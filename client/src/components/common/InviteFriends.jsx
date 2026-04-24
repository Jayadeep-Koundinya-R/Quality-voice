import React, { useState } from 'react';
import { Users, Copy, Gift, Link, Check, X } from 'lucide-react';
import { useToast } from './Toast';

const InviteFriends = () => {
  const [referralCode] = useState('QV' + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(`https://qualityvoice.app/ref/${referralCode}`);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyCodeOnly = async () => {
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
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <Gift size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Invite Friends</h3>
            <p className="text-blue-100 text-sm">Get 500 points for each friend</p>
          </div>
        </div>
      </div>

      <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-blue-100">Your referral code</span>
          <button
            onClick={handleCopyCodeOnly}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Copy code"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <code className="bg-white/20 px-3 py-2 rounded-lg font-mono text-lg font-bold flex-1 text-center">
            {referralCode}
          </code>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleCopyCode}
          className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
        >
          <Link size={18} />
          Copy referral link
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 bg-white/20 py-2 rounded-lg hover:bg-white/30 transition-colors">
            <Users size={16} />
            <span className="text-sm">Share</span>
          </button>
          <button className="flex items-center justify-center gap-2 bg-white/20 py-2 rounded-lg hover:bg-white/30 transition-colors">
            <Link size={16} />
            <span className="text-sm">Link</span>
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between text-sm text-blue-100">
          <span>Friends invited</span>
          <span className="font-bold">0</span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-2 mt-2">
          <div className="bg-white/30 h-2 rounded-full" style={{ width: '0%' }} />
        </div>
      </div>
    </div>
  );
};

export default InviteFriends;
