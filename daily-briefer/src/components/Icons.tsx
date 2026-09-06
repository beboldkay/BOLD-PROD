/** The line icons from the Artifact, unchanged. Each inherits its stroke from
 *  the tile's own token so the four check-in tiles stay visually distinct. */

export function PillIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--pill)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="9" width="18" height="9" rx="4.5" transform="rotate(-35 12 13)" />
      <line x1="12" y1="6" x2="12" y2="20" transform="rotate(-35 12 13)" />
    </svg>
  );
}

export function WaterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--water)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5s6.5 7.2 6.5 12A6.5 6.5 0 0 1 5.5 14.5c0-4.8 6.5-12 6.5-12z" />
    </svg>
  );
}

export function TeethIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--teeth)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3c-2.5 0-4 2-4 5 0 4 1 11 3 11 1.6 0 1.7-4 2.5-4S11 19 12.5 19c1.5 0 1.7-4 3-4 2 0 3-7 3-11 0-3-1.5-5-4-5-1.5 0-2 1-2.5 1S9.5 3 8 3z" />
    </svg>
  );
}

export function CleanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--clean)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21c-4-2.2-7-5.7-7-10 0-3 2-6 7-8 5 2 7 5 7 8 0 4.3-3 7.8-7 10z" />
      <path d="M12 16V8" />
      <path d="M9 11l3-3 3 3" />
    </svg>
  );
}

export function Drop({ full }: { full: boolean }) {
  return full ? (
    <svg viewBox="0 0 24 24" fill="var(--water)" stroke="none">
      <path d="M12 2.5s6.5 7.2 6.5 12A6.5 6.5 0 0 1 5.5 14.5c0-4.8 6.5-12 6.5-12z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" strokeWidth="1.6">
      <path d="M12 2.5s6.5 7.2 6.5 12A6.5 6.5 0 0 1 5.5 14.5c0-4.8 6.5-12 6.5-12z" />
    </svg>
  );
}

export function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 12 9 17 20 6" />
    </svg>
  );
}

export function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}
