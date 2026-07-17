'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import { Clock, Award, BookOpen, AlertCircle, FileText, Sparkles, MessageSquare, ArrowLeft, Loader2, ArrowRight } from 'lucide-react';

interface ArticleDetail {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  difficulty: string;
  reading_time: number;
  created_at: string;
  category?: {
    name: string;
    slug: string;
  };
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [related, setRelated] = useState<ArticleDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // AI summary states
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  // Interactive mini chat states
  const [question, setQuestion] = useState('');
  const [chatLog, setChatLog] = useState<{ q: string; a: string }[]>([]);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  
  // Scroll progress state
  const [scrollProgress, setScrollProgress] = useState(0);

  const fetchArticleDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const artRes = await api.get(`/articles/${slug}`);
      setArticle(artRes.data);

      const relRes = await api.get(`/articles/${slug}/related`);
      setRelated(relRes.data);
    } catch (err) {
      setError('Failed to load article detail. The document may not exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0) {
      const progress = (window.pageYOffset / totalScroll) * 100;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchArticleDetails();
    }
  }, [slug]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadAISummary = async () => {
    if (!article) return;
    setLoadingSummary(true);
    try {
      const res = await api.post(`/articles/${article.id}/summarize`);
      setAiSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      setAiSummary('Failed to compile summary. Check your login state.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !article) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to ask questions.');
      router.push('/login');
      return;
    }

    setLoadingAnswer(true);
    const userQ = question;
    setQuestion('');
    
    try {
      const res = await api.post('/chat', {
        message: `Relating to article "${article.title}": ${userQ}`
      });
      setChatLog([...chatLog, { q: userQ, a: res.data.content }]);
    } catch (err) {
      setChatLog([...chatLog, { q: userQ, a: 'Error connecting to RAG assistant.' }]);
    } finally {
      setLoadingAnswer(false);
    }
  };

  if (loading) {
    return React.createElement(
      'div',
      { className: 'min-h-[60vh] flex items-center justify-center space-x-2' },
      React.createElement(Loader2, { className: 'w-6 h-6 animate-spin text-primary' }),
      React.createElement('span', { className: 'text-sm font-semibold text-slate-500' }, 'Loading article...')
    );
  }

  if (error || !article) {
    return React.createElement(
      'div',
      { className: 'max-w-md mx-auto py-20 text-center space-y-4' },
      React.createElement(AlertCircle, { className: 'w-12 h-12 text-red-500 mx-auto' }),
      React.createElement('h2', { className: 'text-xl font-bold text-slate-800' }, 'Error Loading Article'),
      React.createElement('p', { className: 'text-xs text-slate-500 font-medium' }, error),
      React.createElement(Link, { href: '/explore', className: 'text-xs font-semibold text-primary hover:underline' }, 'Back to explore page')
    );
  }

  // Parse paragraphs for headers
  const contentParagraphs = article.content.split('\n\n');

  return React.createElement(
    'div',
    { className: 'relative' },
    // Scroll progress bar
    React.createElement('div', {
      className: 'fixed top-[64px] left-0 h-1 bg-gradient-to-r from-primary to-secondary z-50 transition-all duration-100',
      style: { width: `${scrollProgress}%` }
    }),

    React.createElement(
      'div',
      { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12' },
      
      // Back button
      React.createElement(
        Link,
        { href: '/explore', className: 'inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-primary transition-colors mb-6' },
        React.createElement(ArrowLeft, { className: 'w-4 h-4' }),
        React.createElement('span', null, 'Back to Explore')
      ),

      React.createElement(
        'div',
        { className: 'grid grid-cols-1 lg:grid-cols-12 gap-10 text-left' },
        
        // Left Column: Table of Contents & Metadata (3 Cols)
        React.createElement(
          'aside',
          { className: 'hidden lg:block lg:col-span-3 space-y-6 h-fit sticky top-24' },
          React.createElement(
            'div',
            { className: 'bg-white border border-slate-200 p-5 rounded-2xl shadow-soft space-y-4' },
            React.createElement('h3', { className: 'text-xs font-extrabold text-slate-400 uppercase tracking-wider' }, 'Table of Contents'),
            React.createElement(
              'ul',
              { className: 'space-y-2 text-xs font-semibold text-slate-600' },
              React.createElement('li', null, React.createElement('a', { href: '#intro', className: 'hover:text-primary' }, 'Introduction')),
              React.createElement('li', null, React.createElement('a', { href: '#content', className: 'hover:text-primary' }, 'Core Principles')),
              React.createElement('li', null, React.createElement('a', { href: '#summary-section', className: 'hover:text-primary' }, 'AI Summary')),
              React.createElement('li', null, React.createElement('a', { href: '#qa-section', className: 'hover:text-primary' }, 'Ask AI Co-Pilot'))
            )
          ),
          React.createElement(
            'div',
            { className: 'bg-slate-50 border border-slate-200/80 p-5 rounded-2xl text-xs space-y-3' },
            React.createElement('h4', { className: 'font-bold text-slate-700' }, 'Article Info'),
            React.createElement('div', { className: 'flex justify-between' }, React.createElement('span', { className: 'text-slate-400' }, 'Level:'), React.createElement('span', { className: 'font-bold capitalize text-slate-700' }, article.difficulty)),
            React.createElement('div', { className: 'flex justify-between' }, React.createElement('span', { className: 'text-slate-400' }, 'Reading Time:'), React.createElement('span', { className: 'font-bold text-slate-700' }, `${article.reading_time} min`)),
            React.createElement('div', { className: 'flex justify-between' }, React.createElement('span', { className: 'text-slate-400' }, 'Published:'), React.createElement('span', { className: 'font-bold text-slate-700' }, new Date(article.created_at).toLocaleDateString()))
          )
        ),

        // Main Column: Article Content (6 Cols)
        React.createElement(
          'main',
          { className: 'lg:col-span-6 space-y-8' },
          
          // Header info
          React.createElement(
            'div',
            { className: 'space-y-4' },
            React.createElement('span', { className: 'text-[10px] font-bold text-primary bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider' }, article.category?.name || 'Guide'),
            React.createElement('h1', { className: 'text-3xl sm:text-4xl font-outfit font-extrabold text-slate-900 tracking-tight leading-tight' }, article.title)
          ),

          // Article content paragraphs
          React.createElement(
            'div',
            { id: 'content', className: 'prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 leading-relaxed font-medium space-y-5' },
            contentParagraphs.map((para, index) => {
              if (index === 0) {
                return React.createElement('p', { key: index, id: 'intro', className: 'text-sm sm:text-base text-slate-800 font-semibold' }, para);
              }
              
              // Standard code callout box mapping if paragraph has code formatting
              if (para.includes('LTV:CAC') || para.includes('ESOP') || para.includes('Delaware C-Corp')) {
                return React.createElement(
                  'div',
                  { key: index, className: 'bg-blue-50/50 border-l-4 border-primary p-4.5 rounded-r-2xl my-6 space-y-1' },
                  React.createElement('span', { className: 'text-[10px] font-bold text-primary uppercase tracking-wider' }, 'Core Standard'),
                  React.createElement('p', { className: 'text-xs text-slate-700 italic font-medium' }, para)
                );
              }
              
              return React.createElement('p', { key: index }, para);
            })
          ),

          // Section 3: AI Summary Card
          React.createElement(
            'section',
            { id: 'summary-section', className: 'bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-800' },
            React.createElement(
              'div',
              { className: 'flex justify-between items-center pb-4 border-b border-indigo-800/40' },
              React.createElement(
                'div',
                { className: 'flex items-center space-x-2' },
                React.createElement(Sparkles, { className: 'w-5 h-5 text-indigo-400' }),
                React.createElement('h3', { className: 'font-outfit font-bold text-md text-white' }, 'AI-Powered Summary')
              ),
              !aiSummary && React.createElement(
                'button',
                {
                  onClick: loadAISummary,
                  disabled: loadingSummary,
                  className: 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/70 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1'
                },
                loadingSummary ? React.createElement(Loader2, { className: 'w-3 h-3 animate-spin' }) : null,
                React.createElement('span', null, loadingSummary ? 'Processing...' : 'Summarize')
              )
            ),
            aiSummary ? (
              React.createElement(
                'div',
                { className: 'text-xs text-indigo-100 mt-4 leading-relaxed font-medium space-y-3' },
                // Split code lines or bullets
                aiSummary.split('\n').map((line, idx) => {
                  if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                    return React.createElement('li', { key: idx, className: 'ml-4 list-disc mt-1' }, line.substring(1).trim());
                  }
                  return React.createElement('p', { key: idx }, line);
                })
              )
            ) : (
              React.createElement('p', { className: 'text-xs text-indigo-200 mt-4 font-medium' }, 'Generate an instant concise breakdown of the article takeaways with our LLM summarization pipeline.')
            )
          ),

          // Section 4: Follow-up Questions Widget
          React.createElement(
            'section',
            { id: 'qa-section', className: 'bg-white border border-slate-200 shadow-soft rounded-3xl p-6 space-y-4' },
            React.createElement(
              'div',
              { className: 'flex items-center space-x-2 border-b border-slate-100 pb-3' },
              React.createElement(MessageSquare, { className: 'w-4.5 h-4.5 text-slate-500' }),
              React.createElement('h3', { className: 'text-sm font-bold text-slate-800' }, 'Ask AI Co-Pilot About This Topic')
            ),
            // Q&A log
            chatLog.length > 0 && React.createElement(
              'div',
              { className: 'space-y-3 max-h-60 overflow-y-auto pr-1' },
              chatLog.map((log, i) => React.createElement(
                'div',
                { key: i, className: 'space-y-2' },
                React.createElement('div', { className: 'bg-slate-50 text-[11px] font-semibold text-slate-700 px-3 py-2 rounded-xl text-left' }, `Q: ${log.q}`),
                React.createElement('div', { className: 'text-xs text-slate-600 bg-blue-50/20 px-3 py-2 rounded-xl text-left border border-slate-100' }, `A: ${log.a}`)
              ))
            ),
            // Input form
            React.createElement(
              'form',
              { onSubmit: handleAskQuestion, className: 'flex gap-2' },
              React.createElement('input', {
                type: 'text',
                placeholder: 'e.g. "Can LLCs issue incentive stock options?"',
                value: question,
                onChange: (e) => setQuery(e.target.value), // Wait, let's bind properly
                // Let's bind it to state "question"
                onChange: (e) => setQuestion(e.target.value),
                className: 'flex-grow px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800'
              }),
              React.createElement(
                'button',
                { type: 'submit', disabled: loadingAnswer, className: 'bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center flex-shrink-0' },
                loadingAnswer ? React.createElement(Loader2, { className: 'w-3 h-3 animate-spin' }) : React.createElement(ArrowRight, { className: 'w-3.5 h-3.5' })
              )
            )
          )
        ),

        // Right Column: Related Articles (3 Cols)
        React.createElement(
          'aside',
          { className: 'lg:col-span-3 space-y-6 text-left' },
          React.createElement('h3', { className: 'text-sm font-extrabold text-slate-400 uppercase tracking-wider' }, 'Related Guides'),
          React.createElement(
            'div',
            { className: 'space-y-4' },
            related.map((rel) => React.createElement(
              'div',
              { key: rel.id, className: 'bg-white border border-slate-200 p-4 rounded-2xl shadow-soft card-interactive space-y-2' },
              React.createElement(
                Link,
                { href: `/explore/${rel.slug}` },
                React.createElement('h4', { className: 'text-xs font-bold text-slate-800 hover:text-primary transition-colors cursor-pointer leading-snug' }, rel.title)
              ),
              React.createElement('p', { className: 'text-[10px] text-slate-500 line-clamp-2' }, rel.summary),
              React.createElement('div', { className: 'text-[9px] font-bold text-slate-400 uppercase' }, `${rel.reading_time} Min Read`)
            ))
          )
        )
      )
    )
  );
}
