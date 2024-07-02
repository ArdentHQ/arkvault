import React from "react";

import { render } from "@/utils/testing-library";

import { QRCameraReader } from "./QRCameraReader";

vi.mock("react-qr-reader", () => ({
	QrReader: ({ onResult }: { onResult: (result: any, error?: Error) => void }) => {
		if (onResult) {
			onResult(undefined, new Error("some generic error"));
		}

		return null;
	},
}));

describe("QRCameraReader Generic Read Error", () => {
	it("should render and emit generic error", () => {
		const onError = vi.fn();

		const { asFragment } = render(<QRCameraReader onError={onError} onRead={vi.fn()} onReady={vi.fn()} />);

		expect(asFragment()).toMatchSnapshot();
		expect(onError).toHaveBeenCalledWith(new Error("some generic error"));
	});
});
