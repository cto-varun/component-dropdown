"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
var _useDropdown = _interopRequireDefault(require("./useDropdown"));
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const {
  Option
} = _antd.Select;
const LabelWrapper = _ref => {
  let {
    children,
    label,
    labelLeft
  } = _ref;
  const styles = labelLeft ? {
    className: 'label-wrapper--parent'
  } : {};
  return /*#__PURE__*/_react.default.createElement("div", styles, label ? /*#__PURE__*/_react.default.createElement("h3", null, label) : null, children);
};
const mapOptions = (placeholder, values) => {
  return [/*#__PURE__*/_react.default.createElement(Option, {
    key: placeholder,
    value: placeholder,
    disabled: true
  }, placeholder), ...values.map(_ref2 => {
    let {
      value,
      label
    } = _ref2;
    return /*#__PURE__*/_react.default.createElement(Option, {
      key: value,
      value: value
    }, label.html ? /*#__PURE__*/_react.default.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: label.html
      }
    }) : label);
  })];
};
const handleSelectionChange = (componentID, id) => value => {
  window[window.sessionStorage?.tabId][`${componentID}_setDDState`]({
    id,
    value
  });
};
const setDefaultValue = function (defaultValue) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  let fromState = arguments.length > 2 ? arguments[2] : undefined;
  let placeholder = arguments.length > 3 ? arguments[3] : undefined;
  let onChange = arguments.length > 4 ? arguments[4] : undefined;
  if (defaultValue !== undefined && options.length) {
    if (fromState.value === undefined) {
      onChange(defaultValue);
    }
    return {
      defaultValue,
      value: fromState.value !== undefined ? fromState.value : defaultValue
    };
  }
  if (defaultValue === undefined) {
    return {
      value: fromState.value !== undefined ? fromState.value : placeholder
    };
  }
  return {};
};
const Dropdown = props => {
  const {
    component: {
      id: componentID,
      params: {
        elements = [],
        saveState = false,
        subscribers = [],
        styles = ''
      }
    },
    children = false
  } = props;
  const {
    state
  } = (0, _useDropdown.default)(componentID, elements, saveState, subscribers);
  const childrenArray = children ? _react.default.Children.toArray(children) : false;
  return elements.length ? /*#__PURE__*/_react.default.createElement("div", {
    className: `${componentID} row--dropdown-info`
  }, styles ? /*#__PURE__*/_react.default.createElement("style", {
    dangerouslySetInnerHTML: {
      __html: styles
    }
  }) : null, elements.map(_ref3 => {
    let {
      id,
      type,
      childIndex = null,
      labelTitle = '',
      placeholder = '',
      labelLeft = false,
      dropdownStyle = null,
      defaultOption = undefined
    } = _ref3;
    const fromState = state[id];
    if (type === 'display') {
      return /*#__PURE__*/_react.default.createElement(LabelWrapper, {
        label: labelTitle,
        key: id
      }, /*#__PURE__*/_react.default.createElement("p", null, fromState));
    }
    if (type === 'childComponent') {
      if (typeof childIndex === 'number' && childrenArray && childrenArray[childIndex] !== undefined) {
        return /*#__PURE__*/_react.default.createElement(LabelWrapper, {
          label: labelTitle,
          key: id
        }, /*#__PURE__*/_react.default.cloneElement(childrenArray[childIndex], {
          parentProps: props
        }));
      }
      return /*#__PURE__*/_react.default.createElement(LabelWrapper, {
        label: labelTitle,
        key: id
      });
    }
    if (type.startsWith('dropdown')) {
      const {
        options = []
      } = fromState;
      const onChange = handleSelectionChange(componentID, id);
      const setDefaults = setDefaultValue(defaultOption, options, fromState, placeholder, onChange);
      return /*#__PURE__*/_react.default.createElement(LabelWrapper, {
        key: id,
        label: labelTitle,
        labelLeft: labelLeft
      }, /*#__PURE__*/_react.default.createElement(_antd.Select, _extends({
        dropdownStyle: dropdownStyle,
        placeholder: placeholder,
        onChange: onChange,
        disabled: fromState.disabled || !options
      }, setDefaults), options.length ? mapOptions(placeholder, options) : null));
    }
    return null;
  })) : null;
};
var _default = Dropdown;
exports.default = _default;
module.exports = exports.default;