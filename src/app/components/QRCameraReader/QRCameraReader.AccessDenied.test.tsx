import React from "react";

import { render, screen } from "@/utils/testing-library";
import { QRCameraReader } from "./QRCameraReader";

jest.mock("react-qr-reader", () => ({
	QrReader: ({ ViewFinder, onResult }: { ViewFinder: React.FC; onResult: (result: any) => void }) => {
		if (onResult) {
			onResult(undefined, new Error("NotAllowedError"));
		}

		return (
			<div>
				<ViewFinder />
			</div>
		);
	},
}));

describe("QRCameraReader Access Denied", () => {
	it("should render and emit access denied callback", () => {
		const onCameraAccessDenied = jest.fn();

		const { asFragment } = render(<QRCameraReader onCameraAccessDenied={onCameraAccessDenied} />);

		expect(screen.getByTestId("ViewFinder")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
		expect(onCameraAccessDenied).toHaveBeenCalledWith();
	});
});
