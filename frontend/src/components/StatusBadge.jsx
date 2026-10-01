import React from 'react';

const STATUS_CONFIGS = {
  // Request Statuses
  open: { label: 'Open', bg: 'bg-[#167D8D]/10', text: 'text-[#167D8D]', border: 'border-[#167D8D]/30' },
  partially_fulfilled: { label: 'Partially Fulfilled', bg: 'bg-[#B7791F]/10', text: 'text-[#B7791F]', border: 'border-[#B7791F]/30' },
  fulfilled: { label: 'Fulfilled', bg: 'bg-[#25855A]/10', text: 'text-[#25855A]', border: 'border-[#25855A]/30' },
  cancelled: { label: 'Cancelled', bg: 'bg-[#F7F8FA]', text: 'text-[#667085]', border: 'border-[#E4E7EC]' },
  expired: { label: 'Expired', bg: 'bg-[#D04444]/10', text: 'text-[#D04444]', border: 'border-[#D04444]/30' },

  // Match Statuses
  pending: { label: 'Pending Response', bg: 'bg-[#B7791F]/10', text: 'text-[#B7791F]', border: 'border-[#B7791F]/30' },
  accepted: { label: 'Accepted', bg: 'bg-[#25855A]/10', text: 'text-[#25855A]', border: 'border-[#25855A]/30' },
  rejected: { label: 'Declined', bg: 'bg-[#D04444]/10', text: 'text-[#D04444]', border: 'border-[#D04444]/30' },
  completed: { label: 'Completed', bg: 'bg-[#167D8D]/10', text: 'text-[#167D8D]', border: 'border-[#167D8D]/30' },

  // Urgency
  critical: { label: 'Critical Urgency', bg: 'bg-[#B42332]/10', text: 'text-[#B42332]', border: 'border-[#B42332]/40' },
  high: { label: 'High Urgency', bg: 'bg-[#D04444]/10', text: 'text-[#D04444]', border: 'border-[#D04444]/30' },
  medium: { label: 'Medium Urgency', bg: 'bg-[#B7791F]/10', text: 'text-[#B7791F]', border: 'border-[#B7791F]/30' },
  low: { label: 'Low Urgency', bg: 'bg-[#F7F8FA]', text: 'text-[#667085]', border: 'border-[#E4E7EC]' },
};

export const StatusBadge = ({ status, className = '' }) => {
  const normalizedKey = (status || '').toLowerCase().replace(' ', '_');
  const config = STATUS_CONFIGS[normalizedKey] || {
    label: status || 'Unknown',
    bg: 'bg-[#F7F8FA]',
    text: 'text-[#202B36]',
    border: 'border-[#E4E7EC]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {config.label}
    </span>
  );
};
