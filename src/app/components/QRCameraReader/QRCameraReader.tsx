import React from "react";
import { QrReader } from "react-qr-reader";

interface QRCameraReaderProperties {
	onError: (error: Error) => void;
	onRead: (text: string) => void;
	onReady: () => void;
}

export const QRCameraReader = ({ onError, onRead, onReady }: QRCameraReaderProperties) => (
	<QrReader
		className="h-full w-full"
		videoContainerStyle={{ height: "100%", paddingTop: 0, width: "100%" }}
		videoStyle={{ objectFit: "cover" }}
		constraints={{ facingMode: "environment" }}
		onResult={(result?: any, error?: Error | null) => {
			onReady();

			if (error) {
				return onError(error);
			}

			if (result?.text) {
				return onRead(result.text);
			}
		}}
	/>
);
