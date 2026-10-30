import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useTickets } from './hooks/useTickets';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import NowWorkingOn from './components/NowWorkingOn';
import Queue from './components/Queue';
import DoneList from './components/DoneList';
import NewTicketModal from './components/NewTicketModal';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

// Determine view from URL hash — never changes after load
const isAdminRoute = window.location.hash === '#admin';

function PublicBoard() {
  const { tickets, loading, createTicket } = useTickets();
  const [showModal, setShowModal] = useState(false);

  const inProgress = useMemo(
    () => tickets.find((t) => t.status === 'in_progress') ?? null,
    [tickets]
  );
  const todo = useMemo(
    () =>
      tickets
        .filter((t) => t.status === 'todo')
        .sort((a, b) => (a.queue_position ?? 99999) - (b.queue_position ?? 99999)),
    [tickets]
  );
  const done = useMemo(
    () =>
      tickets
        .filter((t) => t.status === 'done')
        .sort(
          (a, b) =>
            new Date(b.completed_at ?? 0).getTime() - new Date(a.completed_at ?? 0).getTime()
        ),
    [tickets]
  );

  const handleCreate = async (data: {
    title: string;
    description: string;
    creator_name: string;
  }) => {
    const error = await createTicket(data);
    if (error) throw error;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-light text-lg">Shashank's Queue</h1>
            <p className="text-white/30 text-xs font-light">submit a task · watch the board</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 border border-white/20 px-4 py-2 text-sm font-light hover:bg-white hover:text-black transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-10">
        {/* Now Working On */}
        <section>
          <NowWorkingOn ticket={inProgress} />
        </section>

        {/* Queue */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs uppercase tracking-widest text-white/40 font-light">Queue</h2>
            {todo.length > 0 && (
              <span className="text-xs text-white/20 font-light">{todo.length}</span>
            )}
          </div>
          <Queue tickets={todo} />
        </section>

        {/* Done */}
        {done.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xs uppercase tracking-widest text-white/40 font-light">Done</h2>
              <span className="text-xs text-white/20 font-light">{done.length}</span>
            </div>
            <DoneList tickets={done} />
          </section>
        )}
      </main>

      <footer className="border-t border-white/10 py-6 mt-10">
        <p className="text-center text-white/20 text-xs font-light">
          © {new Date().getFullYear()} Shashank Srivastava
        </p>
      </footer>

      <NewTicketModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
      />

      {/* Floating New Ticket button for mobile */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 md:hidden w-12 h-12 bg-white text-black flex items-center justify-center shadow-lg hover:bg-white/90 transition-colors"
      >
        <Plus className="w-5 h-5" />
      </button>

    </div>
  );
}

function AdminView() {
  const { tickets, updateTicket, deleteTicket, reorderQueue } = useTickets();
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return <AdminLogin />;

  return (
    <AdminPanel
      tickets={tickets}
      updateTicket={updateTicket}
      deleteTicket={deleteTicket}
      reorderQueue={reorderQueue}
    />
  );
}

export default function App() {
  if (isAdminRoute) {
    return (
      <AdminAuthProvider>
        <AdminView />
      </AdminAuthProvider>
    );
  }

  return <PublicBoard />;
}
