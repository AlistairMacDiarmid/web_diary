import axios from 'axios';
import type { DiaryEntry, LoginCredentials, RegisterCredentials } from '../types';

const LOCAL_API_URL = 'http://localhost:8000';
const PRODUCTION_API_URL = 'https://web-diary-blcg.onrender.com';

/**
 * Resolve the API host without ever sending API calls to the static Vercel
 * frontend. A Vercel URL in VITE_API_URL is a deployment misconfiguration and
 * causes preflight requests to redirect before they can reach FastAPI.
 */
function getApiUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  const fallbackUrl = import.meta.env.DEV ? LOCAL_API_URL : PRODUCTION_API_URL;

  if (!configuredUrl) {
    return fallbackUrl;
  }

  try {
    const hostname = new URL(configuredUrl).hostname;
    if (hostname.endsWith('.vercel.app')) {
      console.warn('Ignoring Vercel URL configured as API host. Using the Render API.');
      return fallbackUrl;
    }
  } catch {
    console.warn('Ignoring invalid VITE_API_URL. Using the default API host.');
    return fallbackUrl;
  }

  return configuredUrl.replace(/\/+$/, '');
}

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
});

// Automatically inject the JWT token into headers if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// --- User Authentication Endpoints ---

// Registers a new user with the provided credentials
export const registerUser = async (credentials: RegisterCredentials) => {
  /*** 
   * Registers a new user with the provided credentials
   * @param credentials - The user's registration credentials
   * @returns A promise resolving to the created user object
   ***/
  const response = await api.post('/register', credentials);
  return response.data;
};

export const loginUser = async (credentials: LoginCredentials) => {
  const formData = new URLSearchParams();
  // Use email if provided, otherwise fallback to username
  formData.append('username', credentials.email || credentials.username || '');
  formData.append('password', credentials.password);
  
  const response = await api.post('/token', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
};

export const logoutUser = () => {
  /***
   * Logs out the current user by removing the JWT token from localStorage
   ***/
  localStorage.removeItem('token');
};

// --- Diary Entry Endpoints ---

export const getEntries = async (): Promise<DiaryEntry[]> => {
  /*** 
   * Retrieves all diary entries
   * @returns A promise resolving to the list of diary entries
   ***/
  const response = await api.get('/entries/');
  return response.data;
};

export const createEntry = async (entry: { title: string; content: string }): Promise<DiaryEntry> => {
  /***
   * Creates a new diary entry with the provided title and content
   * @param entry - An object containing the title and content of the new diary entry
   * @returns A promise resolving to the created diary entry
   * */
  const response = await api.post('/entries/', entry);
  return response.data;
};

export const deleteEntry = async (id: number): Promise<void> => {
  /***
   * Deletes a diary entry by its ID
   * @param id - The ID of the diary entry to delete
   * @returns A promise that resolves when the entry is deleted
   ***/
  await api.delete(`/entries/${id}`);
};
