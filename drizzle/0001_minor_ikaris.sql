CREATE TABLE `public_events` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_key` text NOT NULL,
	`event_name` text NOT NULL,
	`tool` text NOT NULL,
	`source` text NOT NULL,
	`event_day` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_public_events_unique_daily` ON `public_events` (`visitor_key`,`event_name`,`tool`,`event_day`);--> statement-breakpoint
CREATE INDEX `idx_public_events_day_tool` ON `public_events` (`event_day`,`tool`);--> statement-breakpoint
CREATE INDEX `idx_public_events_source` ON `public_events` (`source`);