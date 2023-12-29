import BaseReplacement from "./BaseReplacement";

export default class RedditReplacement extends BaseReplacement {
  constructor(newDomain: string) {
    super(
      newDomain,
      /https?:\/\/((((www|old|new|np)\.)?reddit\.com)|(redd\.it))\/(?!media)[^\s]+/g,
      /((((www|old|new|np)\.)?reddit\.com)|(redd\.it))\//,
    );
  }
}
