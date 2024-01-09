import BaseReplacement from "./BaseReplacement";

export default class PixivReplacement extends BaseReplacement {
  constructor(newDomain: string) {
    // https://github.com/thelaao/phixiv#path-formats
    // don't strip query string -- member_illust.php?illust_id=:id
    super(
      newDomain,
      /https?:\/\/(\w+\.)?pixiv\.net\/(\w+\/)?(artworks|member_illust\.php)(\/|\?illust_id=)\d+(\/?\d+)?[^\s]+/g,
      /(\w+\.)?(pixiv\.net\/)/,
      false,
    );
  }
}
