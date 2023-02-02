"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _useStatusDropdown = _interopRequireDefault(require("./useStatusDropdown"));
var _reactRouterDom = require("react-router-dom");
require("./styles.css");
var _utils = require("./utils");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const {
  Option
} = _antd.Select;
const {
  Title,
  Text
} = _antd.Typography;
const NO_FEE_BULKRESUME_WORKFLOW = 'BULKRESUMENOFEE';
const handleOptionChange = function (type, setValues) {
  let setStatus = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
  let selectedRowsData = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    phoneNumbers: []
  };
  let subscribers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
  return value => {
    let phoneNumbers = getPhoneNumbers(selectedRowsData);
    let blockPortPresent = checkBlockPortIndicator(phoneNumbers, subscribers);
    // Check if block port indicator is true on any selected number, then warning will appear and stop cancelling of number
    if (value?.toLowerCase() === 'cancel' && blockPortPresent) {
      _antd.notification.error({
        message: 'Active Port Indicator',
        description: 'Cancellation is not allowed for a subscriber with Pending Port Out request.'
      });
      if (setValues) {
        setValues(v => ({
          ...v,
          status: '',
          reason: '',
          dateToggle: '',
          restoreLostStolenReason: ''
        }));
      }
    } else {
      if (setStatus) {
        if (type == 'status') {
          setStatus(value);
        }
        setValues(v => ({
          ...v,
          [type]: value
        }));
      }
    }
  };
};
// Returning the phone numbers in the form of array from subscribers array
const getPhoneNumbers = selectedRowsData => {
  if (typeof selectedRowsData?.phoneNumbers == 'string') {
    return selectedRowsData?.phoneNumbers?.split(',')?.map(ele => deformatTelephone(ele)) || [];
  }
  if (typeof selectedRowsData?.phoneNumbers == 'array') {
    let returnArray = [];
    selectedRowsData?.phoneNumbers.forEach(el => returnArray.push(el.telephoneNumber));
    return returnArray;
  }
};

/**
 * Returns true or false based on condition check
 * @param {Array} phoneNumbers Selected Phone Numbers.
 * @param {Array} subscribers List of subscribers
 * @return {Boolean} statusMatched true if number is found in subscribers and has blockPortOut indicator true.
 */
const checkBlockPortIndicator = function () {
  let phoneNumbers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  let subscribers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  let statusMatched = false;
  for (const val of phoneNumbers) {
    for (const subscriber of subscribers) {
      if (subscriber?.subscriberDetails?.phoneNumber === val && subscriber?.subscriberDetails?.portProtectInfo?.blockPortOutIndicator === true || subscriber?.subscriberDetails?.portProtectInfo?.blockPortOutIndicator === 'true') {
        statusMatched = true;
      }
    }
  }
  return statusMatched;
};
const LabelWrapper = _ref => {
  let {
    children,
    label
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h3", null, label), children);
};
const mapOptions = values => values.map(_ref2 => {
  let {
    id,
    optionText
  } = _ref2;
  return /*#__PURE__*/_react.default.createElement(Option, {
    key: id,
    value: optionText
  }, optionText);
});
const StatusDropdown = _ref3 => {
  let {
    disabled,
    options,
    onChange,
    styles
  } = _ref3;
  return /*#__PURE__*/_react.default.createElement(LabelWrapper, {
    label: "Change Status"
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    placeholder: "Select One",
    onChange: onChange,
    disabled: disabled,
    value: options.length === 0 ? 'Select One' : undefined,
    style: styles
  }, mapOptions(options)));
};
const ReasonDropdown = _ref4 => {
  let {
    disabled,
    options,
    onChange,
    styles
  } = _ref4;
  return /*#__PURE__*/_react.default.createElement(LabelWrapper, {
    label: "Reason"
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    placeholder: "Select One",
    onChange: onChange,
    disabled: disabled,
    value: options.length === 0 ? 'Select One' : undefined,
    style: styles
  }, mapOptions(options)));
};
const DateDropdown = _ref5 => {
  let {
    disabled,
    options,
    onChange,
    styles
  } = _ref5;
  return /*#__PURE__*/_react.default.createElement(LabelWrapper, {
    label: "Effective by:"
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    placeholder: "Select One",
    onChange: onChange,
    disabled: disabled,
    value: options.length === 0 ? 'Select One' : undefined,
    style: styles
  }, mapOptions(options)));
};
const RestoreLostStolenDropdown = _ref6 => {
  let {
    label,
    disabled,
    options,
    onChange,
    styles
  } = _ref6;
  return /*#__PURE__*/_react.default.createElement(LabelWrapper, {
    label: label
  }, /*#__PURE__*/_react.default.createElement(_antd.Select, {
    placeholder: "Select One",
    onChange: onChange,
    disabled: disabled,
    value: options.length === 0 ? 'Select One' : undefined,
    style: styles
  }, mapOptions(options)));
};
const deformatTelephone = n => {
  return `${n.slice(1, 4)}${n.slice(6, 9)}${n.slice(10)}`;
};
const formatTelephone = n => {
  return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
};
const formatData = dataFromRows => {
  const data = {
    payload: dataFromRows
  };
  return window[window.sessionStorage?.tabId].dp.load(data).extractData({
    extract: [{
      property: 'payload',
      name: 'phoneNumbers',
      transformations: [obj => {
        const numbersResult = obj.map(o => o.telephoneNumberForIcon).join(', ');
        return numbersResult !== '' ? numbersResult : 'None Selected';
      }]
    }, {
      property: 'payload',
      name: 'status',
      transformations: [obj => {
        return obj.reduce((acc, curr) => {
          if (curr.ptnStatus && acc === 'None Selected') {
            return curr.ptnStatus;
          }
          return curr.ptnStatus === acc ? acc : 'None Selected';
        }, 'None Selected');
      }]
    }]
  });
};
function isValid(status, reason, lines) {
  let deviceAndLineEnabled = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  let deviceAndLineStatus = arguments.length > 4 ? arguments[4] : undefined;
  let showDateToggleDropdown = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  let dateToggle = arguments.length > 6 ? arguments[6] : undefined;
  let msg = '';
  if (lines.length === 0) {
    msg = 'Please select lines to update.';
  } else if (status === '' || reason === '') {
    msg = 'Please select a status and/or a reason for update.';
  } else if (deviceAndLineEnabled && (deviceAndLineStatus === null || deviceAndLineStatus === '' || typeof deviceAndLineStatus === 'undefined')) {
    msg = 'Please select device, line, or device and line.';
  } else if (showDateToggleDropdown && (dateToggle === null || dateToggle === '' || typeof dateToggle === 'undefined')) {
    msg = 'Please select device, line, or device and line.';
  } else {
    msg = '';
  }
  return msg;
}
const formatWhitelistInquiry = _ref7 => {
  let {
    authorizedOperators,
    resourceKey
  } = _ref7;
  window[window.sessionStorage?.tabId].imeiSearchPayload = false;
  const payload = [];
  authorizedOperators?.forEach(_ref8 => {
    let {
      itemId,
      itemValue
    } = _ref8;
    if (itemId === 'CTN') {
      payload.push({
        telephoneNumber: itemValue,
        ptnStatus: 'Suspended'
      });
    }
  });
  const res = {
    status: 'Suspended (IMEI)',
    phoneNumbers: payload,
    imei: resourceKey
  };
  window[window.sessionStorage?.tabId].imeiSearchPayload = res;
  return [res, payload];
};
const Dropdown = props => {
  const {
    component,
    children = false,
    data,
    datasources
  } = props;
  const {
    summaryTableName = 'none',
    useAlternate = false,
    bulkResumeWorkflow
    // TODO: Uncomment when needed
    // oneStepChangeSubStatus,
  } = component.params;
  const bridgepayInfo = data?.data?.bridgepayInfo?.status;
  const subscribers = data?.data?.customerView?.subscribers;
  const ban = data?.data?.customerView?.ban;
  const arBalance = data?.data?.customerView?.arBalance;
  const customerAccountDetails = data?.data?.customerViewDetails?.account?.accountDetails;
  const subStatusCancelFutureDated = data?.data?.subStatusCancelFutureDated; // getting data from 360-feature-flagging table using alasql query in viewer.json
  const bulkResumeFlag = data?.data?.bulkResumeFlag;
  const customerAdditionalInfoSubscribers = data?.data?.customerAdditionalInfoSubscribers?.subscribers;
  const lineDetails = data?.data?.lineDetails;
  // bulk resume
  const datasource = bulkResumeWorkflow?.datasource;
  const workflow = bulkResumeWorkflow?.workflow;
  const responseMapping = bulkResumeWorkflow?.responseMapping;
  const successStates = bulkResumeWorkflow?.successStates;
  const errorStates = bulkResumeWorkflow?.errorStates;
  // const {
  //     datasource,
  //     workflow,
  //     responseMapping,
  //     successStates,
  //     errorStates,
  // } = bulkResumeWorkflow;

  //HOTLINE Suspended account check
  const hotlineSuspended = customerAccountDetails?.banStatus === 'S' && customerAccountDetails?.statusActvRsnCode === 'CO';
  const history = (0, _reactRouterDom.useHistory)();
  if (useAlternate) {
    const AlternateDropdown = /*#__PURE__*/_react.default.lazy(() => Promise.resolve().then(() => _interopRequireWildcard(require('../DropdownNew'))));
    return /*#__PURE__*/_react.default.createElement(_react.default.Suspense, {
      fallback: /*#__PURE__*/_react.default.createElement("div", null)
    }, /*#__PURE__*/_react.default.createElement(AlternateDropdown, props));
  }
  const [isImeiSearch, setIsImeiSearch] = _react.default.useState(false);
  const [rawSelectedRows, setRawSelectedRows] = _react.default.useState([]);
  const [selectedRowsData, sendDataToDropdown] = _react.default.useState([]);
  const [showCancelFlowModal, setShowCancelFlowModal] = _react.default.useState(false);
  const [showCancelFlowApproved, setShowCancelFlowApproved] = _react.default.useState(false);
  const [values, setValues] = _react.default.useState({
    status: '',
    reason: '',
    dateToggle: '',
    restoreLostStolenReason: ''
  });
  // one-step restore state values
  const [disableOneStepResumeButton, setDisableOneStepResumeButton] = _react.default.useState(true);
  const [showOneStepModal, setShowOneStepModal] = _react.default.useState(false);
  // replace hardcoded amount with amount from API
  const [restoreDuesTotal, setRestoreDuesTotal] = _react.default.useState(0);
  const [oneStepRestoreButtonLoading, setOneStepRestoreButtonLoading] = _react.default.useState(false);
  const status = selectedRowsData?.status || 'None Selected';
  const phoneNumbers = selectedRowsData.phoneNumbers || 'None Selected';

  // const currentTabletLines = Object.values(lineDetails)?.filter((item) => {
  //     if (item?.currentRatePlan !== undefined)
  //         return item?.currentRatePlan[0]?.soc === 'TABLETUNL';
  // }).length;
  // const previousTabletLines = Object.values(lineDetails)?.filter((item) => {
  //     if (item?.previousRatePlan !== undefined)
  //         return item?.previousRatePlan[0]?.soc === 'TABLETUNL';
  // }).length;

  /**
   * Before you uncomment the above : Updated the viewer with isArray true so it will be an Array for all the scenarios.
   * Go to bulk resume quaries in viewer you will find line details ans isArray flag there
   */

  const currentTabletLines = lineDetails?.filter(item => {
    if (item?.currentRatePlan !== undefined) return item?.currentRatePlan[0]?.soc === 'TABLETUNL';
  }).length;
  const previousTabletLines = lineDetails?.filter(item => {
    if (item?.previousRatePlan !== undefined) return item?.previousRatePlan[0]?.soc === 'TABLETUNL';
  }).length;
  const {
    statusOptions,
    reasonOptions,
    dateToggleOptions,
    showDateToggleDropdown = false,
    showRestoreLostStolenDropdown = false,
    restoreLostStolenDropdownOptions,
    setStatus,
    restoreLostStolenReason
  } = (0, _useStatusDropdown.default)(status, values.status, values.reason, bridgepayInfo, values.restoreLostStolenReason, selectedRowsData, subscribers, subStatusCancelFutureDated,
  // sent to generate dateToggleOptions for updating effective by drop down
  getPhoneNumbers, hotlineSuspended);
  _react.default.useEffect(() => {
    window[window.sessionStorage?.tabId][`${component.id}sendDataToDropdown`] = function (incomingData) {
      let payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (incomingData === '') {
        const formattedWhitelistResponse = formatWhitelistInquiry(payload.value.data);
        window.searchImeiData = formattedWhitelistResponse[0];
        setIsImeiSearch(true);
        sendDataToDropdown(formattedWhitelistResponse[0]);
        setRawSelectedRows(formattedWhitelistResponse[1]);
        return;
      }
      window.searchImeiData = formatData(incomingData);
      setIsImeiSearch(false);
      sendDataToDropdown(formatData(incomingData));
      setRawSelectedRows(incomingData);
    };
    if (window[window.sessionStorage?.tabId][`${summaryTableName}sendDataToSummaryTable`] && (window[window.sessionStorage?.tabId].imeiSearchPayload === undefined || window[window.sessionStorage?.tabId].imeiSearchPayload === false)) {
      if (values.status !== '' && values.status !== 'None Selected') {
        window[window.sessionStorage?.tabId][`${component.id}getDropdownStatusValues`] = values;
        window[window.sessionStorage?.tabId][`${summaryTableName}sendDataToSummaryTable`](rawSelectedRows);
        window[window.sessionStorage?.tabId].dp.set(`${component.id}dropdownPayload`, {
          status: values.status,
          reason: values.reason
        });
      }
    }
    const validationMessage = isValid(values.status, values.reason, rawSelectedRows, showRestoreLostStolenDropdown, restoreLostStolenReason, showDateToggleDropdown, values.dateToggle);
    window[window.sessionStorage?.tabId][`${component.id}changeStatusDropdownPayload`] = {
      status: values.status,
      reason: values.reason,
      lines: rawSelectedRows.map(o => ({
        ...o,
        telephoneNumberForIcon: formatTelephone(o.telephoneNumber)
      })),
      dateToggle: values.dateToggle,
      restoreLostStolenReason: values.restoreLostStolenReason,
      validationMessage,
      bridgepayInfo: bridgepayInfo
    };
    return () => {
      delete window[window.sessionStorage?.tabId][`${component.id}sendDataToDropdown`];
      delete window[window.sessionStorage?.tabId][`${component.id}getDropdownStatusValues`];
      delete window[window.sessionStorage?.tabId][`${component.id}changeStatusDropdownPayload`];
      delete window[window.sessionStorage?.tabId].searchImeiData;
    };
  }, [status, values.reason, values.restoreLostStolenReason, values.dateToggle, rawSelectedRows, showRestoreLostStolenDropdown, bridgepayInfo]);
  _react.default.useEffect(() => {
    if (status === 'None Selected') {
      setValues({
        ...values,
        status: '',
        reason: '',
        dateToggle: '',
        restoreLostStolenReason: ''
      });
      setShowCancelFlowApproved(false);
      setStatus(status);
    }
  }, [status, values.status, values.reason, values.dateToggle, rawSelectedRows.length]);
  const childrenArray = children ? _react.default.Children.toArray(children) : [];
  const handleCancelFlowModalCancel = () => {
    setValues({
      ...values,
      status: '',
      reason: '',
      dateToggle: '',
      restoreLostStolenReason: ''
    });
    setRawSelectedRows([]);
    sendDataToDropdown([]);
    setShowCancelFlowApproved(false);
    setShowCancelFlowModal(false);
    window[sessionStorage.tabId]['change-status-customer-line-tableresetSelectedRows']();
  };
  const handleCancelFlowModalOk = () => {
    setShowCancelFlowApproved(true);
    setShowCancelFlowModal(false);
  };
  const lostStolenDeviceIsSelected = () => {
    return rawSelectedRows.some(row => {
      const subProps = subscribers[subscribers.findIndex(sub => sub.subscriberDetails.phoneNumber === row.telephoneNumber)];
      if (subProps.subscriberDetails.status === 'S' && (subProps.subscriberDetails.statusReasonCode === 'ST' || subProps.subscriberDetails.statusReasonCode === 'TS')) return true;else return false;
    });
  };

  // useEffect to control the disabled state of One step resume/restore button
  _react.default.useEffect(() => {
    //NOTE: We can remove this if codition in future and control everything by bulkResumeFlag
    if (currentTabletLines || previousTabletLines) {
      // If there are tablet lines - disable the bulk resume button
      setDisableOneStepResumeButton(true);

      // disable NEXT button if more than 1 row is selected
      if (rawSelectedRows.length > 1 && rawSelectedRows.every(row => row.ptnStatus === 'Canceled')) {
        window[window.sessionStorage?.tabId]['change-status-section-dropdown-enableNextButton'] = false;
      }
      if (rawSelectedRows.length <= 1) {
        window[window.sessionStorage?.tabId]['change-status-section-dropdown-enableNextButton'] = true;
      }
    } else {
      if (bulkResumeFlag?.enable) {
        if (rawSelectedRows.length > 1) {
          // this condition is inverted because we need to set 'disabled' property
          const conditionForOneStepResume = !rawSelectedRows.every(row => row.ptnStatus === 'Canceled');
          setDisableOneStepResumeButton(conditionForOneStepResume);
          window[window.sessionStorage?.tabId]['change-status-section-dropdown-enableNextButton'] = conditionForOneStepResume;
        }
        if (rawSelectedRows.length <= 1) {
          setDisableOneStepResumeButton(true);
          window[window.sessionStorage?.tabId]['change-status-section-dropdown-enableNextButton'] = true;
        }
      } else {
        // if button is enabled when bulkResume feature flag is disabled
        if (!disableOneStepResumeButton) {
          // disable the one-step resume button
          setDisableOneStepResumeButton(true);
        }

        // set the global window object
        if (rawSelectedRows.length > 0 && rawSelectedRows.every(row => row.ptnStatus === 'Canceled')) {
          window[window.sessionStorage?.tabId]['change-status-section-dropdown-enableNextButton'] = false;
        } else {
          window[window.sessionStorage?.tabId]['change-status-section-dropdown-enableNextButton'] = true;
        }
      }
    }
  }, [rawSelectedRows]);
  const handleBulkResumeResponse = (successStates, errorStates) => (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = successStates.includes(state);
    const isFailure = errorStates.includes(state);
    if (isSuccess || isFailure) {
      /*
          response - for error case
          data - for success case
      */
      const {
        response,
        data
      } = eventData.event.data;
      if (isSuccess) {
        // Disable loading state of restore button
        setOneStepRestoreButtonLoading(false);

        // Set dues amount and check api response
        if (data.dueAmountSummary.totalAmount !== undefined) {
          setRestoreDuesTotal(data.dueAmountSummary.totalAmount);

          // check if due amount is > 0
          if (data.dueAmountSummary.totalAmount > 0) {
            const parsedArBalance = parseFloat(arBalance);

            // !INFO: show the modal if due amount > 0
            setTimeout(() => {
              setShowOneStepModal(true);
            }, 300);
          }

          // if due amount is 0 bulk restore lines without payment
          // if (data.dueAmountSummary.totalAmount === 0) {
          if (data.dueAmountSummary.totalAmount <= 0) {
            // call the feeOnly:false API
            // bulkResumeWithoutPayment();
            // !INFO: Show success message - API will handle adjustment and resume
            _antd.notification.success({
              message: 'Success!',
              description: 'Lines are succesfully scheduled to be restored.'
            });
          }
        } else {
          // display error if there is a problem while fetching due amount
          const {
            errorMessage,
            errorDescription
          } = (0, _utils.constructErrorMessage)(data, 'dueAmountFetch');

          // show error message
          _antd.notification.error({
            message: errorMessage,
            description: errorDescription
          });
        }

        // unsubscribe from message bus
        _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
      }
      if (isFailure) {
        // Disable loading state of restore button
        setOneStepRestoreButtonLoading(false);

        // construct error message
        const {
          errorMessage,
          errorDescription
        } = (0, _utils.constructErrorMessage)(response.data, 'bulkResume');

        // show error modal on error
        _antd.notification.error({
          message: errorMessage,
          description: errorDescription
        });

        // unsubscribe from events
        _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
      }
    }
  };

  // handle one step restore button click
  const handleOneStepResumeClick = () => {
    // make the API call here and get the total amount
    // trigger loading state of the one-step restore button
    setOneStepRestoreButtonLoading(true);

    // if more than one line is selected to restore use the bulk restore API
    if (rawSelectedRows.length > 1) {
      // form the API Payload
      const apiPayload = {
        // billingAccountNumber: ban,
        ctnList: rawSelectedRows.map(rowData => {
          return {
            ctn: rowData.telephoneNumber
          };
        })
        // reason: values.reason,
        // feeOnly: true,
      };

      // get datasource and workflow details
      // init workflow
      const registrationId = `${workflow}`;
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
        header: {
          registrationId: registrationId,
          workflow,
          eventType: 'INIT'
        }
      });

      // subscribe to workflow
      _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleBulkResumeResponse(successStates, errorStates));

      // replace accountId with BAN in URL config
      const baseUri = datasources[datasource].baseUri.replace('{accountId}', ban.toString());
      const url = datasources[datasource].url.replace('{accountId}', ban.toString());

      // submit call
      _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
        header: {
          registrationId: registrationId,
          workflow,
          eventType: 'SUBMIT'
        },
        body: {
          // datasource: datasources[datasource],
          datasource: {
            ...datasources[datasource],
            baseUri,
            url
          },
          request: {
            body: {
              ...apiPayload
            }
          },
          responseMapping
        }
      });
    }
  };
  const closeOneStepModal = () => {
    setShowOneStepModal(false);
  };

  // confirm one step restore
  const confirmOneStepRestore = () => {
    // redirect to payments
    history.push(`/dashboards/payments-board#makeapayment`, {
      routeData: {
        quickPayment: {
          totalAmount: restoreDuesTotal,
          // YES - CAF fee = $0 and NO - CAF fee = $4
          doNotChargeCAF: 'YES',
          // disable option to switch to bridgepay in the middle of restore flow
          disablePaymentType: true,
          // Config for alt workflow - main bulk resume call that creates the activities etc.
          // !INFO: This altWorkflowConfig is not used anymore just leave it as is
          altWorkflowConfig: {
            workflow: NO_FEE_BULKRESUME_WORKFLOW,
            datasource: datasource,
            payload: {
              billingAccountNumber: ban,
              ctnList: rawSelectedRows.map(rowData => {
                return {
                  ctn: rowData.telephoneNumber
                };
              }),
              reason: values.reason,
              feeOnly: false
            },
            successStates: successStates,
            errorStates: errorStates,
            responseMapping: responseMapping
          }
        }
      }
    });

    // close one step modal
    setShowOneStepModal(false);

    // reset state
    setRawSelectedRows([]);
    setRestoreDuesTotal(0);
    setValues({
      status: '',
      reason: '',
      dateToggle: '',
      restoreLostStolenReason: ''
    });
  };
  const checkOneStepResumeClick = () => {
    if (values.reason !== undefined && values.reason !== '') {
      // call handleOneStepResumeClick when reason is selected
      handleOneStepResumeClick();
    } else {
      // if reason is not selected -> show error to select a reason
      const {
        errorMessage,
        errorDescription
      } = (0, _utils.constructErrorMessage)(values, 'reasonNotSelected');
      _antd.notification.error({
        message: errorMessage,
        description: errorDescription
      });
    }
  };
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "row--dropdown-info"
  }, childrenArray[0] !== undefined ? /*#__PURE__*/_react.default.createElement(LabelWrapper, {
    label: "Subscriber IMEI"
  }, /*#__PURE__*/_react.default.cloneElement(childrenArray[0], {
    parentProps: props
  })) : /*#__PURE__*/_react.default.createElement(LabelWrapper, {
    label: "Subscriber Phone Number"
  }, /*#__PURE__*/_react.default.createElement("p", {
    className: "numbers-display"
  }, phoneNumbers)), /*#__PURE__*/_react.default.createElement(LabelWrapper, {
    label: "Current Status"
  }, /*#__PURE__*/_react.default.createElement("p", null, status)), /*#__PURE__*/_react.default.createElement(StatusDropdown, {
    options: statusOptions,
    onChange: handleOptionChange('status', setValues, setStatus, selectedRowsData, customerAdditionalInfoSubscribers),
    disabled: status === 'None Selected' || statusOptions.length === 0,
    styles: {
      width: 250
    }
  }), /*#__PURE__*/_react.default.createElement(ReasonDropdown, {
    options: reasonOptions,
    onChange: handleOptionChange('reason', setValues, setStatus, selectedRowsData, customerAdditionalInfoSubscribers),
    disabled: status === 'None Selected' || reasonOptions.length === 0 || values.status === '',
    styles: {
      width: 250
    }
  }), showDateToggleDropdown && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement(DateDropdown, {
    options: dateToggleOptions,
    onChange: handleOptionChange('dateToggle', setValues, setStatus, selectedRowsData, customerAdditionalInfoSubscribers),
    styles: {
      width: 250
    }
  })), showRestoreLostStolenDropdown && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement(RestoreLostStolenDropdown, {
    label: values.status,
    options: restoreLostStolenDropdownOptions,
    onChange: handleOptionChange('restoreLostStolenReason', setValues, setStatus, selectedRowsData, customerAdditionalInfoSubscribers),
    styles: {
      width: 250
    }
  })), /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
    placement: "topLeft",
    title: bulkResumeFlag?.reasons && bulkResumeFlag?.reasons?.length > 0 ? bulkResumeFlag?.reasons[0] : ''
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "one-step-resume-container"
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "primary",
    disabled: disableOneStepResumeButton,
    onClick: checkOneStepResumeClick,
    loading: oneStepRestoreButtonLoading
  }, "One Step Resume")))), /*#__PURE__*/_react.default.createElement(_antd.Modal, {
    open: showOneStepModal,
    maskClosable: false,
    footer: null,
    closeIcon: /*#__PURE__*/_react.default.createElement(_icons.MinusOutlined, null),
    onCancel: closeOneStepModal
  }, /*#__PURE__*/_react.default.createElement(Title, {
    level: 5
  }, "Payment Due"), /*#__PURE__*/_react.default.createElement(Text, null, "Lines are cancelled for non-payment would you like to resume for $", restoreDuesTotal, "?"), /*#__PURE__*/_react.default.createElement("div", {
    className: "one-step-modal-button-container"
  }, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    size: "small",
    type: "primary",
    onClick: confirmOneStepRestore
  }, "Yes"), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    size: "small",
    type: "ghost",
    onClick: closeOneStepModal
  }, "No"))), showCancelFlowModal && /*#__PURE__*/_react.default.createElement(_antd.Modal, {
    open: showCancelFlowModal,
    onCancel: handleCancelFlowModalCancel,
    onOk: handleCancelFlowModalOk
  }, /*#__PURE__*/_react.default.createElement("div", {
    style: {
      padding: '32px'
    }
  }, "You are about to cancel the subscriber including removing any bill balance.", /*#__PURE__*/_react.default.createElement("br", null), "Proceeding with cancellation will also remove the current promotion applied on the account/subscriber.", /*#__PURE__*/_react.default.createElement("br", null), "Do you want to continue?")));
};
var _default = Dropdown;
exports.default = _default;
module.exports = exports.default;