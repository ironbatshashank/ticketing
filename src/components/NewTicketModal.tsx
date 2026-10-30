import { useState, FormEvent } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; creator_name: string }) => Promise<void>;
}

export default function NewTicketModal({ isOpen, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), creator_name: name.trim() });
      setName('');
      setTitle('');
      setDescription('');
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-black border border-white/20 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-light">New Ticket</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-2 font-light">
              Your Name <span className="text-white/60">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alice"
              required
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-white placeholder-white/20 font-light focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-2 font-light">
              Task Title <span className="text-white/60">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Build me a landing page"
              required
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-white placeholder-white/20 font-light focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-2 font-light">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any details that would help..."
              rows={3}
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-white placeholder-white/20 font-light focus:outline-none focus:border-white/40 transition-colors resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm font-light">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !name.trim() || !title.trim()}
            className="w-full border border-white/20 py-3 font-light text-white hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
}
