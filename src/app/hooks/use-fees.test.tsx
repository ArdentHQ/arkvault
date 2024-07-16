import { ARK } from "@ardenthq/sdk-ark";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { renderHook } from "@testing-library/react-hooks";
import React from "react";

import { useFees } from "./use-fees";
import { EnvironmentProvider } from "@/app/contexts";
import { httpClient } from "@/app/services";
import { StubStorage } from "@/tests/mocks";
import { env, getDefaultProfileId, triggerMessageSignOnce } from "@/utils/testing-library";

const ARKDevnet = "ark.devnet";

describe("useFees", () => {
	it("should find fees by type if already synced", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());

		await env.wallets().syncByProfile(profile);
		await env.delegates().syncAll(profile);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const {
			result: { current },
		} = renderHook(() => useFees(profile), { wrapper });

		await env.fees().sync(profile, "ARK", ARKDevnet);

		await expect(current.calculate({ coin: "ARK", network: ARKDevnet, type: "ipfs" })).resolves.toStrictEqual({
			avg: 5,
			isDynamic: true,
			max: 5,
			min: 5,
			static: 5,
		});
	});

	it("should ensure fees are synced before find", async () => {
		env.reset({
			coins: { ARK },
			httpClient,
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});

		const profile = await env.profiles().create("John Doe");
		await env.profiles().restore(profile);
		await profile.walletFactory().generate({
			coin: "ARK",
			network: ARKDevnet,
		});
		await env.wallets().syncByProfile(profile);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const {
			result: { current },
		} = renderHook(() => useFees(profile), { wrapper });

		await env.fees().sync(profile, "ARK", ARKDevnet);

		await expect(current.calculate({ coin: "ARK", network: ARKDevnet, type: "ipfs" })).resolves.toStrictEqual({
			avg: 5,
			isDynamic: true,
			max: 5,
			min: 5,
			static: 5,
		});
	});

	it("should retry find fees by type", async () => {
		env.reset({
			coins: { ARK },
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
			coin: "ARK",
			network: ARKDevnet,
		});
		await env.wallets().syncByProfile(profile);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const {
			result: { current },
		} = renderHook(() => useFees(profile), { wrapper });

		await env.fees().sync(profile, "ARK", ARKDevnet);

		await expect(current.calculate({ coin: "ARK", network: ARKDevnet, type: "ipfs" })).resolves.toStrictEqual({
			avg: 5,
			isDynamic: true,
			max: 5,
			min: 5,
			static: 5,
		});

		mockFind.mockRestore();
	});

	it("should calculate and return multisignature fees with one participant", async () => {
		env.reset({
			coins: { ARK },
			httpClient,
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});

		const profile = await env.profiles().create("John Doe");
		await env.profiles().restore(profile);

		const { wallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: ARKDevnet,
		});

		await triggerMessageSignOnce(wallet);

		await env.wallets().syncByProfile(profile);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const {
			result: { current },
		} = renderHook(() => useFees(profile), { wrapper });

		await expect(
			current.calculate({
				coin: "ARK",
				data: {},
				network: ARKDevnet,
				type: "multiSignature",
			}),
		).resolves.toStrictEqual({
			avg: 0,
			isDynamic: false,
			max: 0,
			min: 0,
			static: 0,
		});

		await env.fees().sync(profile, "ARK", ARKDevnet);

		await expect(
			current.calculate({
				coin: "ARK",
				data: {},
				network: ARKDevnet,
				type: "multiSignature",
			}),
		).resolves.toStrictEqual({
			avg: 10,
			isDynamic: false,
			max: 10,
			min: 10,
			static: 10,
		});
	});

	it("should calculate and return multisignature fees with two participants", async () => {
		env.reset({
			coins: { ARK },
			httpClient,
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});

		const profile = await env.profiles().create("John Doe");
		await env.profiles().restore(profile);

		const { wallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: ARKDevnet,
		});

		await triggerMessageSignOnce(wallet);

		await env.wallets().syncByProfile(profile);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const {
			result: { current },
		} = renderHook(() => useFees(profile), { wrapper });

		await env.fees().sync(profile, "ARK", ARKDevnet);

		await expect(
			current.calculate({
				coin: wallet.network().coin(),
				data: {
					minParticipants: 2,
					participants: [
						{
							address: "D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
							alias: "Wallet #1",
							publicKey: "03af2feb4fc97301e16d6a877d5b135417e8f284d40fac0f84c09ca37f82886c51",
						},
						{
							address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
							alias: "Wallet #2",
							publicKey: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc",
						},
					],
				},
				network: wallet.network().id(),
				type: "multiSignature",
			}),
		).resolves.toStrictEqual({
			avg: 15,
			isDynamic: false,
			max: 15,
			min: 15,
			static: 15,
		});
	});

	it("should calculate and return fees when feeType is size", async () => {
		env.reset({
			coins: { ARK },
			httpClient,
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});

		const profile = await env.profiles().create("John Doe");
		await env.profiles().restore(profile);
		const { wallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: ARKDevnet,
		});
		await env.wallets().syncByProfile(profile);

		const mockFind = vi.spyOn(env.fees(), "findByType").mockReturnValue({} as any);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const {
			result: { current },
		} = renderHook(() => useFees(profile), { wrapper });

		await env.fees().sync(profile, "ARK", ARKDevnet);

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

	it("should return a default value when error is thrown in the calculation", async () => {
		env.reset({
			coins: { ARK },
			httpClient,
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});

		const profile = await env.profiles().create("John Doe");
		await env.profiles().restore(profile);
		const { wallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: ARKDevnet,
		});
		await env.wallets().syncByProfile(profile);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const {
			result: { current },
		} = renderHook(() => useFees(profile), { wrapper });

		await env.fees().sync(profile, "ARK", ARKDevnet);

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
});
