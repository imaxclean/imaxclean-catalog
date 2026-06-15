'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { signup, ActionState } from '../actions/auth';
import { User, Mail, KeyRound, ArrowRight } from 'lucide-react';

const initialState: ActionState = {
  errors: {},
  success: false,
  message: ''
};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-radial from-primary-500/5 via-brand-bg to-brand-bg">
      <div className="w-full max-w-md p-8 rounded-2xl glassmorphism space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            IMAXCLEAN
          </span>
          <h2 className="text-xl font-bold text-brand-fg">Create B2B Account</h2>
          <p className="text-xs text-brand-fg/60">
            Register to join our portal and submit professional quote requests.
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-4">
          {state?.errors?.form && (
            <div className="p-3 text-xs bg-red-500/10 text-red-500 border border-red-500/20 rounded-md">
              {state.errors.form}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-brand-fg/50">
              Your Full Name
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                name="name"
                id="name"
                className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 focus:border-primary-500 focus:outline-none rounded-lg pl-9 pr-3 py-2.5 text-xs"
                placeholder="Alex Johnson"
                required
              />
              <User className="absolute left-3 text-brand-fg/40" size={14} />
            </div>
            {state?.errors?.name && (
              <p className="text-[10px] text-red-500 mt-1">{state.errors.name[0]}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-brand-fg/50">
              Work Email Address
            </label>
            <div className="relative flex items-center">
              <input
                type="email"
                name="email"
                id="email"
                className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 focus:border-primary-500 focus:outline-none rounded-lg pl-9 pr-3 py-2.5 text-xs"
                placeholder="email@company.com"
                required
              />
              <Mail className="absolute left-3 text-brand-fg/40" size={14} />
            </div>
            {state?.errors?.email && (
              <p className="text-[10px] text-red-500 mt-1">{state.errors.email[0]}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-brand-fg/50">
              Choose Security Password
            </label>
            <div className="relative flex items-center">
              <input
                type="password"
                name="password"
                id="password"
                className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 focus:border-primary-500 focus:outline-none rounded-lg pl-9 pr-3 py-2.5 text-xs"
                placeholder="Min. 6 characters"
                required
              />
              <KeyRound className="absolute left-3 text-brand-fg/40" size={14} />
            </div>
            {state?.errors?.password && (
              <p className="text-[10px] text-red-500 mt-1">{state.errors.password[0]}</p>
            )}
          </div>

          <button
            disabled={pending}
            type="submit"
            className="w-full shine-btn py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:opacity-95 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-opacity cursor-pointer"
          >
            {pending ? 'Registering Account...' : 'Create B2B Account'}
            <ArrowRight size={13} />
          </button>
        </form>

        {/* Footer info link */}
        <div className="text-center text-xs text-brand-fg/60 pt-4 border-t border-black/[0.05] dark:border-white/[0.05]">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-primary-500 hover:underline">
            Portal Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
