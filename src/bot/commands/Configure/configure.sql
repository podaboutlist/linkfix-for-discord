/* @name GetServerByGuildId */
SELECT * FROM guilds WHERE native_guild_id = :guildId;
