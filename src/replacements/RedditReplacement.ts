import BaseReplacement from "./BaseReplacement";

export default class RedditReplacement extends BaseReplacement {
  constructor(newDomain: string) {
    super(
      newDomain,
      /https?:\/\/(redd.it|(\w+\.)?reddit.com\/(r|u|user)\/\w+\/(s|comments))\/[^\s]+/g,
      /(((\w+\.)?reddit\.com)|(redd\.it))\//,
    );
  }
}
