'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Bookmark, History, User, Settings, ArrowRight, Trash2, ExternalLink, MessageSquare, Loader2 } from 'lucide-react';

interface SavedBookmark {
  id: number;
  article_slug?: string;
  article_title?: string;
  resource_title?: string;
  resource_url?: string;
  chat_id?: number;
}

export default function UserDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<{ bookmarks_count: number; searches_count: number; recent_activity: string[] }>({
    bookmarks_count: 0,
    searches_count: 0,
    recent_activity: []
  });
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [searchHistory, setSearchHistory] = useState<{ id: number; question: string; answer: string; created_at: string }[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookmarks' | 'history'>('overview');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/dashboard/user');
      setStats({
        bookmarks_count: statsRes.data.bookmarks_count,
        searches_count: statsRes.data.searches_count,
        recent_activity: statsRes.data.recent_activity
      });
      setBookmarks(statsRes.data.bookmarks);

      const historyRes = await api.get('/chat/history');
      setSearchHistory(historyRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const deleteHistoryItem = async (id: number) => {
    try {
      await api.delete(`/chat/history/${id}`);
      setSearchHistory(searchHistory.filter(h => h.id !== id));
      setStats(prev => ({ ...prev, searches_count: Math.max(0, prev.searches_count - 1) }));
    } catch (err) {
      console.error(err);
    }
  };

  const removeBookmark = async (bookmarkId: number) => {
    try {
      await api.delete(`/bookmarks/${bookmarkId}`);
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
      setStats(prev => ({ ...prev, bookmarks_count: Math.max(0, prev.bookmarks_count - 1) }));
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || loading) {
    return React.createElement(
      'div',
      { className: 'min-h-[60vh] flex items-center justify-center space-x-2' },
      React.createElement(Loader2, { className: 'w-6 h-6 animate-spin text-primary' }),
      React.createElement('span', { className: 'text-sm font-semibold text-slate-500' }, 'Loading dashboard...')
    );
  }

  return React.createElement(
    'div',
    { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left' },
    
    // Top Banner
    React.createElement(
      'div',
      { className: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow' },
      React.createElement(
        'div',
        { className: 'space-y-2' },
        React.createElement('span', { className: 'text-[10px] font-bold text-blue-100 uppercase tracking-widest bg-blue-500/30 px-3 py-1 rounded-full' }, 'Founder Hub'),
        React.createElement('h1', { className: 'text-2xl sm:text-3xl font-outfit font-extrabold' }, `Hello, ${user?.full_name || 'Founder'}!`),
        React.createElement('p', { className: 'text-xs text-blue-100 font-medium' }, `Manage your saved templates, reading history, and AI searches. Account email: ${user?.email}`)
      ),
      React.createElement(
        'div',
        { className: 'flex space-x-4 bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-sm border border-white/15' },
        React.createElement(
          'div',
          { className: 'text-center' },
          React.createElement('div', { className: 'text-xl font-bold' }, stats.bookmarks_count),
          React.createElement('div', { className: 'text-[10px] text-blue-200 font-semibold uppercase mt-0.5' }, 'Saved Items')
        ),
        React.createElement('div', { className: 'w-px bg-white/20' }),
        React.createElement(
          'div',
          { className: 'text-center' },
          React.createElement('div', { className: 'text-xl font-bold' }, stats.searches_count),
          React.createElement('div', { className: 'text-[10px] text-blue-200 font-semibold uppercase mt-0.5' }, 'AI Queries')
        )
      )
    ),

    // Dashboard grid tabs
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 lg:grid-cols-12 gap-8' },
      
      // Left Tab Navigation (3 cols)
      React.createElement(
        'nav',
        { className: 'lg:col-span-3 bg-white border border-slate-200 p-5 rounded-3xl h-fit space-y-2 shadow-soft' },
        React.createElement(
          'button',
          {
            onClick: () => setActiveTab('overview'),
            className: `flex items-center space-x-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
          },
          React.createElement(LayoutDashboard, { className: 'w-4.5 h-4.5' }),
          React.createElement('span', null, 'Overview')
        ),
        React.createElement(
          'button',
          {
            onClick: () => setActiveTab('bookmarks'),
            className: `flex items-center space-x-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'bookmarks' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
          },
          React.createElement(Bookmark, { className: 'w-4.5 h-4.5' }),
          React.createElement('span', null, 'Saved Bookmarks')
        ),
        React.createElement(
          'button',
          {
            onClick: () => setActiveTab('history'),
            className: `flex items-center space-x-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
          },
          React.createElement(History, { className: 'w-4.5 h-4.5' }),
          React.createElement('span', null, 'Search History')
        )
      ),

      // Right Main Panel Content (9 cols)
      React.createElement(
        'main',
        { className: 'lg:col-span-9 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-soft min-h-[40vh]' },
        
        // TAB 1: OVERVIEW
        activeTab === 'overview' && React.createElement(
          'div',
          { className: 'space-y-6' },
          React.createElement(
            'div',
            { className: 'border-b border-slate-100 pb-3' },
            React.createElement('h2', { className: 'text-md font-bold text-slate-800 font-outfit' }, 'Recent Activities')
          ),
          stats.recent_activity.length === 0 ? (
            React.createElement('p', { className: 'text-slate-400 text-xs font-medium py-8 text-center' }, 'No recent activity logged. Start searching or bookmarking guides!')
          ) : (
            React.createElement(
              'div',
              { className: 'space-y-3' },
              stats.recent_activity.map((act, idx) => React.createElement(
                'div',
                { key: idx, className: 'bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-600 leading-normal font-semibold' },
                act
              ))
            )
          )
        ),

        // TAB 2: BOOKMARKS
        activeTab === 'bookmarks' && React.createElement(
          'div',
          { className: 'space-y-6' },
          React.createElement(
            'div',
            { className: 'border-b border-slate-100 pb-3' },
            React.createElement('h2', { className: 'text-md font-bold text-slate-800 font-outfit' }, 'Your Bookmarked Resources')
          ),
          bookmarks.length === 0 ? (
            React.createElement('p', { className: 'text-slate-400 text-xs font-medium py-8 text-center' }, 'No bookmarks found. Save items on the Explore or Resources page!')
          ) : (
            React.createElement(
              'div',
              { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
              bookmarks.map((b) => {
                const title = b.article_title || b.resource_title || "AI Conversation Session";
                const isArticle = !!b.article_slug;
                const isResource = !!b.resource_url;

                return React.createElement(
                  'div',
                  {
                    key: b.id,
                    className: 'bg-slate-50 border border-slate-200/60 rounded-2xl p-4.5 flex flex-col justify-between hover:border-primary/30 transition-all'
                  },
                  React.createElement(
                    'div',
                    { className: 'space-y-2' },
                    React.createElement(
                      'span',
                      { className: 'text-[9px] font-bold uppercase tracking-wider text-slate-400 block' },
                      isArticle ? 'Guide Article' : (isResource ? 'Resource Link' : 'AI Chat')
                    ),
                    React.createElement('h3', { className: 'text-xs font-bold text-slate-800 line-clamp-2' }, title)
                  ),
                  React.createElement(
                    'div',
                    { className: 'flex justify-between items-center border-t border-slate-200/50 pt-3.5 mt-4' },
                    isArticle && React.createElement(
                      Link,
                      { href: `/explore/${b.article_slug}`, className: 'text-[10px] font-bold text-primary hover:underline flex items-center space-x-0.5' },
                      React.createElement('span', null, 'Read Article'),
                      React.createElement(ArrowRight, { className: 'w-3 h-3' })
                    ),
                    isResource && React.createElement(
                      'a',
                      { href: b.resource_url, target: '_blank', rel: 'noopener noreferrer', className: 'text-[10px] font-bold text-primary hover:underline flex items-center space-x-0.5' },
                      React.createElement('span', null, 'Launch Website'),
                      React.createElement(ExternalLink, { className: 'w-3 h-3' })
                    ),
                    !isArticle && !isResource && React.createElement(
                      Link,
                      { href: '/search', className: 'text-[10px] font-bold text-primary hover:underline flex items-center space-x-0.5' },
                      React.createElement('span', null, 'Open Chat Search'),
                      React.createElement(ArrowRight, { className: 'w-3 h-3' })
                    ),
                    React.createElement(
                      'button',
                      {
                        onClick: () => removeBookmark(b.id),
                        className: 'p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors'
                      },
                      React.createElement(Trash2, { className: 'w-3.5 h-3.5' })
                    )
                  )
                );
              })
            )
          )
        ),

        // TAB 3: SEARCH HISTORY
        activeTab === 'history' && React.createElement(
          'div',
          { className: 'space-y-6' },
          React.createElement(
            'div',
            { className: 'border-b border-slate-100 pb-3' },
            React.createElement('h2', { className: 'text-md font-bold text-slate-800 font-outfit' }, 'Your Past AI Queries')
          ),
          searchHistory.length === 0 ? (
            React.createElement('p', { className: 'text-slate-400 text-xs font-medium py-8 text-center' }, 'Your search history is clear.')
          ) : (
            React.createElement(
              'div',
              { className: 'space-y-4' },
              searchHistory.map((h) => React.createElement(
                'div',
                {
                  key: h.id,
                  className: 'bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-3'
                },
                React.createElement(
                  'div',
                  { className: 'flex justify-between items-start' },
                  React.createElement(
                    'div',
                    { className: 'space-y-1.5' },
                    React.createElement('span', { className: 'text-[10px] font-semibold text-slate-400 block' }, new Date(h.created_at).toLocaleString()),
                    React.createElement('h3', { className: 'text-xs font-bold text-slate-800 leading-snug' }, `Q: "${h.question}"`)
                  ),
                  React.createElement(
                    'button',
                    {
                      onClick: () => deleteHistoryItem(h.id),
                      className: 'p-1.5 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-lg transition-colors'
                    },
                    React.createElement(Trash2, { className: 'w-3.5 h-3.5' })
                  )
                ),
                React.createElement(
                  'div',
                  { className: 'text-[11px] text-slate-600 bg-white border border-slate-150 p-3 rounded-xl max-h-32 overflow-y-auto leading-relaxed line-clamp-3' },
                  h.answer
                ),
                React.createElement(
                  'div',
                  { className: 'flex justify-start' },
                  React.createElement(
                    Link,
                    { href: `/search?q=${encodeURIComponent(h.question)}`, className: 'text-[10px] font-bold text-primary hover:underline flex items-center space-x-0.5' },
                    React.createElement('span', null, 'Ask this query again'),
                    React.createElement(ArrowRight, { className: 'w-3 h-3' })
                  )
                )
              ))
            )
          )
        )
      )
    )
  );
}
