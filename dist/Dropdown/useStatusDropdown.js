"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// Get stored JWT Data from sessionStorage
const jwtData = sessionStorage.getItem('jwtData') !== 'undefined' ? JSON.parse(sessionStorage.getItem('jwtData')) : undefined;
const getUrlVars = () => {
  const vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
    vars[key] = value;
  });
  return vars;
};
let {
  profile
} = window[window.sessionStorage?.tabId].COM_IVOYANT_VARS;
// Replace config profile with jwt profile if it exists
if (jwtData !== undefined) {
  if (jwtData?.profile) {
    profile = jwtData?.profile;
  }
}
// Replace config profile with URL  profile if it exists
if (getUrlVars().profile) {
  profile = getUrlVars().profile;
}
const checkSuspendedCondition = function () {
  let selectedRowsData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    phoneNumbers: []
  };
  let subscribers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  let getPhoneNumbers = arguments.length > 2 ? arguments[2] : undefined;
  let statusMatched = false;
  for (const val of getPhoneNumbers(selectedRowsData)) {
    for (const subscriber of subscribers) {
      if (subscriber?.subscriberDetails?.phoneNumber === val && subscriber?.subscriberDetails?.status === 'S' && subscriber?.subscriberDetails?.statusReasonCode === 'CO') {
        statusMatched = true;
      }
    }
  }
  return statusMatched;
};
const getTransitionOptionsForCurrentState = (currentState, bridgepayInfo, selectedRowsData, subscribers, getPhoneNumbers) => {
  switch (currentState) {
    case 'Canceled':
      return [{
        id: 0,
        optionText: 'Restore'
      }];
    case 'Active':
      if (bridgepayInfo === 'Active' || bridgepayInfo === 'Active in BridgePay Extension') {
        return [{
          id: 0,
          optionText: 'Suspend'
        }];
      }
      return [{
        id: 0,
        optionText: 'Cancel'
      }, {
        id: 1,
        optionText: 'Suspend'
      }];
    case 'Suspended':
      if (bridgepayInfo === 'Active' || bridgepayInfo === 'Active in BridgePay Extension') {
        return [{
          id: 0,
          optionText: 'Restore'
        }];
      }
      if (selectedRowsData?.status === 'Suspended' && checkSuspendedCondition(selectedRowsData, subscribers, getPhoneNumbers)) {
        return [{
          id: 0,
          optionText: 'Cancel'
        }];
      }
      return [{
        id: 0,
        optionText: 'Cancel'
      }, {
        id: 1,
        optionText: 'Restore'
      }];
    case 'Suspended (IMEI)':
      return [{
        id: 0,
        optionText: 'Restore'
      }];
    case 'Reserved':
      return [];
    default:
      return [];
  }
};
const getReasonsForCurrentState = (currentStatusState, currentLineState, selectedRowsData, subscribers) => {
  switch (currentStatusState) {
    case 'Suspend':
      let suspendedReasons = [{
        id: 0,
        optionText: 'Lost'
      }, {
        id: 1,
        optionText: 'Stolen'
      }, {
        id: 2,
        optionText: 'Customer Decision'
      }, {
        id: 3,
        optionText: 'Fraud'
      }, {
        id: 4,
        optionText: 'Non-payment'
      }, {
        id: 5,
        optionText: 'Military'
      }, {
        id: 6,
        optionText: 'Unauthorized Sim Swap'
      }];
      return suspendedReasons;
    case 'Cancel':
      return [{
        id: 0,
        optionText: 'Fraud'
      }, {
        id: 1,
        optionText: 'No longer needed'
      }, {
        id: 2,
        optionText: 'Going to competitor'
      }, {
        id: 3,
        optionText: 'Deceased'
      }, {
        id: 4,
        optionText: 'Non-Payment'
      }, {
        id: 5,
        optionText: 'Port request on mixed services'
      }];
    case 'Restore':
      switch (currentLineState) {
        case 'Suspended':
          let suspendedOptions = [{
            id: 0,
            optionText: 'Lost'
          }, {
            id: 1,
            optionText: 'Stolen'
          }, {
            id: 2,
            optionText: 'Customer Decision'
          }, {
            id: 3,
            optionText: 'Fraud'
          }, {
            id: 4,
            optionText: 'Non-payment'
          }, {
            id: 5,
            optionText: 'Military'
          }, {
            id: 6,
            optionText: 'Unauthorized Sim Swap'
          }];
          return suspendedOptions;
        case 'Canceled':
          return [{
            id: 0,
            optionText: 'Customer Decision'
          }];
        case 'Suspended (IMEI)':
          const suspendedImeiOptions = [{
            id: 0,
            optionText: 'Lost'
          }, {
            id: 1,
            optionText: 'Stolen'
          }];
          return suspendedImeiOptions;
        default:
          return [{
            id: 0,
            optionText: 'None'
          }];
      }
    default:
      return [];
  }
};
const getRestoreOptions = (selectedReason, setRestoreReasonOptions, hotlineSuspended) => {
  const reason = selectedReason?.charAt(0)?.toUpperCase() + selectedReason?.slice(1);
  if (hotlineSuspended) {
    setRestoreReasonOptions([{
      id: 0,
      optionText: `${reason} Device`
    }]);
  } else {
    setRestoreReasonOptions([{
      id: 0,
      optionText: `${reason} Device`
    }, {
      id: 1,
      optionText: `${reason} Line`
    }, {
      id: 2,
      optionText: `Both`
    }]);
  }
};
const useStatusDropdown = function (lineState, selectedStatus, selectedReason, bridgepayInfo, restoreLostStolenReason, selectedRowsData, subscribers, subStatusCancelFutureDated,
// 360-feature-flagging query result inheriting from parent component
getPhoneNumbers) {
  let hotlineSuspended = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : false;
  const [statusOptions, setStatusOptions] = _react.default.useState([]);
  const [reasonOptions, setReasonOptions] = _react.default.useState(getReasonsForCurrentState(selectedStatus, lineState));
  const [restoreReasonOptions, setRestoreReasonOptions] = _react.default.useState([]);
  const [showDateToggleDropdown, setShowDateToggleDropdown] = _react.default.useState(false);
  const [showRestoreLostStolenDropdown, setShowRestoreLostStolenDropdown] = _react.default.useState(false);
  _react.default.useEffect(() => {
    const nextStatus = getTransitionOptionsForCurrentState(lineState, bridgepayInfo, selectedRowsData, subscribers, getPhoneNumbers);
    setStatusOptions([...nextStatus]);
  }, [lineState, selectedRowsData]);
  _react.default.useEffect(() => {
    if (selectedStatus === 'Restore' && (selectedReason === 'Lost' || selectedReason === 'Stolen')) {
      setShowDateToggleDropdown(false);
      setShowRestoreLostStolenDropdown(true);
      getRestoreOptions(selectedReason, setRestoreReasonOptions, hotlineSuspended);
    } else if (selectedStatus === 'Suspend' && (selectedReason === 'Lost' || selectedReason === 'Stolen')) {
      setShowDateToggleDropdown(false);
      setShowRestoreLostStolenDropdown(true);
      getRestoreOptions(selectedReason, setRestoreReasonOptions);
    } else if (selectedStatus === 'Cancel') {
      setShowDateToggleDropdown(true);
      setShowRestoreLostStolenDropdown(false);
    } else {
      setShowDateToggleDropdown(false);
      setShowRestoreLostStolenDropdown(false);
    }
  }, [selectedStatus, selectedReason]);

  // function for testing the condition on subStatusCancelFutureDated feature which checks for enable == false && reasons array should have 'BAN Status - Hotline Suspended' included. Return true on the same condition and false if it does not meet the requirement.
  const checkSubStatusCancelFutureDated = () => {
    return subStatusCancelFutureDated && !subStatusCancelFutureDated?.enable ? true : false;
  };
  // generating options for effective by dropdown based on the result of checkSubStatusCancelFutureDated function
  const getToggleOptions = () => {
    return checkSubStatusCancelFutureDated() ? [{
      id: 0,
      optionText: 'Effective today'
    }] : [{
      id: 0,
      optionText: 'Effective today'
    }, {
      id: 1,
      optionText: 'Future dated'
    }];
  };
  return {
    statusOptions,
    reasonOptions,
    restoreReasonOptions,
    showDateToggleDropdown,
    showRestoreLostStolenDropdown,
    setStatus: status => {
      const selectedStatus = getReasonsForCurrentState(status, lineState, selectedRowsData, subscribers);
      setReasonOptions([...selectedStatus]);
    },
    dateToggleOptions: [...getToggleOptions()],
    restoreLostStolenDropdownOptions: restoreReasonOptions,
    restoreLostStolenReason
  };
};
var _default = useStatusDropdown;
exports.default = _default;
module.exports = exports.default;