/*
 * Restore Methods for chrome.tabs
 * Written by Tam710562
 */

window.gnoh = Object.assign(window.gnoh || {}, {
    tabs: {
      getAllInWindow: function () {
        let windowId;
        let callback;
  
        Array.from(arguments).forEach(function (argument) {
          switch (typeof argument) {
            case 'number':
              windowId = argument;
              break;
            default:
              callback = argument;
              break;
          }
        });
  
        chrome.tabs.query({
          windowId: windowId
        }, function (tabs) {
          callback(tabs);
        });
      },
      getSelected: function () {
        let windowId;
        let callback;
  
        Array.from(arguments).forEach(function (argument) {
          switch (typeof argument) {
            case 'number':
              windowId = argument;
              break;
            default:
              callback = argument;
              break;
          }
        });
  
        chrome.tabs.query({
          active: true,
          windowId: windowId
        }, function (tabs) {
          const tab = tabs[0];
          if (tab) {
            callback(tab);
          }
        });
      },
      executeScript: function () {
        let tabId;
        let details;
        let callback;
  
        Array.from(arguments).forEach(function (argument) {
          switch (typeof argument) {
            case 'number':
              tabId = argument;
              break;
            case 'object':
              details = argument;
              break;
            default:
              callback = argument;
              break;
          }
        });
  
        if (tabId) {
          gnoh.webPageView.callMethod(tabId, 'executeScript', [details, callback]);
        } else {
          gnoh.webPageView.callMethod('executeScript', [details, callback]);
        }
      },
      insertCSS: function () {
        let tabId;
        let details;
        let callback;
  
        Array.from(arguments).forEach(function (argument) {
          switch (typeof argument) {
            case 'number':
              tabId = argument;
              break;
            case 'object':
              details = argument;
              break;
            default:
              callback = argument;
              break;
          }
        });
  
        if (tabId) {
          gnoh.webPageView.callMethod(tabId, 'insertCSS', [details, callback]);
        } else {
          gnoh.webPageView.callMethod('insertCSS', [details, callback]);
        }
      }
    },
    webPageView: {
      getSelected(callback) {
        gnoh.tabs.getSelected(function (tab) {
          callback(this.get(tab.id));
        }.bind(this));
      },
      get: function (tabId) {
        return document.getElementById(tabId);
      },
      callMethod: function () {
        let tabId;
        let methodName;
        let args;
  
        Array.from(arguments).forEach(function (argument) {
          switch (typeof argument) {
            case 'number':
              tabId = argument;
              break;
            case 'string':
              methodName = argument;
              break;
            default:
              args = argument;
              break;
          }
        });
  
        if (tabId) {
          const wpw = this.get(tabId);
          wpw[methodName].apply(wpw, args);
        } else {
          this.getSelected(function (wpw) {
            wpw[methodName].apply(wpw, args);
          });
        }
      }
    }
  });
  
  if (!chrome.tabs.getAllInWindow) {
    chrome.tabs.getAllInWindow = gnoh.tabs.getAllInWindow;
  }
  
  if (!chrome.tabs.getSelected) {
    chrome.tabs.getSelected = gnoh.tabs.getSelected;
  }
  
  if (!chrome.tabs.executeScript) {
    chrome.tabs.executeScript = gnoh.tabs.executeScript;
  }
  
  if (!chrome.tabs.insertCSS) {
    chrome.tabs.insertCSS = gnoh.tabs.insertCSS;
  }