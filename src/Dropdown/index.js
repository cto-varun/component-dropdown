import React from 'react';
import { Select, Modal, notification, Button, Typography, Tooltip } from 'antd';
import { MinusOutlined } from '@ant-design/icons';
import { MessageBus } from '@ivoyant/component-message-bus';
import useStatusDropdown from './useStatusDropdown';
import { useHistory } from 'react-router-dom';
import './styles.css';

// utils
import { constructErrorMessage } from './utils';

const { Option } = Select;
const { Title, Text } = Typography;

const NO_FEE_BULKRESUME_WORKFLOW = 'BULKRESUMENOFEE';

const handleOptionChange = (
    type,
    setValues,
    setStatus = undefined,
    selectedRowsData = { phoneNumbers: [] },
    subscribers = []
) => (value) => {
    let phoneNumbers = getPhoneNumbers(selectedRowsData);
    let blockPortPresent = checkBlockPortIndicator(phoneNumbers, subscribers);
    // Check if block port indicator is true on any selected number, then warning will appear and stop cancelling of number
    if (value?.toLowerCase() === 'cancel' && blockPortPresent) {
        notification.error({
            message: 'Active Port Indicator',
            description:
                'Cancellation is not allowed for a subscriber with Pending Port Out request.',
        });
        if (setValues) {
            setValues((v) => ({
                ...v,
                status: '',
                reason: '',
                dateToggle: '',
                restoreLostStolenReason: '',
            }));
        }
    } else {
        if (setStatus) {
            if (type == 'status') {
                setStatus(value);
            }
            setValues((v) => ({
                ...v,
                [type]: value,
            }));
        }
    }
};
// Returning the phone numbers in the form of array from subscribers array
const getPhoneNumbers = (selectedRowsData) => {
    if (typeof selectedRowsData?.phoneNumbers == 'string') {
        return (
            selectedRowsData?.phoneNumbers
                ?.split(',')
                ?.map((ele) => deformatTelephone(ele)) || []
        );
    }
    if (typeof selectedRowsData?.phoneNumbers == 'array') {
        let returnArray = [];
        selectedRowsData?.phoneNumbers.forEach((el) =>
            returnArray.push(el.telephoneNumber)
        );
        return returnArray;
    }
};

/**
 * Returns true or false based on condition check
 * @param {Array} phoneNumbers Selected Phone Numbers.
 * @param {Array} subscribers List of subscribers
 * @return {Boolean} statusMatched true if number is found in subscribers and has blockPortOut indicator true.
 */
const checkBlockPortIndicator = (phoneNumbers = [], subscribers = []) => {
    let statusMatched = false;
    for (const val of phoneNumbers) {
        for (const subscriber of subscribers) {
            if (
                (subscriber?.subscriberDetails?.phoneNumber === val &&
                    subscriber?.subscriberDetails?.portProtectInfo
                        ?.blockPortOutIndicator === true) ||
                subscriber?.subscriberDetails?.portProtectInfo
                    ?.blockPortOutIndicator === 'true'
            ) {
                statusMatched = true;
            }
        }
    }
    return statusMatched;
};
const LabelWrapper = ({ children, label }) => {
    return (
        <div>
            <h3>{label}</h3>
            {children}
        </div>
    );
};

const mapOptions = (values) =>
    values.map(({ id, optionText }) => (
        <Option key={id} value={optionText}>
            {optionText}
        </Option>
    ));

const StatusDropdown = ({ disabled, options, onChange, styles }) => (
    <LabelWrapper label="Change Status">
        <Select
            placeholder="Select One"
            onChange={onChange}
            disabled={disabled}
            value={options.length === 0 ? 'Select One' : undefined}
            style={styles}
        >
            {mapOptions(options)}
        </Select>
    </LabelWrapper>
);

const ReasonDropdown = ({ disabled, options, onChange, styles }) => (
    <LabelWrapper label="Reason">
        <Select
            placeholder="Select One"
            onChange={onChange}
            disabled={disabled}
            value={options.length === 0 ? 'Select One' : undefined}
            style={styles}
        >
            {mapOptions(options)}
        </Select>
    </LabelWrapper>
);

const DateDropdown = ({ disabled, options, onChange, styles }) => (
    <LabelWrapper label="Effective by:">
        <Select
            placeholder="Select One"
            onChange={onChange}
            disabled={disabled}
            value={options.length === 0 ? 'Select One' : undefined}
            style={styles}
        >
            {mapOptions(options)}
        </Select>
    </LabelWrapper>
);

const RestoreLostStolenDropdown = ({
    label,
    disabled,
    options,
    onChange,
    styles,
}) => (
    <LabelWrapper label={label}>
        <Select
            placeholder="Select One"
            onChange={onChange}
            disabled={disabled}
            value={options.length === 0 ? 'Select One' : undefined}
            style={styles}
        >
            {mapOptions(options)}
        </Select>
    </LabelWrapper>
);

const deformatTelephone = (n) => {
    return `${n.slice(1, 4)}${n.slice(6, 9)}${n.slice(10)}`;
};

const formatTelephone = (n) => {
    return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
};

const formatData = (dataFromRows) => {
    const data = {
        payload: dataFromRows,
    };

    return window[window.sessionStorage?.tabId].dp.load(data).extractData({
        extract: [
            {
                property: 'payload',
                name: 'phoneNumbers',
                transformations: [
                    (obj) => {
                        const numbersResult = obj
                            .map((o) => o.telephoneNumberForIcon)
                            .join(', ');

                        return numbersResult !== ''
                            ? numbersResult
                            : 'None Selected';
                    },
                ],
            },
            {
                property: 'payload',
                name: 'status',
                transformations: [
                    (obj) => {
                        return obj.reduce((acc, curr) => {
                            if (curr.ptnStatus && acc === 'None Selected') {
                                return curr.ptnStatus;
                            }

                            return curr.ptnStatus === acc
                                ? acc
                                : 'None Selected';
                        }, 'None Selected');
                    },
                ],
            },
        ],
    });
};

function isValid(
    status,
    reason,
    lines,
    deviceAndLineEnabled = false,
    deviceAndLineStatus,
    showDateToggleDropdown = false,
    dateToggle
) {
    let msg = '';
    if (lines.length === 0) {
        msg = 'Please select lines to update.';
    } else if (status === '' || reason === '') {
        msg = 'Please select a status and/or a reason for update.';
    } else if (
        deviceAndLineEnabled &&
        (deviceAndLineStatus === null ||
            deviceAndLineStatus === '' ||
            typeof deviceAndLineStatus === 'undefined')
    ) {
        msg = 'Please select device, line, or device and line.';
    } else if (
        showDateToggleDropdown &&
        (dateToggle === null ||
            dateToggle === '' ||
            typeof dateToggle === 'undefined')
    ) {
        msg = 'Please select device, line, or device and line.';
    } else {
        msg = '';
    }
    return msg;
}

const formatWhitelistInquiry = ({ authorizedOperators, resourceKey }) => {
    window[window.sessionStorage?.tabId].imeiSearchPayload = false;
    const payload = [];
    authorizedOperators?.forEach(({ itemId, itemValue }) => {
        if (itemId === 'CTN') {
            payload.push({
                telephoneNumber: itemValue,
                ptnStatus: 'Suspended',
            });
        }
    });

    const res = {
        status: 'Suspended (IMEI)',
        phoneNumbers: payload,
        imei: resourceKey,
    };

    window[window.sessionStorage?.tabId].imeiSearchPayload = res;

    return [res, payload];
};

const Dropdown = (props) => {
    const { component, children = false, data, datasources } = props;
    const {
        summaryTableName = 'none',
        useAlternate = false,
        bulkResumeWorkflow,
        // TODO: Uncomment when needed
        // oneStepChangeSubStatus,
    } = component.params;
    const bridgepayInfo = data?.data?.bridgepayInfo?.status;
    const subscribers = data?.data?.customerView?.subscribers;
    const ban = data?.data?.customerView?.ban;
    const arBalance = data?.data?.customerView?.arBalance;
    const customerAccountDetails =
        data?.data?.customerViewDetails?.account?.accountDetails;
    const subStatusCancelFutureDated = data?.data?.subStatusCancelFutureDated; // getting data from 360-feature-flagging table using alasql query in viewer.json
    const bulkResumeFlag = data?.data?.bulkResumeFlag;
    const customerAdditionalInfoSubscribers =
        data?.data?.customerAdditionalInfoSubscribers?.subscribers;
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
    const hotlineSuspended =
        customerAccountDetails?.banStatus === 'S' &&
        customerAccountDetails?.statusActvRsnCode === 'CO';

    const history = useHistory();

    if (useAlternate) {
        const AlternateDropdown = React.lazy(() => import('../DropdownNew'));

        return (
            <React.Suspense fallback={<div />}>
                <AlternateDropdown {...props} />
            </React.Suspense>
        );
    }

    const [isImeiSearch, setIsImeiSearch] = React.useState(false);
    const [rawSelectedRows, setRawSelectedRows] = React.useState([]);
    const [selectedRowsData, sendDataToDropdown] = React.useState([]);
    const [showCancelFlowModal, setShowCancelFlowModal] = React.useState(false);
    const [showCancelFlowApproved, setShowCancelFlowApproved] = React.useState(
        false
    );
    const [values, setValues] = React.useState({
        status: '',
        reason: '',
        dateToggle: '',
        restoreLostStolenReason: '',
    });
    // one-step restore state values
    const [
        disableOneStepResumeButton,
        setDisableOneStepResumeButton,
    ] = React.useState(true);
    const [showOneStepModal, setShowOneStepModal] = React.useState(false);
    // replace hardcoded amount with amount from API
    const [restoreDuesTotal, setRestoreDuesTotal] = React.useState(0);
    const [
        oneStepRestoreButtonLoading,
        setOneStepRestoreButtonLoading,
    ] = React.useState(false);

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

    const currentTabletLines = lineDetails?.filter((item) => {
        if (item?.currentRatePlan !== undefined)
            return item?.currentRatePlan[0]?.soc === 'TABLETUNL';
    }).length;
    const previousTabletLines = lineDetails?.filter((item) => {
        if (item?.previousRatePlan !== undefined)
            return item?.previousRatePlan[0]?.soc === 'TABLETUNL';
    }).length;

    const {
        statusOptions,
        reasonOptions,
        dateToggleOptions,
        showDateToggleDropdown = false,
        showRestoreLostStolenDropdown = false,
        restoreLostStolenDropdownOptions,
        setStatus,
        restoreLostStolenReason,
    } = useStatusDropdown(
        status,
        values.status,
        values.reason,
        bridgepayInfo,
        values.restoreLostStolenReason,
        selectedRowsData,
        subscribers,
        subStatusCancelFutureDated, // sent to generate dateToggleOptions for updating effective by drop down
        getPhoneNumbers,
        hotlineSuspended
    );

    React.useEffect(() => {
        window[window.sessionStorage?.tabId][
            `${component.id}sendDataToDropdown`
        ] = (incomingData, payload = null) => {
            if (incomingData === '') {
                const formattedWhitelistResponse = formatWhitelistInquiry(
                    payload.value.data
                );
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

        if (
            window[window.sessionStorage?.tabId][
                `${summaryTableName}sendDataToSummaryTable`
            ] &&
            (window[window.sessionStorage?.tabId].imeiSearchPayload ===
                undefined ||
                window[window.sessionStorage?.tabId].imeiSearchPayload ===
                    false)
        ) {
            if (values.status !== '' && values.status !== 'None Selected') {
                window[window.sessionStorage?.tabId][
                    `${component.id}getDropdownStatusValues`
                ] = values;
                window[window.sessionStorage?.tabId][
                    `${summaryTableName}sendDataToSummaryTable`
                ](rawSelectedRows);
                window[window.sessionStorage?.tabId].dp.set(
                    `${component.id}dropdownPayload`,
                    {
                        status: values.status,
                        reason: values.reason,
                    }
                );
            }
        }

        const validationMessage = isValid(
            values.status,
            values.reason,
            rawSelectedRows,
            showRestoreLostStolenDropdown,
            restoreLostStolenReason,
            showDateToggleDropdown,
            values.dateToggle
        );

        window[window.sessionStorage?.tabId][
            `${component.id}changeStatusDropdownPayload`
        ] = {
            status: values.status,
            reason: values.reason,
            lines: rawSelectedRows.map((o) => ({
                ...o,
                telephoneNumberForIcon: formatTelephone(o.telephoneNumber),
            })),
            dateToggle: values.dateToggle,
            restoreLostStolenReason: values.restoreLostStolenReason,
            validationMessage,
            bridgepayInfo: bridgepayInfo,
        };

        return () => {
            delete window[window.sessionStorage?.tabId][
                `${component.id}sendDataToDropdown`
            ];
            delete window[window.sessionStorage?.tabId][
                `${component.id}getDropdownStatusValues`
            ];
            delete window[window.sessionStorage?.tabId][
                `${component.id}changeStatusDropdownPayload`
            ];
            delete window[window.sessionStorage?.tabId].searchImeiData;
        };
    }, [
        status,
        values.reason,
        values.restoreLostStolenReason,
        values.dateToggle,
        rawSelectedRows,
        showRestoreLostStolenDropdown,
        bridgepayInfo,
    ]);

    React.useEffect(() => {
        if (status === 'None Selected') {
            setValues({
                ...values,
                status: '',
                reason: '',
                dateToggle: '',
                restoreLostStolenReason: '',
            });
            setShowCancelFlowApproved(false);
            setStatus(status);
        }
    }, [
        status,
        values.status,
        values.reason,
        values.dateToggle,
        rawSelectedRows.length,
    ]);

    const childrenArray = children ? React.Children.toArray(children) : [];

    const handleCancelFlowModalCancel = () => {
        setValues({
            ...values,
            status: '',
            reason: '',
            dateToggle: '',
            restoreLostStolenReason: '',
        });
        setRawSelectedRows([]);
        sendDataToDropdown([]);
        setShowCancelFlowApproved(false);
        setShowCancelFlowModal(false);
        window[sessionStorage.tabId][
            'change-status-customer-line-tableresetSelectedRows'
        ]();
    };

    const handleCancelFlowModalOk = () => {
        setShowCancelFlowApproved(true);
        setShowCancelFlowModal(false);
    };

    const lostStolenDeviceIsSelected = () => {
        return rawSelectedRows.some((row) => {
            const subProps =
                subscribers[
                    subscribers.findIndex(
                        (sub) =>
                            sub.subscriberDetails.phoneNumber ===
                            row.telephoneNumber
                    )
                ];
            if (
                subProps.subscriberDetails.status === 'S' &&
                (subProps.subscriberDetails.statusReasonCode === 'ST' ||
                    subProps.subscriberDetails.statusReasonCode === 'TS')
            )
                return true;
            else return false;
        });
    };

    // useEffect to control the disabled state of One step resume/restore button
    React.useEffect(() => {
        //NOTE: We can remove this if codition in future and control everything by bulkResumeFlag
        if (currentTabletLines || previousTabletLines) {
            // If there are tablet lines - disable the bulk resume button
            setDisableOneStepResumeButton(true);

            // disable NEXT button if more than 1 row is selected
            if (
                rawSelectedRows.length > 1 &&
                rawSelectedRows.every((row) => row.ptnStatus === 'Canceled')
            ) {
                window[window.sessionStorage?.tabId][
                    'change-status-section-dropdown-enableNextButton'
                ] = false;
            }
            if (rawSelectedRows.length <= 1) {
                window[window.sessionStorage?.tabId][
                    'change-status-section-dropdown-enableNextButton'
                ] = true;
            }
        } else {
            if (bulkResumeFlag?.enable) {
                if (rawSelectedRows.length > 1) {
                    // this condition is inverted because we need to set 'disabled' property
                    const conditionForOneStepResume = !rawSelectedRows.every(
                        (row) => row.ptnStatus === 'Canceled'
                    );

                    setDisableOneStepResumeButton(conditionForOneStepResume);

                    window[window.sessionStorage?.tabId][
                        'change-status-section-dropdown-enableNextButton'
                    ] = conditionForOneStepResume;
                }
                if (rawSelectedRows.length <= 1) {
                    setDisableOneStepResumeButton(true);

                    window[window.sessionStorage?.tabId][
                        'change-status-section-dropdown-enableNextButton'
                    ] = true;
                }
            } else {
                // if button is enabled when bulkResume feature flag is disabled
                if (!disableOneStepResumeButton) {
                    // disable the one-step resume button
                    setDisableOneStepResumeButton(true);
                }

                // set the global window object
                if (
                    rawSelectedRows.length > 0 &&
                    rawSelectedRows.every((row) => row.ptnStatus === 'Canceled')
                ) {
                    window[window.sessionStorage?.tabId][
                        'change-status-section-dropdown-enableNextButton'
                    ] = false;
                } else {
                    window[window.sessionStorage?.tabId][
                        'change-status-section-dropdown-enableNextButton'
                    ] = true;
                }
            }
        }
    }, [rawSelectedRows]);

    const handleBulkResumeResponse = (successStates, errorStates) => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const state = eventData.value;
        const isSuccess = successStates.includes(state);
        const isFailure = errorStates.includes(state);
        if (isSuccess || isFailure) {
            /*
                response - for error case
                data - for success case
            */
            const { response, data } = eventData.event.data;
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
                        notification.success({
                            message: 'Success!',
                            description:
                                'Lines are succesfully scheduled to be restored.',
                        });
                    }
                } else {
                    // display error if there is a problem while fetching due amount
                    const {
                        errorMessage,
                        errorDescription,
                    } = constructErrorMessage(data, 'dueAmountFetch');

                    // show error message
                    notification.error({
                        message: errorMessage,
                        description: errorDescription,
                    });
                }

                // unsubscribe from message bus
                MessageBus.unsubscribe(subscriptionId);
            }
            if (isFailure) {
                // Disable loading state of restore button
                setOneStepRestoreButtonLoading(false);

                // construct error message
                const {
                    errorMessage,
                    errorDescription,
                } = constructErrorMessage(response.data, 'bulkResume');

                // show error modal on error
                notification.error({
                    message: errorMessage,
                    description: errorDescription,
                });

                // unsubscribe from events
                MessageBus.unsubscribe(subscriptionId);
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
                ctnList: rawSelectedRows.map((rowData) => {
                    return {
                        ctn: rowData.telephoneNumber,
                    };
                }),
                // reason: values.reason,
                // feeOnly: true,
            };

            // get datasource and workflow details
            // init workflow
            const registrationId = `${workflow}`;
            MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
                header: {
                    registrationId: registrationId,
                    workflow,
                    eventType: 'INIT',
                },
            });

            // subscribe to workflow
            MessageBus.subscribe(
                registrationId,
                'WF.'.concat(workflow).concat('.STATE.CHANGE'),
                handleBulkResumeResponse(successStates, errorStates)
            );

            // replace accountId with BAN in URL config
            const baseUri = datasources[datasource].baseUri.replace(
                '{accountId}',
                ban.toString()
            );
            const url = datasources[datasource].url.replace(
                '{accountId}',
                ban.toString()
            );

            // submit call
            MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
                header: {
                    registrationId: registrationId,
                    workflow,
                    eventType: 'SUBMIT',
                },
                body: {
                    // datasource: datasources[datasource],
                    datasource: {
                        ...datasources[datasource],
                        baseUri,
                        url,
                    },
                    request: {
                        body: {
                            ...apiPayload,
                        },
                    },
                    responseMapping,
                },
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
                            ctnList: rawSelectedRows.map((rowData) => {
                                return {
                                    ctn: rowData.telephoneNumber,
                                };
                            }),
                            reason: values.reason,
                            feeOnly: false,
                        },
                        successStates: successStates,
                        errorStates: errorStates,
                        responseMapping: responseMapping,
                    },
                },
            },
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
            restoreLostStolenReason: '',
        });
    };

    const checkOneStepResumeClick = () => {
        if (values.reason !== undefined && values.reason !== '') {
            // call handleOneStepResumeClick when reason is selected
            handleOneStepResumeClick();
        } else {
            // if reason is not selected -> show error to select a reason
            const { errorMessage, errorDescription } = constructErrorMessage(
                values,
                'reasonNotSelected'
            );

            notification.error({
                message: errorMessage,
                description: errorDescription,
            });
        }
    };

    return (
        <>
            <div className="row--dropdown-info">
                {childrenArray[0] !== undefined ? (
                    <LabelWrapper label="Subscriber IMEI">
                        {React.cloneElement(childrenArray[0], {
                            parentProps: props,
                        })}
                    </LabelWrapper>
                ) : (
                    <LabelWrapper label="Subscriber Phone Number">
                        <p className="numbers-display">{phoneNumbers}</p>
                    </LabelWrapper>
                )}

                <LabelWrapper label="Current Status">
                    <p>{status}</p>
                </LabelWrapper>
                <StatusDropdown
                    options={statusOptions}
                    onChange={handleOptionChange(
                        'status',
                        setValues,
                        setStatus,
                        selectedRowsData,
                        customerAdditionalInfoSubscribers
                    )}
                    disabled={
                        status === 'None Selected' || statusOptions.length === 0
                    }
                    styles={{ width: 250 }}
                />
                <ReasonDropdown
                    options={reasonOptions}
                    onChange={handleOptionChange(
                        'reason',
                        setValues,
                        setStatus,
                        selectedRowsData,
                        customerAdditionalInfoSubscribers
                    )}
                    disabled={
                        status === 'None Selected' ||
                        reasonOptions.length === 0 ||
                        values.status === ''
                    }
                    styles={{ width: 250 }}
                />
                {showDateToggleDropdown && (
                    <>
                        <br />
                        <DateDropdown
                            options={dateToggleOptions}
                            onChange={handleOptionChange(
                                'dateToggle',
                                setValues,
                                setStatus,
                                selectedRowsData,
                                customerAdditionalInfoSubscribers
                            )}
                            styles={{ width: 250 }}
                        />
                    </>
                )}
                {showRestoreLostStolenDropdown && (
                    <>
                        <br />
                        <RestoreLostStolenDropdown
                            label={values.status}
                            options={restoreLostStolenDropdownOptions}
                            onChange={handleOptionChange(
                                'restoreLostStolenReason',
                                setValues,
                                setStatus,
                                selectedRowsData,
                                customerAdditionalInfoSubscribers
                            )}
                            styles={{ width: 250 }}
                        />
                    </>
                )}
                <Tooltip
                    placement="topLeft"
                    title={
                        bulkResumeFlag?.reasons &&
                        bulkResumeFlag?.reasons?.length > 0
                            ? bulkResumeFlag?.reasons[0]
                            : ''
                    }
                >
                    <div className="one-step-resume-container">
                        <Button
                            type="primary"
                            disabled={disableOneStepResumeButton}
                            onClick={checkOneStepResumeClick}
                            loading={oneStepRestoreButtonLoading}
                        >
                            One Step Resume
                        </Button>
                    </div>
                </Tooltip>
            </div>
            <Modal
                open={showOneStepModal}
                maskClosable={false}
                footer={null}
                closeIcon={<MinusOutlined />}
                onCancel={closeOneStepModal}
            >
                <Title level={5}>Payment Due</Title>
                <Text>
                    Lines are cancelled for non-payment would you like to resume
                    for ${restoreDuesTotal}?
                </Text>
                <div className="one-step-modal-button-container">
                    <Button
                        size="small"
                        type="primary"
                        onClick={confirmOneStepRestore}
                    >
                        Yes
                    </Button>
                    <Button
                        size="small"
                        type="ghost"
                        onClick={closeOneStepModal}
                    >
                        No
                    </Button>
                </div>
            </Modal>
            {showCancelFlowModal && (
                <Modal
                    open={showCancelFlowModal}
                    onCancel={handleCancelFlowModalCancel}
                    onOk={handleCancelFlowModalOk}
                >
                    <div style={{ padding: '32px' }}>
                        You are about to cancel the subscriber including
                        removing any bill balance.
                        <br />
                        Proceeding with cancellation will also remove the
                        current promotion applied on the account/subscriber.
                        <br />
                        Do you want to continue?
                    </div>
                </Modal>
            )}
        </>
    );
};

export default Dropdown;
