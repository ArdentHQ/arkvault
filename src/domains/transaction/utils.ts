import { Services } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { TFunction } from "i18next";

export const DISPLAY_DECIMALS = 8;

export const isNullAddress = (address: string) =>
	address.toLowerCase() === "0x0000000000000000000000000000000000000000";

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

export const getTransferType = ({
	recipients,
}: {
	recipients: RecipientItem[];
}): "multiPayment" | "transfer" | "transferToken" => (recipients.length > 1 ? "multiPayment" : "transfer");

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
		return t("TRANSACTION.FORM_STEP.DESCRIPTION_SELECT_WALLET");
	}

	if (wallet.isLedger()) {
		return t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_LEDGER");
	}

	if (wallet.actsWithSecret()) {
		return t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_SECRET");
	}

	return wallet.signingKey().exists()
		? t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_ENCRYPTION_PASSWORD")
		: t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_MNEMONIC");
};

export const handleOnMountChange = ({
	mounted,
	setMounted,
	setActiveTab,
	setErrorMessage,
}: {
	mounted: boolean;
	setMounted: (value: boolean) => void;
	setActiveTab: (step: number) => void;
	setErrorMessage: (error: string | undefined) => void;
}) => {
	setMounted(mounted);

	if (!mounted) {
		setActiveTab(1);
		setErrorMessage(undefined);
	}
};

export const getAuthenticationStepTitleIcon = ({
	wallet,
}: {
	wallet?: Contracts.IReadWriteWallet;
}): { lightIcon: string; darkIcon: string; dimIcon: string; dimensions: number[] } | null => {
	if (!wallet?.isLedger()) {
		return null;
	}

	return {
		darkIcon: "LedgerDark",
		dimIcon: "LedgerDim",
		dimensions: [24, 24],
		lightIcon: "LedgerLight",
	};
};
