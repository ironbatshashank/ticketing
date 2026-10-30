import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Ticket } from '../types/ticket';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    supabase
      .from('tickets')
      .select('*')
      .order('queue_position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setTickets(data as Ticket[]);
        setLoading(false);
      });

    // Realtime subscription
    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTickets((prev) => [...prev, payload.new as Ticket]);
          } else if (payload.eventType === 'UPDATE') {
            setTickets((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Ticket) : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTickets((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createTicket = useCallback(
    async (data: { title: string; description: string; creator_name: string }) => {
      const todoTickets = tickets.filter((t) => t.status === 'todo');
      const maxPos = todoTickets.reduce(
        (max, t) => Math.max(max, t.queue_position ?? 0),
        0
      );
      const { error } = await supabase.from('tickets').insert({
        ...data,
        status: 'todo',
        queue_position: maxPos + 1,
      });
      return error;
    },
    [tickets]
  );

  const updateTicket = useCallback(
    async (id: string, changes: Partial<Omit<Ticket, 'id' | 'created_at'>>) => {
      const { error } = await supabase
        .from('tickets')
        .update(changes)
        .eq('id', id);
      return error;
    },
    []
  );

  const deleteTicket = useCallback(async (id: string) => {
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    return error;
  }, []);

  const reorderQueue = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      const todoTickets = tickets
        .filter((t) => t.status === 'todo')
        .sort((a, b) => (a.queue_position ?? 99999) - (b.queue_position ?? 99999));

      const idx = todoTickets.findIndex((t) => t.id === id);
      if (idx === -1) return;

      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= todoTickets.length) return;

      const current = todoTickets[idx];
      const neighbor = todoTickets[swapIdx];
      const currentPos = current.queue_position ?? idx + 1;
      const neighborPos = neighbor.queue_position ?? swapIdx + 1;

      await Promise.all([
        supabase.from('tickets').update({ queue_position: neighborPos }).eq('id', current.id),
        supabase.from('tickets').update({ queue_position: currentPos }).eq('id', neighbor.id),
      ]);
    },
    [tickets]
  );

  return { tickets, loading, createTicket, updateTicket, deleteTicket, reorderQueue };
}
