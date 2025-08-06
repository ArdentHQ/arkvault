import { env, getMainsailProfileId, triggerMessageSignOnce } from "@/utils/testing-library";

import * as Mainsail from "@/app/lib/mainsail";
import { BigNumber } from "@/app/lib/helpers";
import { EnvironmentProvider } from "@/app/contexts";
import React from "react";
import { StubStorage } from "@/tests/mocks";
import { httpClient } from "@/app/services";
import { renderHook } from "@testing-library/react";
import { getEstimateGasParams, useFees } from "./use-fees";
import { Contracts } from "@/app/lib/profiles";

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

	it.skip("should calculate and return multisignature fees with one participant", async () => {
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

		await triggerMessageSignOnce(wallet);

		await env.wallets().syncByProfile(profile);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const {
			result: { current },
		} = renderHook(() => useFees(profile), { wrapper });

		await expect(
			current.calculate({
				coin: "Mainsail",
				data: {},
				network: MainsailDevnet,
				type: "multiSignature",
			}),
		).resolves.toStrictEqual({
			avg: 0,
			isDynamic: false,
			max: 0,
			min: 0,
			static: 0,
		});

		await env.fees().sync(profile, "Mainsail", MainsailDevnet);

		await expect(
			current.calculate({
				coin: "Mainsail",
				data: {},
				network: MainsailDevnet,
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

	it.skip("should calculate and return multisignature fees with two participants", async () => {
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

		await triggerMessageSignOnce(wallet);

		await env.wallets().syncByProfile(profile);

		const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;
		const {
			result: { current },
		} = renderHook(() => useFees(profile), { wrapper });

		await env.fees().sync(profile, "Mainsail", MainsailDevnet);

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

describe("getEstimateGasParams", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().first();
	});

	it("should return params for transfer", () => {
		const result = getEstimateGasParams(
			profile.activeNetwork(),
			{
				recipientAddress: wallet.address(),
				senderAddress: wallet.address(),
			},
			"transfer",
		);

		expect(result).toEqual({
			from: wallet.address(),
			to: wallet.address(),
		});
	});

	it("should return params for vote", () => {
		const result = getEstimateGasParams(
			profile.activeNetwork(),
			{
				senderAddress: wallet.address(),
				voteAddresses: [wallet.address()],
			},
			"vote",
		);

		expect(result).toEqual({
			data: expect.stringMatching(/^0x/),
			from: wallet.address(),
			to: "0x535B3D7A252fa034Ed71F0C53ec0C6F784cB64E1",
		});
	});

	it("should return params for validatorRegistration", () => {
		const result = getEstimateGasParams(
			profile.activeNetwork(),
			{
				senderAddress: wallet.address(),
				validatorPublicKey: "bls-key",
			},
			"validatorRegistration",
		);

		expect(result).toEqual({
			data: expect.stringMatching(/^0x/),
			from: wallet.address(),
			to: "0x535B3D7A252fa034Ed71F0C53ec0C6F784cB64E1",
			value: "0x0",
		});
	});

	it("should return params for validatorResignation", () => {
		const result = getEstimateGasParams(
			profile.activeNetwork(),
			{
				senderAddress: wallet.address(),
			},
			"validatorResignation",
		);

		expect(result).toEqual({
			data: expect.stringMatching(/^0x/),
			from: wallet.address(),
			to: "0x535B3D7A252fa034Ed71F0C53ec0C6F784cB64E1",
		});
	});

	it("should return params for usernameRegistration", () => {
		const result = getEstimateGasParams(
			profile.activeNetwork(),
			{
				senderAddress: wallet.address(),
			},
			"usernameRegistration",
		);

		expect(result).toEqual({
			data: expect.stringMatching(/^0x/),
			from: wallet.address(),
			to: "0x2c1DE3b4Dbb4aDebEbB5dcECAe825bE2a9fc6eb6",
		});
	});

	it("should return params for usernameResignation", () => {
		const result = getEstimateGasParams(
			profile.activeNetwork(),
			{
				senderAddress: wallet.address(),
			},
			"usernameResignation",
		);

		expect(result).toEqual({
			data: expect.stringMatching(/^0x/),
			from: wallet.address(),
			to: "0x2c1DE3b4Dbb4aDebEbB5dcECAe825bE2a9fc6eb6",
		});
	});

	it("should return params for multiPayment", () => {
		const result = getEstimateGasParams(
			profile.activeNetwork(),
			{
				recipients: [
					{ address: wallet.address(), amount: 5 },
					{ address: wallet.address(), amount: 10 },
				],
				senderAddress: wallet.address(),
			},
			"multiPayment",
		);

		expect(result).toEqual({
			data: expect.stringMatching(/^0x/),
			from: wallet.address(),
			to: "0x00EFd0D4639191C49908A7BddbB9A11A994A8527",
			value: "0xd02ab486cedc0000",
		});
	});
});
