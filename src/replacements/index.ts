import BskyReplacement from "./BskyReplacement";
import InstagramReplacement from "./InstagramReplacement";
import PixivReplacement from "./PixivReplacement";
import RedditMediaReplacement from "./RedditMediaReplacement";
import RedditReplacement from "./RedditReplacement";
import TikTokReplacement from "./TikTokReplacement";
import TwitterReplacement from "./TwitterReplacement";
import YouTubeReplacement from "./YouTubeReplacement";

// Helper function to parse comma-separated URLs from environment variables
function parseUrlsFromEnv(envVar: string | undefined): string[] {
  if (!envVar) return [];
  return envVar.split(',').map(url => url.trim()).filter(url => url.length > 0);
}

const bskyReplacer = process.env.BSKY_FIX_URL
  ? new BskyReplacement(parseUrlsFromEnv(process.env.BSKY_FIX_URL))
  : undefined;
const instagramReplacer = process.env.INSTAGRAM_FIX_URL
  ? new InstagramReplacement(parseUrlsFromEnv(process.env.INSTAGRAM_FIX_URL))
  : undefined;
const pixivReplacer = process.env.PIXIV_FIX_URL
  ? new PixivReplacement(parseUrlsFromEnv(process.env.PIXIV_FIX_URL))
  : undefined;
const redditReplacer = process.env.REDDIT_FIX_URL
  ? new RedditReplacement(parseUrlsFromEnv(process.env.REDDIT_FIX_URL))
  : undefined;
const redditMediaReplacer = process.env.REDDIT_FIX_URL
  ? new RedditMediaReplacement()
  : undefined;
const tiktokReplacer = process.env.TIKTOK_FIX_URL
  ? new TikTokReplacement(parseUrlsFromEnv(process.env.TIKTOK_FIX_URL))
  : undefined;
const twitterReplacer = process.env.TWITTER_FIX_URL
  ? new TwitterReplacement(parseUrlsFromEnv(process.env.TWITTER_FIX_URL))
  : undefined;
const youtubeReplacer = process.env.YOUTUBE_FIX_URL
  ? new YouTubeReplacement(parseUrlsFromEnv(process.env.YOUTUBE_FIX_URL))
  : undefined;

// Export replacement instances for access to multiple domain methods
export const replacementInstances = {
  twitter: twitterReplacer,
  youtube: youtubeReplacer,
  instagram: instagramReplacer,
  tiktok: tiktokReplacer,
  reddit: redditReplacer,
  redditMedia: redditMediaReplacer,
  pixiv: pixivReplacer,
  bsky: bskyReplacer,
};

export const replacements: {
  [identifier: string]: ((messageContent: string) => string | null) & { _instance?: any };
} = {
  "(\\/\\/|\\.)(x|twitter)\\.com": Object.assign(
    (messageContent: string) => {
      return twitterReplacer ? twitterReplacer.replaceURLs(messageContent) : null;
    },
    { _instance: twitterReplacer }
  ),
  "(m|www)\\.youtube\\.com/shorts/": Object.assign(
    (messageContent: string) => {
      return youtubeReplacer ? youtubeReplacer.replaceURLs(messageContent) : null;
    },
    { _instance: youtubeReplacer }
  ),
  "\\/\\/(\\w+\\.)?instagram.com\\/(p|reel|stories)\\/": Object.assign(
    (messageContent: string) => {
      return instagramReplacer ? instagramReplacer.replaceURLs(messageContent) : null;
    },
    { _instance: instagramReplacer }
  ),
  // only match links to videos
  "\\/\\/(\\w+\\.)?tiktok.com\\/((t\\/)?\\w+|@[^\\s]+\\/video)": Object.assign(
    (messageContent: string) => {
      return tiktokReplacer ? tiktokReplacer.replaceURLs(messageContent) : null;
    },
    { _instance: tiktokReplacer }
  ),
  // reddit.com/(r|u|user)/(comments|s)/:id
  // TODO: /s/:id links can be direct links to other sites like twitter.
  "\\/\\/(\\w+\\.)?reddit\\.com\\/(r|u|user)\\/\\w+\\/(s|comments)\\/\\w+": Object.assign(
    (messageContent: string) => {
      return redditReplacer ? redditReplacer.replaceURLs(messageContent, "reddit.com/") : null;
    },
    { _instance: redditReplacer }
  ),
  // don't match any subdomains like i.redd.it
  "\\/\\/redd\\.it/": Object.assign(
    (messageContent: string) => {
      return redditReplacer ? redditReplacer.replaceURLs(messageContent, "redd.it/") : null;
    },
    { _instance: redditReplacer }
  ),
  // special case for reddit media proxy since we have to decode the URI
  "\\/\\/(\\w+\\.)?reddit\\.com/media": Object.assign(
    (messageContent: string) => {
      return redditMediaReplacer ? redditMediaReplacer.replaceURLs(messageContent) : null;
    },
    { _instance: redditMediaReplacer }
  ),
  // https://github.com/thelaao/phixiv#path-formats
  "https?:\\/\\/(\\w+\\.)?pixiv\\.net\\/(\\w+\\/)?(artworks|member_illust\\.php)(\\/|\\?illust_id=)\\d+(\\/?\\d+)?": Object.assign(
    (messageContent: string) => {
      return pixivReplacer ? pixivReplacer.replaceURLs(messageContent) : null;
    },
    { _instance: pixivReplacer }
  ),
  // TID length is always 13 ASCII characters
  // https://atproto.com/specs/record-key#record-key-type-tid
  "\\/\\/bsky\\.app\\/profile\\/((\\w|\\.|-)+|(did:plc:[234567a-z]{24}))\\/post\\/[234567a-z]{13}(?!\\/)": Object.assign(
    (messageContent: string) => {
      return bskyReplacer ? bskyReplacer.replaceURLs(messageContent) : null;
    },
    { _instance: bskyReplacer }
  ),
};
