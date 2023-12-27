export default class BaseReplacement {
  protected newDomain: string;

  protected matchRegex: RegExp;

  protected replaceRegex: RegExp;

  protected stripQueryString: boolean;

  /**
   * Base constructor. I don't have much to say about this one!
   * @param newDomain - The site we're substituting, i.e. fxtwitter.com.
   * @param matchRegex - Pattern used to match domains in the original message.
   * @param replaceRegex - Pattern used to replace domains for the new message.
   * @param stripQueryString - Should we strip the query string? (Usually only used for tracking parameters).
   */
  constructor(
    newDomain: string,
    matchRegex: RegExp,
    replaceRegex: RegExp,
    stripQueryString: boolean = true,
  ) {
    this.newDomain = newDomain;
    this.matchRegex = matchRegex;
    this.replaceRegex = replaceRegex;
    this.stripQueryString = stripQueryString;
  }

  /**
   * Extract an array of URLs from a message.
   * @param messageContent - Original text content of a message from Discord.
   * @returns An array of URLs to process or null if no matches were found.
   */
  protected getURLs: (messageContent: string) => RegExpMatchArray | null = (
    messageContent,
  ) => {
    return messageContent.match(this.matchRegex);
  };

  /**
   *
   * @param messageContent Original text content of a message from Discord.
   * @param domainFilter Used when one instance of a Replacement handles multiple domains.
   * @returns A message to post as a response in discord or null if we made no replacements.
   */
  public replaceURLs: (messageContent: string, domainFilter?: string) => string | null =
    (messageContent, domainFilter?) => {
      const urls = this.getURLs(messageContent)?.filter((url) => {
        return domainFilter ? url.includes(domainFilter) : url;
      });

      // idk if we'll ever hit this second case but better safe than sorry
      if (urls === undefined || urls.length < 1) {
        return null;
      }

      return urls
        .map((url) => {
          let c = url.replace(this.replaceRegex, `${this.newDomain}/`);

          if (this.stripQueryString) {
            c = c.replace(/\?\w+=.*$/gm, "");
          }

          if (process.env.LINKFIX_DEBUG) {
            console.debug(`[${this.constructor.name}]\treplaceURLs()\t${url}\t${c}`);
          }

          return c;
        })
        .join("\n");
    };
}
