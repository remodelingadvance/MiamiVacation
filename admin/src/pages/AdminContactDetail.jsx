import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiArrowLeft,
  HiMail,
  HiPhone,
  HiCalendar,
  HiReply,
  HiCheck,
  HiX,
  HiFlag,
} from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import StatusBadge from '../components/common/StatusBadge';
import adminApi from '../config/api';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await adminApi.getContact(id);
        setContact(response.data.contact);
      } catch (error) {
        toast.error('Message not found');
        navigate('/admin/contacts');
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, [id, navigate]);

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      setReplying(true);
      await adminApi.replyToContact(id, replyText);
      toast.success('Reply sent successfully');
      setReplyText('');
      // Refresh contact
      const response = await adminApi.getContact(id);
      setContact(response.data.contact);
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await adminApi.updateContactStatus(id, { status });
      setContact(prev => ({ ...prev, status }));
      toast.success(`Message marked as ${status}`);
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!contact) return null;

  return (
    <>
      <SEOHead title={`Message from ${contact.name}`} />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/contacts')}
            className="w-10 h-10 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Message Details</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={contact.status} />
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                contact.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                contact.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                'bg-gray-500/10 text-gray-500'
              }`}>
                {contact.priority}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Contact Info</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                    <span className="text-[var(--color-primary)] font-semibold">
                      {contact.name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{contact.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <HiMail className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                  <a href={`mailto:${contact.email}`} className="text-[var(--color-primary)] hover:underline text-sm">
                    {contact.email}
                  </a>
                </div>

                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <HiPhone className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                    <a href={`tel:${contact.phone}`} className="text-white text-sm">
                      {contact.phone}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <HiCalendar className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {formatDate(contact.createdAt)}
                  </span>
                </div>

                {contact.booking && (
                  <div className="flex items-center gap-3">
                    <HiFlag className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                    <Link to={`/admin/bookings/${contact.booking}`} className="text-[var(--color-primary)] hover:underline text-sm">
                      Related Booking
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
              <div className="space-y-2">
                {contact.status !== 'resolved' && (
                  <button
                    onClick={() => handleStatusUpdate('resolved')}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/30 transition-all text-sm font-medium"
                  >
                    <HiCheck className="w-4 h-4" />
                    Mark as Resolved
                  </button>
                )}
                {contact.status !== 'spam' && (
                  <button
                    onClick={() => handleStatusUpdate('spam')}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 transition-all text-sm font-medium"
                  >
                    <HiX className="w-4 h-4" />
                    Mark as Spam
                  </button>
                )}
                {contact.status === 'unread' && (
                  <button
                    onClick={() => handleStatusUpdate('read')}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg glass-light text-[var(--color-text-secondary)] hover:text-white transition-all text-sm font-medium"
                  >
                    <HiFlag className="w-4 h-4" />
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Message content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-medium capitalize">
                  {contact.subject}
                </span>
              </div>
              <div className="p-4 rounded-lg glass-light">
                <p className="text-white whitespace-pre-wrap leading-relaxed">{contact.message}</p>
              </div>
            </div>

            {/* Reply thread */}
            {contact.replies && contact.replies.length > 0 && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Conversation</h3>
                <div className="space-y-4">
                  {contact.replies.map((reply, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl ${
                        reply.isAdmin
                          ? 'bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 ml-4'
                          : 'bg-[var(--color-bg-light)] border border-white/5 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${
                          reply.isAdmin ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                        }`}>
                          {reply.isAdmin ? 'Admin Response' : contact.name}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {formatDate(reply.sentAt)}
                        </span>
                      </div>
                      <p className="text-white text-sm">{reply.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reply form */}
            {contact.status !== 'resolved' && contact.status !== 'spam' && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Send Reply</h3>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="input-field resize-none mb-4"
                  rows={5}
                  placeholder="Type your reply here..."
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || replying}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    {replying ? (
                      'Sending...'
                    ) : (
                      <>
                        <HiReply className="w-4 h-4" />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminContactDetail;
