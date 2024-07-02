import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import {
	env,
	getDefaultProfileId,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
} from "@/utils/testing-library";

import { useNetworkFromQueryParameters, useQueryParameters } from "./use-query-parameters";

const history = createHashHistory();

let profile: Contracts.IProfile;

let nethash: string;
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

	it("should render useQueryParameters", async () => {
		render(
			<Route pathname="/">
				<TestComponent />
			</Route>,
		);

		expect(screen.getByTestId("header_test")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("header_test"));

		expect(screen.getByText("useQueryParameters Test Component")).toBeInTheDocument();
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

	it("should find network from query parameters using network id", () => {
		history.push("/?network=ark.devnet");

		render(<TestComponent />, { history, withProviders: false });

		expect(screen.getByTestId(nethash)).toBeInTheDocument();
	});

	it("should find network from query parameters using nethash", () => {
		history.push(`/?nethash=${nethash}`);

		render(<TestComponent />, { history, withProviders: false });

		expect(screen.getByTestId(nethash)).toBeInTheDocument();
	});

	it("should fail to find network from query parameters using nethash", () => {
		history.push(`/?nethash=1`);

		render(<TestComponent />, { history, withProviders: false });

		expect(() => screen.getByTestId(nethash)).toThrow(/Unable to find/);
	});
});
