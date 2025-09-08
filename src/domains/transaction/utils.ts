import { DTO, Services } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { TFunction } from "i18next";

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

export const getTransferType = ({ recipients }: { recipients: RecipientItem[] }): "multiPayment" | "transfer" =>
	recipients.length > 1 ? "multiPayment" : "transfer";

export const isContractTransaction = (transaction: DTO.RawTransactionData) =>
	[
		transaction.isValidatorRegistration(),
		transaction.isValidatorResignation(),
		transaction.isVote(),
		transaction.isUnvote(),
		transaction.isUsernameRegistration(),
		transaction.isUsernameResignation(),
	].some(Boolean);

/**
 * Contract deployment is appearing as transfer without recipient.
 */
export const isContractDeployment = (transaction: DTO.RawTransactionData) =>
	[!isContractTransaction(transaction), !transaction.to()].every(Boolean);

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

/*
 * Get subtitle for authentication step
 */
export const getAuthenticationStepSubtitle = ({ wallet, t }: { wallet?: Contracts.IReadWriteWallet; t: TFunction }) => {
	if (!wallet) {
		return t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_SELECT_WALLET");
	}

	if (wallet.isLedger()) {
		return t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_LEDGER");
	}

	if (wallet.actsWithSecret()) {
		return t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_SECRET");
	}

	return wallet.signingKey().exists()
		? t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_ENCRYPTION_PASSWORD")
		: t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_MNEMONIC");
};
