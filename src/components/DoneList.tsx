import { CheckCircle } from 'lucide-react';
import type { Ticket } from '../types/ticket';

interface Props {
  tickets: Ticket[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DoneList({ tickets }: Props) {
  if (tickets.length === 0) {
    return (
      <div className="border border-white/10 p-6 text-center">
        <p className="text-white/30 font-light text-sm">No completed tickets yet.</p>
      </div>
    );
  }

  return (
    <div className="border border-white/10 divide-y divide-white/10">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="flex items-start gap-4 p-5 opacity-60 hover:opacity-80 transition-opacity">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-light text-white/80 line-through leading-snug">{ticket.title}</p>
            <p className="text-white/30 text-xs font-light mt-1">
              by {ticket.creator_name}
              {ticket.completed_at && ` · done ${formatDate(ticket.completed_at)}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
