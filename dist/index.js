"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Dropdown = _interopRequireDefault(require("./Dropdown"));
var _template = require("./template.schema");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = {
  component: _Dropdown.default,
  schema: _template.schema,
  ui: _template.ui
};
exports.default = _default;
module.exports = exports.default;