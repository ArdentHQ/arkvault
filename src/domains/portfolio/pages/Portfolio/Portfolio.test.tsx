import { render, screen, waitFor } from "@/utils/testing-library";
import { env, getMainsailProfileId, syncValidators } from "@/utils/testing-library";
import { Portfolio } from "./Portfolio";
import { Contracts } from "@/app/lib/profiles";
import { vi } from "vitest";

let profile: Contracts.IProfile;

beforeAll(async () => {
	profile = env.profiles().findById(getMainsailProfileId());
	await env.profiles().restore(profile);
	await syncValidators(profile);
	await profile.sync();
});

describe("Portfolio", () => {
	it("should render the Dashboard when wallets are selected", async () => {
		vi.spyOn(profile.status(), "isRestored").mockImplementation(() => false as any);

		render(<Portfolio />, {
			route: `/profiles/${getMainsailProfileId()}/portfolio`,
			withProviders: true,
			withProfileSynchronizer: true,
		});

		await waitFor(() => {
			expect(screen.getByTestId("WalletHeader")).toBeInTheDocument();
		});
	});

	it("should render DashboardEmpty when profile is restored with no wallets selected", async () => {
		vi.spyOn(profile.status(), "isRestored").mockImplementation(() => true as any);
		vi.spyOn(profile.wallets(), "selected").mockReturnValue([]);

		render(<Portfolio />, {
			route: `/profiles/${getMainsailProfileId()}/portfolio`,
			withProviders: true,
			withProfileSynchronizer: true,
		});

		await waitFor(() => {
			expect(screen.getByText(/Welcome to ARK Vault/)).toBeInTheDocument();
		});
	});
});
