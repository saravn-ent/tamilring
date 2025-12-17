import { pgTable, uuid, text, integer, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Profiles Table
export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey().notNull(),
    email: text('email').notNull().unique(),
    fullName: text('full_name'),
    avatarUrl: text('avatar_url'),
    role: text('role').default('user').$type<'user' | 'admin'>(),
    bio: text('bio'),
    websiteUrl: text('website_url'),
    instagramHandle: text('instagram_handle'),
    twitterHandle: text('twitter_handle'),
    upiId: text('upi_id'),
    btcAddress: text('btc_address'),
    points: integer('points').default(0),
    level: integer('level').default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Ringtones Table
export const ringtones = pgTable('ringtones', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    slug: text('slug').unique().notNull(),

    // Metadata
    movieName: text('movie_name'),
    movieYear: text('movie_year'),
    singers: text('singers'),
    musicDirector: text('music_director'),
    movieDirector: text('movie_director'),
    castMembers: text('cast_members'),
    mood: text('mood'),
    tags: text('tags').array(),

    // Assets
    posterUrl: text('poster_url'),
    backdropUrl: text('backdrop_url'),
    audioUrl: text('audio_url').notNull(),
    audioUrlIphone: text('audio_url_iphone'),
    waveformUrl: text('waveform_url'),

    // External Links
    spotifyLink: text('spotify_link'),
    appleMusicLink: text('apple_music_link'),

    // Metrics
    downloads: integer('downloads').default(0),
    likes: integer('likes').default(0),

    // Status
    status: text('status').default('pending').$type<'pending' | 'approved' | 'rejected'>(),
    rejectionReason: text('rejection_reason'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    slugIdx: index('idx_ringtones_slug').on(t.slug),
    userIdIdx: index('idx_ringtones_user_id').on(t.userId),
    statusIdx: index('idx_ringtones_status').on(t.status),
    createdAtIdx: index('idx_ringtones_created_at').on(t.createdAt), // Fix: use t.createdAt instead of column name string for correctness in some versions, though created_at string works too. t.createdAt is safer.
}));

// Badges Table
export const badges = pgTable('badges', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(),
    description: text('description').notNull(),
    iconName: text('icon_name').notNull(),
    conditionType: text('condition_type').notNull().$type<'uploads_count' | 'likes_received_count' | 'manual'>(),
    conditionValue: integer('condition_value').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// User Badges Table
export const userBadges = pgTable('user_badges', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
    badgeId: uuid('badge_id').references(() => badges.id, { onDelete: 'cascade' }).notNull(),
    awardedAt: timestamp('awarded_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    uniqueUserBadge: unique('unique_user_badge').on(t.userId, t.badgeId),
}));
