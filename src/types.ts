export interface VelogPost {
  id: string;
  title: string;
  slug: string;
  body: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  url: string;
}

export interface SyncResult {
  discovered: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
}
