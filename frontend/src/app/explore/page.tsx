'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { Search, SlidersHorizontal, BookOpen, Clock, Award, Bookmark, Share2, AlertCircle } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  difficulty: string;
  reading_time: number;
  category?: {
    name: string;
    slug: string;
  };
}

export default function ExplorePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for filter parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [maxReadTime, setMaxReadTime] = useState(15);
  
  // Bookmarks tracked locally
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [shareText, setShareText] = useState<number | null>(null);

  const fetchFiltersData = async () => {
    try {
      const catRes = await api.get('/articles/categories');
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let url = `/articles?max_reading_time=${maxReadTime}`;
      if (selectedCategory) url += `&category_slug=${selectedCategory}`;
      if (selectedDifficulty) url += `&difficulty=${selectedDifficulty}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await api.get(url);
      setArticles(res.data);
    } catch (err) {
      console.error('Failed to load articles', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('/bookmarks');
      const ids = res.data
        .filter((b: any) => b.article_id !== null)
        .map((b: any) => b.article_id);
      setBookmarkedIds(ids);
    } catch (err) {
      console.error('Failed to load bookmarks', err);
    }
  };

  useEffect(() => {
    fetchFiltersData();
    fetchBookmarks();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchArticles();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCategory, selectedDifficulty, maxReadTime]);

  const toggleBookmarkItem = async (articleId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to bookmark resources.');
      return;
    }
    try {
      const res = await api.delete(`/bookmarks/toggle/article/${articleId}`);
      if (res.data.bookmarked) {
        setBookmarkedIds([...bookmarkedIds, articleId]);
      } else {
        setBookmarkedIds(bookmarkedIds.filter(id => id !== articleId));
      }
    } catch (err) {
      console.error('Bookmark update failed', err);
    }
  };

  const handleShareClick = (slug: string, id: number) => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}/explore/${slug}`;
      navigator.clipboard.writeText(fullUrl);
      setShareText(id);
      setTimeout(() => setShareText(null), 2000);
    }
  };

  return React.createElement(
    'div',
    { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8' },
    
    // Top Title & Description
    React.createElement(
      'div',
      { className: 'text-left space-y-2' },
      React.createElement('h1', { className: 'text-3xl font-outfit font-extrabold text-slate-800' }, 'Explore Startup Guides'),
      React.createElement('p', { className: 'text-sm text-slate-500 font-medium' }, 'Browse deep guides on legal setup, venture fundraising, cap tables, ESOPs, and customer analytics.')
    ),

    // Grid Layout
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 lg:grid-cols-12 gap-8 text-left' },
      
      // Sidebar Filters (3 Cols)
      React.createElement(
        'aside',
        { className: 'lg:col-span-3 bg-white border border-slate-200 shadow-soft p-6 rounded-3xl h-fit space-y-6' },
        React.createElement(
          'div',
          { className: 'flex items-center space-x-2 border-b border-slate-100 pb-3' },
          React.createElement(SlidersHorizontal, { className: 'w-4 h-4 text-slate-400' }),
          React.createElement('h2', { className: 'text-sm font-bold text-slate-700' }, 'Filter Results')
        ),
        // Search Input
        React.createElement(
          'div',
          { className: 'space-y-1.5' },
          React.createElement('label', { className: 'text-xs font-semibold text-slate-600' }, 'Search Keyword'),
          React.createElement(
            'div',
            { className: 'relative' },
            React.createElement(Search, { className: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' }),
            React.createElement('input', {
              type: 'text',
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              placeholder: 'Delaware, CAC, seed...',
              className: 'w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800'
            })
          )
        ),
        // Difficulty dropdown
        React.createElement(
          'div',
          { className: 'space-y-1.5' },
          React.createElement('label', { className: 'text-xs font-semibold text-slate-600' }, 'Difficulty Level'),
          React.createElement(
            'select',
            {
              value: selectedDifficulty,
              onChange: (e) => setSelectedDifficulty(e.target.value),
              className: 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700'
            },
            React.createElement('option', { value: '' }, 'All Levels'),
            React.createElement('option', { value: 'beginner' }, 'Beginner'),
            React.createElement('option', { value: 'intermediate' }, 'Intermediate'),
            React.createElement('option', { value: 'advanced' }, 'Advanced')
          )
        ),
        // Max Reading time slider
        React.createElement(
          'div',
          { className: 'space-y-2' },
          React.createElement(
            'div',
            { className: 'flex justify-between items-center text-xs font-semibold text-slate-600' },
            React.createElement('span', null, 'Max Reading Time'),
            React.createElement('span', { className: 'text-primary' }, `${maxReadTime} min`)
          ),
          React.createElement('input', {
            type: 'range',
            min: 2,
            max: 20,
            value: maxReadTime,
            onChange: (e) => setMaxReadTime(Number(e.target.value)),
            className: 'w-full accent-primary h-1.5 bg-slate-100 rounded-lg cursor-pointer'
          })
        )
      ),

      // Articles Listing Grid (9 Cols)
      React.createElement(
        'main',
        { className: 'lg:col-span-9 space-y-6' },
        
        // Category quick tabs
        React.createElement(
          'div',
          { className: 'flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-slate-100' },
          React.createElement(
            'button',
            {
              onClick: () => setSelectedCategory(''),
              className: `px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === '' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'}`
            },
            'All Guides'
          ),
          categories.map((c) => React.createElement(
            'button',
            {
              key: c.id,
              onClick: () => setSelectedCategory(c.slug),
              className: `px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === c.slug ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'}`
            },
            c.name
          ))
        ),

        // Grid cards
        loading ? (
          React.createElement(
            'div',
            { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
            [...Array(4)].map((_, i) => React.createElement(
              'div',
              { key: i, className: 'bg-white border border-slate-200 rounded-3xl p-6 space-y-4 animate-pulse' },
              React.createElement('div', { className: 'h-4 bg-slate-200 rounded-md w-1/3' }),
              React.createElement('div', { className: 'h-6 bg-slate-200 rounded-md w-3/4' }),
              React.createElement('div', { className: 'h-16 bg-slate-200 rounded-md w-full' }),
              React.createElement('div', { className: 'h-4 bg-slate-200 rounded-md w-1/2' })
            ))
          )
        ) : articles.length === 0 ? (
          React.createElement(
            'div',
            { className: 'bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3' },
            React.createElement(AlertCircle, { className: 'w-10 h-10 text-slate-400 mx-auto' }),
            React.createElement('h3', { className: 'font-bold text-slate-700 text-sm' }, 'No Guides Found'),
            React.createElement('p', { className: 'text-xs text-slate-400 max-w-sm mx-auto' }, 'Try clearing filters or search terms to load general database articles.')
          )
        ) : (
          React.createElement(
            'div',
            { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
            articles.map((art) => {
              const isBookmarked = bookmarkedIds.includes(art.id);
              return React.createElement(
                'div',
                {
                  key: art.id,
                  className: 'bg-white border border-slate-200 rounded-3xl p-6 shadow-soft flex flex-col justify-between card-interactive'
                },
                React.createElement(
                  'div',
                  { className: 'space-y-3' },
                  // Meta bar
                  React.createElement(
                    'div',
                    { className: 'flex justify-between items-center' },
                    React.createElement('span', { className: 'text-[10px] font-bold text-primary uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-lg' }, art.category?.name || 'Guide'),
                    React.createElement(
                      'div',
                      { className: 'flex space-x-1' },
                      React.createElement(
                        'button',
                        {
                          onClick: () => toggleBookmarkItem(art.id),
                          className: `p-1.5 rounded-lg border transition-colors ${isBookmarked ? 'bg-amber-50 text-amber-500 border-amber-100 hover:bg-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100 hover:text-slate-600'}`
                        },
                        React.createElement(Bookmark, { className: `w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}` })
                      ),
                      React.createElement(
                        'div',
                        { className: 'relative' },
                        React.createElement(
                          'button',
                          {
                            onClick: () => handleShareClick(art.slug, art.id),
                            className: 'p-1.5 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 hover:text-slate-600'
                          },
                          React.createElement(Share2, { className: 'w-3.5 h-3.5' })
                        ),
                        shareText === art.id && React.createElement(
                          'span',
                          { className: 'absolute bottom-8 right-0 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded shadow whitespace-nowrap' },
                          'Link copied!'
                        )
                      )
                    )
                  ),
                  // Title link
                  React.createElement(
                    Link,
                    { href: `/explore/${art.slug}` },
                    React.createElement('h3', { className: 'font-outfit font-bold text-slate-800 text-sm hover:text-primary transition-colors leading-snug cursor-pointer' }, art.title)
                  ),
                  React.createElement('p', { className: 'text-xs text-slate-500 leading-normal line-clamp-3 font-medium' }, art.summary)
                ),
                // Footer stats
                React.createElement(
                  'div',
                  { className: 'flex items-center space-x-4 border-t border-slate-100 pt-4 mt-4 text-[10px] text-slate-500 font-semibold uppercase tracking-wider' },
                  React.createElement(
                    'span',
                    { className: 'flex items-center space-x-1' },
                    React.createElement(Clock, { className: 'w-3.5 h-3.5 text-slate-400' }),
                    React.createElement('span', null, `${art.reading_time} Min Read`)
                  ),
                  React.createElement(
                    'span',
                    { className: 'flex items-center space-x-1' },
                    React.createElement(Award, { className: 'w-3.5 h-3.5 text-slate-400' }),
                    React.createElement('span', null, art.difficulty)
                  )
                )
              );
            })
          )
        )
      )
    )
  );
}
