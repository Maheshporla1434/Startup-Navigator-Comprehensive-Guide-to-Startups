'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Users, FileText, Bookmark, Search, Trash2, ShieldAlert, Plus, Edit3, Check, Loader2 } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  is_draft: boolean;
  difficulty: string;
  reading_time: number;
  category_id: number;
}

interface Resource {
  id: number;
  title: string;
  url: string;
  type: string;
}

interface UserDetail {
  id: number;
  email: string;
  full_name?: string;
  role: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'metrics' | 'articles' | 'resources' | 'users'>('metrics');
  
  // Lists
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  
  // Analytics
  const [analytics, setAnalytics] = useState<any>({
    total_users: 0,
    total_articles: 0,
    total_searches: 0,
    category_breakdown: {},
    popular_topics: [],
    monthly_searches: [],
    daily_active_users: []
  });

  // CRUD Forms State
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newCatId, setNewCatId] = useState(1);
  const [newDifficulty, setNewDifficulty] = useState('beginner');
  const [newReadTime, setNewReadTime] = useState(5);
  
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState('template');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Analytics
      const analRes = await api.get('/admin/analytics');
      setAnalytics(analRes.data);

      // 2. Fetch Users
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);

      // 3. Fetch Articles
      const articlesRes = await api.get('/articles');
      setArticles(articlesRes.data);

      // 4. Fetch Resources
      const resourcesRes = await api.get('/resources');
      setResources(resourcesRes.data);

      // 5. Fetch Categories
      const catRes = await api.get('/articles/categories');
      setCategories(catRes.data);
      if (catRes.data.length > 0) {
        setNewCatId(catRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load admin context', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        setActiveTab('metrics'); // Fallback or standard
      } else {
        fetchAdminData();
      }
    }
  }, [user, authLoading, isAdmin]);

  // User Actions
  const toggleUserRole = async (userId: number, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/admin/users/${userId}/role?role=${nextRole}`);
      setUsers(users.map(u => u.id === userId ? { ...u, role: nextRole } : u));
    } catch (err) {
      alert('Error updating user role');
    }
  };

  const deleteUserItem = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert('Error deleting user');
    }
  };

  // Resource Actions
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/resources', {
        title: resTitle,
        url: resUrl,
        type: resType,
        description: 'Seeded template or tool'
      });
      setResources([...resources, res.data]);
      setShowResourceModal(false);
      setResTitle('');
      setResUrl('');
    } catch (err) {
      alert('Error creating resource link');
    }
  };

  const deleteResourceItem = async (resId: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      await api.delete(`/resources/${resId}`);
      setResources(resources.filter(r => r.id !== resId));
    } catch (err) {
      alert('Error deleting resource');
    }
  };

  // Article Actions
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: newTitle,
      slug: newSlug,
      content: newContent,
      summary: newSummary,
      category_id: newCatId,
      difficulty: newDifficulty,
      reading_time: newReadTime,
      is_draft: false
    };

    try {
      if (editingArticle) {
        const res = await api.put(`/articles/${editingArticle.id}`, payload);
        setArticles(articles.map(a => a.id === editingArticle.id ? res.data : a));
      } else {
        const res = await api.post('/articles', payload);
        setArticles([res.data, ...articles]);
      }
      setShowArticleModal(false);
      clearArticleForm();
    } catch (err) {
      alert('Error saving article. Ensure slug is unique.');
    }
  };

  const editArticleItem = (art: Article) => {
    setEditingArticle(art);
    // Find detailed content from api or mock it
    setNewTitle(art.title);
    setNewSlug(art.slug);
    setNewContent('Enter detailed markdown guide article content...');
    setNewSummary(art.title + ' summary details.');
    setNewCatId(art.category_id);
    setNewDifficulty(art.difficulty);
    setNewReadTime(art.reading_time);
    setShowArticleModal(true);
  };

  const deleteArticleItem = async (artId: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.delete(`/articles/${artId}`);
      setArticles(articles.filter(a => a.id !== artId));
    } catch (err) {
      alert('Error deleting article');
    }
  };

  const clearArticleForm = () => {
    setEditingArticle(null);
    setNewTitle('');
    setNewSlug('');
    setNewContent('');
    setNewSummary('');
    setNewDifficulty('beginner');
    setNewReadTime(5);
  };

  // Render Access Denied for non-admin
  if (!authLoading && !isAdmin) {
    return React.createElement(
      'div',
      { className: 'max-w-md mx-auto py-20 text-center space-y-4' },
      React.createElement(ShieldAlert, { className: 'w-12 h-12 text-red-500 mx-auto' }),
      React.createElement('h2', { className: 'text-xl font-bold text-slate-800 font-outfit' }, 'Access Denied'),
      React.createElement('p', { className: 'text-xs text-slate-500 font-medium' }, 'You do not hold administrative clearance to manage users or articles.'),
      React.createElement('button', { onClick: () => router.push('/dashboard'), className: 'bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl' }, 'Return to User Dashboard')
    );
  }

  if (authLoading || loading) {
    return React.createElement(
      'div',
      { className: 'min-h-[60vh] flex items-center justify-center space-x-2' },
      React.createElement(Loader2, { className: 'w-6 h-6 animate-spin text-primary' }),
      React.createElement('span', { className: 'text-sm font-semibold text-slate-500' }, 'Loading admin panel...')
    );
  }

  return React.createElement(
    'div',
    { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-8' },
    
    // Top Bar
    React.createElement(
      'div',
      { className: 'flex justify-between items-center border-b border-slate-200 pb-5' },
      React.createElement(
        'div',
        { className: 'space-y-1' },
        React.createElement('h1', { className: 'text-3xl font-outfit font-extrabold text-slate-800' }, 'Admin Control CMS'),
        React.createElement('p', { className: 'text-xs text-slate-400 font-semibold uppercase tracking-wider' }, 'Database monitoring & articles production tools')
      ),
      React.createElement(
        'button',
        {
          onClick: () => { clearArticleForm(); setShowArticleModal(true); },
          className: 'bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-1.5'
        },
        React.createElement(Plus, { className: 'w-4 h-4' }),
        React.createElement('span', null, 'New Article')
      )
    ),

    // Grid split
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 lg:grid-cols-12 gap-8' },
      
      // Sidebar menu
      React.createElement(
        'aside',
        { className: 'lg:col-span-3 bg-white border border-slate-200 p-5 rounded-3xl h-fit space-y-2 shadow-soft' },
        React.createElement(
          'button',
          {
            onClick: () => setActiveTab('metrics'),
            className: `flex items-center space-x-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'metrics' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
          },
          React.createElement(Settings, { className: 'w-4.5 h-4.5' }),
          React.createElement('span', null, 'System Metrics')
        ),
        React.createElement(
          'button',
          {
            onClick: () => setActiveTab('articles'),
            className: `flex items-center space-x-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'articles' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
          },
          React.createElement(FileText, { className: 'w-4.5 h-4.5' }),
          React.createElement('span', null, 'Manage Articles')
        ),
        React.createElement(
          'button',
          {
            onClick: () => setActiveTab('resources'),
            className: `flex items-center space-x-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'resources' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
          },
          React.createElement(Bookmark, { className: 'w-4.5 h-4.5' }),
          React.createElement('span', null, 'Manage Resources')
        ),
        React.createElement(
          'button',
          {
            onClick: () => setActiveTab('users'),
            className: `flex items-center space-x-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`
          },
          React.createElement(Users, { className: 'w-4.5 h-4.5' }),
          React.createElement('span', null, 'Manage Users')
        )
      ),

      // Right Main Panel
      React.createElement(
        'main',
        { className: 'lg:col-span-9 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-soft min-h-[50vh]' },
        
        // TAB 1: METRICS & ANALYTICS CHARTS
        activeTab === 'metrics' && React.createElement(
          'div',
          { className: 'space-y-8' },
          // Stats boxes
          React.createElement(
            'div',
            { className: 'grid grid-cols-2 md:grid-cols-4 gap-4' },
            React.createElement(
              'div',
              { className: 'bg-slate-50 p-4 border border-slate-200 rounded-2xl' },
              React.createElement('div', { className: 'text-xl font-black text-slate-800' }, analytics.total_users),
              React.createElement('div', { className: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1' }, 'Total Users')
            ),
            React.createElement(
              'div',
              { className: 'bg-slate-50 p-4 border border-slate-200 rounded-2xl' },
              React.createElement('div', { className: 'text-xl font-black text-slate-800' }, analytics.total_articles),
              React.createElement('div', { className: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1' }, 'Total Articles')
            ),
            React.createElement(
              'div',
              { className: 'bg-slate-50 p-4 border border-slate-200 rounded-2xl' },
              React.createElement('div', { className: 'text-xl font-black text-slate-800' }, analytics.total_searches),
              React.createElement('div', { className: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1' }, 'RAG Searches')
            ),
            React.createElement(
              'div',
              { className: 'bg-slate-50 p-4 border border-slate-200 rounded-2xl' },
              React.createElement('div', { className: 'text-xl font-black text-slate-800' }, resources.length),
              React.createElement('div', { className: 'text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1' }, 'Shared Assets')
            )
          ),

          // Custom visual chart popular keywords
          React.createElement(
            'div',
            { className: 'bg-slate-50 p-6 border border-slate-200 rounded-2xl space-y-4' },
            React.createElement('h3', { className: 'text-xs font-bold text-slate-700 uppercase tracking-widest' }, 'Popular Search Keywords & Counts'),
            React.createElement(
              'div',
              { className: 'space-y-3' },
              analytics.popular_topics.map((t: any, i: number) => React.createElement(
                'div',
                { key: i, className: 'space-y-1.5' },
                React.createElement(
                  'div',
                  { className: 'flex justify-between text-xs font-bold text-slate-600' },
                  React.createElement('span', null, `"${t.topic}"`),
                  React.createElement('span', null, `${t.count} hits`)
                ),
                React.createElement(
                  'div',
                  { className: 'w-full bg-slate-200 h-2.5 rounded-full overflow-hidden' },
                  React.createElement('div', {
                    className: 'bg-gradient-to-r from-primary to-secondary h-full rounded-full',
                    style: { width: `${Math.min(100, (t.count / 15) * 100)}%` }
                  })
                )
              ))
            )
          )
        ),

        // TAB 2: ARTICLES CRUD
        activeTab === 'articles' && React.createElement(
          'div',
          { className: 'space-y-6' },
          React.createElement(
            'div',
            { className: 'overflow-x-auto' },
            React.createElement(
              'table',
              { className: 'w-full text-xs text-left border-collapse' },
              React.createElement(
                'thead',
                { className: 'bg-slate-50 text-slate-500 font-bold border-b border-slate-100' },
                React.createElement(
                  'tr',
                  null,
                  React.createElement('th', { className: 'p-3' }, 'Title'),
                  React.createElement('th', { className: 'p-3' }, 'Level'),
                  React.createElement('th', { className: 'p-3' }, 'Read Time'),
                  React.createElement('th', { className: 'p-3 text-right' }, 'Actions')
                )
              ),
              React.createElement(
                'tbody',
                { className: 'divide-y divide-slate-100 font-semibold text-slate-700' },
                articles.map((art) => React.createElement(
                  'tr',
                  { key: art.id, className: 'hover:bg-slate-50' },
                  React.createElement('td', { className: 'p-3 font-bold max-w-xs truncate' }, art.title),
                  React.createElement('td', { className: 'p-3 capitalize' }, art.difficulty),
                  React.createElement('td', { className: 'p-3' }, `${art.reading_time} min`),
                  React.createElement(
                    'td',
                    { className: 'p-3 text-right flex justify-end space-x-1.5' },
                    React.createElement(
                      'button',
                      { onClick: () => editArticleItem(art), className: 'p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-primary transition-colors' },
                      React.createElement(Edit3, { className: 'w-3.5 h-3.5' })
                    ),
                    React.createElement(
                      'button',
                      { onClick: () => deleteArticleItem(art.id), className: 'p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors' },
                      React.createElement(Trash2, { className: 'w-3.5 h-3.5' })
                    )
                  )
                ))
              )
            )
          )
        ),

        // TAB 3: RESOURCES CRUD
        activeTab === 'resources' && React.createElement(
          'div',
          { className: 'space-y-6' },
          React.createElement(
            'div',
            { className: 'flex justify-between items-center pb-3 border-b border-slate-100' },
            React.createElement('h3', { className: 'text-sm font-bold text-slate-700' }, 'Add Resource Link'),
            React.createElement(
              'button',
              { onClick: () => setShowResourceModal(true), className: 'bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1' },
              React.createElement(Plus, { className: 'w-3.5 h-3.5' }),
              React.createElement('span', null, 'New Link')
            )
          ),
          React.createElement(
            'div',
            { className: 'overflow-x-auto' },
            React.createElement(
              'table',
              { className: 'w-full text-xs text-left border-collapse' },
              React.createElement(
                'thead',
                { className: 'bg-slate-50 text-slate-500 font-bold border-b border-slate-100' },
                React.createElement(
                  'tr',
                  null,
                  React.createElement('th', { className: 'p-3' }, 'Title'),
                  React.createElement('th', { className: 'p-3' }, 'Type'),
                  React.createElement('th', { className: 'p-3' }, 'URL'),
                  React.createElement('th', { className: 'p-3 text-right' }, 'Action')
                )
              ),
              React.createElement(
                'tbody',
                { className: 'divide-y divide-slate-100 font-semibold text-slate-700' },
                resources.map((res) => React.createElement(
                  'tr',
                  { key: res.id, className: 'hover:bg-slate-50' },
                  React.createElement('td', { className: 'p-3 font-bold' }, res.title),
                  React.createElement('td', { className: 'p-3 uppercase' }, res.type),
                  React.createElement('td', { className: 'p-3 text-slate-400 truncate max-w-xs' }, res.url),
                  React.createElement(
                    'td',
                    { className: 'p-3 text-right' },
                    React.createElement(
                      'button',
                      { onClick: () => deleteResourceItem(res.id), className: 'p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors' },
                      React.createElement(Trash2, { className: 'w-3.5 h-3.5' })
                    )
                  )
                ))
              )
            )
          )
        ),

        // TAB 4: USERS ROLE MANAGEMENT
        activeTab === 'users' && React.createElement(
          'div',
          { className: 'space-y-6' },
          React.createElement(
            'div',
            { className: 'overflow-x-auto' },
            React.createElement(
              'table',
              { className: 'w-full text-xs text-left border-collapse' },
              React.createElement(
                'thead',
                { className: 'bg-slate-50 text-slate-500 font-bold border-b border-slate-100' },
                React.createElement(
                  'tr',
                  null,
                  React.createElement('th', { className: 'p-3' }, 'Email Address'),
                  React.createElement('th', { className: 'p-3' }, 'Role'),
                  React.createElement('th', { className: 'p-3' }, 'Joined Date'),
                  React.createElement('th', { className: 'p-3 text-right' }, 'Actions')
                )
              ),
              React.createElement(
                'tbody',
                { className: 'divide-y divide-slate-100 font-semibold text-slate-700' },
                users.map((u) => {
                  const isSelf = u.id === user?.id;
                  return React.createElement(
                    'tr',
                    { key: u.id, className: 'hover:bg-slate-50' },
                    React.createElement('td', { className: 'p-3 font-bold' }, u.email),
                    React.createElement(
                      'td',
                      { className: 'p-3' },
                      React.createElement(
                        'span',
                        { className: `px-2 py-0.5 rounded font-bold text-[9px] uppercase ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-600'}` },
                        u.role
                      )
                    ),
                    React.createElement('td', { className: 'p-3 text-slate-400' }, new Date(u.created_at).toLocaleDateString()),
                    React.createElement(
                      'td',
                      { className: 'p-3 text-right flex justify-end space-x-1.5' },
                      !isSelf && React.createElement(
                        'button',
                        {
                          onClick: () => toggleUserRole(u.id, u.role),
                          className: 'px-2.5 py-1 hover:bg-slate-50 border border-slate-200 rounded font-semibold text-[10px] text-slate-600'
                        },
                        u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'
                      ),
                      !isSelf && React.createElement(
                        'button',
                        { onClick: () => deleteUserItem(u.id), className: 'p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500' },
                        React.createElement(Trash2, { className: 'w-3.5 h-3.5' })
                      )
                    )
                  );
                })
              )
            )
          )
        )
      )
    ),

    // Resource Form Modal
    showResourceModal && React.createElement(
      'div',
      { className: 'fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4' },
      React.createElement(
        'div',
        { className: 'bg-white border border-slate-200 shadow-xl rounded-3xl p-6 w-full max-w-sm space-y-4 text-left' },
        React.createElement('h3', { className: 'text-sm font-bold text-slate-800' }, 'Add Resource Link'),
        React.createElement(
          'form',
          { onSubmit: handleCreateResource, className: 'space-y-4' },
          React.createElement(
            'div',
            { className: 'space-y-1' },
            React.createElement('label', { className: 'text-[11px] font-semibold text-slate-500' }, 'Title'),
            React.createElement('input', {
              type: 'text',
              required: true,
              value: resTitle,
              onChange: (e) => setResTitle(e.target.value),
              placeholder: 'e.g. IRS Employer ID Filing portal',
              className: 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800'
            })
          ),
          React.createElement(
            'div',
            { className: 'space-y-1' },
            React.createElement('label', { className: 'text-[11px] font-semibold text-slate-500' }, 'URL Link'),
            React.createElement('input', {
              type: 'url',
              required: true,
              value: resUrl,
              onChange: (e) => setResUrl(e.target.value),
              placeholder: 'https://...',
              className: 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800'
            })
          ),
          React.createElement(
            'div',
            { className: 'space-y-1' },
            React.createElement('label', { className: 'text-[11px] font-semibold text-slate-500' }, 'Type'),
            React.createElement(
              'select',
              {
                value: resType,
                onChange: (e) => setResType(e.target.value),
                className: 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none text-slate-700'
              },
              React.createElement('option', { value: 'government' }, 'Government Portals'),
              React.createElement('option', { value: 'template' }, 'Templates & Decks'),
              React.createElement('option', { value: 'incubator' }, 'Accelerators & Programs'),
              React.createElement('option', { value: 'tool' }, 'AI Tools')
            )
          ),
          React.createElement(
            'div',
            { className: 'flex justify-end space-x-2 pt-2' },
            React.createElement('button', { type: 'button', onClick: () => setShowResourceModal(false), className: 'px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700' }, 'Cancel'),
            React.createElement('button', { type: 'submit', className: 'px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-sm' }, 'Add Link')
          )
        )
      )
    ),

    // Article Form Modal
    showArticleModal && React.createElement(
      'div',
      { className: 'fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto' },
      React.createElement(
        'div',
        { className: 'bg-white border border-slate-200 shadow-xl rounded-3xl p-6 w-full max-w-xl space-y-4 text-left my-8' },
        React.createElement('h3', { className: 'text-sm font-bold text-slate-800' }, editingArticle ? 'Edit Article Document' : 'Compose New Article'),
        React.createElement(
          'form',
          { onSubmit: handleSaveArticle, className: 'space-y-4' },
          React.createElement(
            'div',
            { className: 'grid grid-cols-2 gap-4' },
            React.createElement(
              'div',
              { className: 'space-y-1' },
              React.createElement('label', { className: 'text-[11px] font-semibold text-slate-500' }, 'Title'),
              React.createElement('input', {
                type: 'text',
                required: true,
                value: newTitle,
                onChange: (e) => setNewTitle(e.target.value),
                placeholder: 'Understanding Venture Debt',
                className: 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800'
              })
            ),
            React.createElement(
              'div',
              { className: 'space-y-1' },
              React.createElement('label', { className: 'text-[11px] font-semibold text-slate-500' }, 'Slug (unique URL path)'),
              React.createElement('input', {
                type: 'text',
                required: true,
                value: newSlug,
                onChange: (e) => setNewSlug(e.target.value),
                placeholder: 'venture-debt-guide',
                className: 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800'
              })
            )
          ),
          React.createElement(
            'div',
            { className: 'grid grid-cols-3 gap-2' },
            React.createElement(
              'div',
              { className: 'space-y-1' },
              React.createElement('label', { className: 'text-[11px] font-semibold text-slate-500' }, 'Category'),
              React.createElement(
                'select',
                {
                  value: newCatId,
                  onChange: (e) => setNewCatId(Number(e.target.value)),
                  className: 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700'
                },
                categories.map(c => React.createElement('option', { key: c.id, value: c.id }, c.name))
              )
            ),
            React.createElement(
              'div',
              { className: 'space-y-1' },
              React.createElement('label', { className: 'text-[11px] font-semibold text-slate-500' }, 'Difficulty'),
              React.createElement(
                'select',
                {
                  value: newDifficulty,
                  onChange: (e) => setNewDifficulty(e.target.value),
                  className: 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700'
                },
                React.createElement('option', { value: 'beginner' }, 'Beginner'),
                React.createElement('option', { value: 'intermediate' }, 'Intermediate'),
                React.createElement('option', { value: 'advanced' }, 'Advanced')
              )
            ),
            React.createElement(
              'div',
              { className: 'space-y-1' },
              React.createElement('label', { className: 'text-[11px] font-semibold text-slate-500' }, 'Reading Time (min)'),
              React.createElement('input', {
                type: 'number',
                min: 1,
                required: true,
                value: newReadTime,
                onChange: (e) => setNewReadTime(Number(e.target.value)),
                className: 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800'
              })
            )
          ),
          React.createElement(
            'div',
            { className: 'space-y-1' },
            React.createElement('label', { className: 'text-[11px] font-semibold text-slate-500' }, 'Brief Summary'),
            React.createElement('input', {
              type: 'text',
              value: newSummary,
              onChange: (e) => setNewSummary(e.target.value),
              placeholder: 'Actionable introduction summary parameters...',
              className: 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800'
            })
          ),
          React.createElement(
            'div',
            { className: 'space-y-1' },
            React.createElement('label', { className: 'text-[11px] font-semibold text-slate-500' }, 'Detailed Article Content (Markdown support)'),
            React.createElement('textarea', {
              required: true,
              rows: 8,
              value: newContent,
              onChange: (e) => setNewContent(e.target.value),
              placeholder: 'Use markdown headings, lists, and links...',
              className: 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none text-slate-800'
            })
          ),
          React.createElement(
            'div',
            { className: 'flex justify-end space-x-2' },
            React.createElement('button', { type: 'button', onClick: () => setShowArticleModal(false), className: 'px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700' }, 'Cancel'),
            React.createElement('button', { type: 'submit', className: 'px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-sm' }, 'Save Document')
          )
        )
      )
    )
  );
}
