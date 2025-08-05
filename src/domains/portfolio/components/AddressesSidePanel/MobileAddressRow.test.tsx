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
			/>,
		);

		expect(screen.getByText("Delete content")).toBeInTheDocument();
		expect(screen.getByTestId("icon-MarkedTrash")).toBeInTheDocument();
	});
});
