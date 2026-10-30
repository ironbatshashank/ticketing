import { Clock } from 'lucide-react';
import type { Ticket } from '../types/ticket';

interface Props {
  tickets: Ticket[];
}

export default function Queue({ tickets }: Props) {
  if (tickets.length === 0) {
    return (
      <div className="border border-white/10 p-6 text-center">
        <p className="text-white/30 font-light text-sm">Queue is clear.</p>
      </div>
    );
  }

  return (
    <div className="border border-white/10 divide-y divide-white/10">
      {tickets.map((ticket, idx) => (
        <div key={ticket.id} className="flex items-start gap-4 p-5 hover:bg-white/[0.02] transition-colors">
          <span className="text-white/20 font-light text-sm tabular-nums w-6 shrink-0 pt-0.5">
            #{idx + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-light text-white/90 leading-snug">{ticket.title}</p>
            {ticket.description && (
              <p className="text-white/35 text-sm font-light mt-0.5 leading-snug line-clamp-1">
                {ticket.description}
              </p>
            )}
            <p className="text-white/30 text-xs font-light mt-1">by {ticket.creator_name}</p>
          </div>
          {ticket.days_required && (
            <div className="flex items-center gap-1 text-white/30 text-xs font-light shrink-0">
              <Clock className="w-3 h-3" />
              <span>~{ticket.days_required}d</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
