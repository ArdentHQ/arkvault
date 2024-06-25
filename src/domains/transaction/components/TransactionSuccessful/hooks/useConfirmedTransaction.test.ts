import { renderHook } from "@testing-library/react-hooks";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useConfirmedTransaction } from "./useConfirmedTransaction";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import { TransactionFixture } from "@/tests/fixtures/transactions";

describe("useConfirmedTransaction", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should initially set isConfirmed to false", () => {
		const { result } = renderHook(() =>
			useConfirmedTransaction({
				transactionId: "123",
				wallet: wallet,
			}),
		);

		expect(result.current).toBe(false);
	});

	it("should set isConfirmed to true when transaction is found", async () => {
		const transaction = {
			...TransactionFixture,
			wallet: () => wallet,
		};

		vi.spyOn(wallet.coin().client(), "transaction").mockResolvedValue({});
		vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(transaction);

		const { result, waitForNextUpdate } = renderHook(() =>
			useConfirmedTransaction({
				transactionId: "123",
				wallet: wallet,
			}),
		);

		await waitForNextUpdate();

		expect(result.current).toBe(true);
	});
});
