import { useState, FormEvent } from 'react';
import { Lock } from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const ok = login(password);
    if (!ok) {
      setError('Incorrect password.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <Lock className="w-5 h-5 text-white/40" />
          <h1 className="text-xl font-light">Admin</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full bg-transparent border border-white/20 px-4 py-3 text-white placeholder-white/20 font-light focus:outline-none focus:border-white/40 transition-colors"
          />
          {error && <p className="text-red-400 text-sm font-light">{error}</p>}
          <button
            type="submit"
            disabled={!password}
            className="w-full border border-white/20 py-3 font-light hover:bg-white hover:text-black transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
