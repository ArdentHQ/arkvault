import React from "react";

import { QRCameraReader } from "./QRCameraReader";
import { render } from "@/utils/testing-library";

vi.mock("react-qr-reader", () => ({
	QrReader: ({ onResult }: { onResult: (result: any) => void }) => {
		if (onResult) {
			onResult({});
		}

		return null;
	},
}));

describe("QRCameraReader Idle", () => {
	it("should render and wait for qr code", () => {
		const onError = vi.fn();
		const onRead = vi.fn();

		const { asFragment } = render(<QRCameraReader onError={onError} onRead={onRead} onReady={vi.fn()} />);

		expect(asFragment()).toMatchSnapshot();

		expect(onError).not.toHaveBeenCalled();
		expect(onRead).not.toHaveBeenCalled();
	});
});
