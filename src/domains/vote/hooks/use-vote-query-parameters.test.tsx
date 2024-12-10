import { createHashHistory } from "history";
import React from "react";

import { Contracts } from "@ardenthq/sdk-profiles";
import { useValidatorsFromURL } from "./use-vote-query-parameters";

import {
	render,
	screen,
	env,
	getDefaultProfileId,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

const history = createHashHistory();

let profile: Contracts.IProfile;

let nethash: string;
let resetProfileNetworksMock: () => void;

const delegateAddresses = [
	"D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib",
	"D5L5zXgvqtg7qoGimt5vYhFuf5Ued6iWVr",
	"DRgF3PvzeGWndQjET7dZsSmnrc6uAy23ES",
	"D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
	"DBk4cPYpqp7EBcvkstVDpyX7RQJNHxpMg8",
];

describe("useWalletFromQueryParameters hook", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		nethash = profile.wallets().first().network().meta().nethash;
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterAll(() => {
		resetProfileNetworksMock();
	});

	const TestComponent: React.FC = () => {
		const { votes, unvotes, isLoading } = useValidatorsFromURL({
			env,
			network: profile.availableNetworks()[1],
			profile,
		});

		return (
			<>
				<div data-testid={`isLoading-${isLoading}`} />
				<div data-testid={`votes-${votes.length}`} />
				<div data-testid={`unvotes-${unvotes.length}`} />
			</>
		);
	};

	it("should not find vote & unvote delegates from url", async () => {
		history.push("/");

		render(<TestComponent />, { history, withProviders: false });

		await expect(screen.findByTestId("isLoading-false")).resolves.toBeVisible();

		expect(screen.getByTestId("votes-0")).toBeInTheDocument();
		expect(screen.getByTestId("unvotes-0")).toBeInTheDocument();
	});

	it("should find vote validator from url", () => {
		history.push(`/?vote=${delegateAddresses[0]},2&nethash=${nethash}`);

		render(<TestComponent />, { history, withProviders: false });

		expect(screen.getByTestId("votes-1")).toBeInTheDocument();
		expect(screen.getByTestId("unvotes-0")).toBeInTheDocument();
	});

	it("should find unvote validator from url", () => {
		history.push(`/?unvote=${delegateAddresses[0]},2&nethash=${nethash}`);

		render(<TestComponent />, { history, withProviders: false });

		expect(screen.getByTestId("votes-0")).toBeInTheDocument();
		expect(screen.getByTestId("unvotes-1")).toBeInTheDocument();
	});
});
