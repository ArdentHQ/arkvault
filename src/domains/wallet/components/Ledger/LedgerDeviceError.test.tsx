import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { LedgerDeviceError } from "./LedgerDeviceError";
import { render, screen } from "@/utils/testing-library";

describe("LedgerDeviceError", () => {
	it("should call the onClose callback if given", async () => {
		const onClose = vi.fn();

		render(
			<LedgerDeviceError
				isOpen={true}
				onClose={onClose}
				supportedModel={Contracts.WalletLedgerModel.NanoX}
				connectedModel={Contracts.WalletLedgerModel.NanoS}
			/>,
		);

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(onClose).toHaveBeenCalledWith();
	});

	it("should render with custom subtitle", () => {
		const subtitle = "Connect your Ledger Nano S and confirm input";
		render(
			<LedgerDeviceError
				isOpen={true}
				supportedModel={Contracts.WalletLedgerModel.NanoX}
				connectedModel={Contracts.WalletLedgerModel.NanoS}
				subtitle={subtitle}
			/>,
		);

		expect(screen.getByText(subtitle)).toBeInTheDocument();
	});
});
