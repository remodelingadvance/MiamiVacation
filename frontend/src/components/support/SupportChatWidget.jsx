import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiChatAlt2,
  HiPaperAirplane,
  HiSparkles,
  HiSupport,
  HiX,
  HiChevronDown,
} from 'react-icons/hi';
import { TbMessageDots, TbRobot, TbHeadset, TbSend } from 'react-icons/tb';
import apiService from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { getSupportSocket } from '../../services/supportSocket';
import { getGuestSessionId } from '../../utils/supportSession';

const LIVE_CONVERSATION_KEY = 'staywise_live_conversation';

const initialAiMessages = [
  {
    role: 'assistant',
    text: "Hi there! 👋 I'm your StayWise assistant. I can help with properties, pricing, amenities, availability, policies, and Miami recommendations.",
  },
];

const EASE = [0.25, 0.46, 0.45, 0.94];

/* ── Message Bubble ── */
const MessageBubble = ({ message, index }) => {
  const isCustomer =
    message.role === 'user' || message.senderType === 'customer';
  const isAdmin = message.senderType === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, delay: index * 0.03, ease: EASE }}
      className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar for non-customer */}
      {!isCustomer && (
        <div
          className={`mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
            isAdmin
              ? 'bg-[#0d3347] text-white'
              : 'bg-[#e8527a]/10 text-[#e8527a]'
          }`}
        >
          {isAdmin ? (
            <TbHeadset className="h-3.5 w-3.5" />
          ) : (
            <TbRobot className="h-3.5 w-3.5" />
          )}
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
          isCustomer
            ? 'rounded-br-md bg-[#e8527a] text-white'
            : isAdmin
              ? 'rounded-bl-md bg-[#0d3347] text-white'
              : 'rounded-bl-md border border-gray-100 bg-white text-gray-700'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text || message.body}</p>
        {message.sources?.length > 0 && (
          <div className="mt-2 space-y-1 border-t border-white/15 pt-2 text-[11px] opacity-90">
            {message.sources.map((source) =>
              source.url ? (
                <a
                  key={`${source.type}-${source.id}`}
                  href={source.url}
                  className="block font-bold underline underline-offset-2 transition-opacity hover:opacity-80"
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.title}
                </a>
              ) : (
                <span key={`${source.type}-${source.id}`} className="block">
                  {source.title}
                </span>
              )
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ── Typing indicator ── */
const TypingDots = () => (
  <div className="flex items-center gap-1 px-1">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          delay: i * 0.12,
          ease: 'easeInOut',
        }}
        className="h-1.5 w-1.5 rounded-full bg-[#e8527a]/60"
      />
    ))}
  </div>
);

/* ══════ MAIN WIDGET ══════ */
const SupportChatWidget = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('ai');
  const [aiMessages, setAiMessages] = useState(initialAiMessages);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [liveMessages, setLiveMessages] = useState([]);
  const [liveInput, setLiveInput] = useState('');
  const [liveLoading, setLiveLoading] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [customer, setCustomer] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const guestSessionId = useMemo(() => getGuestSessionId(), []);
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    setCustomer((c) => ({
      ...c,
      name: c.name || (user ? `${user.firstName} ${user.lastName}` : ''),
      email: c.email || user?.email || '',
      phone: c.phone || user?.phone || '',
    }));
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [aiMessages, liveMessages, open, mode]);

  useEffect(() => {
    const savedId = localStorage.getItem(LIVE_CONVERSATION_KEY);
    if (!savedId || conversation || !open) return;
    apiService
      .getSupportConversation(savedId, { guestSessionId })
      .then((r) => {
        setConversation(r.data.conversation);
        setLiveMessages(r.data.messages || []);
      })
      .catch(() => localStorage.removeItem(LIVE_CONVERSATION_KEY));
  }, [conversation, guestSessionId, open]);

  useEffect(() => {
    if (!conversation?.id || !open) return undefined;
    const socket = getSupportSocket();
    socketRef.current = socket;

    const handleMessage = (payload) => {
      if (
        payload.conversation?.id !== conversation.id &&
        payload.conversation?._id !== conversation.id
      )
        return;
      const incoming = payload.message;
      setConversation(payload.conversation);
      setLiveMessages((cur) => {
        const id = incoming.messageId || incoming.id || incoming._id;
        if (cur.some((m) => (m.messageId || m.id || m._id) === id)) return cur;
        return [...cur, incoming];
      });
      if (!open) setUnread((n) => n + 1);
    };

    const handleTyping = (payload) => {
      if (payload.senderType === 'admin')
        setAdminTyping(Boolean(payload.isTyping));
    };

    socket.on('support:message', handleMessage);
    socket.on('support:typing', handleTyping);
    socket.emit('support:join', {
      conversationId: conversation.id,
      guestSessionId,
    });
    apiService
      .markSupportRead(conversation.id, { guestSessionId })
      .catch(() => {});

    return () => {
      socket.off('support:message', handleMessage);
      socket.off('support:typing', handleTyping);
    };
  }, [conversation?.id, guestSessionId, open]);

  if (isAdminRoute) return null;

  const currentUrl = `${window.location.pathname}${window.location.search}`;

  const sendAiMessage = async (e) => {
    e.preventDefault();
    const text = aiInput.trim();
    if (!text || aiLoading) return;
    setAiInput('');
    setAiMessages((c) => [...c, { role: 'user', text }]);
    setAiLoading(true);
    try {
      const r = await apiService.askSupportAi({
        message: text,
        guestSessionId,
        currentUrl,
      });
      setAiMessages((c) => [
        ...c,
        { role: 'assistant', text: r.data.answer, sources: r.data.sources },
      ]);
    } catch (err) {
      setAiMessages((c) => [
        ...c,
        {
          role: 'assistant',
          text:
            err.response?.data?.message ||
            'AI support is unavailable. Please try Ask Admin.',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const startConversation = async (messageText) => {
    const r = await apiService.createSupportConversation({
      guestSessionId,
      customer,
      subject: 'Booking assistance',
      message: messageText,
      currentUrl,
    });
    setConversation(r.data.conversation);
    localStorage.setItem(LIVE_CONVERSATION_KEY, r.data.conversation.id);
    setLiveMessages(r.data.message ? [r.data.message] : []);
    return r.data.conversation;
  };

  const sendLiveMessage = async (e) => {
    e.preventDefault();
    const text = liveInput.trim();
    if (!text || liveLoading) return;
    setLiveInput('');
    setLiveLoading(true);
    try {
      const active = conversation || (await startConversation(text));
      if (conversation) {
        const socket = socketRef.current || getSupportSocket();
        socket.emit(
          'support:message',
          {
            conversationId: active.id,
            guestSessionId,
            message: text,
            currentUrl,
          },
          async (ack) => {
            if (ack?.success) {
              setConversation(ack.conversation);
              setLiveMessages((cur) => {
                const id = ack.message.messageId || ack.message.id;
                if (cur.some((m) => (m.messageId || m.id || m._id) === id))
                  return cur;
                return [...cur, ack.message];
              });
            } else {
              const r = await apiService.sendSupportMessage(active.id, {
                guestSessionId,
                message: text,
                currentUrl,
              });
              setLiveMessages((cur) => [...cur, r.data.message]);
            }
          }
        );
      }
    } catch (err) {
      setLiveMessages((cur) => [
        ...cur,
        {
          senderType: 'system',
          body:
            err.response?.data?.message ||
            'Message could not be sent. Please try again.',
        },
      ]);
    } finally {
      setLiveLoading(false);
    }
  };

  const handleLiveInput = (e) => {
    setLiveInput(e.target.value);
    if (conversation?.id && socketRef.current) {
      socketRef.current.emit('support:typing', {
        conversationId: conversation.id,
        guestSessionId,
        isTyping: e.target.value.length > 0,
      });
    }
  };

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) setUnread(0);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mb-3 flex h-[min(640px,calc(100svh-7rem))] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-[0_24px_80px_rgba(13,51,71,0.2)]"
          >
            {/* ── HEADER ── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0d3347] to-[#1a4d6b] px-5 pb-4 pt-5 text-white">
              {/* Glow */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#e8527a]/15 blur-2xl" />
              <div className="pointer-events-none absolute -left-6 bottom-0 h-16 w-16 rounded-full bg-cyan-400/10 blur-xl" />

              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Logo mark */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8527a] shadow-lg shadow-[#e8527a]/25">
                    <TbMessageDots className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8527a]">
                      StayWise
                    </p>
                    <h2 className="text-base font-black text-white">
                      Support Chat
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Minimize */}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-all duration-200 hover:bg-white/20 hover:text-white"
                    aria-label="Minimize chat"
                  >
                    <HiChevronDown className="h-4 w-4" />
                  </button>
                  {/* Close */}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-all duration-200 hover:bg-[#e8527a]/60 hover:text-white"
                    aria-label="Close chat"
                  >
                    <HiX className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Mode tabs */}
              <div className="relative mt-4 flex rounded-xl bg-white/10 p-1">
                {/* Active indicator */}
                <motion.div
                  layout
                  className="absolute inset-y-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm"
                  animate={{ x: mode === 'ai' ? 4 : 'calc(100% + 4px)' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />

                <button
                  type="button"
                  onClick={() => setMode('ai')}
                  className={`relative z-10 flex h-9 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors duration-200 ${
                    mode === 'ai' ? 'text-[#0d3347]' : 'text-white/70'
                  }`}
                >
                  <HiSparkles className="h-4 w-4" />
                  Ask AI
                </button>
                <button
                  type="button"
                  onClick={() => setMode('admin')}
                  className={`relative z-10 flex h-9 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors duration-200 ${
                    mode === 'admin' ? 'text-[#0d3347]' : 'text-white/70'
                  }`}
                >
                  <HiSupport className="h-4 w-4" />
                  Ask Admin
                </button>
              </div>
            </div>

            {/* ── MESSAGES ── */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/80 to-white p-4">
              {mode === 'ai' ? (
                <div className="space-y-3">
                  {aiMessages.map((msg, i) => (
                    <MessageBubble
                      key={`ai-${i}`}
                      message={msg}
                      index={i}
                    />
                  ))}
                  {aiLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8527a]/10">
                        <TbRobot className="h-3.5 w-3.5 text-[#e8527a]" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
                        <TypingDots />
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Customer form */}
                  {!conversation && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                    >
                      <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0d3347]">
                        <TbHeadset className="h-4 w-4 text-[#e8527a]" />
                        Your details
                      </p>
                      <div className="space-y-2.5">
                        {[
                          {
                            key: 'name',
                            placeholder: 'Full name',
                            type: 'text',
                          },
                          {
                            key: 'email',
                            placeholder: 'Email address',
                            type: 'email',
                          },
                          {
                            key: 'phone',
                            placeholder: 'Phone number',
                            type: 'tel',
                          },
                        ].map((field) => (
                          <input
                            key={field.key}
                            value={customer[field.key]}
                            onChange={(e) =>
                              setCustomer({
                                ...customer,
                                [field.key]: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#e8527a] focus:bg-white focus:ring-4 focus:ring-[#e8527a]/10"
                            placeholder={field.placeholder}
                            type={field.type}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {liveMessages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0d3347]">
                        <TbHeadset className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md border border-gray-100 bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-gray-600 shadow-sm">
                        Send your question and our team will reply here in real
                        time. We typically respond within a few minutes!
                      </div>
                    </motion.div>
                  )}

                  {liveMessages.map((msg, i) => (
                    <MessageBubble
                      key={
                        msg.messageId ||
                        msg.id ||
                        `${msg.senderType}-${msg.createdAt}`
                      }
                      message={msg}
                      index={i}
                    />
                  ))}

                  {adminTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0d3347]">
                        <TbHeadset className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
                        <TypingDots />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── INPUT ── */}
            <form
              onSubmit={mode === 'ai' ? sendAiMessage : sendLiveMessage}
              className="border-t border-gray-100 bg-white p-3"
            >
              <div className="flex items-end gap-2">
                <div className="relative flex-1">
                  <textarea
                    value={mode === 'ai' ? aiInput : liveInput}
                    onChange={
                      mode === 'ai'
                        ? (e) => setAiInput(e.target.value)
                        : handleLiveInput
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.target.form.requestSubmit();
                      }
                    }}
                    className="max-h-24 min-h-[44px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-3 text-sm text-gray-800 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#e8527a] focus:bg-white focus:ring-4 focus:ring-[#e8527a]/10"
                    placeholder={
                      mode === 'ai'
                        ? 'Ask about properties, booking...'
                        : 'Message our team...'
                    }
                    rows={1}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={mode === 'ai' ? aiLoading : liveLoading}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8527a] text-white shadow-lg shadow-[#e8527a]/25 transition-all duration-200 hover:bg-[#d4405f] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  {(mode === 'ai' ? aiLoading : liveLoading) ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <TbSend className="h-5 w-5" />
                  )}
                </motion.button>
              </div>

              {/* Powered by */}
              <p className="mt-2 text-center text-[10px] font-medium text-gray-300">
                Powered by{' '}
                <span className="font-bold text-[#e8527a]/50">StayWise</span>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING BUTTON ── */}
      <motion.button
        type="button"
        onClick={handleOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative ml-auto flex h-14 items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#e8527a] to-[#d4405f] px-5 font-bold text-white shadow-[0_12px_36px_rgba(232,82,122,0.35)] transition-all duration-200 hover:shadow-[0_16px_44px_rgba(232,82,122,0.45)] sm:h-[52px] sm:px-6"
        aria-label="Open support chat"
      >
        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HiX className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HiChatAlt2 className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>

        <span className="relative hidden text-sm sm:inline">
          {open ? 'Close' : 'Support'}
        </span>

        {/* Unread badge */}
        <AnimatePresence>
          {unread > 0 && !open && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-[#e8527a] shadow-md"
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring when closed */}
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-[#e8527a]/20" style={{ animationDuration: '3s' }} />
        )}
      </motion.button>
    </div>
  );
};

export default SupportChatWidget;