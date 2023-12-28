/* @name GetServerByGuildId */
SELECT * FROM guilds WHERE discord_native_id = :guildId;
