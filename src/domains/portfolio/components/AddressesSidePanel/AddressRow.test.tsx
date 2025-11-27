import React from "react";
import { Contracts } from "@/app/lib/profiles";
import { env, getMainsailProfileId, render, renderResponsive, screen } from "@/utils/testing-library";
import { AddressRow } from "./AddressRow";
import { expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";

describe("AddressRow", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);

		await profile.sync();

		wallet = profile.wallets().first();
	});

	it("should render", () => {
		render(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={false}
				toggleAddress={vi.fn()}
				isSelected={false}
				onEdit={vi.fn()}
			/>,
		);

		expect(screen.getByText(wallet.displayName())).toBeInTheDocument();
	});

	it("should render mobile row for `xs` screen", () => {
		renderResponsive(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={false}
				toggleAddress={vi.fn()}
				isSelected={false}
				onEdit={vi.fn()}
			/>,
			"xs",
		);

		expect(screen.getByTestId("MobileAddressRow")).toBeInTheDocument();
	});

	it("should render in delete mode", () => {
		render(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={true}
				toggleAddress={vi.fn()}
				isSelected={false}
				onEdit={vi.fn()}
			/>,
		);

		expect(screen.getByTestId(`AddressRow--delete-${wallet.address()}`)).toBeInTheDocument();
		expect(screen.queryByTestId("AddressRow--checkbox")).not.toBeInTheDocument();
	});

	it("should trigger `onDelete` when delete button clicked", async () => {
		const onDelete = vi.fn();
		render(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={onDelete}
				usesManageMode={true}
				toggleAddress={vi.fn()}
				isSelected={false}
				onEdit={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getByTestId(`AddressRow--delete-${wallet.address()}`));
		expect(onDelete).toHaveBeenCalledWith(wallet.address());
	});

	it("should be checked", () => {
		render(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={false}
				toggleAddress={vi.fn()}
				isSelected={true}
				onEdit={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("AddressRow--checkbox")).toBeChecked();
	});

	it("should trigger `toggleAddress` when checkbox clicked", async () => {
		const toggleAddress = vi.fn();

		render(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={false}
				toggleAddress={toggleAddress}
				isSelected={true}
				onEdit={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getByTestId("AddressRow--checkbox"));
		expect(toggleAddress).toHaveBeenCalledWith(wallet.address());
	});

	it("should not trigger `toggleAddress` when checkbox is clicked in single view mode", async () => {
		const toggleAddress = vi.fn();

		render(
			<AddressRow
				isSingleView
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={false}
				toggleAddress={toggleAddress}
				isSelected={true}
				onEdit={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getByTestId("AddressRow"));
		expect(toggleAddress).not.toHaveBeenCalledWith(wallet.address());
	});

	it("should trigger `toggleAddress` when row clicked", async () => {
		const toggleAddress = vi.fn();

		render(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={false}
				toggleAddress={toggleAddress}
				isSelected={true}
				onEdit={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getByTestId("AddressRow"));
		expect(toggleAddress).toHaveBeenCalledWith(wallet.address());
	});

	it("should trigger `toggleAddress` when a key pressed on AddressRow", async () => {
		const toggleAddress = vi.fn();

		render(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={false}
				toggleAddress={toggleAddress}
				isSelected={true}
				onEdit={vi.fn()}
			/>,
		);

		await userEvent.type(screen.getByTestId("AddressRow"), "enter");
		expect(toggleAddress).toHaveBeenCalledWith(wallet.address());
	});

	it("should should render deleteContent", () => {
		const onDelete = vi.fn();
		render(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={onDelete}
				usesManageMode={true}
				toggleAddress={vi.fn()}
				isSelected={false}
				isSingleView={false}
				deleteContent={<div>Delete content</div>}
				onEdit={vi.fn()}
			/>,
		);

		expect(screen.getByText("Delete content")).toBeInTheDocument();
		expect(screen.getByTestId("icon-MarkedTrash")).toBeInTheDocument();
	});

	it("should render radio button when in single view", () => {
		render(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={false}
				toggleAddress={vi.fn()}
				isSelected={true}
				isSingleView={true}
				onEdit={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("AddressRow--radio")).toBeInTheDocument();
	});

	it("should should render editContent", () => {
		render(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={true}
				toggleAddress={vi.fn()}
				isSelected={false}
				isSingleView={false}
				editContent={<div>Edit content</div>}
				onEdit={vi.fn()}
			/>,
		);

		expect(screen.getByText("Edit content")).toBeInTheDocument();
	});

	it("should should trigger onEdit", async () => {
		const onEdit = vi.fn();

		render(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={true}
				toggleAddress={vi.fn()}
				isSelected={false}
				onEdit={onEdit}
			/>,
		);

		expect(screen.getByTestId("dropdown__toggle")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("dropdown__toggle"));
		await expect(screen.findByTestId("dropdown__option--0")).resolves.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("dropdown__option--0"));
		expect(onEdit).toHaveBeenCalled();
	});

	it("should should trigger `Open in Explorer` option", async () => {
		const windowOpen = vi.spyOn(window, "open").mockImplementation(vi.fn());
		const explorerLinkSpy = vi.spyOn(wallet, "explorerLink").mockReturnValue("https://mainsail-scan.com/address");

		render(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={true}
				toggleAddress={vi.fn()}
				isSelected={false}
				onEdit={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("dropdown__toggle")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("dropdown__toggle"));
		await expect(screen.findByTestId("dropdown__option--1")).resolves.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("dropdown__option--1"));

		expect(windowOpen).toHaveBeenCalledWith(new URL("https://mainsail-scan.com/address").toString(), "_blank");

		windowOpen.mockRestore();
		explorerLinkSpy.mockRestore();
	});

	it("should render HD wallet label", () => {
		vi.spyOn(wallet, "isHDWallet").mockImplementation(() => true);

		render(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={false}
				toggleAddress={vi.fn()}
				isSelected={false}
				onEdit={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("hd-wallet-label")).toBeInTheDocument();
	});

	it("should render HD wallet label with primary variant when selected", () => {
		vi.spyOn(wallet, "isHDWallet").mockImplementation(() => true);

		render(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={false}
				toggleAddress={vi.fn()}
				isSelected={true}
				onEdit={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("hd-wallet-label")).toHaveClass("text-theme-primary-600");
	});

	it("should render HD wallet label with neutral variant when not selected", () => {
		vi.spyOn(wallet, "isHDWallet").mockImplementation(() => true);

		render(
			<AddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={false}
				toggleAddress={vi.fn()}
				isSelected={false}
				onEdit={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("hd-wallet-label")).toHaveClass("text-theme-secondary-700");
	});
});
