import BaseReplacement from "./BaseReplacement";

export default class TikTokReplacement extends BaseReplacement {
  constructor(newDomain: string) {
    super(newDomain, /https?:\/\/((www|vm)\.)?tiktok\.com\/[^\s]+/g, /(www\.)?tiktok\.com\//);
  }
}
