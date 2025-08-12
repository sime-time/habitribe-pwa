DROP TABLE `tribe_invite`;--> statement-breakpoint
ALTER TABLE `tribe` ADD `invite_code` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `tribe_invite_code_unique` ON `tribe` (`invite_code`);