import React, { useState, useEffect } from 'react';
import { getEntries, createEntry } from './services/api';
import type { DiaryEntry } from './types';
import './App.css';

function App() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await getEntries();
      setEntries(data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>My Web Diary</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder="Entry Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <textarea 
          placeholder="Write your thoughts here..." 
          value={content} 
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '10px', fontSize: '16px', background: '#007BFF', color: 'white', border: 'none', cursor: 'pointer' }}>
          Save Entry
        </button>
      </form>

      <h2>Previous Entries</h2>
      {entries.length === 0 ? (
        <p>No entries yet. Write your first one above!</p>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', marginBottom: '15px', background: '#f9f9f9' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{entry.title}</h3>
            <p style={{ margin: '0 0 10px 0', whiteSpace: 'pre-wrap' }}>{entry.content}</p>
            <small style={{ color: '#666' }}>{new Date(entry.created_at).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
}

export default App;