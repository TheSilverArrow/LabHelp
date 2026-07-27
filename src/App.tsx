/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import TalongTab from './components/TalongTab';
import PghMapTab from './components/PghMapTab';
import PrintablesTab from './components/PrintablesTab';
import { Menu, ChevronDown } from 'lucide-react';
import { AnimatedTabIcon } from './components/AnimatedTabIcon';

export default function App() {
  const [activeTab, setActiveTab] = useState(localStorage.getItem('pgh_last_active_tab') || 'form-tool-content');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('pgh_last_active_tab', tab);
    setIsMenuOpen(false);
  };

  const tabs = [
    { id: 'form-tool-content', label: 'LABS ASSISTANT' },
    { id: 'third-tool', label: 'PRINTABLES' },
    { id: 'second-tool', label: 'PGH MAP' },
  ];

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label || 'MENU';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col box-border">
      {/* Desktop Navigation */}
      {!isModalOpen && (
        <nav id="main-nav-bar" className="hidden md:flex ml-10 mt-5 pb-0 items-end gap-1 flex-shrink-0">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`nav-tab flex items-center ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <AnimatedTabIcon id={tab.id} isActive={activeTab === tab.id} />
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      {/* Mobile Navigation */}
      {!isModalOpen && (
        <div className="md:hidden px-5 pt-4 pb-2 relative flex-shrink-0" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mobile-menu-btn w-full flex items-center justify-between bg-[#334155] text-white px-4 py-3 rounded-xl shadow-lg font-bold text-sm transition-all active:scale-95 border-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <AnimatedTabIcon id={activeTab} isActive={true} />
              <span>{activeTabLabel}</span>
            </div>
            <ChevronDown size={18} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMenuOpen && (
            <div className="absolute top-full left-5 right-5 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[1000] animate-slide-down">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full text-left px-5 py-4 text-sm font-bold transition-colors border-b border-gray-50 last:border-0 flex items-center gap-3 ${
                    activeTab === tab.id 
                      ? '!bg-[#334155] !text-white' 
                      : '!bg-white !text-[#334155] hover:bg-gray-50'
                  }`}
                >
                  <AnimatedTabIcon id={tab.id} isActive={activeTab === tab.id} />
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <main id="main-content-area" className="flex-1 flex flex-col min-h-0 bg-transparent">
        <div className={`flex-1 scroll-smooth px-2 pb-2 md:px-5 md:pb-5 pt-0 md:pt-0 ${activeTab === 'form-tool-content' ? 'flex flex-col' : 'hidden'}`}>
          <TalongTab />
        </div>
        <div className={`flex-1 pt-0 md:pt-0 ${activeTab === 'second-tool' ? 'flex flex-col' : 'hidden'}`}>
          <PghMapTab />
        </div>
        <div className={`flex-1 scroll-smooth px-2 pb-2 md:px-5 md:pb-5 pt-0 md:pt-0 ${activeTab === 'third-tool' ? 'flex flex-col' : 'hidden'}`}>
          <PrintablesTab onModalToggle={setIsModalOpen} />
        </div>
      </main>
    </div>
  );
}
