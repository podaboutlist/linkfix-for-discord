-- SQL Queries in this file are unused, it's left over from using PgTyped.
-- I find it helpful to have these here regardless so I haven't deleted it.

/* @name findGuildByDiscordId */
SELECT * FROM guilds WHERE native_guild_id = :guildId;

/* @name insertNewServer */
INSERT INTO guilds(id, native_guild_id) VALUES (default, :guildId) RETURNING *;

/* @name getServerSettings */
SELECT * FROM guild_settings WHERE guild = :guildIndex;

/* @name createServerSettings */
INSERT INTO guild_settings(
  id, guild,
  suppress_embeds, delete_original_message, mention_user_in_reply,
  fix_instagram, fix_reddit, fix_tiktok, fix_twitter, fix_yt_shorts
) VALUES (
  default, :guildIndex,
  :suppressEmbeds, :deleteOriginal, :mentionUser,
  :fixInstagram, :fixReddit, :fixTiktok, :fixTwitter, :fixYtShorts
) RETURNING *;

/* @name updateSetting */
-- in code, we will replace these values with `default`
