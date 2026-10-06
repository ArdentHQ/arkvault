import userEvent from "@testing-library/user-event";
import React from "react";

import { Contracts } from "@/app/lib/profiles";

import { useNetworkFromQueryParameters, useQueryParameters } from "./use-query-parameters";

import {
	render,
	screen,
	env,
	getMainsailProfileId,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;

let nethash: string;
let resetProfileNetworksMock: () => void;

const QueryParametersTestComponent: React.FC = () => {
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

const NetworkFromQueryParametersTestComponent: React.FC = () => {
	const network = useNetworkFromQueryParameters(profile);

	if (!network) {
		return null;
	}

	return <div data-testid={network.meta().nethash} />;
};

describe("useQueryParameters hook", () => {
	it("should render useQueryParameters", () => {
		render(<QueryParametersTestComponent />);

		expect(screen.getByTestId("header_test")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("header_test"));

		expect(screen.getByText("useQueryParameters Test Component")).toBeInTheDocument();
	});
});

describe("useNetworkFromQueryParameters hook", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		nethash = profile.wallets().first().network().meta().nethash;
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterAll(() => {
		resetProfileNetworksMock();
	});

	it("should find network from query parameters using network id", () => {
		render(<NetworkFromQueryParametersTestComponent />, {
			route: "/?network=mainsail.devnet",
			withProviders: false,
		});

		expect(screen.getByTestId(nethash)).toBeInTheDocument();
	});

	it("should find network from query parameters using nethash", () => {
		render(<NetworkFromQueryParametersTestComponent />, { route: `/?nethash=${nethash}`, withProviders: false });

		expect(screen.getByTestId(nethash)).toBeInTheDocument();
	});

	it("should fail to find network from query parameters using nethash", () => {
		render(<NetworkFromQueryParametersTestComponent />, { router: "/?nethash=1", withProviders: false });

		expect(() => screen.getByTestId(nethash)).toThrow(/Unable to find/);
	});
});
