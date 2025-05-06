import { Contracts } from "@/app/lib/profiles";
import { screen } from "@testing-library/react";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { WalletActionsModals } from "./WalletActionsModals";
import * as envHooks from "@/app/hooks/env";
import { env, getMainsailProfileId, render, syncValidators } from "@/utils/testing-library";

const dashboardURL = `/profiles/${getMainsailProfileId()}/dashboard`;
const history = createHashHistory();

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

	beforeEach(() => {
		history.push(dashboardURL);
	});

	it("should render `receive-funds` modal", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletActionsModals wallets={[wallet]} activeModal={"receive-funds"} setActiveModal={setActiveModal} />
			</Route>,
			{
				history,
			},
		);

		await expect(screen.findByTestId("ReceiveFunds__toggle")).resolves.toBeInTheDocument();
		await expect(screen.findByTestId("ReceiveFunds__Name_Address")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `wallet-name` modal", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletActionsModals wallets={[wallet]} activeModal={"wallet-name"} setActiveModal={setActiveModal} />
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();
		await expect(screen.findByTestId("UpdateWalletName__input")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `delete-wallet` modal", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletActionsModals wallets={[wallet]} activeModal={"delete-wallet"} setActiveModal={setActiveModal} />
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("DeleteResource__submit-button")).toBeInTheDocument();
		await expect(screen.findByTestId("SelectAddress__wrapper")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});

	it("should render `transaction-history` modal", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletActionsModals
					wallets={[wallet]}
					activeModal={"transaction-history"}
					setActiveModal={setActiveModal}
				/>
			</Route>,
			{
				history,
			},
		);

		await expect(screen.findByTestId("TransactionExportForm")).resolves.toBeInTheDocument();

		expect(asFragment).toMatchSnapshot();
	});
});
