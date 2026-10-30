import { Flame, Clock } from 'lucide-react';
import type { Ticket } from '../types/ticket';

interface Props {
  ticket: Ticket | null;
}

export default function NowWorkingOn({ ticket }: Props) {
  if (!ticket) {
    return (
      <div className="border border-white/10 p-8 text-center">
        <p className="text-white/40 font-light text-lg">Nothing in progress yet.</p>
        <p className="text-white/25 font-light text-sm mt-1">Submit a ticket below to get started.</p>
      </div>
    );
  }

  const daysElapsed = ticket.started_at
    ? (Date.now() - new Date(ticket.started_at).getTime()) / 86_400_000
    : 0;

  const percent =
    ticket.days_required && ticket.days_required > 0
      ? Math.min(Math.round((daysElapsed / ticket.days_required) * 100), 100)
      : null;

  const isOverdue = percent !== null && percent >= 100;
  const barColor = isOverdue ? 'bg-amber-400' : 'bg-white';

  return (
    <div className="border border-white/20 p-8 bg-white/5">
      <div className="flex items-center gap-3 mb-6">
        <Flame className="w-5 h-5 text-orange-400" />
        <span className="text-xs tracking-widest text-white/50 uppercase font-light">
          Now Working On
        </span>
      </div>

      <h2 className="text-3xl font-light mb-2 leading-tight">{ticket.title}</h2>

      {ticket.description && (
        <p className="text-white/50 font-light text-sm mb-5 leading-relaxed">
          {ticket.description}
        </p>
      )}

      <div className="flex items-center gap-4 mb-6 text-sm text-white/40 font-light">
        <span>by {ticket.creator_name}</span>
        {ticket.days_required && (
          <>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {ticket.days_required} day{ticket.days_required !== 1 ? 's' : ''} estimated
            </span>
          </>
        )}
      </div>

      {/* Progress bar */}
      {percent !== null ? (
        <div>
          <div className="h-1.5 bg-white/10 w-full">
            <div
              className={`h-full transition-all duration-500 ${barColor}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/30 font-light">
            <span>
              Day {Math.floor(daysElapsed)} of {ticket.days_required}
            </span>
            <span className={isOverdue ? 'text-amber-400' : ''}>
              {isOverdue ? 'Overdue' : `${percent}%`}
            </span>
          </div>
        </div>
      ) : (
        // Indeterminate shimmer bar when no days set
        <div className="h-1.5 bg-white/10 w-full overflow-hidden">
          <div className="h-full w-1/3 bg-white/30 animate-pulse" />
        </div>
      )}
    </div>
  );
}
