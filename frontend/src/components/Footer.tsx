'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return React.createElement(
    'footer',
    { className: 'bg-slate-900 text-slate-400 border-t border-slate-800' },
    React.createElement(
      'div',
      { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12' },
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 md:grid-cols-4 gap-8' },
        // Column 1: Brand & Tagline
        React.createElement(
          'div',
          { className: 'space-y-4' },
          React.createElement(
            'div',
            { className: 'flex items-center space-x-2' },
            React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm' }, 'SN'),
            React.createElement('span', { className: 'font-outfit font-extrabold text-white text-md tracking-tight' }, 'Startup Navigator')
          ),
          React.createElement(
            'p',
            { className: 'text-xs text-slate-400 font-medium leading-relaxed' },
            'Your AI-powered guide to building successful startups. Leverage verified databases, templates, and dynamic RAG chat assistance.'
          ),
          React.createElement(
            'div',
            { className: 'flex space-x-3 pt-2' },
            React.createElement('a', { href: '#', className: 'hover:text-white transition-colors' }, React.createElement(Twitter, { className: 'w-4 h-4' })),
            React.createElement('a', { href: '#', className: 'hover:text-white transition-colors' }, React.createElement(Linkedin, { className: 'w-4 h-4' })),
            React.createElement('a', { href: '#', className: 'hover:text-white transition-colors' }, React.createElement(Github, { className: 'w-4 h-4' }))
          )
        ),
        // Column 2: Navigation
        React.createElement(
          'div',
          null,
          React.createElement('h3', { className: 'text-white font-semibold text-sm mb-4' }, 'Platform'),
          React.createElement(
            'ul',
            { className: 'space-y-2.5 text-xs' },
            React.createElement('li', null, React.createElement(Link, { href: '/explore', className: 'hover:text-white transition-colors' }, 'Explore Topics')),
            React.createElement('li', null, React.createElement(Link, { href: '/search', className: 'hover:text-white transition-colors' }, 'AI Chat Search')),
            React.createElement('li', null, React.createElement(Link, { href: '/resources', className: 'hover:text-white transition-colors' }, 'Startup Resources')),
            React.createElement('li', null, React.createElement(Link, { href: '/dashboard', className: 'hover:text-white transition-colors' }, 'User Dashboard'))
          )
        ),
        // Column 3: Legal & Resources
        React.createElement(
          'div',
          null,
          React.createElement('h3', { className: 'text-white font-semibold text-sm mb-4' }, 'Information'),
          React.createElement(
            'ul',
            { className: 'space-y-2.5 text-xs' },
            React.createElement('li', null, React.createElement(Link, { href: '/about', className: 'hover:text-white transition-colors' }, 'About Us')),
            React.createElement('li', null, React.createElement(Link, { href: '/contact', className: 'hover:text-white transition-colors' }, 'Contact Support')),
            React.createElement('li', null, React.createElement('a', { href: '#', className: 'hover:text-white transition-colors' }, 'Privacy Policy')),
            React.createElement('li', null, React.createElement('a', { href: '#', className: 'hover:text-white transition-colors' }, 'Terms of Service'))
          )
        ),
        // Column 4: Contact Us
        React.createElement(
          'div',
          { className: 'space-y-3 text-xs' },
          React.createElement('h3', { className: 'text-white font-semibold sm:mb-4' }, 'Contact'),
          React.createElement(
            'div',
            { className: 'flex items-center space-x-2' },
            React.createElement(Mail, { className: 'w-4 h-4 text-slate-500' }),
            React.createElement('span', null, 'hello@startupnavigator.com')
          ),
          React.createElement(
            'div',
            { className: 'flex items-center space-x-2' },
            React.createElement(Phone, { className: 'w-4 h-4 text-slate-500' }),
            React.createElement('span', null, '+1 (555) 019-2834')
          ),
          React.createElement(
            'div',
            { className: 'flex items-center space-x-2' },
            React.createElement(MapPin, { className: 'w-4 h-4 text-slate-500' }),
            React.createElement('span', null, 'San Francisco, CA')
          )
        )
      ),
      React.createElement('div', { className: 'border-t border-slate-800 mt-8 pt-8 text-center text-[11px] text-slate-500 font-medium' }, '© 2026 Startup Navigator. Built with Next.js 15, FastAPI, and PostgreSQL.')
    )
  );
}
