// This file defines TypeScript interfaces for the diary entry data structures used in the application.

// The DiaryEntry interface represents a diary entry as returned by the backend API, including an ID and a timestamp.
export interface DiaryEntry {
    id: number;
    title: string;
    content: string;
    created_at: string; // ISO 8601 date string
}

// This interface is used when creating a new diary entry, where the ID and created_at fields are not required.
export interface DiaryEntryCreate {
    title: string;
    content: string;
}