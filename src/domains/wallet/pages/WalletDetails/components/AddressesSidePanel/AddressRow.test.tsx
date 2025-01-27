import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { env, getMainsailProfileId, render, renderResponsive, screen } from "@/utils/testing-library";
import { AddressRow } from "./AddressRow";
import { expect } from "vitest";
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
				wallet={wallet}
				onDelete={vi.fn()}
				usesDeleteMode={false}
				toggleAddress={vi.fn()}
				isSelected={false}
			/>,
		);

		expect(screen.getByText(wallet.displayName())).toBeInTheDocument();
	});

	it("should render mobile row for `xs` screen", () => {
		renderResponsive(
			<AddressRow
				wallet={wallet}
				onDelete={vi.fn()}
				usesDeleteMode={false}
				toggleAddress={vi.fn()}
				isSelected={false}
			/>,
			"xs"
		);

		expect(screen.getByTestId("MobileAddressRow")).toBeInTheDocument();
	});

	it("should render in delete mode", () => {
		render(
			<AddressRow
				wallet={wallet}
				onDelete={vi.fn()}
				usesDeleteMode={true}
				toggleAddress={vi.fn()}
				isSelected={false}
			/>,
		);

		expect(screen.getByTestId(`AddressRow--delete-${wallet.address()}`)).toBeInTheDocument();
		expect(screen.queryByTestId("AddressRow--checkbox")).not.toBeInTheDocument();
	});

	it("should trigger `onDelete` when deleted", async () => {
		const onDelete = vi.fn();
		render(
			<AddressRow
				wallet={wallet}
				onDelete={onDelete}
				usesDeleteMode={true}
				toggleAddress={vi.fn()}
				isSelected={false}
			/>,
		);

		await userEvent.click(screen.getByTestId(`AddressRow--delete-${wallet.address()}`));
		expect(onDelete).toHaveBeenCalledWith(wallet.address());
	});

	it("should be checked", () => {
		render(
			<AddressRow
				wallet={wallet}
				onDelete={vi.fn()}
				usesDeleteMode={false}
				toggleAddress={vi.fn()}
				isSelected={true}
			/>,
		);

		expect(screen.getByTestId("AddressRow--checkbox")).toBeChecked();
	});

	it("should trigger `toggleAddress` when checkbox clicked", async () => {
		const toggleAddress = vi.fn();

		render(
			<AddressRow
				wallet={wallet}
				onDelete={vi.fn()}
				usesDeleteMode={false}
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
			<AddressRow
				wallet={wallet}
				onDelete={vi.fn()}
				usesDeleteMode={false}
				toggleAddress={toggleAddress}
				isSelected={true}
			/>,
		);

		await userEvent.click(screen.getByTestId("AddressRow"));
		expect(toggleAddress).toHaveBeenCalledWith(wallet.address());
	});

	it("should trigger `toggleAddress` when a key pressed on AddressRow", async () => {
		const toggleAddress = vi.fn();

		render(
			<AddressRow
				wallet={wallet}
				onDelete={vi.fn()}
				usesDeleteMode={false}
				toggleAddress={toggleAddress}
				isSelected={true}
			/>,
		);

		await userEvent.type(screen.getByTestId("AddressRow"), "enter");
		expect(toggleAddress).toHaveBeenCalledWith(wallet.address());
	});
});
