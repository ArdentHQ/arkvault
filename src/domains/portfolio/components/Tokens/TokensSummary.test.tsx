import { Contracts } from "@/app/lib/profiles";
import React from "react";

import {
	env,
	render,
	screen,
	getMainsailProfileId,
} from "@/utils/testing-library";
import { expect } from "vitest";
import { TokensSummary } from "./TokensSummary";

const fixtureProfileId = getMainsailProfileId();

describe("TokensSummary", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		profile = env.profiles().findById(fixtureProfileId);
		wallet = profile.wallets().first();
	});

	it("should render", async () => {
		vi.spyOn(wallet, "tokenCount").mockReturnValue(2);

		render(<TokensSummary wallet={wallet} />);

		expect(screen.getByTestId("TokensSummary")).toBeInTheDocument();
	});

	it("should display count when there are more than 3 tokens", async () => {
		vi.spyOn(wallet, "tokenCount").mockReturnValue(25);

		render(<TokensSummary wallet={wallet} />);

		expect(screen.getByTestId("TokensSummary")).toBeInTheDocument();
		expect(screen.getByTestId("TokensSummary--Count")).toBeInTheDocument();
	});
});
