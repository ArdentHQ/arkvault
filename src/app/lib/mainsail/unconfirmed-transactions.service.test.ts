import { UnconfirmedTransactionsService } from "@/app/lib/mainsail/unconfirmed-transactions.service";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/unconfirmed.json";

let allUnconfirmedMock: any;

vi.mock("@arkecosystem/typescript-client", () => ({
	ArkClient: vi.fn().mockImplementation(() => ({
		transactions: () => ({ allUnconfirmed: allUnconfirmedMock }),
	})),
}));

describe("UnconfirmedTransactionsService", () => {
	let service: UnconfirmedTransactionsService;

	beforeEach(() => {
		allUnconfirmedMock = vi.fn().mockResolvedValue(transactionFixture);

		const config = {
			host: vi.fn((type: string) =>
				type === "tx"
					? "https://dwallets-evm.mainsailhq.com/tx/api"
					: "https://dwallets-evm.mainsailhq.com/evm/api",
			),
		} as any;

		const profile = {} as any;

		service = new UnconfirmedTransactionsService({ config, profile });
	});

	it("should call allUnconfirmed without params and map response", async () => {
		const res = await service.listUnconfirmed();

		expect(allUnconfirmedMock).toHaveBeenCalledTimes(1);
		expect(allUnconfirmedMock).toHaveBeenCalledWith(undefined, undefined, {});

		const results = transactionFixture.results ?? [];
		const totalCount = transactionFixture.totalCount ?? results.length;

		expect(res).toEqual({ results, totalCount });
	});

	it("should translate page and limit into offset", async () => {
		await service.listUnconfirmed({ limit: 50, page: 2 });

		expect(allUnconfirmedMock).toHaveBeenLastCalledWith(50, 50, {});
	});

	it("should pass multiple from/to arrays in request params", async () => {
		const from = ["0x1111111111111111111111111111111111111111", "0x2222222222222222222222222222222222222222"];
		const to = ["0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"];

		await service.listUnconfirmed({ from, limit: 25, page: 1, to });

		expect(allUnconfirmedMock).toHaveBeenLastCalledWith(25, 0, { from, to });
	});

	it("should omit empty arrays for from/to", async () => {
		await service.listUnconfirmed({ from: [], to: [] });

		expect(allUnconfirmedMock).toHaveBeenLastCalledWith(undefined, undefined, {});
	});
});
