ALTER TABLE `user` RENAME COLUMN "username" TO "display_name";--> statement-breakpoint
DROP INDEX `user_username_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_display_name_unique` ON `user` (`display_name`);