function logReplacement(fName: string, original: string, replacement: string) {
  if (!process.env.LINKFIX_LOGGING) {
    return;
  }

  console.log(`> [${fName}()] replacing ${original} -> ${replacement}`);
}

function getUrls(content: string, regexp: RegExp): Array<string> {
  const urls: Array<string> = [];
  for (const matches of content.matchAll(regexp)) {
    const url = matches[0];
    urls.push(url);
  }
  return urls;
}

/*
 * Link fixing functions
 */

function fixTwitterURL(content: string): string {
  let c = content.replace(
    /\/\/(x|twitter)\.com\//,
    `//${process.env.TWITTER_FIX_URL}/`,
  );
  // strip URL parameters from X links since they're only used for tracking
  c = c.replace(/\?.*/, "");

  logReplacement("fixTwitterURL", content, c);

  return c;
}

function fixYTShortsURL(content: string): string {
  let c = content.replace(
    /(www\.)?(youtube\.com\/shorts\/)/,
    `${process.env.YOUTUBE_FIX_URL}/`,
  );

  // strip URL parameters from YT links since they're only used for tracking
  // TODO: make sure this doesn't negatively affect anything. I'm pretty sure
  //       YT shorts don't support ?t= for timestamp or ?list= for playlists.
  c = c.replace(/\?.*/, "");

  logReplacement("fixYTShortsURL", content, c);

  return c;
}

function fixInstagramURL(content: string): string {
  const c = content.replace(
    /(www\.)?(instagram\.com\/)/,
    `${process.env.INSTAGRAM_FIX_URL}/`,
  );

  // TODO: Determine if we need to strip URL params from Instagram links

  logReplacement("fixInstagramURL", content, c);

  return c;
}

function fixTikTokURL(content: string): string {
  const c = content.replace(
    /(tiktok\.com\/)/,
    `${process.env.TIKTOK_FIX_URL}/`,
  );

  // TODO: Determine if we need to strip URL params from TikTok links

  logReplacement("fixTikTokURL", content, c);

  return c;
}

function fixRedditURL(content: string): string {
  let c: string;

  if (content.includes("reddit.com")) {
    c = content.replace(
      /((www|old|new|np)\.)?reddit\.com\//,
      `${process.env.REDDIT_FIX_URL}/`,
    );
  } else if (content.includes("redd.it")) {
    c = content.replace(/redd\.it\//, `${process.env.REDDIT_FIX_URL}/`);
  } else {
    throw new Error(`Could not determine a replacement for ${content}`);
  }

  // TODO: Determine if we need to strip URL params from TikTok links

  logReplacement("fixRedditURL", content, c);

  return c;
}

/*
 * Replacements export
 */

export const replacements: {
  [identifier: string]: (content: string) => string | null;
} = {
  "x.com/": (content) => {
    const urls = getUrls(
      content,
      // check for "status" here instead of the top level because usernames can
      // vary
      /https?:\/\/x\.com\/(\w){1,15}\/status\/[^\s]+/g,
    );
    if (process.env.TWITTER_FIX_URL && urls.length > 0) {
      return urls.map((url) => fixTwitterURL(url)).join("\n");
    } else {
      return null;
    }
  },
  "twitter.com/": (content) => {
    const urls = getUrls(
      content,
      // check for "status" here instead of the top level because usernames can
      // vary
      /https?:\/\/twitter\.com\/(\w){1,15}\/status\/[^\s]+/g,
    );
    if (process.env.TWITTER_FIX_URL && urls.length > 0) {
      return urls.map((url) => fixTwitterURL(url)).join("\n");
    } else {
      return null;
    }
  },
  "youtube.com/shorts/": (content) => {
    const urls = getUrls(content, /https?:\/\/(www\.)?youtube\.com\/[^\s]+/g);
    if (process.env.YOUTUBE_FIX_URL && urls.length > 0) {
      return urls.map((url) => fixYTShortsURL(url)).join("\n");
    } else {
      return null;
    }
  },
  "instagram.com/": (content) => {
    const urls = getUrls(
      content,
      // TODO: Add regex to make sure we only process reels and posts, not
      //       profiles or searches etc.
      /https?:\/\/(www\.)?instagram\.com\/[^\s]+/g,
    );
    if (process.env.INSTAGRAM_FIX_URL && urls.length > 0) {
      return urls.map((url) => fixInstagramURL(url)).join("\n");
    } else {
      return null;
    }
  },
  "tiktok.com/": (content) => {
    const urls = getUrls(
      content,
      // TODO: Add regex to make sure we only process reels and posts, not
      //       profiles or searches etc.
      /https?:\/\/((www|vm)\.)?tiktok\.com\/[^\s]+/g,
    );
    if (process.env.TIKTOK_FIX_URL && urls.length > 0) {
      return urls.map((url) => fixTikTokURL(url)).join("\n");
    } else {
      return null;
    }
  },
  "reddit.com/": (content) => {
    const urls = getUrls(
      content,
      // TODO: Add regex to make sure we only process reels and posts, not
      //       profiles, searches, subreddits, etc.
      /https?:\/\/((www|old|new|np)\.)?reddit\.com\/[^\s]+/g,
    );
    if (process.env.REDDIT_FIX_URL && urls.length > 0) {
      return urls.map((url) => fixRedditURL(url)).join("\n");
    } else {
      return null;
    }
  },
  "redd.it/": (content) => {
    const urls = getUrls(
      content,
      // TODO: Make sure we don't have to handle edge cases here
      /https?:\/\/redd\.it\/[^\s]+/g,
    );
    if (process.env.REDDIT_FIX_URL && urls.length > 0) {
      return urls.map((url) => fixRedditURL(url)).join("\n");
    } else {
      return null;
    }
  },
};
