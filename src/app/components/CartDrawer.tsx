'use client';

import React, { useActionState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { submitInquiry, ActionState } from '../actions/products';
import { X, Trash2, ChevronRight, Plus, Minus, FileText } from 'lucide-react';

const initialState: ActionState = {
  errors: {},
  success: false,
  message: ''
};

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const [state, formAction, pending] = useActionState(submitInquiry, initialState);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close drawer if clicking outside the panel
  useEffect(() => {
    if (!isCartOpen) return;
    
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCartOpen, setIsCartOpen]);

  // Clear cart on successful inquiry submission
  useEffect(() => {
    if (state?.success) {
      clearCart();
    }
  }, [state, clearCart]);

  if (!isCartOpen) return null;

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div
        ref={containerRef}
        className="w-full max-w-lg h-full bg-brand-bg shadow-2xl flex flex-col border-l border-black/[0.08] dark:border-white/[0.08] animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-primary-500" size={20} />
            <h2 className="text-lg font-bold text-brand-fg">Inquiry RFQ Cart</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success State */}
        {state?.success ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="h-16 w-16 bg-primary-100 dark:bg-primary-500/20 text-primary-500 rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-brand-fg">Request Submitted!</h3>
            <p className="text-sm text-brand-fg/60 max-w-sm">
              {state.message}
            </p>
            <button
              onClick={() => {
                setIsCartOpen(false);
                // Force reset state by reloading or just hiding
                window.location.reload();
              }}
              className="mt-4 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        ) : cart.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <span className="text-4xl">📁</span>
            <h3 className="text-base font-bold text-brand-fg">Your Inquiry Cart is Empty</h3>
            <p className="text-xs text-brand-fg/50 max-w-xs">
              Browse our catalog and add industrial cleaning equipment or chemical solutions to request a quotation.
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="mt-2 px-5 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-xs font-semibold transition-colors"
            >
              Go to Products
            </button>
          </div>
        ) : (
          /* Active Cart list & Form */
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Product items list */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-fg/40">Selected Products</h4>
                <div className="space-y-3 divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex gap-4 pt-3 first:pt-0">
                      {/* Placeholder drawing or SVG instead of actual images */}
                      <div className="h-16 w-16 bg-black/[0.03] dark:bg-white/[0.03] rounded-md border flex items-center justify-center shrink-0">
                        <span className="text-xl">🧽</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-semibold text-brand-fg truncate">{item.name}</h5>
                        <p className="text-[10px] text-brand-fg/50 font-mono mt-0.5">SKU: {item.sku}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity control */}
                          <div className="flex items-center border border-black/10 dark:border-white/10 rounded-md">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-1 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-1 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-brand-fg">
                              ${(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.productId)}
                              className="text-brand-fg/40 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total value estimation */}
                <div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-4 flex justify-between items-center">
                  <span className="text-xs text-brand-fg/60 font-medium">Estimated Catalog Total:</span>
                  <span className="text-base font-extrabold text-brand-fg">
                    ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Inquiry RFQ Form */}
              <div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-fg/40">Request a Quotation</h4>
                
                <form action={formAction} className="space-y-4">
                  {/* Hidden field containing stringified items */}
                  <input
                    type="hidden"
                    name="items"
                    value={JSON.stringify(
                      cart.map((i) => ({
                        productId: i.productId,
                        name: i.name,
                        sku: i.sku,
                        quantity: i.quantity
                      }))
                    )}
                  />

                  {state?.errors?.form && (
                    <div className="p-3 text-xs bg-red-500/10 text-red-500 border border-red-500/20 rounded-md">
                      {state.errors.form.join(' ')}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="clientName" className="block text-[10px] font-semibold uppercase tracking-wider text-brand-fg/50 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        name="clientName"
                        id="clientName"
                        className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 focus:border-primary-500 focus:outline-none rounded-lg px-3 py-2 text-xs"
                        placeholder="John Doe"
                      />
                      {state?.errors?.clientName && (
                        <p className="text-[10px] text-red-500 mt-1">{state.errors.clientName[0]}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="clientEmail" className="block text-[10px] font-semibold uppercase tracking-wider text-brand-fg/50 mb-1">
                        Work Email
                      </label>
                      <input
                        type="email"
                        name="clientEmail"
                        id="clientEmail"
                        className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 focus:border-primary-500 focus:outline-none rounded-lg px-3 py-2 text-xs"
                        placeholder="jdoe@company.com"
                      />
                      {state?.errors?.clientEmail && (
                        <p className="text-[10px] text-red-500 mt-1">{state.errors.clientEmail[0]}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="clientCompany" className="block text-[10px] font-semibold uppercase tracking-wider text-brand-fg/50 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="clientCompany"
                        id="clientCompany"
                        className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 focus:border-primary-500 focus:outline-none rounded-lg px-3 py-2 text-xs"
                        placeholder="Acme Corp"
                      />
                      {state?.errors?.clientCompany && (
                        <p className="text-[10px] text-red-500 mt-1">{state.errors.clientCompany[0]}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="clientPhone" className="block text-[10px] font-semibold uppercase tracking-wider text-brand-fg/50 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="clientPhone"
                        id="clientPhone"
                        className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 focus:border-primary-500 focus:outline-none rounded-lg px-3 py-2 text-xs"
                        placeholder="+1 (555) 012-3456"
                      />
                      {state?.errors?.clientPhone && (
                        <p className="text-[10px] text-red-500 mt-1">{state.errors.clientPhone[0]}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-[10px] font-semibold uppercase tracking-wider text-brand-fg/50 mb-1">
                      Requirements Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows={3}
                      className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 focus:border-primary-500 focus:outline-none rounded-lg p-3 text-xs resize-none"
                      placeholder="Specify customized options, delivery locations, bulk needs, etc."
                    />
                  </div>

                  <button
                    disabled={pending}
                    type="submit"
                    className="w-full shine-btn py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:opacity-95 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-opacity"
                  >
                    {pending ? 'Submitting Quote Request...' : 'Submit RFQ Quotation'}
                    <ChevronRight size={14} />
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
