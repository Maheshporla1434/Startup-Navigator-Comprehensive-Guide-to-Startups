'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Compass, BookOpen, Star, Sparkles, Building2, Scale, 
  BarChart2, Award, ArrowRight, ChevronDown, Percent, Info,
  DollarSign, CheckCircle2, HeartHandshake, ShieldAlert
} from 'lucide-react';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const router = useRouter();

  // Startup Calculator State
  const [fundingTarget, setFundingTarget] = useState(500000); // $500k
  const [equityOffered, setEquityOffered] = useState(20); // 20%
  const [esopPool, setEsopPool] = useState(10); // 10%

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    // Instant redirect for friction-free UX
    router.push(`/search?q=${encodeURIComponent(text)}`);
  };

  // Calculations for the interactive widget
  const postMoneyValuation = fundingTarget / (equityOffered / 100);
  const preMoneyValuation = postMoneyValuation - fundingTarget;
  const founderEquityAfter = 100 - equityOffered - esopPool;

  const categories = [
    { title: 'Funding & Equity', slug: 'funding', icon: BarChart2, desc: 'Bootstrap guides, VC pitching structures, and cap tables.', color: 'from-blue-500 to-indigo-500', hoverBg: 'group-hover:bg-blue-50' },
    { title: 'Legal & Incorporation', slug: 'legal', icon: Scale, desc: 'Delaware C-Corp, vesting term sheets, and IP protection.', color: 'from-teal-500 to-emerald-500', hoverBg: 'group-hover:bg-teal-50' },
    { title: 'Marketing & Acquisition', slug: 'marketing', icon: Sparkles, desc: 'Growth loops, CAC payback computations, and search optimization.', color: 'from-purple-500 to-pink-500', hoverBg: 'group-hover:bg-purple-50' },
    { title: 'Hiring & Equity Pools', slug: 'hiring', icon: Building2, desc: 'Early hire salary metrics, remote plans, and ESOP pool options.', color: 'from-amber-500 to-orange-500', hoverBg: 'group-hover:bg-amber-50' },
    { title: 'Branding & Design', slug: 'branding', icon: Award, desc: 'Brand architecture guidelines, values framing, and designs.', color: 'from-rose-500 to-red-500', hoverBg: 'group-hover:bg-rose-50' },
  ];

  const searchSuggestions = [
    "Delaware C-Corp vesting cliff",
    "SaaS LTV to CAC ratios",
    "How to raise a seed round",
    "Stock option pool size"
  ];

  const faqs = [
    { q: "What is Startup Navigator?", a: "Startup Navigator is a comprehensive database and AI-powered co-pilot providing verified templates, calculators, and guides to help founders build, incorporate, fund, and scale their businesses successfully." },
    { q: "How does the AI search work?", a: "We utilize Retrieval-Augmented Generation (RAG) mapped on PostgreSQL. When you ask a question, our AI embeds the query, searches our verified databases for matched context, and returns a grounded answer complete with source citations." },
    { q: "Are these legal templates binding?", a: "Our templates are standard frameworks based on common Y Combinator and industry standards. While highly robust, we always recommend reviewing final versions with qualified attorneys." },
    { q: "Can I manage articles if I am an administrator?", a: "Yes! Startup Navigator features a complete Admin CMS panel supporting Markdown writing, image mapping, draft/publish states, and role-based permissions." }
  ];

  return React.createElement(
    'div',
    { className: 'space-y-24 pb-24 bg-slate-50/50' },
    
    // 1. Hero Section
    React.createElement(
      'section',
      { className: 'relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-slate-50 to-white pt-24 pb-12' },
      // Decorative background blur elements
      React.createElement('div', { className: 'absolute top-[-10%] right-[-10%] w-[450px] h-[450px] bg-primary/5 rounded-full blur-[100px] pointer-events-none' }),
      React.createElement('div', { className: 'absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-secondary/5 rounded-full blur-[80px] pointer-events-none' }),
      
      React.createElement(
        'div',
        { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center' },
        
        // Hero Left
        React.createElement(
          'div',
          { className: 'lg:col-span-7 space-y-8 text-left' },
          React.createElement(
            'div',
            { className: 'inline-flex items-center space-x-2 bg-blue-50 text-primary border border-blue-100 rounded-full px-4.5 py-1.5 text-xs font-semibold hover:bg-blue-100/70 transition-colors duration-300 shadow-sm cursor-pointer' },
            React.createElement(Sparkles, { className: 'w-3.5 h-3.5 animate-pulse text-primary' }),
            React.createElement('span', null, 'AI-Powered RAG Co-Pilot Active')
          ),
          React.createElement(
            'h1',
            { className: 'text-4xl sm:text-5xl lg:text-6xl font-outfit font-extrabold text-slate-900 tracking-tight leading-[1.1]' },
            'Your AI-Powered Guide to Building ',
            React.createElement('span', { className: 'text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary' }, 'Successful Startups')
          ),
          React.createElement(
            'p',
            { className: 'text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl' },
            'Navigate funding pipelines, understand complex legal frameworks, scale your marketing loops, and search our verified knowledge base with zero hallucinations.'
          ),
          
          // Search Form
          React.createElement(
            'form',
            { onSubmit: handleSearchSubmit, className: 'flex flex-col sm:flex-row gap-3 max-w-xl' },
            React.createElement(
              'div',
              { className: 'relative flex-grow' },
              React.createElement(Search, { className: 'absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5' }),
              React.createElement('input', {
                type: 'text',
                placeholder: 'Ask AI: "How does founder vesting with a 1-year cliff work?"',
                value: query,
                onChange: (e) => setQuery(e.target.value),
                className: 'w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 shadow-soft bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800'
              })
            ),
            React.createElement(
              'button',
              { type: 'submit', className: 'bg-primary hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-sm hover:shadow transition-all duration-300 flex items-center justify-center space-x-2' },
              React.createElement('span', null, 'Ask AI Co-Pilot'),
              React.createElement(ArrowRight, { className: 'w-4 h-4' })
            )
          ),
          
          // Suggestions Chips (Clickable)
          React.createElement(
            'div',
            { className: 'space-y-2' },
            React.createElement('span', { className: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest block' }, 'Suggested Queries:'),
            React.createElement(
              'div',
              { className: 'flex flex-wrap gap-2' },
              searchSuggestions.map((item, idx) => React.createElement(
                'button',
                {
                  key: idx,
                  type: 'button',
                  onClick: () => handleSuggestionClick(item),
                  className: 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 shadow-sm hover:border-slate-300 active:scale-[0.97]'
                },
                item
              ))
            )
          )
        ),
        
        // Hero Right: Interactive Cap Table Calculator
        React.createElement(
          'div',
          { className: 'lg:col-span-5' },
          React.createElement(
            'div',
            { className: 'bg-white border border-slate-200 shadow-soft rounded-3xl p-6 relative z-10 space-y-6 hover:shadow-md transition-shadow duration-300 text-left' },
            React.createElement(
              'div',
              { className: 'flex justify-between items-center pb-3 border-b border-slate-100' },
              React.createElement(
                'div',
                { className: 'flex items-center space-x-1.5' },
                React.createElement(Percent, { className: 'w-4 h-4 text-primary' }),
                React.createElement('h3', { className: 'font-outfit font-extrabold text-sm text-slate-800' }, 'Cap Table Simulator')
              ),
              React.createElement(
                'div',
                { className: 'inline-flex items-center space-x-1 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold' },
                React.createElement(Info, { className: 'w-3 h-3' }),
                React.createElement('span', null, 'Interactive')
              )
            ),
            
            // Slider 1: Funding target
            React.createElement(
              'div',
              { className: 'space-y-1.5' },
              React.createElement(
                'div',
                { className: 'flex justify-between text-xs font-semibold text-slate-600' },
                React.createElement('span', null, 'Target Funding ($)'),
                React.createElement('span', { className: 'font-bold text-primary' }, `$${fundingTarget.toLocaleString('en-US')}`)
              ),
              React.createElement('input', {
                type: 'range',
                min: 50000,
                max: 2000000,
                step: 50000,
                value: fundingTarget,
                onChange: (e) => setFundingTarget(Number(e.target.value)),
                className: 'w-full accent-primary h-1.5 bg-slate-100 rounded-lg cursor-pointer'
              })
            ),
            
            // Slider 2: Equity Offered
            React.createElement(
              'div',
              { className: 'space-y-1.5' },
              React.createElement(
                'div',
                { className: 'flex justify-between text-xs font-semibold text-slate-600' },
                React.createElement('span', null, 'Equity Offered to VC (%)'),
                React.createElement('span', { className: 'font-bold text-primary' }, `${equityOffered}%`)
              ),
              React.createElement('input', {
                type: 'range',
                min: 5,
                max: 40,
                step: 1,
                value: equityOffered,
                onChange: (e) => setEquityOffered(Number(e.target.value)),
                className: 'w-full accent-primary h-1.5 bg-slate-100 rounded-lg cursor-pointer'
              })
            ),

            // Slider 3: ESOP Pool
            React.createElement(
              'div',
              { className: 'space-y-1.5' },
              React.createElement(
                'div',
                { className: 'flex justify-between text-xs font-semibold text-slate-600' },
                React.createElement('span', null, 'Employee Pool Option (ESOP)'),
                React.createElement('span', { className: 'font-bold text-primary' }, `${esopPool}%`)
              ),
              React.createElement('input', {
                type: 'range',
                min: 5,
                max: 25,
                step: 1,
                value: esopPool,
                onChange: (e) => setEsopPool(Number(e.target.value)),
                className: 'w-full accent-primary h-1.5 bg-slate-100 rounded-lg cursor-pointer'
              })
            ),

            // Output Calculations Details
            React.createElement(
              'div',
              { className: 'bg-slate-50 border border-slate-100 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs' },
              React.createElement(
                'div',
                { className: 'text-left' },
                React.createElement('span', { className: 'text-slate-400 block text-[10px] uppercase font-bold' }, 'Post-Money Valuation'),
                React.createElement('span', { className: 'text-slate-800 font-extrabold text-sm block mt-0.5' }, `$${postMoneyValuation.toLocaleString('en-US', {maximumFractionDigits: 0})}`)
              ),
              React.createElement(
                'div',
                { className: 'text-left' },
                React.createElement('span', { className: 'text-slate-400 block text-[10px] uppercase font-bold' }, 'Pre-Money Valuation'),
                React.createElement('span', { className: 'text-slate-800 font-extrabold text-sm block mt-0.5' }, `$${preMoneyValuation.toLocaleString('en-US', {maximumFractionDigits: 0})}`)
              ),
              React.createElement(
                'div',
                { className: 'text-left col-span-2 border-t border-slate-200/50 pt-2.5 mt-1 flex justify-between items-center' },
                React.createElement('span', { className: 'text-slate-500 font-bold' }, 'Co-Founders Retention:'),
                React.createElement('span', { className: 'text-emerald-600 font-black text-sm' }, `${founderEquityAfter}%`)
              )
            )
          )
        )
      )
    ),

    // 2. Categories Section
    React.createElement(
      'section',
      { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12' },
      React.createElement(
        'div',
        { className: 'text-center space-y-3 max-w-2xl mx-auto' },
        React.createElement('h2', { className: 'text-3xl font-outfit font-extrabold text-slate-800 tracking-tight' }, 'Explore Startup Categories'),
        React.createElement('p', { className: 'text-sm text-slate-500 font-medium' }, 'Browse deep guides on legal setup, venture fundraising, cap tables, ESOPs, and customer analytics.')
      ),
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6' },
        categories.map((cat, idx) => React.createElement(
          Link,
          {
            key: idx,
            href: `/explore?category=${cat.slug}`,
            className: 'bg-white border border-slate-200/80 rounded-3xl p-6 shadow-soft card-interactive text-left group flex flex-col justify-between h-48 cursor-pointer hover:border-primary/20'
          },
          React.createElement(
            'div',
            { className: `w-10 h-10 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110` },
            React.createElement(cat.icon, { className: 'w-5 h-5' })
          ),
          React.createElement(
            'div',
            { className: 'space-y-1.5' },
            React.createElement('h3', { className: 'font-outfit font-bold text-slate-800 text-xs sm:text-sm group-hover:text-primary transition-colors flex items-center' }, React.createElement('span', null, cat.title), React.createElement(ArrowRight, { className: 'w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-1 text-primary group-hover:translate-x-1' })),
            React.createElement('p', { className: 'text-[11px] text-slate-500 leading-snug line-clamp-3 font-medium' }, cat.desc)
          )
        ))
      )
    ),

    // 3. Middle Interactive Feature: Seed Roadmap Steps
    React.createElement(
      'section',
      { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
      React.createElement(
        'div',
        { className: 'bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-[40px] p-8 md:p-12 shadow-xl border border-slate-800 relative overflow-hidden text-left' },
        // Decorative background blur
        React.createElement('div', { className: 'absolute bottom-[-20%] right-[-10%] w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none' }),
        
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-center' },
          React.createElement(
            'div',
            { className: 'lg:col-span-6 space-y-6' },
            React.createElement('h2', { className: 'text-2xl sm:text-3xl font-outfit font-extrabold text-white tracking-tight' }, 'Launch Confidently with Verified Steps'),
            React.createElement('p', { className: 'text-xs sm:text-sm text-indigo-200 leading-relaxed font-medium' }, 'Avoid expensive founder mistakes. From Delaware filing configurations, 83(b) tax elections, to seed pitch deck structuring, we map the sequence clearly.'),
            React.createElement(
              Link,
              { href: '/explore', className: 'inline-flex items-center space-x-2 bg-white text-indigo-950 font-bold text-xs px-5 py-3 rounded-2xl hover:bg-indigo-50 transition-colors shadow' },
              React.createElement('span', null, 'Begin Founder Roadmap'),
              React.createElement(ArrowRight, { className: 'w-4 h-4 text-indigo-950' })
            )
          ),
          React.createElement(
            'div',
            { className: 'lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4' },
            [
              { step: '01', title: 'File Delaware C-Corp', desc: 'Secure institutional investment options.' },
              { step: '02', title: 'Vesting & Cliffs', desc: 'Protect alignment between co-founders.' },
              { step: '03', title: 'Seed Pitch Prep', desc: 'Structure problem, sizing, and metrics.' },
              { step: '04', title: 'Scale Growth Loops', desc: 'Sustain customer loops with low churn.' }
            ].map((step, idx) => React.createElement(
              'div',
              { key: idx, className: 'bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm' },
              React.createElement('span', { className: 'text-xs font-black text-indigo-400 block' }, step.step),
              React.createElement('h4', { className: 'text-xs font-bold text-white mt-1' }, step.title),
              React.createElement('p', { className: 'text-[10px] text-indigo-200 mt-1 font-medium' }, step.desc)
            ))
          )
        )
      )
    ),

    // 4. Testimonials
    React.createElement(
      'section',
      { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12' },
      React.createElement(
        'div',
        { className: 'text-center space-y-2' },
        React.createElement('h2', { className: 'text-3xl font-outfit font-extrabold text-slate-800 tracking-tight' }, 'Loved by Builders'),
        React.createElement('p', { className: 'text-sm text-slate-500 font-medium' }, 'Startup Navigator guides the next generation of founders to scale successfully.')
      ),
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
        [
          { quote: "The AI search in Startup Navigator resolved our Delaware incorporation doubts in 30 seconds. A must-have tool.", author: "Marcus Chen", role: "CEO, NexaHealth" },
          { quote: "Calculated our CAC/LTV benchmarks using the guides. Clear, concise, and structured specifically for SaaS founders.", author: "Sophia Patel", role: "Co-Founder, SaaSFlow" },
          { quote: "The ESOP pool calculators and legal templates saved us thousands of dollars in initial attorney fees.", author: "David Lindqvist", role: "CTO, Zenith Robotics" }
        ].map((t, idx) => React.createElement(
          'div',
          { key: idx, className: 'bg-white border border-slate-200 rounded-3xl p-6 text-left space-y-4 hover:border-primary/20 transition-colors shadow-soft' },
          React.createElement(
            'div',
            { className: 'flex space-x-1 text-amber-400' },
            [...Array(5)].map((_, i) => React.createElement(Star, { key: i, className: 'w-4 h-4 fill-amber-400' }))
          ),
          React.createElement('p', { className: 'text-xs text-slate-600 italic font-medium leading-relaxed' }, `"${t.quote}"`),
          React.createElement(
            'div',
            { className: 'border-t border-slate-100 pt-3 flex items-center justify-between' },
            React.createElement(
              'div',
              null,
              React.createElement('h4', { className: 'text-xs font-bold text-slate-800' }, t.author),
              React.createElement('p', { className: 'text-[10px] text-slate-400' }, t.role)
            ),
            React.createElement(HeartHandshake, { className: 'w-4 h-4 text-primary/40' })
          )
        ))
      )
    ),

    // 5. Frequently Asked Questions (with animation rotation)
    React.createElement(
      'section',
      { className: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12' },
      React.createElement(
        'div',
        { className: 'text-center space-y-2' },
        React.createElement('h2', { className: 'text-3xl font-outfit font-extrabold text-slate-800 tracking-tight' }, 'Frequently Asked Questions'),
        React.createElement('p', { className: 'text-sm text-slate-500 font-medium' }, 'Answers to popular questions about Startup Navigator, the AI system, and standard processes.')
      ),
      React.createElement(
        'div',
        { className: 'space-y-4 text-left' },
        faqs.map((faq, idx) => {
          const isOpen = faqOpen === idx;
          return React.createElement(
            'div',
            { key: idx, className: 'bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-200 shadow-soft' },
            React.createElement(
              'button',
              {
                onClick: () => setFaqOpen(isOpen ? null : idx),
                className: 'flex justify-between items-center w-full px-6 py-4.5 text-left font-extrabold text-slate-800 text-xs sm:text-sm hover:text-primary transition-colors focus:outline-none'
              },
              React.createElement('span', null, faq.q),
              React.createElement(ChevronDown, { className: `w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}` })
            ),
            isOpen && React.createElement(
              'div',
              { className: 'px-6 pb-5 text-xs text-slate-500 font-medium leading-relaxed border-t border-slate-100/50 pt-3.5' },
              faq.a
            )
          );
        })
      )
    )
  );
}
