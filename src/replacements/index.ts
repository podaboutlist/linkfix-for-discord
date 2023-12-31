import InstagramReplacement from "./InstagramReplacement";
import PixivReplacement from "./PixivReplacement";
import RedditMediaReplacement from "./RedditMediaReplacement";
import RedditReplacement from "./RedditReplacement";
import TikTokReplacement from "./TikTokReplacement";
import TwitterReplacement from "./TwitterReplacement";
import YouTubeReplacement from "./YouTubeReplacement";

const instagramReplacer = process.env.INSTAGRAM_FIX_URL
  ? new InstagramReplacement(process.env.INSTAGRAM_FIX_URL)
  : undefined;
const pixivReplacer = process.env.PIXIV_FIX_URL
  ? new PixivReplacement(process.env.PIXIV_FIX_URL)
  : undefined;
const redditReplacer = process.env.REDDIT_FIX_URL
  ? new RedditReplacement(process.env.REDDIT_FIX_URL)
  : undefined;
const redditMediaReplacer = process.env.REDDIT_FIX_URL
  ? new RedditMediaReplacement()
  : undefined;
const tiktokReplacer = process.env.TIKTOK_FIX_URL
  ? new TikTokReplacement(process.env.TIKTOK_FIX_URL)
  : undefined;
const twitterReplacer = process.env.TWITTER_FIX_URL
  ? new TwitterReplacement(process.env.TWITTER_FIX_URL)
  : undefined;
const youtubeReplacer = process.env.YOUTUBE_FIX_URL
  ? new YouTubeReplacement(process.env.YOUTUBE_FIX_URL)
  : undefined;

export const replacements: {
  [identifier: string]: (messageContent: string) => string | null;
} = {
  "(\\/\\/|\\.)(x|twitter)\\.com": (messageContent) => {
    return twitterReplacer ? twitterReplacer.replaceURLs(messageContent) : null;
  },
  "(m|www)\\.youtube\\.com/shorts/": (messageContent) => {
    return youtubeReplacer ? youtubeReplacer.replaceURLs(messageContent) : null;
  },
  "(\\/\\/|\\.)instagram\\.com/": (messageContent) => {
    return instagramReplacer ? instagramReplacer.replaceURLs(messageContent) : null;
  },
  // only match links to videos
  "\\/\\/(\\w+\\.)?tiktok.com\\/((t\\/)?\\w+|@[^\\s]+\\/video)": (messageContent) => {
    return tiktokReplacer ? tiktokReplacer.replaceURLs(messageContent) : null;
  },
  "(\\/\\/|\\.)reddit\\.com/(?!media)": (messageContent) => {
    return redditReplacer ? redditReplacer.replaceURLs(messageContent, "reddit.com/") : null;
  },
  "\\/\\/redd\\.it/": (messageContent) => {
    return redditReplacer ? redditReplacer.replaceURLs(messageContent, "redd.it/") : null;
  },
  "(\\/\\/|\\.)reddit\\.com/media": (messageContent) => {
    return redditMediaReplacer ? redditMediaReplacer.replaceURLs(messageContent) : null;
  },
  // https://github.com/thelaao/phixiv#path-formats
  "(\\/\\/|\\.)pixiv\\.net/(member_illust|(\\w+)?/artworks)": (messageContent) => {
    return pixivReplacer ? pixivReplacer.replaceURLs(messageContent) : null;
  },
};
