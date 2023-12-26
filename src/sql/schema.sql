CREATE TABLE "guilds" (
  "id" integer PRIMARY KEY,
  "native_id" bigint UNIQUE NOT NULL
);

CREATE TABLE "settings" (
  "id" integer PRIMARY KEY,
  "guild_id" integer UNIQUE NOT NULL,
  "delete_original" boolean NOT NULL DEFAULT false,
  "mention_user" boolean NOT NULL DEFAULT false,
  "fix_instagram" boolean NOT NULL DEFAULT true,
  "fix_reddit" boolean NOT NULL DEFAULT true,
  "fix_tiktok" boolean NOT NULL DEFAULT true,
  "fix_twitter" boolean NOT NULL DEFAULT true,
  "fix_yt_shorts" boolean NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX ON "guilds" ("native_id");

CREATE UNIQUE INDEX ON "settings" ("guild_id");

COMMENT ON COLUMN "guilds"."native_id" IS 'Discord Guild ID';

ALTER TABLE "guilds" ADD FOREIGN KEY ("id") REFERENCES "settings" ("guild_id");
