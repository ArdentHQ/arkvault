import React from "react";
import { Contracts } from "@/app/lib/profiles";
import { env, getMainsailProfileId, render } from "@/utils/testing-library";
import { expect } from "vitest";
import { AddressesSidePanel } from "./AddressesSidePanel";
import userEvent from "@testing-library/user-event";
import { waitFor, screen } from "@testing-library/react";

const getSearchInput = () => screen.getByTestId("AddressesPanel--SearchInput");

describe("AddressesSidePanel", () => {
	let profile: Contracts.IProfile;
	let wallets: Contracts.IWalletRepository;

	const sidePanelCloseButton = "SidePanel__close-button";

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);

		await profile.sync();

		wallets = profile.wallets();
	});

	it("should render", () => {
		render(
			<AddressesSidePanel
				profile={profile}
				open={true}
				onClose={vi.fn()}
				onOpenChange={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("AddressesSidePanel")).toBeInTheDocument();
		expect(screen.getAllByTestId("AddressRow").length).toBe(wallets.count());
	});

	it("should select an address when AddressRow is clicked", async () => {
		const onClose = vi.fn();

		render(
			<AddressesSidePanel
				profile={profile}
				open={true}
				onClose={onClose}
				onOpenChange={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getAllByTestId("AddressRow")[0]);
		await userEvent.click(screen.getByTestId(sidePanelCloseButton));

		expect(onClose).toHaveBeenCalled();
	});

	it("should select all displayed addresses when `select all` clicked", async () => {
		const onClose = vi.fn();

		render(
			<AddressesSidePanel
				profile={profile}
				open={true}
				onClose={onClose}
				onOpenChange={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getByTestId("SelectAllAddresses"));
		await userEvent.click(screen.getByTestId(sidePanelCloseButton));

		expect(onClose).toHaveBeenCalled();
	});

	it("should switch to delete mode when `manage` clicked", async () => {
		render(
			<AddressesSidePanel
				profile={profile}
				open={true}
				onOpenChange={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getByTestId("ManageAddresses"));

		expect(screen.getByTestId("BackManage")).toBeInTheDocument();
	});

	it("should disable `select all` when delete mode enabled", async () => {
		render(
			<AddressesSidePanel
				profile={profile}
				open={true}
				onOpenChange={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getByTestId("ManageAddresses"));

		expect(screen.getByTestId("SelectAllAddresses_Checkbox")).toBeDisabled();
	});

	it("should reset delete state when `cancel` clicked", async () => {

		render(
			<AddressesSidePanel
				profile={profile}
				open={true}
				onOpenChange={vi.fn()}
			/>,
		);

		// go into delete mode
		await userEvent.click(screen.getByTestId("ManageAddresses"));

		// click on the delete button
		await userEvent.click(screen.getByTestId(`AddressRow--delete-${wallets.first().address()}`));

		await userEvent.click(screen.getByTestId("CancelDelete"));

		// should reset back to select mode
		expect(screen.getByTestId("ManageAddresses")).toBeInTheDocument();
	});

	it("should filter wallets by address", async () => {
		render(
			<AddressesSidePanel
				profile={profile}
				open={true}
				onClose={vi.fn()}
				onOpenChange={vi.fn()}
			/>,
		);

		await userEvent.type(getSearchInput(), wallets.first().address());

		expect(screen.getAllByTestId("AddressRow").length).toBe(1);
	});

	it("should filter wallets by displayName", async () => {
		render(
			<AddressesSidePanel
				profile={profile}
				open={true}
				onClose={vi.fn()}
				onOpenChange={vi.fn()}
			/>,
		);

		await userEvent.type(getSearchInput(), "Mainsail Wallet 1");

		await waitFor(() => {
			expect(getSearchInput()).toHaveValue("Mainsail Wallet 1");
		});

		await waitFor(() => {
			expect(screen.getAllByTestId("AddressRow").length).toBe(1);
		});
	});

	it("should show a hint for `manage` button", async () => {
		const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockReturnValue(undefined);

		render(
			<AddressesSidePanel
				profile={profile}
				open={true}
				onClose={vi.fn()}
				onOpenChange={vi.fn()}
			/>,
		);

		await expect(screen.findByText(/You can manage and remove your addresses here./)).resolves.toBeVisible();

		getItemSpy.mockRestore();
	});

	it("should not show a hint for `manage` button if already shown", async () => {
		const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockReturnValue("1");

		render(
			<AddressesSidePanel
				profile={profile}
				open={true}
				onClose={vi.fn()}
				onOpenChange={vi.fn()}
			/>,
		);

		await waitFor(() => {
			expect(screen.queryByText(/You can manage and remove your addresses here./)).not.toBeInTheDocument();
		});

		getItemSpy.mockRestore();
	});

	it("should persist state for shown `manage` button hint", async () => {
		const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockReturnValue(undefined);

		render(
			<AddressesSidePanel
				profile={profile}
				open={true}
				onClose={vi.fn()}
				onOpenChange={vi.fn()}
			/>,
		);

		await expect(screen.findByText(/You can manage and remove your addresses here./)).resolves.toBeVisible();

		const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

		await userEvent.click(screen.getByTestId("HideManageHint"));

		expect(setItemSpy).toHaveBeenCalledWith("manage-hint", "true");

		setItemSpy.mockRestore();
		getItemSpy.mockRestore();
	});

	it("should deselect an address when AddressRow is clicked", async () => {
		const onClose = vi.fn();

		render(
			<AddressesSidePanel
				profile={profile}
				open={true}
				onClose={onClose}
				onOpenChange={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getAllByTestId("AddressRow")[0]);
		await userEvent.click(screen.getByTestId(sidePanelCloseButton));

		expect(onClose).toHaveBeenCalled();
	});

	it("should toggle between single and multiple view", async () => {
		render(
			<AddressesSidePanel
				profile={profile}
				open={true}
				onClose={vi.fn()}
				onOpenChange={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("tabs__tab-button-single")).toBeInTheDocument();
		await userEvent.click(screen.getByTestId("tabs__tab-button-single"));

		expect(screen.getByTestId("tabs__tab-button-multiple")).toBeInTheDocument();
		await userEvent.click(screen.getByTestId("tabs__tab-button-multiple"));
	});

	it("should select only one address when in single view", async () => {
		const onClose = vi.fn();
		render(
			<AddressesSidePanel
				profile={profile}
				open={true}
				onClose={onClose}
				onOpenChange={vi.fn()}
			/>,
		);

		const singleTabButton = screen.getByTestId("tabs__tab-button-single");
		await userEvent.click(singleTabButton);

		const addressRows = screen.getAllByTestId("AddressRow");
		await userEvent.click(addressRows[0]);

		const closeButton = screen.getByTestId(sidePanelCloseButton);
		await userEvent.click(closeButton);

		expect(onClose).toHaveBeenCalled();
	});

	it("should mark an address for deletion", async () => {
		const onClose = vi.fn();

		render(
			<AddressesSidePanel
				profile={profile}
				open={true}
				onClose={onClose}
				onOpenChange={vi.fn()}
			/>,
		);

		// go into delete mode
		await userEvent.click(screen.getByTestId("ManageAddresses"));

		// click on the delete button
		await userEvent.click(screen.getByTestId(`AddressRow--delete-${wallets.first().address()}`));

		// confirm address deletion
		await userEvent.click(screen.getByTestId("ConfirmDelete"));
		await userEvent.click(screen.getByTestId(sidePanelCloseButton));

		expect(onClose).toHaveBeenCalled();

		// should reset back to select mode
		expect(screen.getByTestId("ManageAddresses")).toBeInTheDocument();
	});

});
