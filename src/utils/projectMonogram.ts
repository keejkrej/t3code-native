export function getProjectMonogram(name: string): string {
  if (!name) return 'PR';
  const parts = name.split(/[-_]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function getProjectColor(name: string): { bg: string; text: string; border: string } {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palettes = [
    { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' }, // Amber
    { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' }, // Emerald
    { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' }, // Blue
    { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' }, // Violet
    { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' }, // Cyan
  ];
  return palettes[hash % palettes.length];
}
