import React, { useState, useEffect, useCallback } from 'react';
import { getComments, createComment } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send } from 'lucide-react';
import { useToast } from './Toast';

const DiscussionThreads = ({ reviewId }) => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getComments(reviewId);
      setComments(data.comments || []);
    } catch (err) {
      toast.error('Failed to load comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setSubmitting(true);
    try {
      const { data } = await createComment({ 
        reviewId, 
        commentText: text 
      });
      setComments(prev => [...prev, data.comment]);
      setText('');
      toast.success('Comment added!');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const displayComments = showAll 
    ? comments 
    : comments.slice(0, 3);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={18} className="text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handleComment} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {currentUser.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {text.length}/500 characters
                </span>
                <button
                  type="submit"
                  disabled={!text.trim() || submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                  <span>Comment</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to join the discussion
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {displayComments.map(comment => (
              <div key={comment._id} className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-bold">
                    {comment.userId?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {comment.userId?.name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {comment.commentText}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {comments.length > 3 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              View all {comments.length} comments
            </button>
          )}

          {showAll && (
            <button
              onClick={() => setShowAll(false)}
              className="w-full py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Show less
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default DiscussionThreads;
