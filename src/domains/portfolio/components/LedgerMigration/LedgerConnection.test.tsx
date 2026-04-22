import {
	env,
	getMainsailProfileId,
	mockNanoSTransport,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";
import { expect, it, describe, beforeAll, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { LedgerConnectionStep } from "./LedgerConnection";

const mockNetwork = {
	coin: () => "Mainsail",
	id: () => "mainsail",
	isLive: () => true,
	isTest: () => false,
	ticker: () => "ARK",
	toObject: () => ({ id: "mainsail", name: "Mainsail" }),
};

describe("LedgerConnection", () => {
	let profile: Contracts.IProfile;
	const route = `/profiles/${getMainsailProfileId()}/dashboard`;

	beforeAll(async () => {
		mockNanoSTransport();

		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);
	});

	it("should render connection step", async () => {
		const onConnect = vi.fn();

		render(
			<LedgerConnectionStep
				profile={profile}
				network={mockNetwork as any}
				onConnect={onConnect}
			/>,
			{ route },
		);

		expect(screen.getByTestId("LedgerConnectionStep")).toBeInTheDocument();
	});

	it("should render cancelling state", async () => {
		const onConnect = vi.fn();

		render(
			<LedgerConnectionStep
				profile={profile}
				network={mockNetwork as any}
				isCancelling={true}
				onConnect={onConnect}
			/>,
			{ route },
		);

		await waitFor(() => {
			expect(screen.queryByTestId("LedgerConnectionStep")).not.toBeInTheDocument();
		});
	});
});