import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";

import { LedgerWaitingDevice } from "./LedgerWaitingDevice";
import { useLedgerContext } from "@/app/contexts/Ledger/Ledger";
import { mockNanoXTransport, render, screen, waitFor } from "@/utils/testing-library";

describe("LedgerWaitingDevice", () => {
	it("should call the onClose callback if given", async () => {
		const onClose = vi.fn();

		render(<LedgerWaitingDevice isOpen={true} onClose={onClose} />);

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(onClose).toHaveBeenCalledWith();
	});

	it("should emit true when devices is available", async () => {
		const onDeviceAvailable = vi.fn();

		const nanoXTransportMock = mockNanoXTransport();

		const Component = () => {
			const { listenDevice } = useLedgerContext();

			useEffect(() => {
				listenDevice();
			}, []);

			return <LedgerWaitingDevice isOpen={true} onDeviceAvailable={onDeviceAvailable} />;
		};

		render(<Component />);

		await waitFor(() => expect(onDeviceAvailable).toHaveBeenCalledWith(true));

		nanoXTransportMock.mockReset();
	});

	it("should render with custom subtitle", () => {
		const subtitle = "Connect your Ledger Nano S and confirm input";
		render(<LedgerWaitingDevice isOpen={true} subtitle={subtitle} />);

		expect(screen.getByText(subtitle)).toBeInTheDocument();
	});
});
