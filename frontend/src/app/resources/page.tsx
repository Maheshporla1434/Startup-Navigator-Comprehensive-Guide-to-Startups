'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { BookOpen, ExternalLink, Bookmark, Search, GraduationCap, Building2, Gavel, FolderHeart } from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  url: string;
  description: string;
  type: string;
  created_at: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Bookmarks state
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resources');
      setResources(res.data);
      setFilteredResources(res.data);
    } catch (err) {
      console.error(err);
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
        .filter((b: any) => b.resource_id !== null)
        .map((b: any) => b.resource_id);
      setBookmarkedIds(ids);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchBookmarks();
  }, []);

  useEffect(() => {
    let result = resources;
    if (selectedType !== 'all') {
      result = result.filter(r => r.type === selectedType);
    }
    if (searchTerm.trim()) {
      result = result.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredResources(result);
  }, [selectedType, searchTerm, resources]);

  const toggleBookmark = async (resourceId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to save resources.');
      return;
    }
    try {
      const res = await api.delete(`/bookmarks/toggle/resource/${resourceId}`);
      if (res.data.bookmarked) {
        setBookmarkedIds([...bookmarkedIds, resourceId]);
      } else {
        setBookmarkedIds(bookmarkedIds.filter(id => id !== resourceId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resourceTypes = [
    { value: 'all', label: 'All Resources', icon: BookOpen },
    { value: 'government', label: 'Government Portals', icon: Gavel },
    { value: 'template', label: 'Templates & Decks', icon: FolderHeart },
    { value: 'incubator', label: 'Incubators & Programs', icon: Building2 },
    { value: 'tool', label: 'AI & Developer Tools', icon: GraduationCap }
  ];

  return React.createElement(
    'div',
    { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left' },
    
    // Header
    React.createElement(
      'div',
      { className: 'space-y-2' },
      React.createElement('h1', { className: 'text-3xl font-outfit font-extrabold text-slate-800' }, 'Startup Resources'),
      React.createElement('p', { className: 'text-sm text-slate-500 font-medium' }, 'Access standard templates, government regulatory registries, SEC guides, and pitch assets.')
    ),

    // Filter controls
    React.createElement(
      'div',
      { className: 'flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-200 pb-6' },
      // Category buttons
      React.createElement(
        'div',
        { className: 'flex flex-wrap gap-2' },
        resourceTypes.map((type) => {
          const isActive = selectedType === type.value;
          return React.createElement(
            'button',
            {
              key: type.value,
              onClick: () => setSelectedType(type.value),
              className: `flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-primary text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`
            },
            React.createElement(type.icon, { className: 'w-4 h-4' }),
            React.createElement('span', null, type.label)
          );
        })
      ),
      // Search
      React.createElement(
        'div',
        { className: 'relative w-full md:w-72' },
        React.createElement(Search, { className: 'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' }),
        React.createElement('input', {
          type: 'text',
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          placeholder: 'Search resources...',
          className: 'w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 shadow-soft'
        })
      )
    ),

    // Resource Cards
    loading ? (
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
        [...Array(6)].map((_, i) => React.createElement(
          'div',
          { key: i, className: 'bg-white border border-slate-200 rounded-3xl p-6 space-y-4 animate-pulse' },
          React.createElement('div', { className: 'h-4 bg-slate-200 rounded-md w-1/4' }),
          React.createElement('div', { className: 'h-6 bg-slate-200 rounded-md w-3/4' }),
          React.createElement('div', { className: 'h-16 bg-slate-200 rounded-md w-full' })
        ))
      )
    ) : filteredResources.length === 0 ? (
      React.createElement(
        'div',
        { className: 'bg-white border border-slate-200 rounded-3xl p-12 text-center' },
        React.createElement('p', { className: 'text-slate-400 text-xs font-semibold' }, 'No resources matching the selection filters found.')
      )
    ) : (
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
        filteredResources.map((res) => {
          const isSaved = bookmarkedIds.includes(res.id);
          const typeLabel = resourceTypes.find(t => t.value === res.type)?.label || 'Resource';
          
          return React.createElement(
            'div',
            {
              key: res.id,
              className: 'bg-white border border-slate-200 rounded-3xl p-6 shadow-soft flex flex-col justify-between card-interactive'
            },
            React.createElement(
              'div',
              { className: 'space-y-4' },
              // Top badge & save
              React.createElement(
                'div',
                { className: 'flex justify-between items-center' },
                React.createElement('span', { className: 'text-[9px] font-bold text-primary uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded' }, typeLabel),
                React.createElement(
                  'button',
                  {
                    onClick: () => toggleBookmark(res.id),
                    className: `p-1.5 rounded-lg border transition-colors ${isSaved ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100 hover:text-slate-600'}`
                  },
                  React.createElement(Bookmark, { className: `w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}` })
                )
              ),
              // Body
              React.createElement(
                'div',
                { className: 'space-y-1.5' },
                React.createElement('h3', { className: 'font-outfit font-bold text-slate-800 text-sm leading-snug' }, res.title),
                React.createElement('p', { className: 'text-xs text-slate-500 leading-relaxed font-medium' }, res.description)
              )
            ),
            // Link footer
            React.createElement(
              'div',
              { className: 'border-t border-slate-100 pt-4 mt-5' },
              React.createElement(
                'a',
                {
                  href: res.url,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: 'inline-flex items-center space-x-1 text-xs font-bold text-primary hover:text-primary-dark transition-colors'
                },
                React.createElement('span', null, 'Launch Resource'),
                React.createElement(ExternalLink, { className: 'w-3.5 h-3.5' })
              )
            )
          );
        })
      )
    )
  );
}
