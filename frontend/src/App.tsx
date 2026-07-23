/**
 * @file App.tsx
 * @description Main application component for the diary app.
 * Manages authentication, diary entries state, and theme switching between classic and modern UI layouts.
 */

import React, { useState, useEffect } from 'react';
import { getEntries, createEntry, deleteEntry, logoutUser } from './services/api';
import type { DiaryEntry } from './types';
import ClassicDiary from './ClassDiary';
import ModernDiary from './ModernDiary';
import Auth from './Auth';

/** Available UI theme layout options */
type Theme = 'classic' | 'modern';

/** Local storage key used to persist user theme preferences */
const THEME_STORAGE_KEY = 'diary-theme';

/**
 * Root component that controls user authentication state, handles CRUD operations 
 * for diary entries, and handles layout rendering based on the active theme.
 */
function App() {
  // Track authentication status based on token presence in localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'modern' ? 'modern' : 'classic';
  });

  // Fetch entries when authenticated or when the token changes
  useEffect(() => {
    if (isAuthenticated) {
      loadEntries();
    }
  }, [isAuthenticated]);

  // Persist theme changes to localStorage
  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  /** Fetches all diary entries from the backend API */
  const loadEntries = async () => {
    try {
      const data = await getEntries();
      setEntries(data);
    } catch (error) {
      console.error("Error fetching entries:", error);
      // If token is invalid or expired, log out automatically
      if ((error as any)?.response?.status === 401) {
        handleLogout();
      }
    }
  };

  /** Handles creation of a new diary entry */
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      await createEntry({ title, content });
      setTitle('');
      setContent('');
      loadEntries();
    } catch (error) {
      console.error("Error creating entry:", error);
    }
  };

  /** Handles deletion of an existing diary entry by ID */
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this diary entry?");
    if (!confirmed) return;

    try {
      await deleteEntry(id);
      loadEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  /** Logs out the current user and clears session state */
  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
    setEntries([]);
  };

  /** Toggles between classic and modern visual layouts */
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'classic' ? 'modern' : 'classic'));
  };

  /** Shared props passed down to diary layout view components */
  const sharedProps = {
    entries,
    title,
    content,
    setTitle,
    setContent,
    onSubmit: handleSubmit,
    onDelete: handleDelete,
  };

  // If the user is not logged in, render the Auth view
  if (!isAuthenticated) {
    return <Auth onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="relative">
      {theme === 'classic' ? (
        <ClassicDiary {...sharedProps} />
      ) : (
        <ModernDiary {...sharedProps} />
      )}

      {/* Floating Action Buttons container (Theme toggle & Logout) */}
      <div className="fixed bottom-5 right-5 flex items-center gap-3 z-50">
        {/* Logout button */}
        <button
          onClick={handleLogout}
          aria-label="Log out of account"
          title="Log out"
          className="flex items-center gap-2 bg-red-600 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Sign Out
        </button>

        {/* Floating theme toggle button */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'classic' ? 'Switch to modern style' : 'Switch to classic style'}
          title={theme === 'classic' ? 'Switch to modern style' : 'Switch to classic style'}
          className="flex items-center gap-2 bg-[#1F2937] text-white text-sm font-medium pl-3 pr-4 py-2.5 rounded-full shadow-lg hover:bg-[#111827] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B5BD6]"
        >
          {theme === 'classic' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" />
            </svg>
          )}
          {theme === 'classic' ? 'Try modern' : 'Try classic'}
        </button>
      </div>
    </div>
  );
}

export default App;