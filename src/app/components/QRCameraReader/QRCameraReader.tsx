import React, { ReactNode } from "react";
import { QrReader } from "react-qr-reader";

interface QRCameraReaderProperties {
	onCameraAccessDenied?: () => void;
	onError?: (error: Error) => void;
	onQRRead?: (qr: string) => void;
}

const ViewFinder = () => (
	<div className="absolute inset-0 border-2 border-theme-secondary-700 dark:border-theme-secondary-500">
		<div className="absolute left-8 right-8 -top-[2px] h-0.5 bg-theme-primary-100 dark:bg-theme-secondary-800"></div>
		<div className="absolute left-8 right-8 -bottom-[2px] h-0.5 bg-theme-primary-100 dark:bg-theme-secondary-800"></div>
		<div className="absolute top-8 bottom-8 -left-[2px] w-0.5 bg-theme-primary-100 dark:bg-theme-secondary-800"></div>
		<div className="absolute top-8 bottom-8 -right-[2px] w-0.5 bg-theme-primary-100 dark:bg-theme-secondary-800"></div>
	</div>
);

export const QRCameraReader = ({ onCameraAccessDenied, onError, onQRRead }: QRCameraReaderProperties) => (
	<QrReader
		videoStyle={{ objectFit: "cover", padding: "6px" }}
		ViewFinder={() => <ViewFinder />}
		constraints={{ facingMode: "environment" }}
		onResult={(result?: any, error?: Error | null) => {
			if (error && error.message === "NotAllowedError") {
				console.log("case1")
				return onCameraAccessDenied?.();
			}

			if (error && !!error.message) {
				console.log("case2", error)
				return onError?.(error);
			}

			if (!!result && result.text) {
				console.log("case3")
				return onQRRead?.(result.text);
			}

			console.log("oooooo");
		}}
	/>
);
