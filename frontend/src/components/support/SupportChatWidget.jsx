import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiChatAlt2,
  HiPaperAirplane,
  HiSparkles,
  HiSupport,
  HiX,
} from 'react-icons/hi';
import apiService from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { getSupportSocket } from '../../services/supportSocket';
import { getGuestSessionId } from '../../utils/supportSession';

const LIVE_CONVERSATION_KEY = 'staywise_live_conversation';

const initialAiMessages = [{
  role: 'assistant',
  text: 'Hi, I can help with Stay Wise properties, pricing, amenities, availability, policies, and Miami recommendations from approved records.',
}];

const MessageBubble = ({ message }) => {
  const isCustomer = message.role === 'user' || message.senderType === 'customer';
  const isAdmin = message.senderType === 'admin';

  return (
    <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[82%] rounded-[8px] px-3 py-2 text-sm leading-relaxed shadow-sm ${
          isCustomer
            ? 'bg-[var(--color-primary)] text-white'
            : isAdmin
              ? 'bg-[#052A38] text-white'
              : 'bg-white text-[var(--color-text-primary)] ring-1 ring-[var(--color-border)]'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text || message.body}</p>
        {message.sources?.length > 0 && (
          <div className="mt-2 space-y-1 border-t border-black/10 pt-2 text-xs opacity-90">
            {message.sources.map((source) => (
              source.url ? (
                <a
                  key={`${source.type}-${source.id}`}
                  href={source.url}
                  className="block font-bold underline underline-offset-2"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const guestSessionId = useMemo(() => getGuestSessionId(), []);

  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    setCustomer((current) => ({
      ...current,
      name: current.name || (user ? `${user.firstName} ${user.lastName}` : ''),
      email: current.email || user?.email || '',
      phone: current.phone || user?.phone || '',
    }));
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [aiMessages, liveMessages, open, mode]);

  useEffect(() => {
    const savedConversationId = localStorage.getItem(LIVE_CONVERSATION_KEY);
    if (!savedConversationId || conversation || !open) return;

    apiService.getSupportConversation(savedConversationId, { guestSessionId })
      .then((response) => {
        setConversation(response.data.conversation);
        setLiveMessages(response.data.messages || []);
      })
      .catch(() => {
        localStorage.removeItem(LIVE_CONVERSATION_KEY);
      });
  }, [conversation, guestSessionId, open]);

  useEffect(() => {
    if (!conversation?.id || !open) return undefined;

    const socket = getSupportSocket();
    socketRef.current = socket;

    const handleMessage = (payload) => {
      if (payload.conversation?.id !== conversation.id && payload.conversation?._id !== conversation.id) return;
      const incoming = payload.message;
      setConversation(payload.conversation);
      setLiveMessages((current) => {
        const incomingId = incoming.messageId || incoming.id || incoming._id;
        if (current.some((item) => (item.messageId || item.id || item._id) === incomingId)) return current;
        return [...current, incoming];
      });
    };

    const handleTyping = (payload) => {
      if (payload.senderType === 'admin') {
        setAdminTyping(Boolean(payload.isTyping));
      }
    };

    socket.on('support:message', handleMessage);
    socket.on('support:typing', handleTyping);
    socket.emit('support:join', { conversationId: conversation.id, guestSessionId });

    apiService.markSupportRead(conversation.id, { guestSessionId }).catch(() => {});

    return () => {
      socket.off('support:message', handleMessage);
      socket.off('support:typing', handleTyping);
    };
  }, [conversation?.id, guestSessionId, open]);

  if (isAdminRoute) return null;

  const currentUrl = `${window.location.pathname}${window.location.search}`;

  const sendAiMessage = async (event) => {
    event.preventDefault();
    const text = aiInput.trim();
    if (!text || aiLoading) return;

    setAiInput('');
    setAiMessages((current) => [...current, { role: 'user', text }]);
    setAiLoading(true);

    try {
      const response = await apiService.askSupportAi({
        message: text,
        guestSessionId,
        currentUrl,
      });

      setAiMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: response.data.answer,
          sources: response.data.sources,
        },
      ]);
    } catch (error) {
      setAiMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: error.response?.data?.message || 'AI support is unavailable. Please choose Ask Admin.',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const startConversation = async (messageText) => {
    const response = await apiService.createSupportConversation({
      guestSessionId,
      customer,
      subject: 'Booking assistance',
      message: messageText,
      currentUrl,
    });

    setConversation(response.data.conversation);
    localStorage.setItem(LIVE_CONVERSATION_KEY, response.data.conversation.id);
    setLiveMessages(response.data.message ? [response.data.message] : []);
    return response.data.conversation;
  };

  const sendLiveMessage = async (event) => {
    event.preventDefault();
    const text = liveInput.trim();
    if (!text || liveLoading) return;

    setLiveInput('');
    setLiveLoading(true);

    try {
      const activeConversation = conversation || await startConversation(text);

      if (conversation) {
        const socket = socketRef.current || getSupportSocket();
        socket.emit('support:message', {
          conversationId: activeConversation.id,
          guestSessionId,
          message: text,
          currentUrl,
        }, async (ack) => {
          if (ack?.success) {
            setConversation(ack.conversation);
            setLiveMessages((current) => {
              const incomingId = ack.message.messageId || ack.message.id;
              if (current.some((item) => (item.messageId || item.id || item._id) === incomingId)) return current;
              return [...current, ack.message];
            });
          } else {
            const response = await apiService.sendSupportMessage(activeConversation.id, {
              guestSessionId,
              message: text,
              currentUrl,
            });
            setLiveMessages((current) => [...current, response.data.message]);
          }
        });
      }
    } catch (error) {
      setLiveMessages((current) => [
        ...current,
        {
          senderType: 'system',
          body: error.response?.data?.message || 'Message could not be sent. Please try again.',
        },
      ]);
    } finally {
      setLiveLoading(false);
    }
  };

  const handleLiveInput = (event) => {
    setLiveInput(event.target.value);
    if (conversation?.id && socketRef.current) {
      socketRef.current.emit('support:typing', {
        conversationId: conversation.id,
        guestSessionId,
        isTyping: event.target.value.length > 0,
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            className="mb-3 flex h-[min(680px,calc(100vh-6.5rem))] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-[8px] border border-white/40 bg-[var(--color-bg-medium)] shadow-[0_24px_80px_rgba(5,42,56,0.28)]"
          >
            <div className="bg-[#052A38] p-4 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-sun)]">Stay Wise</p>
                  <h2 className="text-xl font-display font-bold">Booking Assistance</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white/10 transition hover:bg-white/20"
                  aria-label="Close support chat"
                >
                  <HiX className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-[8px] bg-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setMode('ai')}
                  className={`flex h-10 items-center justify-center gap-2 rounded-[8px] text-sm font-bold transition ${
                    mode === 'ai' ? 'bg-white text-[#052A38]' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <HiSparkles className="h-4 w-4" />
                  Ask AI
                </button>
                <button
                  type="button"
                  onClick={() => setMode('admin')}
                  className={`flex h-10 items-center justify-center gap-2 rounded-[8px] text-sm font-bold transition ${
                    mode === 'admin' ? 'bg-white text-[#052A38]' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <HiSupport className="h-4 w-4" />
                  Ask Admin
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#F5FBFC,#FFFDFB)] p-4">
              {mode === 'ai' ? (
                <div className="space-y-3">
                  {aiMessages.map((message, index) => (
                    <MessageBubble key={`${message.role}-${index}`} message={message} />
                  ))}
                  {aiLoading && (
                    <MessageBubble message={{ role: 'assistant', text: 'Checking approved Stay Wise records...' }} />
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {!conversation && (
                    <div className="rounded-[8px] border border-[var(--color-border)] bg-white p-4 shadow-sm">
                      <p className="mb-3 text-sm font-bold text-[var(--color-text-primary)]">Your details</p>
                      <div className="space-y-3">
                        <input
                          value={customer.name}
                          onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
                          className="input-field"
                          placeholder="Full name"
                        />
                        <input
                          value={customer.email}
                          onChange={(event) => setCustomer({ ...customer, email: event.target.value })}
                          className="input-field"
                          placeholder="Email"
                          type="email"
                        />
                        <input
                          value={customer.phone}
                          onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
                          className="input-field"
                          placeholder="Phone"
                        />
                      </div>
                    </div>
                  )}

                  {liveMessages.length === 0 && (
                    <div className="rounded-[8px] border border-[var(--color-border)] bg-white p-4 text-sm text-[var(--color-text-secondary)] shadow-sm">
                      Send your question and an administrator will reply here in real time.
                    </div>
                  )}

                  {liveMessages.map((message) => (
                    <MessageBubble key={message.messageId || message.id || `${message.senderType}-${message.createdAt}`} message={message} />
                  ))}

                  {adminTyping && (
                    <p className="text-xs font-semibold text-[var(--color-text-muted)]">Admin is typing...</p>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={mode === 'ai' ? sendAiMessage : sendLiveMessage} className="border-t border-[var(--color-border)] bg-white p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={mode === 'ai' ? aiInput : liveInput}
                  onChange={mode === 'ai' ? (event) => setAiInput(event.target.value) : handleLiveInput}
                  className="min-h-[44px] flex-1 resize-none rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-medium)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                  placeholder={mode === 'ai' ? 'Ask about a property or booking...' : 'Message admin...'}
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={mode === 'ai' ? aiLoading : liveLoading}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-primary)] text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Send support message"
                >
                  {(mode === 'ai' ? aiLoading : liveLoading) ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <HiPaperAirplane className="h-5 w-5 rotate-90" />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="ml-auto flex h-14 items-center gap-3 rounded-[8px] bg-[#052A38] px-5 font-bold text-white shadow-[0_18px_42px_rgba(5,42,56,0.32)] transition hover:-translate-y-0.5 hover:bg-[#073949]"
        aria-label="Open support chat"
      >
        <HiChatAlt2 className="h-6 w-6 text-[var(--color-sun)]" />
        <span className="hidden sm:inline">Support</span>
      </button>
    </div>
  );
};

export default SupportChatWidget;
