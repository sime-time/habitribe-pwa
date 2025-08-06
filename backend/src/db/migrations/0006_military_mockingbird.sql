CREATE TABLE `tribe` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`leader_id` integer,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`leader_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `tribe_invite` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tribe_id` integer NOT NULL,
	`code` text NOT NULL,
	`expires_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`tribe_id`) REFERENCES `tribe`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tribe_invite_code_unique` ON `tribe_invite` (`code`);--> statement-breakpoint
CREATE TABLE `tribe_member` (
	`tribe_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`joined_at` integer NOT NULL,
	PRIMARY KEY(`tribe_id`, `user_id`),
	FOREIGN KEY (`tribe_id`) REFERENCES `tribe`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
