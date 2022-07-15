import React from "react";
import { QrReader } from "react-qr-reader";
import { string } from "yup/lib/locale";

interface QRCameraReaderProperties {
	onCameraAccessDenied: () => void;
	onError: (error: Error) => void;
	onRead: (text: string) => void;
}

const NotAllowedErrors = [
	"Permission denied", // Chrome
	"is not allowed", // Firefox & Safari
];

export const QRCameraReader = ({ onCameraAccessDenied, onError, onRead }: QRCameraReaderProperties) => (
	<QrReader
		className="w-full h-full"
		videoContainerStyle={{ height: "100%", width: "100%", paddingTop: 0 }}
		videoStyle={{ objectFit: "cover" }}
		constraints={{ facingMode: "environment" }}
		onResult={(result?: any, error?: Error | null) => {
			if (error) {
				if (NotAllowedErrors.some((message: string) => message.includes(error.message))) {
					return onCameraAccessDenied();
				}

				if (!!error.message) {
					return onError(error);
				}
			}

			if (result?.text) {
				return onRead(result.text);
			}
		}}
	/>
);
