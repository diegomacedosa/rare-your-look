/** Formatação de tempo, números e datas (pt-BR). */

/** 95 → "1:35" */
export function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** 95 → "1 min 35 s" (para leitores de tela) */
export function spokenTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (!m) return `${s} segundos`;
  return s ? `${m} minuto${m > 1 ? 's' : ''} e ${s} segundos` : `${m} minuto${m > 1 ? 's' : ''}`;
}

export function formatPoints(value) {
  return new Intl.NumberFormat('pt-BR').format(Math.round(value));
}

export function formatDate(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
}

export function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
