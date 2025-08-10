import { debug } from "../logging";

export default class BaseReplacement {
  protected newDomains: string[];
  protected currentDomainIndex: number = 0;

  protected matchRegex: RegExp;

  protected replaceRegex: RegExp;

  protected stripQueryString: boolean;

  /**
   * Base constructor. I don't have much to say about this one!
   * @param newDomains - The sites we're substituting, i.e. ["fxtwitter.com", "vxtwitter.com"].
   * @param matchRegex - Pattern used to match domains in the original message.
   * @param replaceRegex - Pattern used to replace domains for the new message.
   * @param stripQueryString - Should we strip the query string? (Usually only used for tracking parameters).
   */
  constructor(
    newDomains: string | string[],
    matchRegex: RegExp,
    replaceRegex: RegExp,
    stripQueryString: boolean = true,
  ) {
    this.newDomains = Array.isArray(newDomains) ? newDomains : [newDomains];
    this.matchRegex = matchRegex;
    this.replaceRegex = replaceRegex;
    this.stripQueryString = stripQueryString;
  }

  /**
   * Get the current domain to use for replacement
   */
  protected get currentDomain(): string {
    return this.newDomains[this.currentDomainIndex] || this.newDomains[0];
  }

  /**
   * Move to the next domain in the list
   */
  protected nextDomain(): boolean {
    if (this.currentDomainIndex < this.newDomains.length - 1) {
      this.currentDomainIndex++;
      return true;
    }
    return false;
  }

  /**
   * Reset to the first domain
   */
  protected resetDomain(): void {
    this.currentDomainIndex = 0;
  }

  /**
   * Extract an array of URLs from a message.
   * @param messageContent - Original text content of a message from Discord.
   * @returns An array of URLs to process or null if no matches were found.
   */
  protected getURLs: (messageContent: string) => RegExpMatchArray | null = (messageContent) => {
    return messageContent.match(this.matchRegex);
  };

  /**
   * Replace URLs with the current domain
   * @param messageContent Original text content of a message from Discord.
   * @param domainFilter Used when one instance of a Replacement handles multiple domains.
   * @returns A message to post as a response in discord or null if we made no replacements.
   */
  public replaceURLs: (messageContent: string, domainFilter?: string) => string | null = (
    messageContent,
    domainFilter?,
  ) => {
    const urls = this.getURLs(messageContent)?.filter((url) => {
      return domainFilter ? url.includes(domainFilter) : url;
    });

    // idk if we'll ever hit this second case but better safe than sorry
    if (urls === undefined || urls.length < 1) {
      return null;
    }

    return urls
      .map((url) => {
        let c = url.replace(this.replaceRegex, `${this.currentDomain}/`);

        if (this.stripQueryString) {
          c = c.replace(/\?\w+=.*$/gm, "");
        }

        if (process.env.LINKFIX_DEBUG) {
          debug(`replaceURLs()\t${url}\t${c}`, this.constructor.name);
        }

        return c;
      })
      .join("\n");
  };

  /**
   * Get all possible URL replacements for a message
   * @param messageContent Original text content of a message from Discord.
   * @param domainFilter Used when one instance of a Replacement handles multiple domains.
   * @returns An array of all possible replacement messages
   */
  public getAllReplacements: (messageContent: string, domainFilter?: string) => string[] = (
    messageContent,
    domainFilter?,
  ) => {
    const urls = this.getURLs(messageContent)?.filter((url) => {
      return domainFilter ? url.includes(domainFilter) : url;
    });

    if (urls === undefined || urls.length < 1) {
      return [];
    }

    return this.newDomains.map((domain) => {
      return urls
        .map((url) => {
          let c = url.replace(this.replaceRegex, `${domain}/`);

          if (this.stripQueryString) {
            c = c.replace(/\?\w+=.*$/gm, "");
          }

          if (process.env.LINKFIX_DEBUG) {
            debug(`getAllReplacements()\t${url}\t${c}`, this.constructor.name);
          }

          return c;
        })
        .join("\n");
    });
  };

  /**
   * Get all available domains
   * @returns An array of all available domains
   */
  public getAllDomains(): string[] {
    return [...this.newDomains];
  }

  /**
   * Check if there are more domains to try
   */
  public hasMoreDomains(): boolean {
    return this.currentDomainIndex < this.newDomains.length - 1;
  }

  /**
   * Get the number of available domains
   */
  public getDomainCount(): number {
    return this.newDomains.length;
  }
}
