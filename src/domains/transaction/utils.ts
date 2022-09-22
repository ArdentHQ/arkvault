import { Services } from "@ardenthq/sdk";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";

export const isNoDeviceError = (error: any) => {
	if (!error) {
		return false;
	}

	if (String(error).includes("no device found")) {
		return true;
	}

	return false;
};

export const isRejectionError = (error: any) => String(error).includes("Condition of use not satisfied");

export const handleBroadcastError = ({ errors }: Services.BroadcastResponse) => {
	const allErrors = Object.values(errors);

	if (allErrors.length === 0) {
		return;
	}

	throw new Error(allErrors[0]);
};

export const getTransferType = ({ recipients }: { recipients: RecipientItem[] }): "multiPayment" | "transfer" => {
	const isMultiPayment = recipients.length > 1;
	return isMultiPayment ? "multiPayment" : "transfer";
};

export const withAbortPromise =
	(signal?: AbortSignal, callback?: () => void) =>
	<T>(promise: Promise<T>) =>
		new Promise<T>((resolve, reject) => {
			if (signal) {
				signal.addEventListener("abort", () => {
					callback?.();
					reject("ERR_ABORT");
				});
			}

			return promise.then(resolve).catch(reject);
		});
