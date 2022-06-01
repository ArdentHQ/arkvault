/* eslint-disable @typescript-eslint/require-await */
import { Networks } from "@payvo/sdk";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ReceiveFunds } from "./ReceiveFunds";
import { env, getDefaultProfileId, getDefaultWalletId, render, screen, waitFor } from "@/utils/testing-library";

let network: Networks.Network;

describe("ReceiveFunds", () => {
	beforeEach(() => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const wallet = profile.wallets().findById(getDefaultWalletId());
		network = wallet.network();
	});

	it("should render without a wallet name", async () => {
		const { asFragment } = render(<ReceiveFunds address="abc" network={network} />);

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__name")).toHaveLength(0));
		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__address")).toHaveLength(1));
		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__qrcode")).toHaveLength(1));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should not render qrcode without an address", async () => {
		// @ts-ignore
		const { asFragment } = render(<ReceiveFunds network={network} />);

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__name")).toHaveLength(0));
		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__address")).toHaveLength(1));
		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__qrcode")).toHaveLength(0));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with a wallet name", async () => {
		const { asFragment } = render(<ReceiveFunds address="abc" name="My Wallet" network={network} />);

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__name")).toHaveLength(1));
		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__address")).toHaveLength(1));
		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__qrcode")).toHaveLength(1));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle close", async () => {
		const onClose = jest.fn();

		render(<ReceiveFunds address="abc" name="My Wallet" network={network} onClose={onClose} />);

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__name")).toHaveLength(1));
		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__address")).toHaveLength(1));
		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__qrcode")).toHaveLength(1));

		userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should open qr code form", async () => {
		render(<ReceiveFunds address="abc" name="My Wallet" network={network} />);

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__name")).toHaveLength(1));
		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__address")).toHaveLength(1));
		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__qrcode")).toHaveLength(1));

		userEvent.click(screen.getByTestId("ReceiveFunds__toggle"));

		await waitFor(() => expect(screen.getByTestId("ReceiveFundsForm__amount")).not.toHaveValue());
		await waitFor(() => expect(screen.getByTestId("ReceiveFundsForm__memo")).not.toHaveValue());
	});
});
