CREATE TABLE `dreams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`transcript` text NOT NULL,
	`image_url` text,
	`analysis` text,
	`mood` text,
	`symbols` text,
	`narrative` text,
	`created_at` text NOT NULL
);
