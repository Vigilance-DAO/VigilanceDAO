"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/background.js
  var require_background = __commonJS({
    "src/background.js"(exports) {
      try {
        importScripts(
          "./psl.min.js"
          /*, and so on */
        );
      } catch (e) {
        console.error(e);
      }
      var env = {
        host: "http://localhost:4000",
        alertPeriod: 4 * 30 * 86400 * 1e3,
        SUBGRAPH_URL: "https://api.thegraph.com/subgraphs/name/venkatteja/vigilancedao"
      };
      function getStorageKey(url) {
        return `vigil__${url}`;
      }
      var inMemoryStorage = {};
      var lastUrl = null;
      function getDomainRegistrationDate(storageInfo, url) {
        return __async(this, null, function* () {
          const key = getStorageKey(url);
          if (storageInfo[key]) {
            console.log("not requesting. saved in db", storageInfo[key], key);
            return new Date(storageInfo[key].createdon);
          } else {
            try {
              const rawResponse = yield fetch(`${env.host}/domain-info`, {
                method: "POST",
                headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ domain: url })
              });
              const content = yield rawResponse.json();
              console.log("bg", { content });
              if (content.domain) {
                let createdon = new Date(content.createdon);
                let data = {};
                data[key] = content;
                chrome.storage.sync.set(data, function() {
                  console.log("Settings saved", key);
                  inMemoryStorage = data;
                });
                return createdon;
              }
            } catch (err) {
              console.warn("error fetching domain reg date", err);
            }
          }
          return null;
        });
      }
      function getUrl(tab2) {
        if (!tab2.url)
          return;
        let _url = tab2.url;
        _url = new URL(_url);
        console.debug("bg current url", _url);
        console.debug("bg current tab", tab2);
        var parsed = psl.parse(_url.hostname);
        let url = parsed.domain;
        console.debug("bg url", url);
        return url;
      }
      function getDomainValidationInfo(url) {
        return __async(this, null, function* () {
          let type = "info";
          let msg = "No reports/reviews";
          let description = "";
          let isScamVerified = false;
          let isLegitVerified = false;
          let openScamReports = 0;
          let query = `query {
        reports(
            orderBy: id
            orderDirection: desc
            where: {domain: "${url}"}
            first:1
        ){
            id
            domain
            isScam
            status
        }
    }`;
          try {
            const rawResponse = yield fetch(env.SUBGRAPH_URL, {
              method: "POST",
              headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ query })
            });
            let data = yield rawResponse.json();
            console.log("response", data);
            let reports = data.data.reports;
            for (let i = 0; i < reports.length; ++i) {
              let report = reports[i];
              if (report.status == "ACCEPTED" && (!isScamVerified && !isScamVerified)) {
                isLegitVerified = report.isScam ? false : true;
                isScamVerified = report.isScam ? true : false;
              }
              if (!report.status || report.status == "OPEN") {
                if (report.isScam) {
                  openScamReports += 1;
                }
              }
            }
          } catch (err) {
            console.warn("Error fetching domain information", domain, err);
            console.log("changing icon");
            chrome.action.setIcon({ path: { 16: "/images/icon16.png", 32: "/images/icon32.png" } });
            chrome.action.setBadgeText({ text: "\u26A0\uFE0F" });
            chrome.action.setBadgeBackgroundColor({ color: "#000000" });
            type = "warning";
            msg = "Error fetching domain information";
            sendMessage(tab, "domain", { isSuccess: true, domain: url, createdOn: createdOn ? createdOn.getTime() : 0, type, msg, description });
            return;
          }
          return {
            isLegitVerified,
            isScamVerified,
            openScamReports,
            type,
            msg,
            description
          };
        });
      }
      function isSoftWarning(createdOn2) {
        let now = /* @__PURE__ */ new Date();
        return now.getTime() - createdOn2.getTime() < env.alertPeriod;
      }
      function processTab(tab2) {
        const url = getUrl(tab2);
        console.log("processTab", JSON.stringify({ url, lastUrl }));
        if (!url || url != lastUrl) {
          chrome.action.setIcon({ path: { 16: "/images/icon16.png", 32: "/images/icon32.png" } });
          chrome.action.setBadgeText({ text: "..." });
          chrome.action.setBadgeBackgroundColor({ color: "yellow" });
          lastUrl = url || lastUrl;
          return;
        }
        if (tab2.url && tab2.status == "complete") {
          const key = getStorageKey(url);
          chrome.storage.sync.get([key], (items) => __async(this, null, function* () {
            var _a, _b, _c;
            let createdOn2 = yield getDomainRegistrationDate(items, url);
            let now = /* @__PURE__ */ new Date();
            let validationInfo = {
              type: "info",
              msg: "No reports/reviews",
              description: "",
              isScamVerified: false,
              isLegitVerified: false,
              openScamReports: 0
            };
            let lastValidationStateUpdatedOn = (_b = (_a = items[key]) == null ? void 0 : _a.validationInfo) == null ? void 0 : _b.updatedOn;
            if (lastValidationStateUpdatedOn && now.getTime() - lastValidationStateUpdatedOn.getTime() < 5 * 60 * 1e3) {
              validationInfo = (_c = items[key]) == null ? void 0 : _c.validationInfo;
            } else {
              validationInfo = yield getDomainValidationInfo(url);
              chrome.storage.sync.get([key], (items2) => __async(this, null, function* () {
                if (!items2[key])
                  items2[key] = {};
                items2[key].validationInfo = validationInfo;
                chrome.storage.sync.set(items2, function() {
                  console.log("validation info saved", key);
                  inMemoryStorage = items2;
                });
              }));
            }
            if (createdOn2 && (isSoftWarning(createdOn2) || validationInfo.isScamVerified)) {
              sendMessage(tab2, "show-warning", {
                domain: url,
                createdOn: createdOn2 ? createdOn2.getTime() : 0,
                type: validationInfo.type,
                msg: validationInfo.msg,
                description: validationInfo.description
              });
            }
            if (validationInfo.isScamVerified) {
              chrome.action.setIcon({ path: { 19: "/images/alerticon19-red.png", 38: "/images/alerticon38-red.png" } });
              chrome.action.setBadgeText({ text: "\u274C" });
              chrome.action.setBadgeBackgroundColor({ color: "#f96c6c" });
              validationInfo.type = "error";
              validationInfo.msg = "Verified as fraudulent domain";
            } else if (validationInfo.isLegitVerified) {
              chrome.action.setIcon({ path: { 16: "/images/icon16.png", 32: "/images/icon32.png" } });
              chrome.action.setBadgeText({ text: "\u2714\uFE0F" });
              chrome.action.setBadgeBackgroundColor({ color: "#05ed05" });
              validationInfo.type = "success";
              validationInfo.msg = "Verified as legit";
            } else if (createdOn2 && isSoftWarning(createdOn2)) {
              console.log("changing icon");
              chrome.action.setIcon({ path: { 19: "/images/alerticon19-red.png", 38: "/images/alerticon38-red.png" } });
              validationInfo.openScamReports ? chrome.action.setBadgeText({ text: validationInfo.openScamReports + "" }) : chrome.action.setBadgeText({ text: "1" });
              chrome.action.setBadgeBackgroundColor({ color: "#f96c6c" });
              validationInfo.type = "warning";
              if (validationInfo.openScamReports > 0) {
                validationInfo.msg = "Domain registed recently and has `OPEN` fraud reports";
                validationInfo.description = "The legitimacy of this domain is currently in debate and being validated. Please maintain caution, especially while performing financial transactions.";
              } else {
                validationInfo.msg = "Domain registed recently";
                validationInfo.description = "Majority of new domains are legit but some could be scam. Please maintain caution, especially while performing financial transactions.";
              }
            } else if (validationInfo.openScamReports) {
              console.log("changing icon");
              chrome.action.setIcon({ path: { 19: "/images/alerticon19-red.png", 38: "/images/alerticon38-red.png" } });
              validationInfo.openScamReports ? chrome.action.setBadgeText({ text: validationInfo.openScamReports + "" }) : chrome.action.setBadgeText({ text: "1" });
              chrome.action.setBadgeBackgroundColor({ color: "#f96c6c" });
              validationInfo.type = "warning";
              validationInfo.msg = "Has `OPEN` fraud reports";
              validationInfo.description = "The legitimacy of this domain is currently in debate and being validated. Please maintain caution, especially while performing financial transactions.";
            } else {
              chrome.action.setIcon({ path: { 16: "/images/icon16.png", 32: "/images/icon32.png" } });
              chrome.action.setBadgeText({ text: "0" });
              chrome.action.setBadgeBackgroundColor({ color: "#05ed05" });
            }
            sendMessage(tab2, "domain", {
              isSuccess: true,
              domain: url,
              createdOn: createdOn2 ? createdOn2.getTime() : 0,
              type: validationInfo.type,
              msg: validationInfo.msg,
              description: validationInfo.description
            });
          }));
        }
      }
      chrome.tabs.onUpdated.addListener((tabId, info, tab2) => __async(exports, null, function* () {
        console.log(tab2);
        processTab(tab2);
      }));
      chrome.tabs.onActivated.addListener((activeInfo) => {
        console.log({ activeInfo });
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, function(tabs) {
          var tab2 = tabs[0];
          var url = tab2.url;
          console.log("url", tabs);
          processTab(tabs[0]);
        });
      });
      function sendMessage(tab2, type, data) {
        return __async(this, null, function* () {
          return new Promise((resolve, reject) => {
            console.log("sending msg", type);
            chrome.tabs.sendMessage(tab2.id, {
              type,
              data
            }, void 0, (response) => {
              resolve();
            });
          });
        });
      }
      chrome.action.onClicked.addListener(function(tab2) {
        console.log("extension clickeddd", tab2.id, chrome.tabs);
        sendMessage(tab2, "toggle", {});
      });
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => __async(exports, null, function* () {
        console.log("msg in background", request, sender, sendResponse);
        if (request.type == "take-screenshot") {
          yield sendMessage(sender.tab, "toggle", {});
          yield takeScreenshot(sender.tab);
          yield sendMessage(sender.tab, "toggle", {});
        } else if (request.type == "connect-wallet") {
          yield sendMessage(sender.tab, "connect-wallet-2", {});
        } else if (request.type == "wallet-connected") {
          yield sendMessage(sender.tab, "wallet-connected", request.data);
        } else if (request.type == "switch-network") {
          yield sendMessage(sender.tab, "switch-network-2", request.data);
        } else if (request.type == "chainID") {
          yield sendMessage(sender.tab, "chainID", request.data);
        } else if (request.type == "submit-report") {
          yield sendMessage(sender.tab, "submit-report-2", request.data);
        } else if (request.type == "transaction-update") {
          yield sendMessage(sender.tab, "transaction-update", request.data);
        } else if (request.type == "get-stake-amount") {
          yield sendMessage(sender.tab, "get-stake-amount-2", request.data);
        } else if (request.type == "stake-amount") {
          yield sendMessage(sender.tab, "stake-amount", request.data);
        }
      }));
      function takeScreenshot(tab2) {
        return new Promise((resolve, reject) => {
          let capturing = chrome.tabs.captureVisibleTab();
          capturing.then((imageUri) => {
            console.log("imageUri", imageUri);
            sendMessage(tab2, "screenshot", { isSuccess: true, imageUri });
            sendMessage(tab2, "screenshot", { isSuccess: true, imageUri });
            resolve();
          }, (error) => {
            console.log(`Error: ${error}`);
            sendMessage(tab2, "screenshot", { isSuccess: false, error });
            resolve();
          });
        });
      }
    }
  });
  require_background();
})();
