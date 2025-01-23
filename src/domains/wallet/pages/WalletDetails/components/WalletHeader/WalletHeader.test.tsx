import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";

import { WalletHeader } from "./WalletHeader";
import * as envHooks from "@/app/hooks/env";
import { env, getDefaultProfileId, render, renderResponsiveWithRoute, screen, waitFor } from "@/utils/testing-library";
import { expect } from "vitest";
import { userEvent } from "@testing-library/user-event";

const history = createHashHistory();

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let votes: Contracts.VoteRegistryItem[];
let walletUrl: string;

describe("WalletHeader", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");
		votes = wallet.voting().current();

		await wallet.synchroniser().votes();
		await wallet.synchroniser().identity();
		await wallet.synchroniser().coin();

		vi.spyOn(envHooks, "useActiveProfile").mockReturnValue(profile);

		walletUrl = `/profiles/${profile.id()}/wallets/${wallet.id()}`;

		history.push(walletUrl);
	});

	it("should render", async () => {
		renderResponsiveWithRoute(
			<WalletHeader
				profile={profile}
				wallet={wallet}
				votes={votes}
				isLoadingVotes={false}
				handleVotesButtonClick={vi.fn()}
				isUpdatingTransactions={false}
			/>,
			{
				history,
				route: walletUrl,
			},
		);

		await expect(screen.findByText(wallet.address())).resolves.toBeVisible();
	});

	it("should re-sync wallet", async () => {
		const onUpdate = vi.fn();
		renderResponsiveWithRoute(
			<WalletHeader
				profile={profile}
				wallet={wallet}
				votes={votes}
				isLoadingVotes={false}
				handleVotesButtonClick={vi.fn()}
				isUpdatingTransactions={false}
				onUpdate={onUpdate}
			/>,
			{
				history,
				route: walletUrl,
			},
		);

		await expect(screen.findByText(wallet.address())).resolves.toBeVisible();
		expect(screen.getByTestId("WalletHeader__refresh")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("WalletHeader__refresh"));

		await waitFor(() => {
			expect(onUpdate).toHaveBeenCalled();
		});
	});

	it("should render empty votes section if no votes are available", async () => {
		renderResponsiveWithRoute(
			<WalletHeader
				profile={profile}
				wallet={wallet}
				votes={[]}
				isLoadingVotes={false}
				handleVotesButtonClick={vi.fn()}
				isUpdatingTransactions={false}
			/>,
			{
				history,
				route: walletUrl,
			},
		);

		await expect(screen.getByTestId("EmptyVotes")).toBeVisible();
	});

	it("should show addresses panel when address clicked", async () => {
		render(
			<WalletHeader
				profile={profile}
				wallet={wallet}
				votes={votes}
				isLoadingVotes={false}
				handleVotesButtonClick={vi.fn()}
				isUpdatingTransactions={false}
			/>,
			{
				history,
				route: walletUrl,
			},
		);

		await expect(screen.findByText(wallet.address())).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ShowAddressesPanel"));

		await expect(screen.findByTestId("AddressesSidePanel")).resolves.toBeVisible();
	});

	it("should show addresses panel when enter key pressed", async () => {
		render(
			<WalletHeader
				profile={profile}
				wallet={wallet}
				votes={votes}
				isLoadingVotes={false}
				handleVotesButtonClick={vi.fn()}
				isUpdatingTransactions={false}
			/>,
			{
				history,
				route: walletUrl,
			},
		);

		await expect(screen.findByText(wallet.address())).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("ShowAddressesPanel"), "{Enter}");

		await expect(screen.findByTestId("AddressesSidePanel")).resolves.toBeVisible();
	});

	it("should close the addresses panel when close button clicked", async () => {
		render(
			<WalletHeader
				profile={profile}
				wallet={wallet}
				votes={votes}
				isLoadingVotes={false}
				handleVotesButtonClick={vi.fn()}
				isUpdatingTransactions={false}
			/>,
			{
				history,
				route: walletUrl,
			},
		);

		await expect(screen.findByText(wallet.address())).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ShowAddressesPanel"));

		await expect(screen.findByTestId("AddressesSidePanel")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SidePanel__close-button"));

		await waitFor(() => expect(screen.queryByTestId("AddressesSidePanel")).not.toBeInTheDocument());
	});

	it("should delete wallet", async () => {
		render(
			<WalletHeader
				profile={profile}
				wallet={wallet}
				votes={votes}
				isLoadingVotes={false}
				handleVotesButtonClick={vi.fn()}
				isUpdatingTransactions={false}
			/>,
			{
				history,
				route: walletUrl,
			},
		);

		await expect(screen.findByText(wallet.address())).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ShowAddressesPanel"));

		await expect(screen.findByTestId("AddressesSidePanel")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ManageAddresses"));

		const deleteButtonId = `AddressRow--delete-${profile.wallets().first().address()}`;

		await userEvent.click(screen.getByTestId(deleteButtonId));

		const count = profile.wallets().count();

		await userEvent.click(screen.getByTestId("ConfirmDelete"));

		await waitFor(() => expect(profile.wallets().count()).toBe(count - 1));
	});
});
