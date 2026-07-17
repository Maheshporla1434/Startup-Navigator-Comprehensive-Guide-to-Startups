'use client';

import React from 'react';
import { Compass, Cpu, Database, Layout, ShieldAlert } from 'lucide-react';

export default function AboutPage() {
  const stack = [
    { name: 'Next.js 15 (App Router)', desc: 'Provides fast page loading, routing structure, and server-side optimization.', category: 'Frontend', icon: Layout },
    { name: 'FastAPI (Python)', desc: 'Powering high performance microsecond-level REST endpoints and auth validation.', category: 'Backend', icon: Cpu },
    { name: 'PostgreSQL DB', desc: 'Saves and retrieves transactional logs, bookmark indexes, and chat sessions.', category: 'Database', icon: Database },
    { name: 'RAG Pipeline & LLM', desc: 'Combines text embeds with context similarity matching to ground answers.', category: 'Artificial Intelligence', icon: Compass }
  ];

  return React.createElement(
    'div',
    { className: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 text-left' },
    
    // Header
    React.createElement(
      'div',
      { className: 'text-center space-y-4' },
      React.createElement('h1', { className: 'text-4xl font-outfit font-extrabold text-slate-900 tracking-tight' }, 'About Startup Navigator'),
      React.createElement('p', { className: 'text-base text-slate-500 max-w-2xl mx-auto' }, 'Our mission is to democratize venture-building knowledge for founders everywhere, using high-quality guidelines and robust artificial intelligence.')
    ),

    // Sections
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 md:grid-cols-2 gap-8' },
      React.createElement(
        'div',
        { className: 'bg-white border border-slate-200 p-6 rounded-3xl space-y-3' },
        React.createElement('h2', { className: 'text-lg font-bold text-slate-800' }, 'Our Vision'),
        React.createElement(
          'p',
          { className: 'text-xs text-slate-500 leading-relaxed font-medium' },
          'We believe starting a business should not be restricted by lack of corporate transparency or legal complexities. By compiling standard practices from top tier incubators and division codes, we provide a unified resource library.'
        )
      ),
      React.createElement(
        'div',
        { className: 'bg-white border border-slate-200 p-6 rounded-3xl space-y-3' },
        React.createElement('h2', { className: 'text-lg font-bold text-slate-800' }, 'Verify & Build'),
        React.createElement(
          'p',
          { className: 'text-xs text-slate-500 leading-relaxed font-medium' },
          'All resources are verified against active government schemas, venture parameters, and option frameworks. Grounded retrieval ensures you receive source links directly corresponding to the matching rules.'
        )
      )
    ),

    // Stack Details
    React.createElement(
      'div',
      { className: 'space-y-6' },
      React.createElement('h2', { className: 'text-2xl font-outfit font-bold text-slate-800 text-center' }, 'Technology Ecosystem'),
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
        stack.map((item, idx) => React.createElement(
          'div',
          { key: idx, className: 'bg-slate-50 border border-slate-200/80 p-5 rounded-2xl flex items-start space-x-4' },
          React.createElement('div', { className: 'w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0' }, React.createElement(item.icon, { className: 'w-5 h-5' })),
          React.createElement(
            'div',
            null,
            React.createElement('span', { className: 'text-[10px] font-bold text-primary uppercase tracking-wider block' }, item.category),
            React.createElement('h3', { className: 'text-xs font-bold text-slate-800 mt-0.5' }, item.name),
            React.createElement('p', { className: 'text-[11px] text-slate-500 mt-1 leading-normal font-medium' }, item.desc)
          )
        ))
      )
    )
  );
}
