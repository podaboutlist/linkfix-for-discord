export type GuildRecord = { id: number; native_guild_id: bigint | string };

export type SettingsRecord = {
  id: number;
  guild: number;
  suppress_embeds: boolean;
  delete_original_message: boolean;
  mention_user_in_reply: boolean;
  fix_instagram: boolean;
  fix_reddit: boolean;
  fix_tiktok: boolean;
  fix_twitter: boolean;
  fix_yt_shorts: boolean;
};
