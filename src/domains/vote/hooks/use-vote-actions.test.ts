import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import { useVoteActions } from "./use-vote-actions";
import { env, getDefaultProfileId } from "@/utils/testing-library";

jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useHistory: () => ({
		push: jest.fn(),
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
		const nethashSpy = jest.spyOn(wallet.network(), "meta").mockReturnValue(() => {
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
