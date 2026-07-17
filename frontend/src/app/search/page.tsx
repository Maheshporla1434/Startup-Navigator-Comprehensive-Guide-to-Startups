'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { 
  Search, Sparkles, Send, Copy, Download, Bookmark, Trash2, 
  History, Plus, MessageSquare, Loader2, ArrowRight, ShieldCheck, 
  HelpCircle, RefreshCw, PanelLeftClose, PanelLeft, Info
} from 'lucide-react';

interface ChatMessage {
  id: number;
  role: string;
  content: string;
  citations?: string; // JSON string list of strings
  created_at: string;
}

interface ChatSession {
  id: number;
  title: string;
  created_at: string;
}

function AISearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams ? searchParams.get('q') : '';

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [bookmarkedId, setBookmarkedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedPrompts = [
    "What is the par value for Delaware incorporation?",
    "How do I maintain LTV to CAC above 3:1?",
    "Explain stock option vesting schedules.",
    "Draft a VC pitch deck problem statement."
  ];

  const fetchChatSessions = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setHistoryLoading(true);
    try {
      const res = await api.get('/chat/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadSessionMessages = async (sessionId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/chat/sessions/${sessionId}`);
      setMessages(res.data.messages);
      setActiveSessionId(sessionId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setMessages([]);
        setActiveSessionId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setActiveSessionId(null);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to ask AI questions.');
      router.push('/login');
      return;
    }

    setLoading(true);
    // Optimistic User Bubble
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setInputMessage('');

    try {
      const res = await api.post('/chat', {
        chat_id: activeSessionId || undefined,
        message: text
      });
      
      const assistantMsg = res.data;
      setMessages(prev => [...prev, assistantMsg]);
      
      // If first message in a new session, reload session list
      if (!activeSessionId) {
        setActiveSessionId(assistantMsg.chat_id);
        fetchChatSessions();
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Error: Failed to process request in RAG pipeline. Verify your PostgreSQL database connection.',
        created_at: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatSessions();
  }, []);

  // Handle incoming search query parameter from landing page
  useEffect(() => {
    if (initialQuery && sessions.length >= 0) {
      const delayQuery = setTimeout(() => {
        handleSendMessage(initialQuery);
      }, 500);
      return () => clearTimeout(delayQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadAnswer = (content: string, title: string) => {
    if (typeof window !== 'undefined') {
      const element = document.createElement('a');
      const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_answer.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const toggleBookmark = async (chatId: number) => {
    try {
      await api.post('/bookmarks', { chat_id: chatId });
      setBookmarkedId(chatId);
      setTimeout(() => setBookmarkedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return React.createElement(
    'div',
    { className: 'flex h-[calc(100vh-64px)] overflow-hidden text-left bg-slate-50' },
    
    // Sidebar Chat History list
    sidebarOpen && React.createElement(
      'aside',
      { className: 'hidden md:flex flex-col w-64 bg-white border-r border-slate-200 transition-all duration-300' },
      React.createElement(
        'div',
        { className: 'p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50' },
        React.createElement(
          'span',
          { className: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5' },
          React.createElement(History, { className: 'w-3.5 h-3.5' }),
          React.createElement('span', null, 'AI Conversations')
        ),
        React.createElement(
          'div',
          { className: 'flex items-center space-x-1' },
          React.createElement(
            'button',
            { onClick: clearChat, className: 'p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary transition-colors', title: 'New Conversation' },
            React.createElement(Plus, { className: 'w-4 h-4' })
          ),
          React.createElement(
            'button',
            { onClick: () => setSidebarOpen(false), className: 'p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors', title: 'Close Sidebar' },
            React.createElement(PanelLeftClose, { className: 'w-4 h-4' })
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'flex-grow overflow-y-auto p-2.5 space-y-1' },
        historyLoading ? (
          React.createElement('p', { className: 'text-slate-400 text-xs py-4 text-center' }, 'Loading histories...')
        ) : sessions.length === 0 ? (
          React.createElement('p', { className: 'text-slate-400 text-[10px] py-8 text-center px-4 font-semibold leading-relaxed' }, 'No historical chat sessions yet. Ask AI a question!')
        ) : (
          sessions.map((s) => {
            const isActive = activeSessionId === s.id;
            return React.createElement(
              'div',
              {
                key: s.id,
                onClick: () => loadSessionMessages(s.id),
                className: `group flex justify-between items-center px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${isActive ? 'bg-blue-50/80 text-primary' : 'text-slate-600 hover:bg-slate-50'}`
              },
              React.createElement(
                'div',
                { className: 'flex items-center space-x-2 truncate' },
                React.createElement(MessageSquare, { className: 'w-3.5 h-3.5 flex-shrink-0' }),
                React.createElement('span', { className: 'truncate' }, s.title)
              ),
              React.createElement(
                'button',
                {
                  onClick: (e) => deleteSession(e, s.id),
                  className: 'opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-all'
                },
                React.createElement(Trash2, { className: 'w-3.5 h-3.5' })
              )
            );
          })
        )
      )
    ),

    // Main Chat Window
    React.createElement(
      'main',
      { className: 'flex-grow flex flex-col justify-between bg-slate-50 relative' },
      
      // Top status header bar
      React.createElement(
        'div',
        { className: 'border-b border-slate-200 bg-white py-3 px-6 flex justify-between items-center shadow-sm' },
        React.createElement(
          'div',
          { className: 'flex items-center space-x-3' },
          !sidebarOpen && React.createElement(
            'button',
            { onClick: () => setSidebarOpen(true), className: 'p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary transition-colors mr-1', title: 'Open History' },
            React.createElement(PanelLeft, { className: 'w-4 h-4' })
          ),
          React.createElement('div', { className: 'w-2 h-2 rounded-full bg-emerald-500 animate-ping' }),
          React.createElement('span', { className: 'text-xs font-bold text-slate-700' }, 'AI Co-pilot active (Grounded context search)')
        ),
        React.createElement(
          'button',
          { onClick: clearChat, className: 'flex items-center space-x-1 text-[10px] font-bold text-slate-500 hover:text-primary transition-colors' },
          React.createElement(RefreshCw, { className: 'w-3 h-3' }),
          React.createElement('span', null, 'Reset Chat')
        )
      ),

      // Messages container
      React.createElement(
        'div',
        { className: 'flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 w-full max-w-3xl mx-auto' },
        messages.length === 0 ? (
          // Welcome states with suggested prompts AND the newly generated illustration image!
          React.createElement(
            'div',
            { className: 'py-8 space-y-6 text-center' },
            
            // Generated Illustration Image
            React.createElement(
              'div',
              { className: 'relative max-w-sm mx-auto group' },
              React.createElement('img', {
                src: '/images/hero.png',
                alt: 'Startup Navigator Hero Illustration',
                className: 'w-48 h-auto rounded-3xl mx-auto shadow-md border border-slate-200 transition-all duration-500 group-hover:scale-105'
              }),
              React.createElement('div', { className: 'absolute -top-3 -right-3 bg-gradient-to-tr from-primary to-secondary text-white p-2 rounded-2xl shadow-md border border-white' }, React.createElement(Sparkles, { className: 'w-4.5 h-4.5 animate-pulse' }))
            ),

            React.createElement(
              'div',
              { className: 'space-y-2' },
              React.createElement('h2', { className: 'text-xl sm:text-2xl font-outfit font-extrabold text-slate-800' }, 'What can I guide you with today?'),
              React.createElement('p', { className: 'text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-semibold' }, 'Search verified articles, legal parameters, cap table guidelines, and seed templates.')
            ),
            
            // Grid chips
            React.createElement(
              'div',
              { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto pt-4' },
              suggestedPrompts.map((p, i) => React.createElement(
                'button',
                {
                  key: i,
                  onClick: () => handleSendMessage(p),
                  className: 'bg-white border border-slate-200 text-slate-600 font-semibold hover:border-primary/50 text-xs px-4 py-3.5 rounded-2xl shadow-soft text-left hover:bg-slate-50 hover:text-primary transition-all flex justify-between items-center group active:scale-[0.98]'
                },
                React.createElement('span', null, p),
                React.createElement(ArrowRight, { className: 'w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-primary transition-opacity' })
              ))
            )
          )
        ) : (
          messages.map((m) => {
            const isUser = m.role === 'user';
            let citationList: string[] = [];
            if (m.citations) {
              try {
                citationList = JSON.parse(m.citations);
              } catch (e) {
                citationList = [];
              }
            }

            return React.createElement(
              'div',
              { key: m.id, className: `flex ${isUser ? 'justify-end' : 'justify-start'}` },
              React.createElement(
                'div',
                { className: `max-w-xl rounded-3xl p-5 shadow-soft border ${isUser ? 'bg-primary text-white border-primary' : 'bg-white text-slate-700 border-slate-200'}` },
                
                // Content text
                React.createElement(
                  'div',
                  { className: 'text-xs sm:text-sm font-semibold leading-relaxed prose prose-slate text-left space-y-3' },
                  m.content.split('\n').map((line, idx) => {
                    if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                      return React.createElement('li', { key: idx, className: 'ml-4 list-disc mt-1' }, line.substring(1).trim());
                    }
                    if (line.trim().startsWith('###')) {
                      return React.createElement('h3', { key: idx, className: 'font-bold font-outfit text-slate-800 text-sm mt-3 mb-1' }, line.substring(3).trim());
                    }
                    return React.createElement('p', { key: idx }, line);
                  })
                ),

                // Citations list
                !isUser && citationList.length > 0 && React.createElement(
                  'div',
                  { className: 'mt-4 border-t border-slate-100 pt-3 text-left space-y-1.5' },
                  React.createElement('span', { className: 'text-[9px] font-bold text-slate-400 uppercase tracking-wider block' }, 'Source Citations:'),
                  React.createElement(
                    'div',
                    { className: 'flex flex-wrap gap-1.5' },
                    citationList.map((cit, idx) => React.createElement(
                      'span',
                      { key: idx, className: 'bg-slate-50 border border-slate-150 text-slate-500 font-semibold px-2 py-0.5 rounded text-[9px] flex items-center' },
                      `[${idx + 1}] ${cit}`
                    ))
                  )
                ),

                // Action Bar under assistant bubble
                !isUser && React.createElement(
                  'div',
                  { className: 'flex justify-end space-x-1.5 mt-4 border-t border-slate-100 pt-2 text-slate-400' },
                  React.createElement(
                    'button',
                    {
                      onClick: () => copyToClipboard(m.content, m.id),
                      className: `flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all ${copiedId === m.id ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100 hover:text-slate-600'}`
                    },
                    copiedId === m.id ? React.createElement(CheckCircle2, { className: 'w-3 h-3' }) : React.createElement(Copy, { className: 'w-3 h-3' }),
                    React.createElement('span', null, copiedId === m.id ? 'Copied' : 'Copy')
                  ),
                  React.createElement(
                    'button',
                    {
                      onClick: () => downloadAnswer(m.content, 'ai_search_answer'),
                      className: 'flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 hover:text-slate-600 transition-all text-[10px] font-bold'
                    },
                    React.createElement(Download, { className: 'w-3 h-3' }),
                    React.createElement('span', null, 'Download')
                  ),
                  React.createElement(
                    'button',
                    {
                      onClick: () => toggleBookmark(m.id),
                      className: `flex items-center space-x-1 px-2.5 py-1 rounded-lg border transition-all text-[10px] font-bold ${bookmarkedId === m.id ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100 hover:text-slate-600'}`
                    },
                    React.createElement(Bookmark, { className: 'w-3 h-3' }),
                    React.createElement('span', null, bookmarkedId === m.id ? 'Saved' : 'Save')
                  )
                )
              )
            );
          })
        ),

        // Typing animation spinner
        loading && React.createElement(
          'div',
          { className: 'flex justify-start' },
          React.createElement(
            'div',
            { className: 'bg-white border border-slate-200 rounded-3xl p-5 shadow-soft flex items-center space-x-3 text-slate-400 text-xs' },
            React.createElement(Loader2, { className: 'w-4 h-4 animate-spin text-primary' }),
            React.createElement('span', { className: 'font-semibold' }, 'Analyzing knowledge base context & creating RAG response...')
          )
        ),
        React.createElement('div', { ref: messagesEndRef })
      ),

      // ChatGPT-style centered floating prompt input box
      React.createElement(
        'div',
        { className: 'w-full max-w-3xl mx-auto px-4 pb-6 pt-2 bg-transparent relative' },
        React.createElement(
          'form',
          {
            onSubmit: (e) => { e.preventDefault(); handleSendMessage(inputMessage); },
            className: 'relative flex items-center bg-white border border-slate-200 shadow-lg rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all'
          },
          React.createElement(
            'div',
            { className: 'pl-3 text-primary flex-shrink-0' },
            React.createElement(Sparkles, { className: 'w-4 h-4 animate-pulse' })
          ),
          React.createElement('input', {
            type: 'text',
            value: inputMessage,
            onChange: (e) => setInputMessage(e.target.value),
            placeholder: 'Ask AI: "How do option vesting cliffs work?" or "Draft Delaware bylaws..."',
            disabled: loading,
            className: 'flex-grow px-3 py-3.5 bg-white text-xs sm:text-sm focus:outline-none text-slate-800 disabled:opacity-50 font-semibold'
          }),
          React.createElement(
            'button',
            {
              type: 'submit',
              disabled: loading || !inputMessage.trim(),
              className: 'bg-primary hover:bg-primary-dark disabled:opacity-40 text-white font-bold p-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center flex-shrink-0 mr-1 active:scale-[0.95]'
            },
            React.createElement(Send, { className: 'w-4 h-4' })
          )
        )
      )
    )
  );
}

export default function AISearchPage() {
  return React.createElement(
    React.Suspense,
    { fallback: React.createElement('div', { className: 'flex items-center justify-center min-h-screen text-slate-500 font-semibold' }, 'Loading AI Search...') },
    React.createElement(AISearchPageContent)
  );
}
