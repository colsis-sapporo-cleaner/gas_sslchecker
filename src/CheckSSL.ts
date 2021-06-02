const URI:string = "https://www.en-pc.jp/tech/checkssl.php?hostname=";
const REG:RegExp = /(\d{4}\/\d{2}\/\d{2}\s*\d{2}:\d{2}:\d{2}\s*[A-Z]{3})/g;

export class CheckSSL {
  domain:string;
  raw:string;

  constructor (param) {
    this.domain = param.domain;
  }

  fetch () {
    const res = UrlFetchApp.fetch(URI + this.domain);
    this.raw = res.getContentText();
    if (/<p>有効期限:/.test(this.raw)) {
      return this._parse();
    }
    return '';
  }

  private _parse () {
    const matches = this.raw.match(REG);
    return {start: matches[0], end: matches[1]};
  }
}

