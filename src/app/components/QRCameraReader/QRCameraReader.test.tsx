import React from "react";

import { QRCameraReader } from "./QRCameraReader";
import { render } from "@/utils/testing-library";

jest.mock("react-qr-reader", () => ({
	QrReader: ({ onResult }: { onResult: (result: any) => void }) => {
		if (onResult) {
			onResult({ text: "qrstring" });
		}

		return null;
	},
}));

describe("QRCameraReader", () => {
	it("should render and read qr code", () => {
		const onRead = jest.fn();

		const { asFragment } = render(<QRCameraReader onError={jest.fn()} onRead={onRead} onReady={jest.fn()} />);

		expect(asFragment()).toMatchSnapshot();
		expect(onRead).toHaveBeenCalledWith("qrstring");
	});
});
