export default class BaseReplacement {
  protected newURL: string;

  protected matchRegex: RegExp;

  protected replaceRegex: RegExp;

  protected stripQueryString: boolean;

  constructor(
    newURL: string,
    matchRegex: RegExp,
    replaceRegex: RegExp,
    stripQueryString: boolean = true,
  ) {
    this.newURL = newURL;
    this.matchRegex = matchRegex;
    this.replaceRegex = replaceRegex;
    this.stripQueryString = stripQueryString;
  }

  getURLs: (messageContent: string) => RegExpMatchArray | null = (content) => {
    return content.match(this.matchRegex);
  };

  replaceURLs: (messageContent: string) => string | null = (messageContent) => {
    const urls = this.getURLs(messageContent);

    if (urls === null || urls.length < 1) {
      return null;
    }

    return urls
      .map((url) => {
        let c = url.replace(this.replaceRegex, `//${this.newURL}/`);

        if (this.stripQueryString) {
          c = c.replace(/\?\w+=.*$/gm, "");
        }

        return c;
      })
      .join("\n");
  };
}
