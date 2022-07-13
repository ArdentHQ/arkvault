import React from "react";

import { render, screen } from "@/utils/testing-library";
import { QRCameraReader } from "./QRCameraReader";

jest.mock("react-qr-reader", () => ({
	QrReader: ({ ViewFinder, onResult }: { ViewFinder: React.FC; onResult: (result: any) => void }) => {
		if (onResult) {
			onResult(undefined, new Error("some generic error"));
		}

		return (
			<div>
				<ViewFinder />
			</div>
		);
	},
}));

describe("QRCameraReader Generic Read Error", () => {
	it("should render and emit generic error", () => {
		const onError = jest.fn();

		const { asFragment } = render(<QRCameraReader onError={onError} />);

		expect(screen.getByTestId("ViewFinder")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
		expect(onError).toHaveBeenCalledWith(new Error("some generic error"));
	});
});
