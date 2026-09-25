import React, { useState } from 'react';
import { Flag, X, ShieldAlert, Check } from 'lucide-react';

interface ModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'post' | 'user';
  targetTitle: string;
}

export const ModerationModal: React.FC<ModerationModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetTitle,
}) => {
  const [reason, setReason] = useState('Inappropriate imagery / Not safe for work');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  const reportReasons = [
    'Inappropriate imagery / Not safe for work',
    'Copyright or trademark infringement',
    'Harassment, hate speech or bullying',
    'Spam, advertising or scams',
    'Dangerous or exploitative content',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-3 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 p-1"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-rose-400">
          <Flag className="w-5 h-5" />
          <h3 className="font-display font-bold text-sm text-zinc-100">
            Report {targetType === 'post' ? 'Creation' : 'Creator'}
          </h3>
        </div>

        <p className="text-xs text-zinc-400">
          Reporting: <span className="text-zinc-200 font-semibold">{targetTitle}</span>
        </p>

        {submitted ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-emerald-400 text-xs text-center">
            <Check className="w-8 h-8" />
            <span className="font-semibold">Report Submitted for Automated Review</span>
            <span className="text-zinc-400 text-[10px]">Thank you for keeping Cyra Creator Studio safe!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-1">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-zinc-300">Select reason:</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-zinc-200 focus:outline-none focus:border-rose-500"
              >
                {reportReasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-zinc-300">Additional details (optional):</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Help our moderation team understand the issue..."
                rows={3}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
