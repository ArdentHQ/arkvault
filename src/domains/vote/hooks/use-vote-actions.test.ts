import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import { useVoteActions } from "./use-vote-actions";
import { env, getDefaultProfileId } from "@/utils/testing-library";

vi.mock("react-router-dom", async () => ({
	...(await vi.importActual("react-router-dom")),
	useHistory: () => ({
		push: vi.fn(),
	}),
}));

let profile: Contracts.IProfile;

describe("useVoteActions", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should net nethash parameter", () => {
		const wallet = profile.wallets().first();
		const nethashSpy = vi.spyOn(wallet.network(), "meta").mockReturnValue(() => {
			"1";
		});

		const { result } = renderHook(() =>
			useVoteActions({
				hasWalletId: false,
				profile,
				selectedAddress: wallet.address(),
				selectedNetwork: wallet.network().id(),
				wallet,
			}),
		);

		result.current.navigateToSendVote([], []);

		expect(nethashSpy).toHaveBeenCalledWith();
	});
});
