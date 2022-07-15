import React from "react";

import { QRCameraReader } from "./QRCameraReader";
import { render, screen } from "@/utils/testing-library";

jest.mock("react-qr-reader", () => ({
	QrReader: ({ onResult }: { onResult: (result: any, error?: Error) => void }) => {
		if (onResult) {
			onResult(undefined, new Error("some generic error"));
		}

		return null;
	},
}));

describe("QRCameraReader Generic Read Error", () => {
	it("should render and emit generic error", () => {
		const onError = jest.fn();

		const { asFragment } = render(
			<QRCameraReader
				onError={onError}
				onRead={jest.fn()}
				onReady={jest.fn()}
			/>,
		);

		expect(asFragment()).toMatchSnapshot();
		expect(onError).toHaveBeenCalledWith(new Error("some generic error"));
	});
});
