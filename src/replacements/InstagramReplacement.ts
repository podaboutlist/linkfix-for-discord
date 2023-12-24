import BaseReplacement from "./BaseReplacement";

export default class InstagramReplacement extends BaseReplacement {
  constructor(newDomain: string) {
    super(
      newDomain,
      /https?:\/\/(www\.)?instagram\.com\/[^\s]+/g,
      /(www\.)?(instagram\.com\/)/,
    );
  }
}
