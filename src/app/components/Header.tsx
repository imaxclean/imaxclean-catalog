'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { logout } from '../actions/auth';
import { LogOut, Menu, X } from 'lucide-react';

interface HeaderProps {
  user: {
    name: string;
    role: string;
  } | null;
}

export default function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-zinc-200 shadow-sm transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="IMAXCLEAN"
              className="h-10 w-auto object-contain rounded-md"
            />
          </Link>

          {/* Right side: user info + mobile trigger */}
          <div className="flex items-center gap-4">
            {/* User Auth Info (Only shown if logged in) */}
            {user && (
              <div className="hidden sm:flex items-center gap-4 border-l pl-4 border-black/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-brand-fg">{user.name}</span>
                    <span className="text-[10px] text-brand-fg/50 capitalize">{user.role}</span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="p-2 text-brand-fg/60 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                    title="Log Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Menu Trigger — only for logged-in users */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 sm:hidden text-brand-fg/80 hover:text-primary-500 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown (admin only) */}
      {mobileMenuOpen && user && (
        <div className="sm:hidden border-t border-black/[0.08] bg-white px-4 py-4 space-y-3">
          <div className="border-t border-black/[0.08] pt-3">
            <div className="flex items-center justify-between px-3">
              <div>
                <div className="text-sm font-semibold">{user.name}</div>
                <div className="text-xs text-brand-fg/50 capitalize">{user.role}</div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 text-sm text-red-500 font-semibold py-1.5 px-3 rounded-md hover:bg-red-500/10"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
