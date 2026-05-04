import React, { useState, useEffect, useCallback } from 'react';
import { getComments, createComment, deleteComment } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { useToast } from './Toast';
import '../../styles/Social.css';

const getAvatarGradient = name => {
  const c = (name || 'A')[0].toUpperCase();
  if (c <= 'F') return 'linear-gradient(135deg,#667eea,#764ba2)';
  if (c <= 'M') return 'linear-gradient(135deg,#f093fb,#f5576c)';
  if (c <= 'S') return 'linear-gradient(135deg,#43e97b,#38f9d7)';
  return 'linear-gradient(135deg,#fa709a,#fee140)';
};

const timeAgo = dateStr => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const DiscussionThreads = ({ reviewId }) => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getComments(reviewId);
      setComments(data.comments || []);
    } catch {
      toast.error('Failed to load comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const handleComment = async e => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await createComment({ reviewId, commentText: text });
      setComments(prev => [...prev, data.comment]);
      setText('');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    setDeletingId(commentId);
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setDeletingId(null);
    }
  };

  const displayComments = showAll ? comments : comments.slice(0, 3);

  return (
    <div className="discussion-threads">
      <div className="dt-header">
        <MessageSquare size={15} />
        <span className="dt-title">Discussion ({comments.length})</span>
      </div>

      {/* Comment form */}
      {currentUser ? (
        <form onSubmit={handleComment} className="dt-form">
          <div
            className="dt-form-avatar"
            style={{ background: getAvatarGradient(currentUser.name) }}
          >
            {currentUser.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="dt-form-right">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add a comment…"
              className="dt-textarea"
              rows={2}
              maxLength={500}
            />
            <div className="dt-form-footer">
              <span className="dt-char-count">{text.length}/500</span>
              <button
                type="submit"
                disabled={!text.trim() || submitting}
                className="dt-submit-btn"
              >
                <Send size={14} />
                {submitting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="dt-login-prompt">Log in to join the discussion</p>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="dt-loading"><div className="spinner" /></div>
      ) : comments.length === 0 ? (
        <p className="dt-empty">No comments yet — be the first!</p>
      ) : (
        <>
          <div className="dt-list">
            {displayComments.map(comment => {
              const isOwn = currentUser?._id === comment.userId?._id ||
                            currentUser?._id === comment.userId?._id?.toString();
              const isAdmin = currentUser?.role === 'admin';
              const canDelete = isOwn || isAdmin;

              return (
                <div key={comment._id} className="dt-comment">
                  <div
                    className="dt-comment-avatar"
                    style={{ background: getAvatarGradient(comment.userId?.name) }}
                  >
                    {comment.userId?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="dt-comment-body">
                    <div className="dt-comment-meta">
                      <span className="dt-comment-author">{comment.userId?.name || 'Anonymous'}</span>
                      <span className="dt-comment-time">{timeAgo(comment.createdAt)}</span>
                      {canDelete && (
                        <button
                          className="dt-delete-btn"
                          onClick={() => handleDelete(comment._id)}
                          disabled={deletingId === comment._id}
                          title="Delete comment"
                          aria-label="Delete comment"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <p className="dt-comment-text">{comment.commentText}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {comments.length > 3 && (
            <button className="dt-show-more" onClick={() => setShowAll(v => !v)}>
              {showAll ? 'Show less' : `View all ${comments.length} comments`}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default DiscussionThreads;
