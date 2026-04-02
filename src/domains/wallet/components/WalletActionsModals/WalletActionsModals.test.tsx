import { Contracts } from "@/app/lib/profiles";
import { screen, waitFor } from "@testing-library/react";
import React from "react";
import { WalletActionsModals } from "./WalletActionsModals";
import * as envHooks from "@/app/hooks/env";
import { env, getMainsailProfileId, render, syncValidators } from "@/utils/testing-library";
import userEvent from "@testing-library/user-event";
import { expect } from "vitest";

describe("WalletActionsModals", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	const setActiveModal = vi.fn();

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		wallet = profile.wallets().first();

		await syncValidators(profile);

		vi.spyOn(envHooks, "useActiveProfile").mockReturnValue(profile);
	});

	it("should render `receive-funds` modal", async () => {
		const { asFragment } = render(
			<WalletActionsModals wallets={[wallet]} activeModal={"receive-funds"} setActiveModal={setActiveModal} />,
		);

		await expect(screen.findByTestId("ReceiveFunds__toggle")).resolves.toBeInTheDocument();
		await expect(screen.findByTestId("ReceiveFunds__Name_Address")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `wallet-name` modal", async () => {
		const { asFragment } = render(
			<WalletActionsModals wallets={[wallet]} activeModal={"wallet-name"} setActiveModal={setActiveModal} />,
		);

		expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();
		await expect(screen.findByTestId("UpdateWalletName__input")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should trigger `onUpdateWallet`", async () => {
		const onUpdateWalletMock = vi.fn();
		const setActiveModalMock = vi.fn();

		render(
			<WalletActionsModals
				wallets={[wallet]}
				activeModal={"wallet-name"}
				onUpdateWallet={onUpdateWalletMock}
				setActiveModal={setActiveModalMock}
			/>,
		);

		const walletInputName = "UpdateWalletName__input";

		const getInput = screen.getByTestId(walletInputName);

		expect(getInput).toBeInTheDocument();

		const user = userEvent.setup();
		await user.clear(getInput);
		await user.paste("hello-123");

		await user.click(screen.getByTestId("UpdateWalletName__submit"));

		expect(onUpdateWalletMock).toHaveBeenCalled();
		expect(setActiveModalMock).toHaveBeenCalled();
	});

	it("should render `delete-wallet` modal", async () => {
		const { asFragment } = render(
			<WalletActionsModals wallets={[wallet]} activeModal={"delete-wallet"} setActiveModal={setActiveModal} />,
		);

		expect(screen.getByTestId("DeleteResource__submit-button")).toBeInTheDocument();
		await expect(screen.findByTestId("SelectAddress__wrapper")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `transaction-history` modal", async () => {
		const { asFragment } = render(
			<WalletActionsModals
				wallets={[wallet]}
				activeModal={"transaction-history"}
				setActiveModal={setActiveModal}
			/>,
		);

		await expect(screen.findByTestId("TransactionExportForm")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});
});
