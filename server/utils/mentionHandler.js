const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Parses mentions like @Name in text and creates notifications
 * @param {string} text - The text to parse
 * @param {string} actorId - ID of user who mentioned
 * @param {string} reviewId - ID of related review (optional)
 * @param {string} shopId - ID of related shop (optional)
 * @param {string} type - Notification type ('mention' or 'comment_mention')
 */
const handleMentions = async (text, actorId, reviewId, shopId, type = 'mention') => {
  if (!text) return;

  // Regex to find @followed by alphanumeric chars (handling potential spaces in names is tricky)
  // We'll look for @Word
  const mentionRegex = /@(\w+)/g;
  const matches = text.match(mentionRegex);
  
  if (!matches) return;

  // Unique names mentioned
  const names = [...new Set(matches.map(m => m.substring(1)))];

  for (const name of names) {
    // Find user by name (partial match or exact match)
    // For simplicity, we'll try exact match first
    const user = await User.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (user && user._id.toString() !== actorId.toString()) {
      await Notification.create({
        recipientId: user._id,
        actorId,
        type,
        reviewId,
        shopId,
        commentText: text.slice(0, 100)
      });
    }
  }
};

module.exports = { handleMentions };
