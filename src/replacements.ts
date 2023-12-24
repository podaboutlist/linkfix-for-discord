import InstagramReplacement from "./replacements/InstagramReplacement";
import RedditReplacement from "./replacements/RedditReplacement";
import TikTokReplacement from "./replacements/TikTokReplacement";
import TwitterReplacement from "./replacements/TwitterReplacement";
import YouTubeReplacement from "./replacements/YouTubeReplacement";

const instagramReplacer = process.env.INSTAGRAM_FIX_URL
  ? new InstagramReplacement(process.env.INSTAGRAM_FIX_URL)
  : undefined;
const redditReplacer = process.env.REDDIT_FIX_URL
  ? new RedditReplacement(process.env.REDDIT_FIX_URL)
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
  "x.com/": (messageContent) => {
    return twitterReplacer
      ? twitterReplacer.replaceURLs(messageContent, "x.com/")
      : null;
  },
  "twitter.com/": (messageContent) => {
    return twitterReplacer
      ? twitterReplacer.replaceURLs(messageContent, "twitter.com/")
      : null;
  },
  "youtube.com/shorts/": (messageContent) => {
    return youtubeReplacer ? youtubeReplacer.replaceURLs(messageContent) : null;
  },
  "instagram.com/": (messageContent) => {
    return instagramReplacer
      ? instagramReplacer.replaceURLs(messageContent)
      : null;
  },
  "tiktok.com/": (messageContent) => {
    return tiktokReplacer ? tiktokReplacer.replaceURLs(messageContent) : null;
  },
  "reddit.com/": (messageContent) => {
    return redditReplacer
      ? redditReplacer.replaceURLs(messageContent, "reddit.com/")
      : null;
  },
  "redd.it/": (messageContent) => {
    return redditReplacer
      ? redditReplacer.replaceURLs(messageContent, "redd.it/")
      : null;
  },
};
