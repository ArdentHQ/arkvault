import { env, getMainsailProfileId, triggerMessageSignOnce } from "@/utils/testing-library";

import * as Mainsail from "@/app/lib/mainsail";
import { BigNumber } from "@/app/lib/helpers";
import { EnvironmentProvider } from "@/app/contexts";
import React from "react";
import { StubStorage } from "@/tests/mocks";
import { httpClient } from "@/app/services";
import { renderHook } from "@testing-library/react";
import { useFees } from "./use-fees";

const MainsailDevnet = "mainsail.devnet";

describe("useFees", () => {
	it.skip("should find fees by type if already synced", async () => {
		const profile = env.profiles().findById(getMainsailProfileId());

		await env.wallets().syncByProfile(profile);
		await profile.validators().syncAll(profile);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const {
			result: { current },
		} = renderHook(() => useFees(profile), { wrapper });

		await env.fees().sync(profile, "Mainsail", MainsailDevnet);

		await expect(
			current.calculate({ coin: "Mainsail", network: MainsailDevnet, type: "validatorRegistration" }),
		).resolves.toStrictEqual({
			avg: 25,
			isDynamic: true,
			max: 25,
			min: 25,
			static: 25,
		});
	});

	it.skip("should ensure fees are synced before find", async () => {
		env.reset({
			coins: { Mainsail },
			httpClient,
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});

		const profile = await env.profiles().create("John Doe");
		await env.profiles().restore(profile);
		await profile.walletFactory().generate({
			coin: "Mainsail",
			network: MainsailDevnet,
		});
		await env.wallets().syncByProfile(profile);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const {
			result: { current },
		} = renderHook(() => useFees(profile), { wrapper });

		await env.fees().sync(profile, "Mainsail", MainsailDevnet);

		await expect(
			current.calculate({ coin: "Mainsail", network: MainsailDevnet, type: "validatorRegistration" }),
		).resolves.toStrictEqual({
			avg: 25,
			isDynamic: true,
			max: 25,
			min: 25,
			static: 25,
		});
	});

	it.skip("should retry find fees by type", async () => {
		env.reset({
			coins: { Mainsail },
			httpClient,
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});

		const mockFind = vi.spyOn(env.fees(), "findByType").mockImplementationOnce(() => {
			throw new Error("test");
		});

		const profile = await env.profiles().create("John Doe");
		await env.profiles().restore(profile);
		await profile.walletFactory().generate({
			coin: "Mainsail",
			network: MainsailDevnet,
		});
		await env.wallets().syncByProfile(profile);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const {
			result: { current },
		} = renderHook(() => useFees(profile), { wrapper });

		await env.fees().sync(profile, "Mainsail", MainsailDevnet);

		await expect(
			current.calculate({ coin: "Mainsail", network: MainsailDevnet, type: "validatorRegistration" }),
		).resolves.toStrictEqual({
			avg: 25,
			isDynamic: true,
			max: 25,
			min: 25,
			static: 25,
		});

		mockFind.mockRestore();
	});

	it.skip("should calculate and return fees when feeType is size", async () => {
		env.reset({
			coins: { Mainsail },
			httpClient,
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});

		const profile = await env.profiles().create("John Doe");
		await env.profiles().restore(profile);
		const { wallet } = await profile.walletFactory().generate({
			coin: "Mainsail",
			network: MainsailDevnet,
		});
		await env.wallets().syncByProfile(profile);

		const mockFind = vi.spyOn(env.fees(), "findByType").mockReturnValue({} as any);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const {
			result: { current },
		} = renderHook(() => useFees(profile), { wrapper });

		await env.fees().sync(profile, "Mainsail", MainsailDevnet);

		const transferMock = vi.spyOn(wallet.coin().transaction(), "transfer").mockResolvedValue({} as any);
		const calculateMock = vi.spyOn(wallet.coin().fee(), "calculate").mockResolvedValue(BigNumber.make(1));
		const feeTypeSpy = vi.spyOn(wallet.network(), "feeType").mockReturnValue("size");

		const transactionData = {
			amount: 1,
			to: "0b05d911-fc73-4431-ae4c-cd872cf12a9d",
		};

		await expect(
			current.calculate({
				coin: wallet.network().coin(),
				data: transactionData,
				network: wallet.network().id(),
				type: "transfer",
			}),
		).resolves.toStrictEqual({
			avg: 1,
			isDynamic: undefined,
			max: 1,
			min: 1,
			static: 1,
		});

		mockFind.mockRestore();
		transferMock.mockRestore();
		calculateMock.mockRestore();
		feeTypeSpy.mockRestore();
	});

	it.skip("should return a default value when error is thrown in the calculation", async () => {
		env.reset({
			coins: { Mainsail },
			httpClient,
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});

		const profile = await env.profiles().create("John Doe");
		await env.profiles().restore(profile);
		const { wallet } = await profile.walletFactory().generate({
			coin: "Mainsail",
			network: MainsailDevnet,
		});
		await env.wallets().syncByProfile(profile);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const {
			result: { current },
		} = renderHook(() => useFees(profile), { wrapper });

		await env.fees().sync(profile, "Mainsail", MainsailDevnet);

		const feeTypeSpy = vi.spyOn(wallet.network(), "feeType").mockReturnValue("size");
		const transferMock = vi.spyOn(wallet.coin().transaction(), "transfer").mockImplementation(() => {
			throw new Error("error");
		});

		const transactionData = {
			amount: 1,
			to: "0b05d911-fc73-4431-ae4c-cd872cf12a9d",
		};

		await expect(
			current.calculate({
				coin: wallet.network().coin(),
				data: transactionData,
				network: wallet.network().id(),
				type: "transfer",
			}),
		).resolves.toStrictEqual({
			avg: 0,
			isDynamic: true,
			max: 0,
			min: 0,
			static: 0,
		});

		feeTypeSpy.mockRestore();
		transferMock.mockRestore();
	});

	it("should return estimated gas", async () => {
		const profile = env.profiles().findById(getMainsailProfileId());
		const wallet = profile.wallets().first();

		await env.wallets().syncByProfile(profile);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;

		const {
			result: { current },
		} = renderHook(() => useFees(profile), { wrapper });

		await expect(
			current.estimateGas({
				data: {
					recipientAddress: wallet.address(),
					senderAddress: wallet.address(),
				},
				type: "transfer",
			}),
		).resolves.toStrictEqual(BigNumber.make(21_000));
	});
});
