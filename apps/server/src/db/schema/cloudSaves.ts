import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { game } from "./game";

export const cloudSaves = pgTable("cloud_saves", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	gameId: text("game_id")
		.notNull()
		.references(() => game.id, { onDelete: "cascade" }),
	saveData: text("save_data").notNull(),
	lastModified: timestamp("last_modified", { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export const cloudSavesRelations = relations(cloudSaves, ({ one }) => ({
	user: one(user, {
		fields: [cloudSaves.userId],
		references: [user.id],
	}),
	game: one(game, {
		fields: [cloudSaves.gameId],
		references: [game.id],
	}),
}));
