'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, Compass, Search, BookOpen, User, LogOut, LayoutDashboard, Settings } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { href: '/explore', label: 'Explore Topics', icon: Compass },
    { href: '/search', label: 'AI Search', icon: Search },
    { href: '/resources', label: 'Resources', icon: BookOpen },
    { href: '/about', label: 'About', icon: User },
  ];

  const activeClass = "text-primary border-b-2 border-primary";
  const inactiveClass = "text-slate-600 hover:text-primary transition-colors duration-200";

  return React.createElement(
    'header',
    { className: 'sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm' },
    React.createElement(
      'div',
      { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
      React.createElement(
        'div',
        { className: 'flex justify-between h-16 items-center' },
        // Logo
        React.createElement(
          Link,
          { href: '/', className: 'flex items-center space-x-2' },
          React.createElement('div', { className: 'w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md' }, 'SN'),
          React.createElement(
            'div',
            null,
            React.createElement('span', { className: 'font-outfit font-extrabold text-lg text-slate-800 tracking-tight block' }, 'Startup Navigator'),
            React.createElement('span', { className: 'text-[10px] text-slate-400 block -mt-1 font-medium' }, 'AI Co-pilot')
          )
        ),
        // Desktop Navigation
        React.createElement(
          'nav',
          { className: 'hidden md:flex space-x-8 items-center h-full' },
          navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return React.createElement(
              Link,
              {
                key: link.href,
                href: link.href,
                className: `flex items-center space-x-1.5 py-5 px-1 text-sm font-medium ${isActive ? activeClass : inactiveClass}`
              },
              React.createElement(link.icon, { className: 'w-4 h-4' }),
              React.createElement('span', null, link.label)
            );
          }),
          React.createElement(Link, { href: '/contact', className: `text-sm font-medium ${pathname === '/contact' ? activeClass : inactiveClass}` }, 'Contact')
        ),
        // Desktop Auth Actions
        React.createElement(
          'div',
          { className: 'hidden md:flex items-center space-x-4' },
          isAuthenticated ? (
            React.createElement(
              'div',
              { className: 'flex items-center space-x-3' },
              isAdmin && React.createElement(
                Link,
                { href: '/admin', className: 'flex items-center space-x-1 text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors' },
                React.createElement(Settings, { className: 'w-3.5 h-3.5' }),
                React.createElement('span', null, 'Admin Panel')
              ),
              React.createElement(
                Link,
                { href: '/dashboard', className: 'flex items-center space-x-1.5 text-sm font-medium text-slate-700 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors' },
                React.createElement(LayoutDashboard, { className: 'w-4 h-4' }),
                React.createElement('span', null, 'Dashboard')
              ),
              React.createElement(
                'button',
                {
                  onClick: logout,
                  className: 'flex items-center space-x-1 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100'
                },
                React.createElement(LogOut, { className: 'w-4 h-4' }),
                React.createElement('span', null, 'Logout')
              )
            )
          ) : (
            React.createElement(
              'div',
              { className: 'flex items-center space-x-3' },
              React.createElement(Link, { href: '/login', className: 'text-sm font-medium text-slate-700 hover:text-primary px-3 py-2 rounded-lg transition-colors' }, 'Login'),
              React.createElement(
                Link,
                { href: '/register', className: 'bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all' },
                'Get Started'
              )
            )
          )
        ),
        // Mobile menu button
        React.createElement(
          'div',
          { className: 'md:hidden flex items-center' },
          React.createElement(
            'button',
            { onClick: toggleMenu, className: 'text-slate-600 hover:text-primary focus:outline-none p-1 rounded-lg hover:bg-slate-100' },
            isOpen ? React.createElement(X, { className: 'w-6 h-6' }) : React.createElement(Menu, { className: 'w-6 h-6' })
          )
        )
      )
    ),
    // Mobile Menu
    isOpen && React.createElement(
      'div',
      { className: 'md:hidden border-b border-slate-200 bg-white' },
      React.createElement(
        'div',
        { className: 'px-2 pt-2 pb-4 space-y-1 sm:px-3' },
        navLinks.map((link) => React.createElement(
          Link,
          {
            key: link.href,
            href: link.href,
            onClick: () => setIsOpen(false),
            className: 'flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-primary'
          },
          React.createElement(link.icon, { className: 'w-5 h-5' }),
          React.createElement('span', null, link.label)
        )),
        React.createElement(
          Link,
          { href: '/contact', onClick: () => setIsOpen(false), className: 'block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-primary' },
          'Contact'
        ),
        React.createElement('div', { className: 'border-t border-slate-100 my-2 pt-2' }),
        isAuthenticated ? (
          React.createElement(
            'div',
            { className: 'space-y-1' },
            isAdmin && React.createElement(
              Link,
              { href: '/admin', onClick: () => setIsOpen(false), className: 'flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-semibold text-indigo-600 hover:bg-indigo-50' },
              React.createElement(Settings, { className: 'w-5 h-5' }),
              React.createElement('span', null, 'Admin Panel')
            ),
            React.createElement(
              Link,
              { href: '/dashboard', onClick: () => setIsOpen(false), className: 'flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50' },
              React.createElement(LayoutDashboard, { className: 'w-5 h-5' }),
              React.createElement('span', null, 'Dashboard')
            ),
            React.createElement(
              'button',
              { onClick: () => { setIsOpen(false); logout(); }, className: 'flex w-full items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 text-left' },
              React.createElement(LogOut, { className: 'w-5 h-5' }),
              React.createElement('span', null, 'Logout')
            )
          )
        ) : (
          React.createElement(
            'div',
            { className: 'grid grid-cols-2 gap-2 px-3 pt-2' },
            React.createElement(Link, { href: '/login', onClick: () => setIsOpen(false), className: 'text-center border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-50' }, 'Login'),
            React.createElement(Link, { href: '/register', onClick: () => setIsOpen(false), className: 'text-center bg-primary text-white px-3 py-2 rounded-xl text-sm font-semibold shadow hover:bg-primary-dark' }, 'Sign Up')
          )
        )
      )
    )
  );
}
