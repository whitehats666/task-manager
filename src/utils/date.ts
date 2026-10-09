export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return 'Not Submitted';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Not Submitted';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return 'Not Submitted';
  }
}

export function formatDate(isoString?: string | null): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return '-';
  }
}
