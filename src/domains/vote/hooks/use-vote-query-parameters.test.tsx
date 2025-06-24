import React from "react";

import { Contracts } from "@/app/lib/profiles";
import { useValidatorsFromURL } from "./use-vote-query-parameters";

import {
	render,
	screen,
	env,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;

let nethash: string;
let resetProfileNetworksMock: () => void;

const validatorAddresses = [
	"0x1Bf9cf8a006a5279ca81Ea9D3F6aC2D41e1353e2",
	"0x3F8eCbF08078F22038235F9834540A960E99085b",
	"0x137c59f371a7049159ef19a72f908773Ade219b1",
];

describe("useWalletFromQueryParameters hook", () => {
	beforeAll(() => {
		process.env.MOCK_AVAILABLE_NETWORKS = "false";
		profile = env.profiles().findById(getMainsailProfileId());
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

	it("should not find vote & unvote validators from url", async () => {
		render(<TestComponent />, { withProviders: false });

		await expect(screen.findByTestId("isLoading-false")).resolves.toBeVisible();

		expect(screen.getByTestId("votes-0")).toBeInTheDocument();
		expect(screen.getByTestId("unvotes-0")).toBeInTheDocument();
	});

	it("should find vote validator from url", () => {
		render(<TestComponent />, {
			route: `/?vote=${validatorAddresses[0]},2&nethash=${nethash}`,
			withProviders: false,
		});

		expect(screen.getByTestId("votes-1")).toBeInTheDocument();
		expect(screen.getByTestId("unvotes-0")).toBeInTheDocument();
	});

	it("should find unvote validator from url", () => {
		render(<TestComponent />, {
			route: `/?unvote=${validatorAddresses[0]},2&nethash=${nethash}`,
			withProviders: false,
		});

		expect(screen.getByTestId("votes-0")).toBeInTheDocument();
		expect(screen.getByTestId("unvotes-1")).toBeInTheDocument();
	});
});
