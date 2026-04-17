import { pgTable, text, uuid, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const notificationsTable = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('system'),
  referenceType: text('reference_type'),
  referenceId: uuid('reference_id'),
  actionUrl: text('action_url'),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at', { withTimezone: true }),
  pushSent: boolean('push_sent').default(false),
  pushSentAt: timestamp('push_sent_at', { withTimezone: true }),
  smsSent: boolean('sms_sent').default(false),
  smsSentAt: timestamp('sms_sent_at', { withTimezone: true }),
  emailSent: boolean('email_sent').default(false),
  emailSentAt: timestamp('email_sent_at', { withTimezone: true }),
  imageUrl: text('image_url'),
  data: jsonb('data'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Notification = typeof notificationsTable.$inferSelect;
export type NewNotification = typeof notificationsTable.$inferInsert;
