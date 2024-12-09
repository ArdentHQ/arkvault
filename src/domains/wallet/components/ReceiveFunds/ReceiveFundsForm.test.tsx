/* eslint-disable @typescript-eslint/require-await */
import { Networks } from "@ardenthq/sdk";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ReceiveFundsForm } from "./ReceiveFundsForm";
import { env, getDefaultProfileId, getDefaultWalletId, renderWithForm, screen, waitFor } from "@/utils/testing-library";

let network: Networks.Network;

describe("ReceiveFundsForm", () => {
	beforeEach(() => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const wallet = profile.wallets().findById(getDefaultWalletId());
		network = wallet.network();
	});

	it("should render", async () => {
		const { asFragment } = renderWithForm(<ReceiveFundsForm network={network} />);

		await waitFor(() => expect(screen.getByTestId("ReceiveFundsForm__amount")).not.toHaveValue());

		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit amount onChange event", async () => {
		const { asFragment, form } = renderWithForm(<ReceiveFundsForm network={network} />);

		await waitFor(() => expect(screen.getByTestId("ReceiveFundsForm__amount")).not.toHaveValue());

		await userEvent.clear(screen.getByTestId("ReceiveFundsForm__amount"));
		await userEvent.type(screen.getByTestId("ReceiveFundsForm__amount"), "10");

		await waitFor(() => expect(form()?.getValues("amount")).toBe("10"));

		expect(asFragment()).toMatchSnapshot();
	});
});
