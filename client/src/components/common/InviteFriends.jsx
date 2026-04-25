import React, { useState } from 'react';
import { Users, Copy, Gift, Link, Check, Share2, Sparkles, ArrowRight } from 'lucide-react';
import { useToast } from './Toast';

const InviteFriends = () => {
  const [referralCode] = useState('QV' + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const referralLink = `https://qualityvoice.app/ref/${referralCode}`;
  const rewardPerFriend = 500;
  const invitedCount = 0;
  const earnedPoints = invitedCount * rewardPerFriend;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div className="invite-card">
      <div className="invite-card__hero">
        <div className="invite-card__icon-wrap">
          <div className="invite-card__icon">
            <Gift size={22} />
          </div>
          <div className="invite-card__sparkle">
            <Sparkles size={14} />
          </div>
        </div>
        <div className="invite-card__hero-copy">
          <span className="invite-card__eyebrow">Referral rewards</span>
          <h3 className="invite-card__title">Invite friends and grow your circle</h3>
          <p className="invite-card__subtitle">
            Earn {rewardPerFriend} points each time someone joins with your invite.
          </p>
        </div>
      </div>

      <div className="invite-card__stats">
        <div className="invite-card__stat">
          <span className="invite-card__stat-label">Friends joined</span>
          <strong className="invite-card__stat-value">{invitedCount}</strong>
        </div>
        <div className="invite-card__stat">
          <span className="invite-card__stat-label">Points earned</span>
          <strong className="invite-card__stat-value invite-card__stat-value--accent">{earnedPoints}</strong>
        </div>
      </div>

      <div className="invite-card__panel">
        <div className="invite-card__panel-head">
          <span className="invite-card__panel-label">Your referral code</span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="invite-card__icon-button"
            title="Copy code"
            aria-label="Copy referral code"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <code className="invite-card__code">{referralCode}</code>
      </div>

      <div className="invite-card__panel invite-card__panel--compact">
        <span className="invite-card__panel-label">Referral link</span>
        <div className="invite-card__link-preview">{referralLink}</div>
      </div>

      <div className="invite-card__actions">
        <button type="button" onClick={handleCopyLink} className="invite-card__primary-btn">
          <Link size={18} />
          Copy referral link
        </button>

        <div className="invite-card__secondary-actions">
          <button className="invite-card__secondary-btn" type="button">
            <Share2 size={16} />
            <span>Share invite</span>
          </button>
          <button className="invite-card__secondary-btn" type="button">
            <Users size={16} />
            <span>Invite list</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="invite-card__footnote">
        <div className="invite-card__footnote-row">
          <span>Personal invites usually convert better than generic link sharing.</span>
          <span>{rewardPerFriend} pts / friend</span>
        </div>
      </div>
    </div>
  );
};

export default InviteFriends;
