import { Contracts } from "@/app/lib/profiles";
import { renderHook } from "@testing-library/react";
import { useVoteActions } from "./use-vote-actions";
import { env, getMainsailProfileId } from "@/utils/testing-library";

vi.mock("react-router-dom", async () => ({
	...(await vi.importActual("react-router-dom")),
	useNavigate: () => vi.fn(),
}));

let profile: Contracts.IProfile;

describe("useVoteActions", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
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
