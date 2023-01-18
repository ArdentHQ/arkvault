import React from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import { useMigrationTransactions } from "./use-migration-transactions";
import { env, getDefaultProfileId, WithProviders, mockProfileWithPublicAndTestNetworks } from "@/utils/testing-library";
import * as useLatestTransactions from "@/domains/dashboard/hooks";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import * as useMigrations from "@/app/contexts";

let profile: Contracts.IProfile;
let resetProfileNetworksMock: () => void;
let transactionFixture: DTO.ExtendedSignedTransactionData;

describe("useMigrationTransactions hook", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();
	});

	beforeEach(async () => {
		const wallet = profile.wallets().first();

		transactionFixture = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: wallet.address(),
					},
					fee: 1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);

		vi.spyOn(transactionFixture, "memo").mockReturnValue("0xb9EDE6f94D192073D8eaF85f8db677133d483249");
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should return undefined migrations", async () => {
		const wrapper = ({ children }: React.PropsWithChildren<{}>) => <WithProviders>{children}</WithProviders>;

		const sent = await profile.transactionAggregate().all({ limit: 10 });
		const items = sent.items();

		const mockTransactionsAggregate = vi
			.spyOn(profile.transactionAggregate(), "all")
			.mockImplementation(() => Promise.resolve({ hasMorePages: () => false, items: () => items } as any));

		const { result } = renderHook(() => useMigrationTransactions({ profile }), { wrapper });
		expect(result.current.migrations).toBeUndefined();

		mockTransactionsAggregate.mockRestore();
	});

	it("should store and return migrations", async () => {
		const useLatestTransactionsSpy = vi.spyOn(useLatestTransactions, "useLatestTransactions").mockReturnValue({
			isLoadingTransactions: false,
			latestTransactions: [transactionFixture],
		});

		const useMigrationsSpy = vi.spyOn(useMigrations, "useMigrations").mockReturnValue({
			migrations: [
				{
					address: "AdDreSs",
					amount: 123,
					id: "123",
					migrationAddress: "BuRnAdDreSs",
					status: MigrationTransactionStatus.Confirmed,
					timestamp: Date.now() / 1000,
				},
			],
			storeTransaction: () => {},
		});
		const wrapper = ({ children }: React.PropsWithChildren<{}>) => <WithProviders>{children}</WithProviders>;

		const sent = await profile.transactionAggregate().all({ limit: 10 });
		const items = sent.items();

		const mockTransactionsAggregate = vi
			.spyOn(profile.transactionAggregate(), "all")
			.mockImplementation(() => Promise.resolve({ hasMorePages: () => false, items: () => items } as any));

		const { result } = renderHook(() => useMigrationTransactions({ profile }), { wrapper });
		expect(result.current.migrations).toHaveLength(1);

		mockTransactionsAggregate.mockRestore();
		useMigrationsSpy.mockRestore();
		useLatestTransactionsSpy.mockRestore();
	});
});
