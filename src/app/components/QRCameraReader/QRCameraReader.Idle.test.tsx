import React from "react";

import { render, screen } from "@/utils/testing-library";
import { QRCameraReader } from "./QRCameraReader";

jest.mock("react-qr-reader", () => ({
	QrReader: ({ ViewFinder, onResult }: { ViewFinder: React.FC; onResult: (result: any) => void }) => {
		if (onResult) {
			onResult({});
		}

		return (
			<div>
				<ViewFinder />
			</div>
		);
	},
}));

describe("QRCameraReader Idle", () => {
	it("should render and wait for qr code", () => {
		const onError = jest.fn();
		const onCameraAccessDenied = jest.fn();
		const onQRRead = jest.fn();

		const { asFragment } = render(
			<QRCameraReader onError={onError} onQRRead={onQRRead} onCameraAccessDenied={onCameraAccessDenied} />,
		);

		expect(screen.getByTestId("ViewFinder")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		expect(onError).not.toHaveBeenCalled();
		expect(onCameraAccessDenied).not.toHaveBeenCalled();
		expect(onQRRead).not.toHaveBeenCalled();
	});
});
