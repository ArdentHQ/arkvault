import React from "react";

import { QRCameraReader } from "./QRCameraReader";
import { render } from "@/utils/testing-library";

vi.mock("react-qr-reader", () => ({
	QrReader: ({ onResult }: { onResult: (result: any) => void }) => {
		if (onResult) {
			onResult({ text: "qrstring" });
		}

		return null;
	},
}));

describe("QRCameraReader", () => {
	it("should render and read qr code", () => {
		const onRead = vi.fn();

		const { asFragment } = render(<QRCameraReader onError={vi.fn()} onRead={onRead} onReady={vi.fn()} />);

		expect(asFragment()).toMatchSnapshot();
		expect(onRead).toHaveBeenCalledWith("qrstring");
	});
});
