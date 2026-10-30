import { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Play,
  CheckCircle,
  RotateCcw,
  Trash2,
  LogOut,
} from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import type { Ticket } from '../types/ticket';

interface Props {
  tickets: Ticket[];
  updateTicket: (id: string, changes: Partial<Omit<Ticket, 'id' | 'created_at'>>) => Promise<unknown>;
  deleteTicket: (id: string) => Promise<unknown>;
  reorderQueue: (id: string, direction: 'up' | 'down') => Promise<void>;
}

function DaysInput({
  value,
  onSave,
}: {
  value: number | null;
  onSave: (days: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value?.toString() ?? '');

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value?.toString() ?? ''); setEditing(true); }}
        className="text-xs text-white/30 hover:text-white/60 font-light border border-white/10 px-2 py-1 transition-colors"
      >
        {value ? `${value}d` : 'set days'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min="1"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoFocus
        className="w-14 bg-black border border-white/30 px-2 py-1 text-xs font-light focus:outline-none text-white"
      />
      <button
        onClick={() => { onSave(draft ? parseInt(draft, 10) : null); setEditing(false); }}
        className="text-xs text-white/60 hover:text-white px-1"
      >
        ok
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-xs text-white/30 hover:text-white/60 px-1"
      >
        ×
      </button>
    </div>
  );
}

export default function AdminPanel({ tickets, updateTicket, deleteTicket, reorderQueue }: Props) {
  const { logout } = useAdminAuth();

  const todo = tickets
    .filter((t) => t.status === 'todo')
    .sort((a, b) => (a.queue_position ?? 99999) - (b.queue_position ?? 99999));
  const inProgress = tickets.filter((t) => t.status === 'in_progress');
  const done = tickets
    .filter((t) => t.status === 'done')
    .sort((a, b) => new Date(b.completed_at ?? 0).getTime() - new Date(a.completed_at ?? 0).getTime());

  const moveToInProgress = (ticket: Ticket) =>
    updateTicket(ticket.id, { status: 'in_progress', started_at: new Date().toISOString() });

  const moveToDone = (ticket: Ticket) =>
    updateTicket(ticket.id, { status: 'done', completed_at: new Date().toISOString() });

  const moveToTodo = (ticket: Ticket) =>
    updateTicket(ticket.id, { status: 'todo', started_at: null, completed_at: null });

  const setDays = (id: string, days: number | null) =>
    updateTicket(id, { days_required: days });

  const Section = ({ title, count }: { title: string; count: number }) => (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-xs uppercase tracking-widest text-white/40 font-light">{title}</h2>
      <span className="text-xs text-white/20 font-light">{count}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="font-light text-lg">Admin</h1>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-light"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-12">
        {/* In Progress */}
        <section>
          <Section title="In Progress" count={inProgress.length} />
          {inProgress.length === 0 ? (
            <p className="text-white/20 text-sm font-light">Nothing in progress.</p>
          ) : (
            <div className="space-y-3">
              {inProgress.map((ticket) => (
                <div key={ticket.id} className="border border-white/20 p-4 bg-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-light">{ticket.title}</p>
                      <p className="text-white/40 text-xs font-light mt-0.5">by {ticket.creator_name}</p>
                    </div>
                    <DaysInput value={ticket.days_required} onSave={(d) => setDays(ticket.id, d)} />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => moveToDone(ticket)}
                      className="flex items-center gap-1.5 text-xs text-green-400/70 hover:text-green-400 font-light transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Done
                    </button>
                    <button
                      onClick={() => moveToTodo(ticket)}
                      className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 font-light transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Back to Queue
                    </button>
                    <button
                      onClick={() => deleteTicket(ticket.id)}
                      className="flex items-center gap-1.5 text-xs text-red-400/50 hover:text-red-400 font-light transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Queue */}
        <section>
          <Section title="Queue" count={todo.length} />
          {todo.length === 0 ? (
            <p className="text-white/20 text-sm font-light">Queue is empty.</p>
          ) : (
            <div className="space-y-2">
              {todo.map((ticket, idx) => (
                <div key={ticket.id} className="border border-white/10 p-4 flex items-start gap-3">
                  <span className="text-white/20 text-xs font-light tabular-nums w-5 shrink-0 pt-1">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-light text-sm">{ticket.title}</p>
                        <p className="text-white/35 text-xs font-light mt-0.5">by {ticket.creator_name}</p>
                      </div>
                      <DaysInput value={ticket.days_required} onSave={(d) => setDays(ticket.id, d)} />
                    </div>
                    <div className="flex gap-3 mt-3 flex-wrap">
                      <button
                        onClick={() => moveToInProgress(ticket)}
                        className="flex items-center gap-1.5 text-xs text-orange-400/70 hover:text-orange-400 font-light transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        Start
                      </button>
                      <button
                        onClick={() => reorderQueue(ticket.id, 'up')}
                        disabled={idx === 0}
                        className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 font-light transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-3 h-3" />
                        Up
                      </button>
                      <button
                        onClick={() => reorderQueue(ticket.id, 'down')}
                        disabled={idx === todo.length - 1}
                        className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 font-light transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-3 h-3" />
                        Down
                      </button>
                      <button
                        onClick={() => deleteTicket(ticket.id)}
                        className="flex items-center gap-1.5 text-xs text-red-400/50 hover:text-red-400 font-light transition-colors ml-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Done */}
        <section>
          <Section title="Done" count={done.length} />
          {done.length === 0 ? (
            <p className="text-white/20 text-sm font-light">Nothing completed yet.</p>
          ) : (
            <div className="space-y-2">
              {done.map((ticket) => (
                <div key={ticket.id} className="border border-white/10 p-4 flex items-start gap-3 opacity-60">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-light text-sm line-through text-white/60">{ticket.title}</p>
                    <p className="text-white/30 text-xs font-light mt-0.5">by {ticket.creator_name}</p>
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => moveToInProgress(ticket)}
                        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 font-light transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reopen
                      </button>
                      <button
                        onClick={() => deleteTicket(ticket.id)}
                        className="flex items-center gap-1.5 text-xs text-red-400/50 hover:text-red-400 font-light transition-colors ml-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
