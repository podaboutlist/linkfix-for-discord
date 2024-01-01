import BaseReplacement from "./BaseReplacement";

export default class TikTokReplacement extends BaseReplacement {
  constructor(newDomain: string) {
    super(newDomain, /https?:\/\/(\w+\.)?tiktok\.com\/[^\s]+/g, /tiktok\.com\//);
  }
}
