'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return React.createElement(
    'div',
    { className: 'min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-blue-50/20 to-slate-100/50' },
    React.createElement(
      'div',
      { className: 'w-full max-w-md bg-white border border-slate-200 shadow-soft rounded-3xl p-8 space-y-6' },
      
      !submitted ? (
        React.createElement(
          React.Fragment,
          null,
          React.createElement(
            'div',
            { className: 'text-center space-y-2' },
            React.createElement('div', { className: 'w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary' }, React.createElement(KeyRound, { className: 'w-6 h-6' })),
            React.createElement('h2', { className: 'text-2xl font-outfit font-extrabold text-slate-800' }, 'Reset Password'),
            React.createElement('p', { className: 'text-xs text-slate-500 font-medium' }, "Enter your email address and we'll send you a recovery link")
          ),
          React.createElement(
            'form',
            { onSubmit: handleSubmit, className: 'space-y-4 text-left' },
            React.createElement(
              'div',
              { className: 'space-y-1.5' },
              React.createElement('label', { className: 'text-xs font-semibold text-slate-600' }, 'Email Address'),
              React.createElement(
                'div',
                { className: 'relative' },
                React.createElement(Mail, { className: 'absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4' }),
                React.createElement('input', {
                  type: 'email',
                  required: true,
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  placeholder: 'name@company.com',
                  className: 'w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-slate-800'
                })
              )
            ),
            React.createElement(
              'button',
              { type: 'submit', className: 'w-full bg-primary hover:bg-primary-dark text-white font-semibold text-sm py-3 rounded-xl shadow-sm hover:shadow transition-all' },
              'Send Reset Link'
            )
          )
        )
      ) : (
        React.createElement(
          React.Fragment,
          null,
          React.createElement(
            'div',
            { className: 'text-center space-y-4 py-4' },
            React.createElement('div', { className: 'w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto' }, React.createElement(CheckCircle2, { className: 'w-6 h-6' })),
            React.createElement('h2', { className: 'text-2xl font-outfit font-extrabold text-slate-800' }, 'Email Sent'),
            React.createElement(
              'p',
              { className: 'text-xs text-slate-500 font-medium leading-relaxed' },
              "We have successfully dispatched a verification recovery link to ",
              React.createElement('span', { className: 'font-semibold text-slate-700' }, email),
              ". Please inspect your inbox or spam filters."
            )
          )
        )
      ),

      React.createElement(
        'div',
        { className: 'text-center text-xs text-slate-500 border-t border-slate-100 pt-4' },
        React.createElement(
          Link,
          { href: '/login', className: 'inline-flex items-center space-x-1.5 font-semibold text-slate-600 hover:text-primary transition-colors' },
          React.createElement(ArrowLeft, { className: 'w-4 h-4' }),
          React.createElement('span', null, 'Back to Login')
        )
      )
    )
  );
}
