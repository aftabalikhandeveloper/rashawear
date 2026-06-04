'use client';

import React, { useState } from 'react';
import { Mail, ArrowRight, Check } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail size={24} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Don&apos;t miss out on special offers
          </h2>
          <p className="text-gray-400 mb-8">
            Register to receive news about the latest, savings combos, discount codes, and more.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-5 py-3.5 bg-white/10 border border-white/10 rounded-full text-sm text-white placeholder:text-gray-500 outline-none focus:border-white/30 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitted}
              className="px-6 py-3.5 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 disabled:opacity-70"
            >
              {submitted ? (
                <>
                  <Check size={16} />
                  Done!
                </>
              ) : (
                <>
                  Subscribe
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
