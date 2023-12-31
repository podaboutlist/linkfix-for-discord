import BaseReplacement from "./BaseReplacement";

export default class PixivReplacement extends BaseReplacement {
  constructor(newDomain: string) {
    // don't strip query string -- member_illust.php?illust_id=:id
    super(newDomain, /https?:\/\/(www\.)?pixiv\.net\/[^\s]+/g, /(www\.)?(pixiv\.net\/)/, false);
  }
}
