function main() {
}/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/CheckSSL.ts":
/*!*************************!*\
  !*** ./src/CheckSSL.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CheckSSL": () => (/* binding */ CheckSSL)
/* harmony export */ });
const URI = "https://www.en-pc.jp/tech/checkssl.php?hostname=";
const REG = /(\d{4}\/\d{2}\/\d{2}\s*\d{2}:\d{2}:\d{2}\s*[A-Z]{3})/g;
class CheckSSL {
  constructor(param) {
    this.domain = param.domain;
  }

  fetch() {
    const res = UrlFetchApp.fetch(URI + this.domain);
    this.raw = res.getContentText();

    if (/<p>有効期限:/.test(this.raw)) {
      return this._parse();
    }

    return '';
  }

  _parse() {
    const matches = this.raw.match(REG);
    return {
      start: matches[0],
      end: matches[1]
    };
  }

}

/***/ }),

/***/ "./src/DomainsSheet.ts":
/*!*****************************!*\
  !*** ./src/DomainsSheet.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DomainsSheet": () => (/* binding */ DomainsSheet)
/* harmony export */ });
// スプレッドシート1行目のタイトルを入れとく。これを元に書き込む列とかを得るので
const DOMAIN_TITLE = 'ドメイン';
const EXPIRATION_TITLE = 'SSL証明書有効期限日';
const IGNORE_RECENT = '今回のみ通知しない';
const IGNORE_PERMANENT = '通知しない';
class DomainsSheet {
  constructor(params) {
    this.params = params;

    if (!params.sheetId) {
      throw new Error('Required property was not specified.');
    }

    this.book = SpreadsheetApp.openById(params.sheetId);

    if (!params.domainsSheetName) {
      throw new Error('Required property was not specified.');
    }

    this.domainsSheet = this.book.getSheetByName(params.domainsSheetName); // @NOTE: 列番号探して保管しとく

    this.expirationColumn = this._findColumnColLetter(EXPIRATION_TITLE);
    this.domainColumn = this._findColumnColLetter(DOMAIN_TITLE);
    this.ignoreRecentColumn = this._findColumnColLetter(IGNORE_RECENT);
    this.ignorePermanentColumn = this._findColumnColLetter(IGNORE_PERMANENT);
  }
  /** ドメイン名を得る */


  getDomains() {
    const lastRow = this.domainsSheet.getLastRow();
    this.domains = this.domainsSheet.getRange(`${this.domainColumn}1:${this.domainColumn}${lastRow}`).getValues().map(val => val[0]).filter(value => {
      return value != DOMAIN_TITLE;
    });
    return this.domains;
  }
  /** ドメインと期限日と通知設定を得る */


  getDomainExpirations() {
    const lastRow = this.domainsSheet.getLastRow();
    this.domainExpirations = this.domainsSheet.getRange(`${this.domainColumn}1:${this.ignorePermanentColumn}${lastRow}`).getValues().filter(value => {
      return value[this._columnLetterToNumber(this.domainColumn)] != DOMAIN_TITLE;
    }).map(record => {
      return {
        domain: record[this._columnLetterToNumber(this.domainColumn)],
        expiration: record[this._columnLetterToNumber(this.expirationColumn)],
        ignoreRecent: !!record[this._columnLetterToNumber(this.ignoreRecentColumn)],
        ignorePermanent: !!record[this._columnLetterToNumber(this.ignorePermanentColumn)]
      };
    });
    return this.domainExpirations;
  }

  getExpiration(domain) {
    return this._getTargetRangeFromDomain('expiration', domain).getValue();
  }
  /** 指定ドメインの期限日列に書き込む */


  setExpiration(value, domain) {
    this._getTargetRangeFromDomain('expiration', domain).setValue(value);
  }
  /** 指定ドメインの status 列に書き込む */


  setStatus(value, domain) {
    this._getTargetRangeFromDomain('status', domain).setValue(value.toString());
  }
  /** 指定ドメインの 今回のみ通知しない 列に書き込む */


  setIgnoreRecent(value, domain) {
    this._getTargetRangeFromDomain('ignoreRecent', domain).setValue(value);
  }
  /**
  * 指定ドメインの指定列のrangeを得る
  * @param article 列指定 expiration | status | ignoreRecent
  * @param domain ドメイン名
  * @return Range
  */


  _getTargetRangeFromDomain(article, domain) {
    const row = this._findColumnRowNumber(domain);

    let range;

    switch (article) {
      case 'expiration':
        range = this.domainsSheet.getRange(`${this.expirationColumn}${row}`);
        break;

      case 'ignoreRecent':
        range = this.domainsSheet.getRange(`${this.ignoreRecentColumn}${row}`);
        break;
    }

    return range;
  }
  /** 指定ワードのカラムを検索しA1形式アドレスを得る */


  _findColumnAddress(word) {
    const finder = this.domainsSheet.createTextFinder(word);
    const results = finder.findAll();
    return results[0].getA1Notation();
  }
  /** 指定ワードのカラムの列名アルファベットを得る */
  // @FIXME: 1桁列にしか対応していません。AA,AB... とかは今の所使う予定もないので。


  _findColumnColLetter(word) {
    return this._findColumnAddress(word).split('').shift();
  }
  /** 指定ワードのカラムの行番号を得る */


  _findColumnRowNumber(word) {
    return Number(this._findColumnAddress(word).match(/\d+$/));
  }
  /** 列名アルファベットを数値に変換する */
  // @FIXME: 1桁列にしか対応していません。AA,AB... とかは今の所使う予定もないので。


  _columnLetterToNumber(letter) {
    if (letter.length <= 0 && letter.length > 1) throw new Error('argument must be one character.');
    return letter.toUpperCase().charCodeAt(0) - 65;
  }

}
;

/***/ }),

/***/ "./src/Properties.ts":
/*!***************************!*\
  !*** ./src/Properties.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Properties": () => (/* binding */ Properties)
/* harmony export */ });
class Properties {
  constructor() {
    this.sheetId = this._getProperty('SHEET_ID');
    this.domainsSheet = this._getProperty('DOMAINS_SHEET_NAME');
    this.slackAccessToken = this._getProperty('SLACK_ACCESS_TOKEN');
    this.slackChannelId = this._getProperty('SLACK_CHANNEL_ID');
  }

  _getProperty(name) {
    if (!name) throw 'Property name not specified.';
    return PropertiesService.getScriptProperties().getProperty(name);
  }

}

/***/ }),

/***/ "./src/Slack.ts":
/*!**********************!*\
  !*** ./src/Slack.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Slack": () => (/* binding */ Slack)
/* harmony export */ });
const SLACK_URI = 'https://slack.com/api/';
class Slack {
  constructor(params) {
    this.token = params.accessToken;
    this.channel = params.channelId;

    if (!this.token || !this.channel) {
      throw new Error('Required property was not specified.');
    }
  }

  postDomainExpireRemindMessage(user, message, icon) {
    const endpoint = 'chat.postMessage';
    const opt = {
      method: 'post',
      payload: {
        token: this.token,
        channel: this.channel,
        text: message,
        //        as_user: false,
        username: user,
        icon_emoji: icon
      }
    };
    UrlFetchApp.fetch(`${SLACK_URI}${endpoint}`, opt);
  }

}

/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "main": () => (/* binding */ main)
/* harmony export */ });
/* harmony import */ var _Properties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Properties */ "./src/Properties.ts");
/* harmony import */ var _DomainsSheet__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DomainsSheet */ "./src/DomainsSheet.ts");
/* harmony import */ var _CheckSSL__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./CheckSSL */ "./src/CheckSSL.ts");
/* harmony import */ var _Slack__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Slack */ "./src/Slack.ts");

 //import { Whois } from "./Whois";



const SLACKBOT_ICON = ':alarm_clock:';
function main() {
  const cssl = new _CheckSSL__WEBPACK_IMPORTED_MODULE_2__.CheckSSL({
    domain: 'colsis.jp'
  });
  cssl.fetch();
  const prop = new _Properties__WEBPACK_IMPORTED_MODULE_0__.Properties();
  const sheet = new _DomainsSheet__WEBPACK_IMPORTED_MODULE_1__.DomainsSheet({
    sheetId: prop.sheetId,
    domainsSheetName: prop.domainsSheet
  });
  const expirations = sheet.getDomainExpirations();
  const arounds = expirations.filter(record => {
    return !record.expiration || new Date(record.expiration).getTime() <= _targetDate().getTime();
  });
  const slack = new _Slack__WEBPACK_IMPORTED_MODULE_3__.Slack({
    accessToken: prop.slackAccessToken,
    channelId: prop.slackChannelId
  }); // @NOTE: Slack通知

  arounds.forEach(record => {
    if (!record.expiration) return;
    if (record.ignoreRecent || record.ignorePermanent) return;
    slack.postDomainExpireRemindMessage('SSLExpireReminder', `${record.domain} のSSL証明書有効期限が ${record.expiration} に到来するようです。`, SLACKBOT_ICON);
  }); // @NOTE: シート更新
  // @TODO: 通知されるようになってからずっとシートの期限日更新するが、ほんとは過ぎてからでいいんじゃないか

  const whois = arounds.map((record, i) => {
    return {
      domain: record.domain,
      result: new _CheckSSL__WEBPACK_IMPORTED_MODULE_2__.CheckSSL({
        domain: record.domain
      }).fetch().end
    };
  });
  whois.forEach(record => {
    let expirationDate = record.result.replace(/\s.*$/, '');
    const ymd = expirationDate.split(/[-\/]/).map(Number);
    ymd[1] = ymd[1] - 1; // @OPTIMIZE: spread演算子にするとなんかtscがエラー吐く

    const d = new Date(ymd[0], ymd[1], ymd[2]);
    const latest = sheet.getExpiration(record.domain);

    if (latest !== _formatDate(d)) {
      sheet.setExpiration(_formatDate(d), record.domain);
      sheet.setIgnoreRecent('', record.domain);
    }
  });
}
/** 本日の1ヶ月後の日付を得る */

function _targetDate() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
}

function _formatDate(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd');
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _main__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main */ "./src/main.ts");

__webpack_require__.g.main = _main__WEBPACK_IMPORTED_MODULE_0__.main;
})();

/******/ })()
;