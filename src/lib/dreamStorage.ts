import { Dream } from "@/types/dream";

const STORAGE_KEY = "dream-journal-entries";

export const saveDream = (dream: Dream): void => {
  if (typeof window === "undefined") return;
  
  const dreams = getDreams();
  dreams.unshift(dream);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dreams));
};

export const getDreams = (): Dream[] => {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getDreamById = (id: string): Dream | undefined => {
  const dreams = getDreams();
  return dreams.find((dream) => dream.id === id);
};

export const deleteDream = (id: string): void => {
  if (typeof window === "undefined") return;
  
  const dreams = getDreams();
  const filtered = dreams.filter((dream) => dream.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const updateDream = (id: string, updates: Partial<Dream>): void => {
  if (typeof window === "undefined") return;
  
  const dreams = getDreams();
  const index = dreams.findIndex((dream) => dream.id === id);
  
  if (index !== -1) {
    dreams[index] = { ...dreams[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dreams));
  }
};