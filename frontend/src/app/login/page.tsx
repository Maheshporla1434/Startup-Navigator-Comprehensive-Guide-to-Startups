'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Retrieve role for redirect routing
        const role = localStorage.getItem('role');
        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError('Incorrect email or password. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return React.createElement(
    'div',
    { className: 'min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-blue-50/20 to-slate-100/50' },
    React.createElement(
      'div',
      { className: 'w-full max-w-md bg-white border border-slate-200 shadow-soft rounded-3xl p-8 space-y-6' },
      
      // Top header
      React.createElement(
        'div',
        { className: 'text-center space-y-2' },
        React.createElement('div', { className: 'w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary' }, React.createElement(Shield, { className: 'w-6 h-6' })),
        React.createElement('h2', { className: 'text-2xl font-outfit font-extrabold text-slate-800' }, 'Welcome Back'),
        React.createElement('p', { className: 'text-xs text-slate-500 font-medium' }, 'Login to access your bookmarks and AI search history')
      ),

      // Error Banner
      error && React.createElement(
        'div',
        { className: 'bg-red-50 text-red-600 border border-red-100 rounded-2xl p-3.5 flex items-start space-x-2 text-xs font-semibold' },
        React.createElement(AlertCircle, { className: 'w-4 h-4 mt-0.5 flex-shrink-0' }),
        React.createElement('span', null, error)
      ),

      // Form
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
          'div',
          { className: 'space-y-1.5' },
          React.createElement(
            'div',
            { className: 'flex justify-between items-center' },
            React.createElement('label', { className: 'text-xs font-semibold text-slate-600' }, 'Password'),
            React.createElement(Link, { href: '/forgot-password', className: 'text-[11px] font-semibold text-primary hover:underline' }, 'Forgot?')
          ),
          React.createElement(
            'div',
            { className: 'relative' },
            React.createElement(Lock, { className: 'absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4' }),
            React.createElement('input', {
              type: showPassword ? 'text' : 'password',
              required: true,
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: '••••••••',
              className: 'w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-slate-800'
            }),
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: () => setShowPassword(!showPassword),
                className: 'absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none'
              },
              React.createElement(showPassword ? EyeOff : Eye, { className: 'w-4 h-4' })
            )
          )
        ),
        React.createElement(
          'button',
          {
            type: 'submit',
            disabled: submitting,
            className: 'w-full bg-primary hover:bg-primary-dark disabled:bg-primary/60 text-white font-semibold text-sm py-3 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-1.5'
          },
          submitting ? React.createElement(Loader2, { className: 'w-4 h-4 animate-spin' }) : null,
          React.createElement('span', null, submitting ? 'Signing In...' : 'Sign In')
        )
      ),

      // Footer
      React.createElement(
        'div',
        { className: 'text-center text-xs text-slate-500 border-t border-slate-100 pt-4' },
        "Don't have an account? ",
        React.createElement(Link, { href: '/register', className: 'font-semibold text-primary hover:underline' }, 'Sign Up Free')
      )
    )
  );
}
