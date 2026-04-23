import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";
import { FormProvider, useForm, UseFormMethods } from "react-hook-form";

import { UsernameRegistrationForm, signUsernameRegistration, handleSelectSender } from "./UsernameRegistrationForm";
import { getWalletAddress } from "./FormStep";
import * as useFeesHook from "@/app/hooks/use-fees";
import usernameResignationFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/username-resignation.json";
import { TransactionFixture } from "@/tests/fixtures/transactions";

import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	RenderResult,
	screen,
	syncValidators,
	waitFor,
} from "@/utils/testing-library";
import { vi } from "vitest";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let isValidatorMock: vi.Mock;
const fees = { avg: 1.354, max: 10, min: 0 };

const renderComponent = (properties?: any) => {
	let form: UseFormMethods | undefined;

	const defaultValues = properties?.defaultValues ?? { fee: "2" };
	const activeTab = properties?.activeTab ?? 1;

	const Component = () => {
		form = useForm({ defaultValues, mode: "onChange" });

		const { register } = form;

		useEffect(() => {
			register("fee");
			register("fees");
			register("inputFeeSettings");
			register("username");
			register("senderAddress");
		}, [register]);

		return (
			<FormProvider {...form}>
				<UsernameRegistrationForm.component profile={profile} activeTab={activeTab} wallet={wallet} />
			</FormProvider>
		);
	};

	const utils: RenderResult = render(<Component />, {
		route: `/profiles/${profile.id()}`,
	});

	return { ...utils, form };
};

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => 0,
		data: () => ({ data: () => usernameResignationFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${usernameResignationFixture.data.hash}`,
		from: () => usernameResignationFixture.data.from,
		gasPrice: () => +usernameResignationFixture.data.gasPrice / 1e8,
		hash: () => usernameResignationFixture.data.hash,
		to: () => usernameResignationFixture.data.to,
		username: () => "testuser.",
	});

const formStepID = "UsernameRegistrationForm__form-step";

describe("UsernameRegistrationForm", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		isValidatorMock = vi.spyOn(wallet, "isValidator").mockReturnValue(false);

		await syncValidators(profile);

		vi.spyOn(useFeesHook, "useFees").mockReturnValue({
			calculate: () => Promise.resolve(fees),
		});
	});

	afterAll(() => {
		isValidatorMock.mockRestore();
	});

	it("should render form step", async () => {
		const { asFragment } = renderComponent();

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render review step", async () => {
		const { asFragment } = renderComponent({ activeTab: 2 });

		await expect(screen.findByTestId("UsernameRegistrationForm__review-step")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should error if username is too long", async () => {
		renderComponent();

		const longUsername = "this_username_is_way_too_long_for_validation";

		await userEvent.type(screen.getByTestId("Input__username"), longUsername);

		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue(longUsername));

		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveAttribute("aria-invalid"));

		expect(screen.getByTestId("Input__error")).toBeVisible();
	});

	it("should set username", async () => {
		const { form } = renderComponent();

		const username = "testuser";

		await userEvent.type(screen.getByTestId("Input__username"), username);

		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue(username));
		await waitFor(() => expect(form?.getValues("username")).toBe(username));
	});

	it("should output transaction details", () => {
		const translations = vi.fn((translation) => translation);
		const transaction = {
			...TransactionFixture,
			data: () => ({ data: () => usernameResignationFixture.data }),
			fee: () => usernameResignationFixture.data.fee / 1e8,
			from: () => usernameResignationFixture.data.from,
			gasLimit: () => usernameResignationFixture.data.gas,
			gasPrice: () => usernameResignationFixture.data.gasPrice,
			hash: () => usernameResignationFixture.data.hash,
			to: () => usernameResignationFixture.data.to,
			username: () => "testuser.",
		};

		render(
			<UsernameRegistrationForm.transactionDetails
				transaction={transaction}
				translations={translations}
				wallet={wallet}
			/>,
		);

		expect(screen.getByText(/testuser\./)).toBeInTheDocument();
	});

	it("should sign transaction", async () => {
		const form = {
			clearErrors: vi.fn(),
			getValues: () => ({
				gasLimit: "1",
				gasPrice: "1",
				mnemonic: MNEMONICS[0],
				network: wallet.network(),
				senderAddress: wallet.address(),
				username: "testuser",
			}),
			setError: vi.fn(),
			setValue: vi.fn(),
		};
		const signMock = vi
			.spyOn(wallet.transaction(), "signUsernameRegistration")
			.mockReturnValue(Promise.resolve(usernameResignationFixture.data.hash));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [usernameResignationFixture.data.hash],
			errors: {},
			rejected: [],
		});

		const transactionMock = createTransactionMock(wallet);

		await signUsernameRegistration({
			env,
			form,
			profile,
		});

		expect(signMock).toHaveBeenCalledWith({
			data: {
				username: "testuser",
			},
			gasLimit: "1",
			gasPrice: "1",
			signatory: undefined,
		});
		expect(broadcastMock).toHaveBeenCalledWith(usernameResignationFixture.data.hash);
		expect(transactionMock).toHaveBeenCalledWith(usernameResignationFixture.data.hash);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should sign transaction using password encryption", async () => {
		const walletUsesWIFMock = vi.spyOn(wallet.signingKey(), "exists").mockReturnValue(true);
		const walletWifMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue(MNEMONICS[0]);

		const form = {
			clearErrors: vi.fn(),
			getValues: () => ({
				encryptionPassword: "password",
				gasLimit: "1",
				gasPrice: "1",
				mnemonic: MNEMONICS[0],
				network: wallet.network(),
				senderAddress: wallet.address(),
				username: "testuser",
			}),
			setError: vi.fn(),
			setValue: vi.fn(),
		};
		const signMock = vi
			.spyOn(wallet.transaction(), "signUsernameRegistration")
			.mockReturnValue(Promise.resolve(usernameResignationFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [usernameResignationFixture.data.hash],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await signUsernameRegistration({
			env,
			form,
			profile,
		});

		expect(signMock).toHaveBeenCalledWith({
			data: {
				username: "testuser",
			},
			gasLimit: "1",
			gasPrice: "1",
			signatory: undefined,
		});
		expect(broadcastMock).toHaveBeenCalledWith(usernameResignationFixture.data.hash);
		expect(transactionMock).toHaveBeenCalledWith(usernameResignationFixture.data.hash);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		walletUsesWIFMock.mockRestore();
		walletWifMock.mockRestore();
	});

	it("should set sender address and sync wallet when not fully restored", async () => {
		const setValueMock = vi.fn();

		const identityMock = vi.fn();
		const synchroniserMock = vi.fn().mockReturnValue({ identity: identityMock });

		const mockWallet = {
			...wallet,
			hasBeenFullyRestored: () => false,
			hasSyncedWithNetwork: () => false,
			synchroniser: synchroniserMock,
		};

		vi.spyOn(profile.wallets(), "findByAddressWithNetwork").mockReturnValue(mockWallet);

		handleSelectSender(wallet.address(), setValueMock, profile, wallet.network().id());

		expect(setValueMock).toHaveBeenCalledWith("senderAddress", wallet.address(), {
			shouldDirty: true,
			shouldValidate: false,
		});
		expect(synchroniserMock).toHaveBeenCalled();
		expect(identityMock).toHaveBeenCalled();
	});

	it("should not sync wallet when already fully restored and synced", async () => {
		const setValueMock = vi.fn();

		const synchroniserMock = vi.fn();

		const mockWallet = {
			...wallet,
			hasBeenFullyRestored: () => true,
			hasSyncedWithNetwork: () => true,
			synchroniser: synchroniserMock,
		};

		vi.spyOn(profile.wallets(), "findByAddressWithNetwork").mockReturnValue(mockWallet);

		handleSelectSender(wallet.address(), setValueMock, profile, wallet.network().id());

		expect(setValueMock).toHaveBeenCalledWith("senderAddress", wallet.address(), {
			shouldDirty: true,
			shouldValidate: false,
		});
		expect(synchroniserMock).not.toHaveBeenCalled();
	});
});

describe("getWalletAddress", () => {
	it("should return address when wallet is provided", () => {
		const mockWallet = { address: () => "0x123" };
		expect(getWalletAddress(mockWallet)).toBe("0x123");
	});

	it("should return empty string when wallet is null", () => {
		expect(getWalletAddress(null)).toBe("");
	});

	it("should return empty string when wallet is undefined", () => {
		expect(getWalletAddress(undefined)).toBe("");
	});
});
