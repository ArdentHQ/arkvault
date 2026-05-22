import {
	env,
	getMainsailProfileId,
	mockNanoSTransport,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";
import { expect, it, describe, beforeAll, vi, beforeEach } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { LedgerConnectionStep } from "./LedgerConnection";
import { useLedgerContext } from "@/app/contexts/Ledger";

const defaultLedgerContext = {
	abortConnectionRetry: vi.fn(),
	connect: vi.fn(),
	error: "",
	isConnected: false,
};

vi.mock("@/app/contexts/Ledger", () => ({
	useLedgerContext: vi.fn(() => defaultLedgerContext),
}));

beforeEach(() => {
	vi.mocked(useLedgerContext).mockReturnValue({ ...defaultLedgerContext });
});

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

		await render(
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

		await render(
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