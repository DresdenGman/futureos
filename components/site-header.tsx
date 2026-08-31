import Link from 'next/link';
import { ArrowRight, ChevronDown, LogOut } from 'lucide-react';
import {
  chatGPTSignInPath,
  chatGPTSignOutPath,
  getChatGPTUser,
} from '@/app/chatgpt-auth';

const productLinks = [
  { href: '/workspace', label: 'Workspace' },
  { href: '/map', label: 'Decision map' },
  { href: '/memory', label: 'Memory' },
  { href: '/tools', label: 'Free tools' },
  { href: '/research', label: 'Research' },
];

export async function SiteHeader() {
  const user = await getChatGPTUser();
  return (
    <header className="sticky top-0 z-40 border-b border-[#0b1511]/15 bg-[#f2efe6]/92 backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="focus-ring flex items-center gap-3"
          aria-label="FutureOS home"
        >
          <span className="grid h-9 min-w-14 grid-cols-2 overflow-hidden border border-[#0b1511] bg-[#0b1511] font-mono text-[10px] font-black">
            <span className="grid place-items-center text-[#d4ff4f]">F</span>
            <span className="grid place-items-center bg-[#d4ff4f] text-[#0b1511]">
              OS
            </span>
          </span>
          <span>
            <span className="block text-sm font-black tracking-[-0.03em] text-[#0b1511]">
              FutureOS
            </span>
            <span className="block font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-[#3d6800]">
              Decision field / 01
            </span>
          </span>
        </Link>
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary navigation"
        >
          {productLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring border-b border-transparent px-3 py-2 text-xs font-bold text-[#0b1511]/52 transition hover:border-[#0b1511] hover:text-[#0b1511]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="max-w-40 truncate font-mono text-[10px] font-semibold text-[#0b1511]/48">
                {user.displayName}
              </span>
              <a
                href={chatGPTSignOutPath('/')}
                className="focus-ring flex h-9 w-9 items-center justify-center border border-[#0b1511]/20 bg-transparent text-[#0b1511]/52 transition hover:border-[#0b1511] hover:text-[#0b1511]"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </a>
              <Link
                href="/decisions/new"
                className="focus-ring inline-flex h-9 items-center gap-2 border border-[#0b1511] bg-[#0b1511] px-4 text-xs font-black uppercase tracking-[0.03em] text-white transition hover:bg-[#d4ff4f] hover:text-[#0b1511]"
              >
                New decision <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <a
                href={chatGPTSignInPath('/workspace')}
                target="_top"
                className="focus-ring border-b border-transparent px-3 py-2 text-xs font-bold text-[#0b1511]/58 hover:border-[#0b1511] hover:text-[#0b1511]"
              >
                Sign in
              </a>
              <a
                href={chatGPTSignInPath('/decisions/new')}
                target="_top"
                className="focus-ring inline-flex h-9 items-center gap-2 border border-[#0b1511] bg-[#0b1511] px-4 text-xs font-black uppercase tracking-[0.03em] text-white transition hover:bg-[#d4ff4f] hover:text-[#0b1511]"
              >
                Start a decision <ArrowRight className="h-4 w-4" />
              </a>
            </>
          )}
        </div>
        <details className="group relative md:hidden">
          <summary className="focus-ring flex h-9 cursor-pointer list-none items-center gap-2 border border-[#0b1511]/20 bg-[#f2efe6] px-3 text-xs font-bold text-[#0b1511]">
            Menu{' '}
            <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
          </summary>
          <div className="absolute right-0 mt-2 w-56 border border-[#0b1511]/20 bg-[#fbfaf6] p-2 shadow-xl">
            {productLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2.5 text-sm font-bold text-[#0b1511]/65 hover:bg-[#d4ff4f]/35 hover:text-[#0b1511]"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-1 border-t border-[#0b1511]/10" />
            <a
              href={
                user ? chatGPTSignOutPath('/') : chatGPTSignInPath('/workspace')
              }
              target="_top"
              className="block px-3 py-2.5 text-sm font-black text-[#3d6800] hover:bg-[#d4ff4f]/35"
            >
              {user ? 'Sign out' : 'Sign in to save'}
            </a>
          </div>
        </details>
      </div>
    </header>
  );
}
