import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { Contracts } from "@ardenthq/sdk-profiles";

import {
	useNetworkFromQueryParameters,
	useQueryParameters,
	useWalletFromQueryParameters,
} from "./use-query-parameters";

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
let walletId: string;
let resetProfileNetworksMock: () => void;

describe("useQueryParameters hook", () => {
	const TestComponent: React.FC = () => {
		const reloadPath = useQueryParameters();

		const handle = () => {
			reloadPath.get("");
		};
		return (
			<h1 data-testid="header_test" onClick={handle}>
				useQueryParameters Test Component
			</h1>
		);
	};

	it("should render useQueryParameters", () => {
		render(
			<Route pathname="/">
				<TestComponent />
			</Route>,
		);

		expect(screen.getByTestId("header_test")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("header_test"));

		expect(screen.getByText("useQueryParameters Test Component")).toBeInTheDocument();
	});
});

describe("useWalletFromQueryParameters hook", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		walletId = profile.wallets().first().id();
	});
	const TestComponent: React.FC = () => {
		const wallet = useWalletFromQueryParameters(profile);

		if (!wallet) {
			return null;
		}

		return <div data-testid={wallet.id()} />;
	};

	it("should find profile wallet from query parameters", () => {
		history.push(`/?walletId=${walletId}`);

		render(<TestComponent />, { history, withProviders: false });

		expect(screen.getByTestId(walletId)).toBeInTheDocument();
	});

	it("should not find profile wallet from query parameters", () => {
		history.push(`/?walletId=1`);

		render(<TestComponent />, { history, withProviders: false });

		expect(() => screen.getByTestId(walletId)).toThrowError(/Unable to find/);
	});

	it("should not find profile wallet from query parameters", () => {
		history.push(`/`);

		render(<TestComponent />, { history, withProviders: false });

		expect(() => screen.getByTestId(walletId)).toThrowError(/Unable to find/);
	});
});

describe("useNetworkFromQueryParameters hook", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		nethash = profile.wallets().first().network().meta().nethash;
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterAll(() => {
		resetProfileNetworksMock();
	});

	const TestComponent: React.FC = () => {
		const network = useNetworkFromQueryParameters(profile);

		if (!network) {
			return null;
		}

		return <div data-testid={network.meta().nethash} />;
	};

	it("should find nethash from query parameters", () => {
		history.push(`/?nethash=${nethash}`);

		render(<TestComponent />, { history, withProviders: false });

		expect(screen.getByTestId(nethash)).toBeInTheDocument();
	});

	it("should not find nethash from query parameters", () => {
		history.push(`/?nethash=1`);

		render(<TestComponent />, { history, withProviders: false });

		expect(() => screen.getByTestId(nethash)).toThrowError(/Unable to find/);
	});
});
