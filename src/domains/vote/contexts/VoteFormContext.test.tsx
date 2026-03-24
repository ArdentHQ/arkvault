import React from "react";

import { Contracts } from "@/app/lib/profiles";
import { beforeAll, expect, vi } from "vitest";
import { env, getMainsailProfileId, render, renderWithoutRouter, waitFor, screen } from "@/utils/testing-library";
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
						<div>{vote.wallet.address()}</div>
					))}
				</div>
			)}
			{!isLoading && Array.isArray(unvotes) && (
				<div data-testid="unvotes">
					{unvotes.map((unvote) => (
						<div>{unvote.wallet.address()}</div>
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
		wallet = profile.wallets().first();
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
		const { container } = render(
			<VoteFormProvider profile={profile} wallet={wallet} network={profile.activeNetwork()}>
				<Component />
			</VoteFormProvider>,
		);

		await waitFor(() => {
			expect(container).toHaveTextContent("loading validators");
		});

		await waitFor(() => {
			expect(screen.queryByText("loading validators")).not.toBeInTheDocument();
		});

		await expect(screen.findByTestId("votes")).resolves.toBeVisible();
		await expect(screen.findByTestId("unvotes")).resolves.toBeVisible();
	});
});
