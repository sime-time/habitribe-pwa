CREATE TABLE `habit_entry` (
	`habit_id` integer NOT NULL,
	`date` text DEFAULT (CURRENT_DATE),
	`goal` integer NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`habit_id`, `date`),
	FOREIGN KEY (`habit_id`) REFERENCES `habit`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `habit` ADD `description` text;