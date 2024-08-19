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
		await waitFor(() => expect(screen.getByTestId("ReceiveFundsForm__memo")).not.toHaveValue());

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

	it("should emit memo onChange event", async () => {
		const { asFragment, form } = renderWithForm(<ReceiveFundsForm network={network} />);
		await waitFor(() => expect(screen.getByTestId("ReceiveFundsForm__memo")).not.toHaveValue());

		await userEvent.clear(screen.getByTestId("ReceiveFundsForm__memo"));
		await userEvent.type(screen.getByTestId("ReceiveFundsForm__memo"), "test");
		await waitFor(() => expect(form()?.getValues("memo")).toBe("test"));
		await waitFor(() => expect(screen.getByTestId("ReceiveFundsForm__memo")).toHaveValue("test"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should not show memo if is not supported by network", async () => {
		const memo = Array.from({ length: 256 }).fill("x").join("");

		const memoMock = vi.spyOn(network, "usesMemo").mockReturnValue(false);

		const { asFragment } = renderWithForm(<ReceiveFundsForm network={network} />, {
			defaultValues: { memo },
		});

		expect(screen.queryByTestId("ReceiveFundsForm__memo")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		memoMock.mockRestore();
	});
});
