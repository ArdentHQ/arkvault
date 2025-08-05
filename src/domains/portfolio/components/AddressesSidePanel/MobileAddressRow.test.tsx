import React from "react";
import { Contracts } from "@/app/lib/profiles";
import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";
import { MobileAddressRow } from "./MobileAddressRow";
import { expect } from "vitest";
import userEvent from "@testing-library/user-event";

describe("MobileAddressRow", () => {
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
			<MobileAddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={false}
				toggleAddress={vi.fn()}
				isSelected={false}
				onSelectOption={vi.fn()}
				isSingleView={true}
			/>,
		);

		expect(screen.getByText(wallet.displayName())).toBeInTheDocument();
	});

	it("should render in delete mode", () => {
		render(
			<MobileAddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={true}
				toggleAddress={vi.fn()}
				isSelected={false}
				onSelectOption={vi.fn()}
				isSingleView={true}
			/>,
		);

		expect(screen.getByTestId(`AddressRow--delete-${wallet.address()}`)).toBeInTheDocument();
		expect(screen.queryByTestId("AddressRow--checkbox")).not.toBeInTheDocument();
	});

	it("should trigger `onDelete` when delete button clicked", async () => {
		const onDelete = vi.fn();
		render(
			<MobileAddressRow
				profile={profile}
				wallet={wallet}
				onDelete={onDelete}
				usesManageMode={true}
				toggleAddress={vi.fn()}
				isSelected={false}
				onSelectOption={vi.fn()}
				isSingleView={true}
			/>,
		);

		await userEvent.click(screen.getByTestId(`AddressRow--delete-${wallet.address()}`));
		expect(onDelete).toHaveBeenCalledWith(wallet.address());
	});

	it("should be checked", () => {
		render(
			<MobileAddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={false}
				toggleAddress={vi.fn()}
				isSelected={true}
				onSelectOption={vi.fn()}
				isSingleView={false}
			/>,
		);

		expect(screen.getByTestId("AddressRow--checkbox")).toBeChecked();
	});

	it("should trigger `toggleAddress` when checkbox clicked", async () => {
		const toggleAddress = vi.fn();

		render(
			<MobileAddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={false}
				toggleAddress={toggleAddress}
				isSelected={true}
				onSelectOption={vi.fn()}
				isSingleView={false}
			/>,
		);

		await userEvent.click(screen.getByTestId("AddressRow--checkbox"));
		expect(toggleAddress).toHaveBeenCalledWith(wallet.address());
	});

	it("should trigger `toggleAddress` when row clicked", async () => {
		const toggleAddress = vi.fn();

		render(
			<MobileAddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={false}
				toggleAddress={toggleAddress}
				isSelected={true}
				onSelectOption={vi.fn()}
				isSingleView={true}
			/>,
		);

		await userEvent.click(screen.getByTestId("MobileAddressRowHeader"));
		expect(toggleAddress).toHaveBeenCalledWith(wallet.address());
	});

	it("should should render deleteContent", () => {
		const onDelete = vi.fn();
		render(
			<MobileAddressRow
				profile={profile}
				wallet={wallet}
				onDelete={onDelete}
				usesManageMode={true}
				toggleAddress={vi.fn()}
				isSelected={false}
				deleteContent={<div>Delete content</div>}
				onSelectOption={vi.fn()}
				isSingleView={true}
			/>,
		);

		expect(screen.getByText("Delete content")).toBeInTheDocument();
		expect(screen.getByTestId("icon-MarkedTrash")).toBeInTheDocument();
	});

	it("should should render editContent", async () => {
		render(
			<MobileAddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={true}
				toggleAddress={vi.fn()}
				isSelected={false}
				editContent={<div>Edit content</div>}
				onSelectOption={vi.fn()}
				isSingleView={true}
			/>,
		);

		expect(screen.getByTestId("dropdown__toggle")).toBeInTheDocument();
		expect(screen.getByText("Edit content")).toBeInTheDocument();
	});

	it("should should trigger onSelectOption when option is selected", async () => {
		const onSelectOption = vi.fn();

		render(
			<MobileAddressRow
				profile={profile}
				wallet={wallet}
				onDelete={vi.fn()}
				usesManageMode={true}
				toggleAddress={vi.fn()}
				isSelected={false}
				onSelectOption={onSelectOption}
				isSingleView={true}
			/>,
		);

		expect(screen.getByTestId("dropdown__toggle")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("dropdown__toggle"));
		await expect(screen.findByTestId("dropdown__option--0")).resolves.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("dropdown__option--0"));
		expect(onSelectOption).toHaveBeenCalled();
	});
});
