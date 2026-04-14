import { Networks } from "@/app/lib/mainsail";
import { URLBuilder } from "@ardenthq/arkvault-url";
import { isValidUrl } from "@/utils/url-validation";
import { urlSearchParameters } from "@/domains/transaction/hooks/use-transaction-url";
import { SendTransferStep } from "./SendTransfer.contracts";
import { toasts } from "@/app/services";

export const getFeeType = (numberOfRecipients: number): "multiPayment" | "transfer" =>
	numberOfRecipients > 1 ? "multiPayment" : "transfer";

export const parseQRCodeUrl = (url: string, network?: Networks.Network): URLSearchParams => {
	let uri = url;

	if (!isValidUrl(url)) {
		const urlBuilder = new URLBuilder();
		urlBuilder.setNethash(network?.meta().nethash);
		uri = urlBuilder.generateTransfer(url);
	}

	return urlSearchParameters(uri);
};

export const isSendTransferNextDisabled = ({
	activeTab,
	network,
	isDirty,
	isValid,
}: {
	activeTab: number;
	network?: Networks.Network;
	isDirty: boolean;
	isValid: boolean;
}): boolean => {
	if (activeTab === SendTransferStep.NetworkStep && typeof network?.isLive === "function") {
		return false;
	}

	if (!isDirty) {
		return true;
	}

	return !isValid;
};

export const handleQRCodeReadError = (t: (key: string, options?: Record<string, any>) => string): void => {
	toasts.error(t("TRANSACTION.VALIDATION.INVALID_QR_REASON", { reason: t("TRANSACTION.INVALID_URL") }));
};
