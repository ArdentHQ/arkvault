interface ErrorWithResponse extends Error {
	response: any;
}

const isInvalidAddressError = (error: ErrorWithResponse) => {
	try {
		return error.response.json().error.message === "Invalid Address";
	} catch {
		return false;
	}
};

const isInvalidRefundAddressError = (error: ErrorWithResponse) => {
	try {
		return error.response.json().error.message === "Invalid Refund Address";
	} catch {
		return false;
	}
};

const isUnavailablePairError = (error: ErrorWithResponse) => {
	try {
		return error.response.json().error.message === "Unavailable Pair";
	} catch {
		return false;
	}
};

export { isInvalidAddressError, isInvalidRefundAddressError, isUnavailablePairError };
