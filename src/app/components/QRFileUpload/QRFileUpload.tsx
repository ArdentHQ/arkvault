import React from "react";
import QRScanner from "qr-scanner";

import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { useFiles } from "@/app/hooks/use-files";
import { useBreakpoint } from "@/app/hooks";

interface QRFileUploadProperties {
	onError: (error: Error) => void;
	onRead: (text: string) => void;
}

export const QRFileUpload = ({ onError, onRead }: QRFileUploadProperties) => {
	const { t } = useTranslation();
	const { showOpenDialog } = useFiles();
	const { isSmAndAbove } = useBreakpoint();

	const handeQRFileScan = async () => {
		try {
			const file = await showOpenDialog({});

			if (!file) {
				return;
			}

			const { data } = await QRScanner.scanImage(file, { returnDetailedScanResult: true });

			onRead(data);
		} catch (error) {
			if (error.name === "AbortError") {
				return;
			}

			onError(new Error("InvalidQR"));
		}
	};

	return (
		<Button
			variant="secondary"
			theme={isSmAndAbove ? "dark" : "light"}
			className="z-20 space-x-2"
			onClick={handeQRFileScan}
			data-testid="QRFileUpload__upload"
		>
			<Icon name="ArrowUpBracket" />
			<span>{t("TRANSACTION.MODAL_QR_CODE.UPLOAD")}</span>
		</Button>
	);
};
