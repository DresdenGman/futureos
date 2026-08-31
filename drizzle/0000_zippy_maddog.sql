CREATE TABLE `belief_updates` (
	`id` text PRIMARY KEY NOT NULL,
	`decision_id` text NOT NULL,
	`user_id` text NOT NULL,
	`probability` integer NOT NULL,
	`evidence` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_updates_decision_created` ON `belief_updates` (`decision_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_updates_user` ON `belief_updates` (`user_id`);--> statement-breakpoint
CREATE TABLE `decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`question` text NOT NULL,
	`success_criteria` text NOT NULL,
	`deadline` text NOT NULL,
	`selected_option` text NOT NULL,
	`expected_value` integer NOT NULL,
	`reversibility` integer NOT NULL,
	`probability` integer NOT NULL,
	`reversal_trigger` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`outcome` integer,
	`outcome_note` text,
	`outcome_metric` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_decisions_user_status` ON `decisions` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_decisions_user_updated` ON `decisions` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `request_limits` (
	`user_id` text NOT NULL,
	`bucket` text NOT NULL,
	`count` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_request_limits_user_bucket` ON `request_limits` (`user_id`,`bucket`);--> statement-breakpoint
PRAGMA optimize;
