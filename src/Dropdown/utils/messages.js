const EXCLUDED_ERROR_CODES = ['UNKNOWN_SOURCE_ERROR_CODE', 'DEV_MODE_MESSAGE'];
/**
 * This function is used to construct the error message to display in
 * the component. This function is customized for the one-step restore functionality.
 * @param {any} errorMessageData - The error message from the API response.
 * @param {('bulkResume'|'defaultChangeSub'|'dueAmountFetch'|'reasonNotSelected')} opType - The allowed operation types.
 */
export const constructErrorMessage = (errorMessageData, opType) => {
    // default error messages
    let errorMessage = 'Error!';
    let errorDescription = 'Invalid Request!';

    const { message, causedBy, results } = errorMessageData;

    if (opType === 'bulkResume') {
        if (message !== undefined && causedBy !== undefined) {
            // set message as data from API
            errorMessage = message;

            // construct description
            if (causedBy.length > 0) {
                errorDescription = causedBy
                    .map((errorObj) =>
                        !EXCLUDED_ERROR_CODES.includes(errorObj.code)
                            ? errorObj.message
                            : ''
                    )
                    .join(' ');
            }
        }
    }

    if (opType === 'defaultChangeSub') {
        if (results !== undefined && results.length > 0) {
            errorDescription = results
                .map((errorObj) => errorObj.description)
                .join(' ');
        }
    }

    if (opType === 'dueAmountFetch') {
        errorDescription =
            'An error occured while fetching the due amount to be paid, please retry after some time!';
    }

    if (opType === 'reasonNotSelected') {
        errorDescription = "Please select a 'Reason' to retore the lines!";
    }

    return { errorMessage, errorDescription };
};
