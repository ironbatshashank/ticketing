export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  creator_name: string;
  status: 'todo' | 'in_progress' | 'done';
  days_required: number | null;
  queue_position: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}
