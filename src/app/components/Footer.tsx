import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-black/[0.08] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.01]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider uppercase text-brand-fg">
              IMAXCLEAN
            </h3>
            <p className="text-xs text-brand-fg/60 max-w-xs leading-relaxed">
              Industrial and commercial grade cleaning systems engineered for performance, durability, and resource efficiency.
            </p>
            <div className="flex gap-2">
              <span className="rounded bg-black/[0.04] dark:bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-brand-fg/60">
                ISO 9001
              </span>
              <span className="rounded bg-black/[0.04] dark:bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-brand-fg/60">
                CE Certified
              </span>
              <span className="rounded bg-black/[0.04] dark:bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-brand-fg/60">
                Eco-Conscious
              </span>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold text-brand-fg/90 uppercase tracking-wider mb-4">
              Equipment & Solutions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?category=industrial-equipment" className="text-brand-fg/60 hover:text-primary-500 transition-colors">
                  Scrubber Driers
                </Link>
              </li>
              <li>
                <Link href="/products?category=industrial-equipment" className="text-brand-fg/60 hover:text-primary-500 transition-colors">
                  High-Pressure Washers
                </Link>
              </li>
              <li>
                <Link href="/products?category=chemical-solutions" className="text-brand-fg/60 hover:text-primary-500 transition-colors">
                  Eco Degreasers
                </Link>
              </li>
              <li>
                <Link href="/products?category=chemical-solutions" className="text-brand-fg/60 hover:text-primary-500 transition-colors">
                  Broad Sanitizers
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold text-brand-fg/90 uppercase tracking-wider mb-4">
              Support & Service
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="text-brand-fg/60 hover:text-primary-500 transition-colors">
                  Operator Training
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-fg/60 hover:text-primary-500 transition-colors">
                  Technical Specifications
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-fg/60 hover:text-primary-500 transition-colors">
                  Warranty Registration
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-fg/60 hover:text-primary-500 transition-colors">
                  Spare Parts Inquiry
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold text-brand-fg/90 uppercase tracking-wider mb-4">
              B2B Inquiries
            </h4>
            <p className="text-xs text-brand-fg/60 leading-relaxed mb-2">
              For direct enterprise inquiries, custom specifications, or distribution rights:
            </p>
            <p className="text-xs font-semibold text-brand-fg/80">
              support@imaxclean.com
            </p>
            <p className="text-xs font-semibold text-brand-fg/80">
              +1 (800) 555-IMAX
            </p>
          </div>
        </div>
        
        <div className="mt-8 border-t border-black/[0.06] dark:border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-brand-fg/40 text-center sm:text-left">
            &copy; {currentYear} Imaxclean International. All rights reserved.
          </p>
          <div className="flex gap-4 text-[10px] text-brand-fg/40">
            <a href="#" className="hover:text-primary-500">Privacy Policy</a>
            <a href="#" className="hover:text-primary-500">Terms of Service</a>
            <a href="#" className="hover:text-primary-500">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
