import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";
import { expect } from "vitest";
import { AddressesSidePanel } from "./AddressesSidePanel";
import userEvent from "@testing-library/user-event";

describe("AddressesSidePanel", () => {
	let profile: Contracts.IProfile;
	let wallets: Contracts.IWalletRepository;

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);

		await profile.sync();

		wallets = profile.wallets();
	});

	it("should render", () => {
		render(
			<AddressesSidePanel
				wallets={wallets}
				selectedAddresses={[]}
				open={true}
				onSelectedAddressesChange={vi.fn()}
				onOpenChange={vi.fn()}
				onDeleteAddress={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("AddressesSidePanel")).toBeInTheDocument();
		expect(screen.getAllByTestId("AddressRow").length).toBe(wallets.count());
	});

	it("should select an address when AddressRow is clicked", async () => {
		const onSelectedAddressChange = vi.fn();

		render(
			<AddressesSidePanel
				wallets={wallets}
				selectedAddresses={[]}
				open={true}
				onSelectedAddressesChange={onSelectedAddressChange}
				onOpenChange={vi.fn()}
				onDeleteAddress={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getAllByTestId("AddressRow")[0]);

		expect(onSelectedAddressChange).toHaveBeenCalledWith([wallets.first().address()]);
	});

	it("should show delete buttons when `manage` clicked", async () => {
		render(
			<AddressesSidePanel
				wallets={wallets}
				selectedAddresses={[]}
				open={true}
				onSelectedAddressesChange={vi.fn()}
				onOpenChange={vi.fn()}
				onDeleteAddress={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getByTestId("ManageAddresses"));

		expect(screen.getByTestId("CancelDelete")).toBeInTheDocument();
		expect(screen.getByTestId("ConfirmDelete")).toBeInTheDocument();
	});

	it("should delete an address when `done` clicked", async () => {
		const onDelete = vi.fn();
		const onSelectedAddressesChange = vi.fn();

		const firstWallet = wallets.first();
		const addressesExcludingFirstWallet = wallets
			.values()
			.slice(1)
			.map((wallet) => wallet.address());

		render(
			<AddressesSidePanel
				wallets={wallets}
				selectedAddresses={[firstWallet.address(), ...addressesExcludingFirstWallet]}
				open={true}
				onSelectedAddressesChange={onSelectedAddressesChange}
				onOpenChange={vi.fn()}
				onDeleteAddress={onDelete}
			/>,
		);

		// go into delete mode
		await userEvent.click(screen.getByTestId("ManageAddresses"));

		// click on the delete button
		await userEvent.click(screen.getByTestId(`AddressRow--delete-${wallets.first().address()}`));

		// confirm address deletion
		await userEvent.click(screen.getByTestId("ConfirmDelete"));

		expect(onDelete).toHaveBeenCalledWith(wallets.first().address());

		expect(onSelectedAddressesChange).toHaveBeenCalledWith([...addressesExcludingFirstWallet]);

		// should reset back to select mode
		expect(screen.getByTestId("ManageAddresses")).toBeInTheDocument();
	});

	it("should reset delete state when `cancel` clicked", async () => {
		const onDelete = vi.fn();

		render(
			<AddressesSidePanel
				wallets={wallets}
				selectedAddresses={[]}
				open={true}
				onSelectedAddressesChange={vi.fn()}
				onOpenChange={vi.fn()}
				onDeleteAddress={onDelete}
			/>,
		);

		// go into delete mode
		await userEvent.click(screen.getByTestId("ManageAddresses"));

		// click on the delete button
		await userEvent.click(screen.getByTestId(`AddressRow--delete-${wallets.first().address()}`));

		await userEvent.click(screen.getByTestId("CancelDelete"));

		// should reset back to select mode
		expect(screen.getByTestId("ManageAddresses")).toBeInTheDocument();

		expect(onDelete).not.toHaveBeenCalled();
	});

	it("should filter wallets by address", async () => {
		render(
			<AddressesSidePanel
				wallets={wallets}
				selectedAddresses={[]}
				open={true}
				onSelectedAddressesChange={vi.fn()}
				onOpenChange={vi.fn()}
				onDeleteAddress={vi.fn()}
			/>,
		);

		await userEvent.type(screen.getByTestId("AddressesPanel--SearchInput"), wallets.first().address());

		expect(screen.getAllByTestId("AddressRow").length).toBe(1);
	});

	it("should filter wallets by displayName", async () => {
		render(
			<AddressesSidePanel
				wallets={wallets}
				selectedAddresses={[]}
				open={true}
				onSelectedAddressesChange={vi.fn()}
				onOpenChange={vi.fn()}
				onDeleteAddress={vi.fn()}
			/>,
		);

		await userEvent.type(screen.getByTestId("AddressesPanel--SearchInput"), "Wallet 2");

		expect(screen.getAllByTestId("AddressRow").length).toBe(1);
	});
});
