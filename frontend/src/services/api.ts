import axios from 'axios';
import type { DiaryEntry, DiaryEntryCreate } from '../types';

// Set the base URL for the API from environment variables, with a fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Fetch all diary entries from the backend API
export const getEntries = async (): Promise<DiaryEntry[]> => {
  const response = await axios.get<DiaryEntry[]>(`${API_URL}/entries/`);
  return response.data;
};


// Create a new diary entry by sending a POST request to the backend API
export const createEntry = async (entryData: DiaryEntryCreate): Promise<DiaryEntry> => {
  const response = await axios.post<DiaryEntry>(`${API_URL}/entries/`, entryData);
  return response.data;
};