import React from "react";
import QrScanner from "qr-scanner";

import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { useTranslation } from "react-i18next";
import { useFiles } from "@/app/hooks/use-files";

interface QRFileUploadProperties {
	onError?: (error: Error) => void;
	onRead?: (text: string) => void;
}

export const QRFileUpload = ({ onError, onRead }: QRFileUploadProperties) => {
	const { t } = useTranslation();
	const { showOpenDialog } = useFiles();

	const handeQrFileScan = async () => {
		try {
			const file = await showOpenDialog({});

			if (!file) {
				return;
			}

			const { data } = await QrScanner.scanImage(file, { returnDetailedScanResult: true });

			onRead?.(data);
		} catch (error) {
			if (error.name === "AbortError") {
				return;
			}

			onError?.(new Error("InvalidQR"));
		}
	};

	return (
		<Button
			variant="secondary"
			theme="dark"
			className="z-20 space-x-2"
			onClick={handeQrFileScan}
			data-testid="QRFileUpload__upload"
		>
			<Icon name="ArrowUpBracket" />
			<span>{t("TRANSACTION.MODAL_QR_CODE.UPLOAD")}</span>
		</Button>
	);
};
