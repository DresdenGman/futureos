import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const links = [
  { href: '/challenge', label: '7-day field test' },
  { href: '/tools', label: 'Open instruments' },
  { href: '/research', label: 'Research protocol' },
  { href: '/impact', label: 'Public impact' },
  { href: '/privacy', label: 'Privacy' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/15 bg-ink text-bone">
      <div className="page-shell grid gap-10 py-12 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-signal">
            FutureOS / Decision field
          </p>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/48">
            A versioned memory for decisions made before the outcome was known.
          </p>
          <a
            href="https://github.com/DresdenGman/futureos"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 border-b border-white/25 pb-1 text-xs font-bold text-white/65 hover:text-white"
          >
            Open source on GitHub <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <nav className="grid grid-cols-2 gap-x-8 gap-y-3" aria-label="Footer">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-bold text-white/45 hover:text-signal"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
