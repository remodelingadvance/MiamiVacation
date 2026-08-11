import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiArchive,
  HiChatAlt2,
  HiCheckCircle,
  HiFilter,
  HiPaperAirplane,
  HiRefresh,
  HiSearch,
  HiUserAdd,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import SEOHead from '../components/common/SEOHead';
import adminApi from '../config/api';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const conversationFilters = [
  { label: 'Open', value: 'open' },
  { label: 'Pending', value: 'pending' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Archived', value: 'archived' },
];

const StatCard = ({ label, value, accent = 'text-white' }) => (
  <div className="glass rounded-xl p-4">
    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">{label}</p>
    <p className={`mt-2 text-3xl font-black ${accent}`}>{value}</p>
  </div>
);

const MessageBubble = ({ message }) => {
  const isAdmin = message.senderType === 'admin';

  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[82%] rounded-lg px-3 py-2 text-sm shadow-lg ${
          isAdmin
            ? 'bg-[var(--color-primary)] text-[var(--color-bg-dark)]'
            : 'glass-light text-white'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.body}</p>
        <p className={`mt-1 text-[10px] ${isAdmin ? 'text-black/60' : 'text-[var(--color-text-muted)]'}`}>
          {message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}
        </p>
      </div>
    </div>
  );
};

const AdminSupport = () => {
  const { user } = useAdminAuth();
  const { socket, resetBadge } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();
  const [analytics, setAnalytics] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(searchParams.get('status') || 'open');
  const [search, setSearch] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const selectedIdFromUrl = searchParams.get('chat');

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, item) => sum + (item.unread?.admin || 0), 0),
    [conversations]
  );

  const loadAnalytics = async () => {
    const response = await adminApi.getAdminSupportAnalytics();
    setAnalytics(response.data.analytics);
  };

  const loadConversations = async () => {
    const response = await adminApi.getAdminSupportConversations({
      status,
      search: search || undefined,
      limit: 75,
    });
    setConversations(response.data.conversations || []);
  };

  const loadSelectedConversation = async (conversationId) => {
    if (!conversationId) return;

    const response = await adminApi.getAdminSupportConversation(conversationId);
    setSelected(response.data.conversation);
    setMessages(response.data.messages || []);
    await adminApi.markAdminSupportRead(response.data.conversation.id).catch(() => {});
    resetBadge('support');
  };

  const refreshAll = async () => {
    setLoading(true);
    try {
      await Promise.all([loadAnalytics(), loadConversations()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, [status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadConversations();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (selectedIdFromUrl) {
      loadSelectedConversation(selectedIdFromUrl);
    }
  }, [selectedIdFromUrl]);

  useEffect(() => {
    if (!selected && conversations.length && !selectedIdFromUrl) {
      const first = conversations[0];
      setSelected(first);
      setSearchParams((params) => {
        params.set('chat', first.id);
        params.set('status', status);
        return params;
      });
      loadSelectedConversation(first.id);
    }
  }, [conversations, selected, selectedIdFromUrl, setSearchParams, status]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleConversationUpdated = (payload) => {
      const updated = payload.conversation;
      if (!updated) return;

      setConversations((current) => {
        const without = current.filter((item) => item.id !== updated.id);
        const next = [updated, ...without];
        return next.filter((item) => !status || item.status === status);
      });

      if (selected?.id === updated.id) {
        setSelected(updated);
      }
    };

    const handleMessage = (payload) => {
      if (!selected || payload.conversation?.id !== selected.id) return;

      setMessages((current) => {
        const incomingId = payload.message.messageId || payload.message.id;
        if (current.some((item) => (item.messageId || item.id) === incomingId)) return current;
        return [...current, payload.message];
      });
      setSelected(payload.conversation);
      adminApi.markAdminSupportRead(selected.id).catch(() => {});
      resetBadge('support');
    };

    socket.on('support:conversation-updated', handleConversationUpdated);
    socket.on('support:message', handleMessage);

    return () => {
      socket.off('support:conversation-updated', handleConversationUpdated);
      socket.off('support:message', handleMessage);
    };
  }, [socket, selected?.id, status, resetBadge]);

  useEffect(() => {
    if (!selected?.id || !socket) return;
    socket.emit('support:join', { conversationId: selected.id });
    adminApi.markAdminSupportRead(selected.id).catch(() => {});
    resetBadge('support');
  }, [selected?.id, socket, resetBadge]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const selectConversation = (conversation) => {
    setSelected(conversation);
    setSearchParams((params) => {
      params.set('chat', conversation.id);
      params.set('status', status);
      return params;
    });
    loadSelectedConversation(conversation.id);
  };

  const sendReply = async (event) => {
    event.preventDefault();
    if (!selected?.id || !reply.trim() || sending) return;

    const text = reply.trim();
    setReply('');
    setSending(true);

    const appendMessage = (message, conversation) => {
      setMessages((current) => {
        const messageId = message.messageId || message.id;
        if (current.some((item) => (item.messageId || item.id) === messageId)) return current;
        return [...current, message];
      });
      if (conversation) setSelected(conversation);
    };

    try {
      if (socket) {
        socket.emit('support:admin-message', {
          conversationId: selected.id,
          message: text,
        }, async (ack) => {
          if (ack?.success) {
            appendMessage(ack.message, ack.conversation);
          } else {
            const response = await adminApi.sendAdminSupportMessage(selected.id, { message: text });
            appendMessage(response.data.message);
          }
        });
      } else {
        const response = await adminApi.sendAdminSupportMessage(selected.id, { message: text });
        appendMessage(response.data.message);
      }
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Reply could not be sent');
    } finally {
      setSending(false);
    }
  };

  const updateConversation = async (data) => {
    if (!selected?.id) return;
    const response = await adminApi.updateAdminSupportConversation(selected.id, data);
    setSelected(response.data.conversation);
    await Promise.all([loadConversations(), loadAnalytics()]);
  };

  return (
    <>
      <SEOHead title="Support Inbox" />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">Customer support</p>
            <h1 className="mt-2 text-3xl font-display font-bold text-white">Live Support Inbox</h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Reply to customer booking questions from desktop or mobile with realtime delivery.
            </p>
          </div>
          <button type="button" onClick={refreshAll} className="btn-outline inline-flex items-center justify-center gap-2">
            <HiRefresh className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard label="Total chats" value={analytics?.total ?? '-'} />
          <StatCard label="Open" value={analytics?.open ?? '-'} accent="text-blue-400" />
          <StatCard label="Unread" value={analytics?.unread ?? unreadTotal} accent="text-[var(--color-primary)]" />
          <StatCard label="30d messages" value={analytics?.recentMessages ?? '-'} accent="text-green-400" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
          <div className="glass rounded-xl overflow-hidden">
            <div className="border-b border-white/10 p-4">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="input-field pl-10"
                  placeholder="Search chats, names, emails"
                />
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {conversationFilters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setStatus(item.value);
                      setSelected(null);
                      setSearchParams({ status: item.value });
                    }}
                    className={`h-9 shrink-0 rounded-lg px-3 text-sm font-semibold transition ${
                      status === item.value
                        ? 'bg-[var(--color-primary)] text-[var(--color-bg-dark)]'
                        : 'glass-light text-[var(--color-text-secondary)] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[64vh] overflow-y-auto">
              {loading && (
                <div className="p-6 text-sm text-[var(--color-text-muted)]">Loading support conversations...</div>
              )}
              {!loading && conversations.length === 0 && (
                <div className="p-6 text-sm text-[var(--color-text-muted)]">No conversations found.</div>
              )}
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => selectConversation(conversation)}
                  className={`block w-full border-b border-white/5 p-4 text-left transition hover:bg-white/[0.04] ${
                    selected?.id === conversation.id ? 'bg-[var(--color-primary)]/10' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {conversation.customer?.name || conversation.customer?.email || 'Guest visitor'}
                      </p>
                      <p className="truncate text-xs text-[var(--color-text-muted)]">{conversation.conversationId}</p>
                    </div>
                    {(conversation.unread?.admin || 0) > 0 && (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-black text-white">
                        {conversation.unread.admin}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-secondary)]">
                    {conversation.lastMessage?.text || conversation.subject}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className="rounded-full bg-white/5 px-2 py-1 capitalize text-[var(--color-text-secondary)]">
                      {conversation.status}
                    </span>
                    <span className="rounded-full bg-blue-500/10 px-2 py-1 capitalize text-blue-300">
                      {conversation.priority}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass flex min-h-[72vh] flex-col overflow-hidden rounded-xl"
          >
            {selected ? (
              <>
                <div className="border-b border-white/10 p-4">
                  <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <HiChatAlt2 className="h-5 w-5 text-[var(--color-primary)]" />
                        <h2 className="text-xl font-display font-bold text-white">
                          {selected.customer?.name || 'Guest visitor'}
                        </h2>
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {selected.customer?.email || 'No email'} {selected.customer?.phone ? `- ${selected.customer.phone}` : ''}
                      </p>
                      <p className="mt-1 break-all text-xs text-[var(--color-text-muted)]">
                        {selected.metadata?.currentUrl}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                      <button
                        type="button"
                        onClick={() => updateConversation({ assignedTo: user?.id || user?._id })}
                        className="glass-light flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-white transition hover:text-[var(--color-primary)]"
                      >
                        <HiUserAdd className="h-4 w-4" />
                        Assign
                      </button>
                      <button
                        type="button"
                        onClick={() => updateConversation({ status: 'resolved' })}
                        className="flex h-10 items-center justify-center gap-2 rounded-lg bg-green-500/15 px-3 text-sm font-semibold text-green-300"
                      >
                        <HiCheckCircle className="h-4 w-4" />
                        Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateConversation({ status: 'archived' })}
                        className="flex h-10 items-center justify-center gap-2 rounded-lg bg-white/5 px-3 text-sm font-semibold text-[var(--color-text-secondary)]"
                      >
                        <HiArchive className="h-4 w-4" />
                        Archive
                      </button>
                      <select
                        value={selected.priority}
                        onChange={(event) => updateConversation({ priority: event.target.value })}
                        className="input-field h-10 py-0 text-sm font-semibold"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--color-bg-dark)]/55 p-4">
                  {messages.map((message) => (
                    <MessageBubble key={message.messageId || message.id || message.createdAt} message={message} />
                  ))}
                  <div ref={endRef} />
                </div>

                <form onSubmit={sendReply} className="border-t border-white/10 p-4">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={reply}
                      onChange={(event) => {
                        setReply(event.target.value);
                        socket?.emit('support:typing', {
                          conversationId: selected.id,
                          isTyping: event.target.value.length > 0,
                        });
                      }}
                      className="min-h-[48px] flex-1 resize-none rounded-lg border border-white/10 bg-[var(--color-bg-light)] px-3 py-2 text-sm text-white outline-none transition focus:border-[var(--color-primary)]"
                      placeholder="Reply to customer"
                    />
                    <button
                      type="submit"
                      disabled={sending || !reply.trim()}
                      className="btn-primary flex h-12 items-center gap-2 px-5 disabled:opacity-60"
                    >
                      {sending ? (
                        <div className="h-5 w-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                      ) : (
                        <HiPaperAirplane className="h-5 w-5 rotate-90" />
                      )}
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div>
                  <HiFilter className="mx-auto h-10 w-10 text-[var(--color-primary)]" />
                  <h2 className="mt-4 text-2xl font-display font-bold text-white">Select a conversation</h2>
                  <p className="mt-2 text-[var(--color-text-muted)]">Choose a customer chat from the queue.</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminSupport;
