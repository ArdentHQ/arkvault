import React from "react";

import { render, screen } from "@/utils/testing-library";
import { QRCameraReader } from "./QRCameraReader";

jest.mock("react-qr-reader", () => ({
	QrReader: ({ ViewFinder, onResult }: { ViewFinder: React.FC; onResult: (result: any) => void }) => {
		if (onResult) {
			onResult({ text: "qrstring" });
		}

		return (
			<div>
				<ViewFinder />
			</div>
		);
	},
}));

describe("QRCameraReader", () => {
	it("should render and read qr code", () => {
		const onQRRead = jest.fn();

		const { asFragment } = render(<QRCameraReader onQRRead={onQRRead} />);

		expect(screen.getByTestId("ViewFinder")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
		expect(onQRRead).toHaveBeenCalledWith("qrstring");
	});
});
