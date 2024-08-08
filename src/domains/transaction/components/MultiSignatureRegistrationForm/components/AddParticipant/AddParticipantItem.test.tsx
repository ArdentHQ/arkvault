/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { AddParticipantItem } from "./AddParticipantItem";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

const deleteButton = () => screen.getByTestId("AddParticipantItem--deleteButton");

describe("Add Participant item", () => {
	let profile: Contracts.IProfile;
	let participant: {
		address: string;
		alias?: string;
	};
	let wallet: Contracts.IReadWriteWallet;
	let wallet2: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
		wallet2 = profile.wallets().last();

		await profile.sync();

		participant = {
			address: wallet2.address(),
			alias: wallet2.alias(),
		};
	});

	it("should render", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<AddParticipantItem participant={participant} wallet={wallet} index={1} onDelete={() => {}} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(screen.getByTestId("AddParticipantItem")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should disable the button if is the same address as the wallet", () => {
		render(
			<Route path="/profiles/:profileId">
				<AddParticipantItem
					participant={{
						...participant,
						address: wallet.address(),
					}}
					wallet={wallet}
					index={1}
					onDelete={() => {}}
				/>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(deleteButton()).toBeDisabled();
	});

	it("should handle the delete button", async () => {
		const onDelete = vi.fn();

		render(
			<Route path="/profiles/:profileId">
				<AddParticipantItem participant={participant} wallet={wallet} index={1} onDelete={onDelete} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(deleteButton()).not.toBeDisabled();

		await userEvent.click(deleteButton());

		expect(onDelete).toHaveBeenCalledWith(1);
	});
});
