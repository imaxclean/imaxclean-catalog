'use client';

import React, { useState, useTransition } from 'react';
import { submitReview } from '../actions/products';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  productId: string;
  isLoggedIn: boolean;
}

export default function ReviewForm({ productId, isLoggedIn }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  if (!isLoggedIn) {
    return (
      <div className="p-5 border border-dashed border-black/10 dark:border-white/10 rounded-xl text-center space-y-2">
        <p className="text-xs text-brand-fg/60">Want to share your feedback?</p>
        <a href="/login" className="inline-block text-xs font-bold text-primary-500 hover:underline">
          Portal Sign In to write a review
        </a>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrors([]);

    startTransition(async () => {
      const res = await submitReview(productId, rating, comment);
      if (res.errors) {
        if (res.errors.comment) {
          setErrors(res.errors.comment);
        } else if (res.errors.form) {
          setErrors(res.errors.form);
        }
      } else {
        setMessage(res.message || 'Review submitted successfully.');
        setComment('');
        setRating(5);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 border border-black/10 dark:border-white/10 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] space-y-4">
      <h4 className="text-sm font-bold text-brand-fg">Submit a Customer Review</h4>

      {message && (
        <div className="p-3 text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md">
          {message}
        </div>
      )}

      {errors.length > 0 && (
        <div className="p-3 text-xs bg-red-500/10 text-red-500 border border-red-500/20 rounded-md">
          {errors.join(' ')}
        </div>
      )}

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-fg/50 mb-1">
          Rating Score
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                size={20}
                className={star <= rating ? 'text-amber-500 fill-amber-500' : 'text-brand-fg/20'}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-[10px] font-bold uppercase tracking-wider text-brand-fg/50 mb-1">
          Comment / Feedback
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 focus:border-primary-500 focus:outline-none rounded-lg p-3 text-xs resize-none"
          placeholder="Describe your user experience with this equipment..."
          required
        />
      </div>

      <button
        disabled={isPending}
        type="submit"
        className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
      >
        {isPending ? 'Submitting...' : 'Post Review'}
      </button>
    </form>
  );
}
