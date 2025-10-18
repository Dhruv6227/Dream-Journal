import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const dreams = sqliteTable('dreams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  transcript: text('transcript').notNull(),
  imageUrl: text('image_url'),
  analysis: text('analysis'),
  mood: text('mood'),
  symbols: text('symbols'),
  narrative: text('narrative'),
  createdAt: text('created_at').notNull(),
}); 