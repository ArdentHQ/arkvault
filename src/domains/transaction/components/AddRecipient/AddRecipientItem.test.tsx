/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@/app/lib/profiles";
import React from "react";
import userEvent from "@testing-library/user-event";
import { AddRecipientItem } from "./AddRecipientItem";
import { env, getDefaultProfileId, render, renderResponsive, screen } from "@/utils/testing-library";

const deleteButton = () => screen.getByTestId("AddRecipientItem--deleteButton-1");

describe("Add Recipient item", () => {
	let profile: Contracts.IProfile;

	let recipient: {
		address: string;
		alias?: string;
		amount: number;
	};
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		await profile.sync();

		recipient = {
			address: wallet.address(),
			alias: wallet.alias(),
			amount: 1,
		};
	});

	it.each(["xs", "lg"] as const)("should render with size %s", (size) => {
		const { asFragment } = renderResponsive(
			<AddRecipientItem
				recipient={recipient}
				ticker="DARK"
				exchangeTicker="USD"
				showExchangeAmount={false}
				index={1}
				onDelete={() => {}}
				profile={profile}
			/>,
			size,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without exchange amount", () => {
		const { asFragment } = render(
			<AddRecipientItem
				recipient={recipient}
				ticker="DARK"
				exchangeTicker="USD"
				showExchangeAmount={false}
				index={1}
				onDelete={() => {}}
				profile={profile}
			/>,
		);

		expect(screen.getByTestId("AddRecipientItem")).toBeInTheDocument();
		expect(screen.queryByTestId("AddRecipientItem--exchangeAmount")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with exchange amount", () => {
		const { asFragment } = render(
			<AddRecipientItem
				recipient={recipient}
				ticker="DARK"
				exchangeTicker="USD"
				showExchangeAmount={true}
				index={1}
				onDelete={() => {}}
				profile={profile}
			/>,
		);

		expect(screen.getByTestId("AddRecipientItem")).toBeInTheDocument();
		expect(screen.getByTestId("AddRecipientItem--exchangeAmount")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle the delete button", async () => {
		const onDelete = vi.fn();

		render(
			<AddRecipientItem
				recipient={recipient}
				ticker="DARK"
				exchangeTicker="USD"
				showExchangeAmount={false}
				index={1}
				onDelete={onDelete}
				profile={profile}
			/>,
		);

		await userEvent.click(deleteButton());

		expect(onDelete).toHaveBeenCalledWith(1);
	});
});
