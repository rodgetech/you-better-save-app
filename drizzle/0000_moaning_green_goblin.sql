CREATE TABLE `user_setup` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`motivation` text NOT NULL,
	`goal` integer NOT NULL,
	`payday_schedule` text NOT NULL,
	`current_step` integer DEFAULT 1 NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
