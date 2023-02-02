"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _messages = require("./messages");
Object.keys(_messages).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _messages[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _messages[key];
    }
  });
});