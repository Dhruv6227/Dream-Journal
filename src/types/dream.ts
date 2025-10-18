export interface Dream {
  id: string;
  title: string;
  description: string;
  transcript: string;
  imageUrl?: string;
  analysis?: string;
  mood?: string;
  symbols?: string[];
  narrative?: string;
  createdAt: string;
}