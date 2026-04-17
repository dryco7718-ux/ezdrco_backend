"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.notificationsTable = (0, pg_core_1.pgTable)('notifications', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull(),
    title: (0, pg_core_1.text)('title').notNull(),
    message: (0, pg_core_1.text)('message').notNull(),
    type: (0, pg_core_1.text)('type').notNull().default('system'),
    referenceType: (0, pg_core_1.text)('reference_type'),
    referenceId: (0, pg_core_1.uuid)('reference_id'),
    actionUrl: (0, pg_core_1.text)('action_url'),
    isRead: (0, pg_core_1.boolean)('is_read').default(false),
    readAt: (0, pg_core_1.timestamp)('read_at', { withTimezone: true }),
    pushSent: (0, pg_core_1.boolean)('push_sent').default(false),
    pushSentAt: (0, pg_core_1.timestamp)('push_sent_at', { withTimezone: true }),
    smsSent: (0, pg_core_1.boolean)('sms_sent').default(false),
    smsSentAt: (0, pg_core_1.timestamp)('sms_sent_at', { withTimezone: true }),
    emailSent: (0, pg_core_1.boolean)('email_sent').default(false),
    emailSentAt: (0, pg_core_1.timestamp)('email_sent_at', { withTimezone: true }),
    imageUrl: (0, pg_core_1.text)('image_url'),
    data: (0, pg_core_1.jsonb)('data'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
});
//# sourceMappingURL=notifications.js.map