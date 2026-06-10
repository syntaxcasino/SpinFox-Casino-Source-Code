export function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000); // convert seconds to milliseconds
    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).replace(',', ''); // remove the comma for exact format
}

export function slugifyTeamName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-'); // replace spaces with dash
}