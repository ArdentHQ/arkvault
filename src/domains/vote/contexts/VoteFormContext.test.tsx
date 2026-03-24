import React from "react";

import { Contracts } from "@/app/lib/profiles";
import { beforeAll, expect, vi } from "vitest";
import {
	env,
	getMainsailProfileId,
	render,
	renderWithoutRouter,
	screen,
	syncValidators,
} from "@/utils/testing-library";
import { useVoteFormContext, VoteFormProvider } from "./VoteFormContext";
import * as ReactRouter from "react-router";

const Component = () => {
	const { isLoading, votes, unvotes } = useVoteFormContext();

	return (
		<>
			{isLoading && <div data-testid="loading">loading validators</div>}
			{!isLoading && Array.isArray(votes) && (
				<div data-testid="votes">
					{votes.map((vote) => (
						<div key={vote.wallet?.address()}>{vote.wallet?.address()}</div>
					))}
				</div>
			)}
			{!isLoading && Array.isArray(unvotes) && (
				<div data-testid="unvotes">
					{unvotes.map((unvote) => (
						<div key={unvote.wallet?.address()}>{unvote.wallet?.address()}</div>
					))}
				</div>
			)}
		</>
	);
};

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
// let _useSearchParamsMock;

describe("VoteFormContext", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await syncValidators(profile);

		wallet = profile.wallets().first();
		await wallet.synchroniser().votes();
		await profile.sync();
	});

	beforeEach(() => {
		// const _useSearchParamsMock = vi
		vi.spyOn(ReactRouter, "useSearchParams").mockReturnValue([new URLSearchParams(), vi.fn()]);
	});

	it("should throw without provider", () => {
		const Test = () => {
			useVoteFormContext();

			return <div>hello</div>;
		};

		expect(() =>
			renderWithoutRouter(<Test />, {
				withProviders: false,
			}),
		).toThrow("[useVoteFormContext] Component not wrapped within a Provider");
	});

	it("should fetch validators", async () => {
		const route =
			"?method=vote&coin=Mainsail&validator=test&vote=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6&unvote=0xAa6d78a89706b744eDD2894CE30BeCE77Ab0F753";

		render(
			<VoteFormProvider profile={profile} wallet={wallet} network={profile.activeNetwork()}>
				<Component />
			</VoteFormProvider>,
			{
				route,
			},
		);

		await expect(screen.findByTestId("votes")).resolves.toBeVisible();
		await expect(screen.findByTestId("unvotes")).resolves.toBeVisible();
	});
});
