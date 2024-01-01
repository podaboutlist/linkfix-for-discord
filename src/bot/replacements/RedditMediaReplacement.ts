export default class RedditMediaReplacement {
  private previewToOriginal: (url: string) => string = (url) => {
    let fixable = false;

    [".jpeg", ".jpg", ".png", ".gif", ".webp"].forEach((ext: string) => {
      fixable = fixable || url.includes(ext);
    });

    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition --
     *   This value is NOT "always truthy" eslint!!!
     */
    if (!fixable) {
      return url;
    }

    // https://preview.redd.it/vsi8icu8mv8c1.jpeg?width=640&crop=smart&auto=webp&s=6a490e817519de3bc03f8131c3ae9943d90dc598
    let newUrl = url.replace("//preview.", "//i.");
    newUrl = newUrl.substring(0, newUrl.indexOf("?"));

    console.debug(`[${this.constructor.name}]\tpreviewToOriginal()\t${url}\t${newUrl}`);

    return newUrl;
  };

  /**
   * Pull the *real* URLs out of our list of matched URLs
   * @param urls Array of matched URLs
   * @returns Array of decoded URIs from Reddit's weird media proxy
   */
  private getURLs: (urls: RegExpMatchArray) => Array<string> | null = (urls) => {
    // this is like the ugliest thing ive written in my life. thanks!
    const decodedURIs: Array<string> = [];

    urls.map((url) => {
      // grab the part of the URL after /media?url= (i.e. the URI encoded REAL URL)
      const uris = url.match(/(?<=\.com\/media\?url=).*/g);

      if (uris === null) {
        return;
      }

      uris.map((uri) => {
        const decoded = decodeURIComponent(uri);

        if (process.env.LINKFIX_DEBUG) {
          console.debug(`[${this.constructor.name}]\treplaceURLs()\t${url}\t${decoded}`);
        }

        decodedURIs.push(this.previewToOriginal(decoded));
      });
    });

    return decodedURIs.length > 0 ? decodedURIs : null;
  };

  /**
   * Special case class for handling Reddit media URLs.
   * @param messageContent Original message from Discord
   * @returns Message containing all fixed URLs separated by newlines
   */
  public replaceURLs: (messageContent: string) => string | null = (messageContent) => {
    const urls = messageContent.match(/https?:\/\/(\w+\.)?reddit\.com\/media[^\s]+/g);

    if (urls === null) {
      return null;
    }

    const fixedURLs = this.getURLs(urls);

    return fixedURLs ? fixedURLs.join("\n") : null;
  };
}
