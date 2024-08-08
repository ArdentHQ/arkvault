import { Contracts } from "@ardenthq/sdk";
import { BIP39 } from "@ardenthq/sdk-cryptography";
import { Contracts as ProfilesContracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Route, Router } from "react-router-dom";
import { SecondSignatureRegistrationForm, signSecondSignatureRegistration } from "./SecondSignatureRegistrationForm";
import * as useFilesHook from "@/app/hooks/use-files";
import * as randomWordPositionsMock from "@/domains/wallet/components/MnemonicVerification/utils/randomWordPositions";
import { toasts } from "@/app/services";
import { translations } from "@/domains/transaction/i18n";
import secondSignatureFixture from "@/tests/fixtures/coins/ark/devnet/transactions/second-signature-registration.json";
import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	renderWithForm,
	screen,
	waitFor,
	within,
} from "@/utils/testing-library";

const history = createHashHistory();
const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;

const secondMnemonic = "test mnemonic";

const generationStepId = "SecondSignatureRegistrationForm__generation-step";
const backupStepId = "SecondSignatureRegistrationForm__backup-step";
const verificationStepId = "SecondSignatureRegistrationForm__verification-step";
const reviewStepId = "SecondSignatureRegistrationForm__review-step";

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe("SecondSignatureRegistrationForm", () => {
	const passphrase = "power return attend drink piece found tragic fire liar page disease combine";
	let profile: ProfilesContracts.IProfile;
	let wallet: ProfilesContracts.IReadWriteWallet;

	const fees = { avg: 1.354, max: 10, min: 0, static: 0 };

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	const createTransactionMock = (wallet: ProfilesContracts.IReadWriteWallet) =>
		// @ts-ignore
		vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
			amount: () => secondSignatureFixture.data.amount / 1e8,
			data: () => ({ data: () => secondSignatureFixture.data }),
			explorerLink: () => `https://test.arkscan.io/transaction/${secondSignatureFixture.data.id}`,
			fee: () => secondSignatureFixture.data.fee / 1e8,
			id: () => secondSignatureFixture.data.id,
			recipient: () => secondSignatureFixture.data.recipient,
			sender: () => secondSignatureFixture.data.sender,
		});

	it("should render generation step", async () => {
		history.push(dashboardURL);

		const passphrase = "mock bip39 passphrase";
		const bip39GenerateMock = vi.spyOn(BIP39, "generate").mockReturnValue(passphrase);

		const { form, asFragment } = renderWithForm(
			<Router history={history}>
				<Route path="/profiles/:profileId/dashboard">
					<SecondSignatureRegistrationForm.component profile={profile} activeTab={1} wallet={wallet} />
				</Route>
			</Router>,
			{
				defaultValues: { fees },
				withProviders: true,
			},
		);

		await waitFor(() => expect(screen.getByTestId(generationStepId)));
		await waitFor(() => expect(form()?.getValues("secondMnemonic")).toBe(passphrase));

		expect(bip39GenerateMock).toHaveBeenCalledWith("english", 24);
		expect(asFragment()).toMatchSnapshot();

		bip39GenerateMock.mockRestore();
	});

	it("should not generate mnemonic if already set", async () => {
		history.push(dashboardURL);

		const bip39GenerateMock = vi.spyOn(BIP39, "generate").mockImplementation(vi.fn());

		const { form, asFragment } = renderWithForm(
			<Router history={history}>
				<Route path="/profiles/:profileId/dashboard">
					<SecondSignatureRegistrationForm.component profile={profile} activeTab={1} wallet={wallet} />
				</Route>
			</Router>,
			{
				defaultValues: {
					fees,
					secondMnemonic,
				},
				withProviders: true,
			},
		);

		await waitFor(() => expect(screen.getByTestId(generationStepId)));

		expect(form()?.getValues("secondMnemonic")).toBe(secondMnemonic);
		expect(bip39GenerateMock).not.toHaveBeenCalled();
		expect(asFragment()).toMatchSnapshot();

		bip39GenerateMock.mockRestore();
	});

	it("should set fee", async () => {
		renderWithForm(
			<Router history={history}>
				<Route path="/profiles/:profileId/dashboard">
					<SecondSignatureRegistrationForm.component profile={profile} activeTab={1} wallet={wallet} />
				</Route>
			</Router>,
			{
				defaultValues: {
					fees,
				},
				registerCallback: ({ register }) => {
					register("fees");
					register("fee");
					register("inputFeeSettings");
				},
				withProviders: true,
			},
		);

		await waitFor(() => expect(screen.getByTestId(generationStepId)));

		// simple

		await waitFor(() => expect(screen.getAllByRole("radio")[1]).toBeChecked());

		await userEvent.click(within(screen.getByTestId("InputFee")).getAllByRole("radio")[2]);

		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		// advanced

		await userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		await waitFor(() => expect(screen.getByTestId("InputCurrency")).toBeVisible());

		await userEvent.clear(screen.getByTestId("InputCurrency"));
		await userEvent.type(screen.getByTestId("InputCurrency"), "9");

		await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("9"));
	});

	describe("backup step", () => {
		it("should render", async () => {
			const { asFragment } = renderWithForm(
				<SecondSignatureRegistrationForm.component profile={profile} activeTab={2} wallet={wallet} />,
				{
					defaultValues: {
						fees,
						secondMnemonic,
						wallet: {
							address: () => "address",
						},
					},
					withProviders: true,
				},
			);

			await expect(screen.findByTestId(backupStepId)).resolves.toBeVisible();

			const writeTextMock = vi.fn();
			const clipboardOriginal = navigator.clipboard;
			(navigator as any).clipboard = { writeText: writeTextMock };

			await userEvent.click(screen.getByTestId("clipboard-icon__wrapper"));

			await waitFor(() => expect(writeTextMock).toHaveBeenCalledWith(secondMnemonic));

			(navigator as any).clipboard = clipboardOriginal;

			expect(asFragment()).toMatchSnapshot();
		});

		it("should show success toast on successful download when non-legacy save method is used", async () => {
			const useFilesOutput = useFilesHook.useFiles();

			const isLegacyMock = vi.spyOn(useFilesHook, "useFiles").mockReturnValue({
				...useFilesOutput,
				isLegacy: () => false,
			});

			renderWithForm(
				<SecondSignatureRegistrationForm.component profile={profile} activeTab={2} wallet={wallet} />,
				{
					defaultValues: {
						fees,
						secondMnemonic,
						wallet: {
							address: () => "address",
						},
					},
					withProviders: true,
				},
			);

			await expect(screen.findByTestId(backupStepId)).resolves.toBeVisible();

			const toastSpy = vi.spyOn(toasts, "success");

			await userEvent.click(screen.getByTestId("CopyOrDownload__download"));

			const filePath = useFilesOutput.showSaveDialog(secondMnemonic, { fileName: "address.txt" });

			await waitFor(() =>
				expect(toastSpy).toHaveBeenCalledWith(
					<Trans i18nKey="COMMON.SAVE_FILE.SUCCESS" values={{ filePath }} />,
				),
			);

			toastSpy.mockRestore();
			isLegacyMock.mockRestore();
		});

		it("should not show success toast on successful download when legacy save method is used", async () => {
			renderWithForm(
				<SecondSignatureRegistrationForm.component profile={profile} activeTab={2} wallet={wallet} />,
				{
					defaultValues: {
						fees,
						secondMnemonic,
						wallet: {
							address: () => "address",
						},
					},
					withProviders: true,
				},
			);

			await expect(screen.findByTestId(backupStepId)).resolves.toBeVisible();

			const toastSpy = vi.spyOn(toasts, "success");

			await userEvent.click(screen.getByTestId("CopyOrDownload__download"));

			expect(toastSpy).not.toHaveBeenCalled();

			toastSpy.mockRestore();
		});

		it("should not show error toast on cancelled download", async () => {
			const toastSpy = vi.spyOn(toasts, "error").mockImplementation(vi.fn());

			const useFilesOutput = useFilesHook.useFiles();

			const showSaveDialogMock = vi.spyOn(useFilesHook, "useFiles").mockReturnValue({
				...useFilesOutput,
				showSaveDialog: () => {
					throw new Error("The user aborted a request");
				},
			});

			renderWithForm(
				<SecondSignatureRegistrationForm.component profile={profile} activeTab={2} wallet={wallet} />,
				{
					defaultValues: {
						fees,
						secondMnemonic,
						wallet: {
							address: () => "address",
						},
					},
					withProviders: true,
				},
			);

			await expect(screen.findByTestId(backupStepId)).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("CopyOrDownload__download"));

			await waitFor(() => {
				expect(toastSpy).not.toHaveBeenCalled();
			});

			toastSpy.mockRestore();
			showSaveDialogMock.mockRestore();
		});

		it("should show error toast on error", async () => {
			const useFilesOutput = useFilesHook.useFiles();

			const showSaveDialogMock = vi.spyOn(useFilesHook, "useFiles").mockReturnValue({
				...useFilesOutput,
				showSaveDialog: () => {
					throw new Error("error opening save dialog");
				},
			});

			renderWithForm(
				<SecondSignatureRegistrationForm.component profile={profile} activeTab={2} wallet={wallet} />,
				{
					defaultValues: {
						fees,
						secondMnemonic,
						wallet: {
							address: () => "address",
						},
					},
					withProviders: true,
				},
			);

			await expect(screen.findByTestId(backupStepId)).resolves.toBeVisible();

			const toastSpy = vi.spyOn(toasts, "error");

			await userEvent.click(screen.getByTestId("CopyOrDownload__download"));

			await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(expect.stringMatching(/Could not save file/)));

			toastSpy.mockRestore();
			showSaveDialogMock.mockRestore();
		});
	});

	it("should render verification step", async () => {
		vi.spyOn(randomWordPositionsMock, "randomWordPositions").mockReturnValue([1, 2, 3]);

		const { form } = renderWithForm(
			<SecondSignatureRegistrationForm.component profile={profile} activeTab={3} wallet={wallet} />,
			{
				defaultValues: {
					fees,
					secondMnemonic: passphrase,
				},
				withProviders: true,
			},
		);

		await expect(screen.findByTestId(verificationStepId)).resolves.toBeVisible();

		expect(form()?.getValues("verification")).toBeUndefined();

		const [firstInput, secondInput, thirdInput] = screen.getAllByTestId("MnemonicVerificationInput__input");
		await userEvent.clear(firstInput);
		await userEvent.type(firstInput, "power");
		await userEvent.clear(secondInput);
		await userEvent.type(secondInput, "return");
		await userEvent.clear(thirdInput);
		await userEvent.type(thirdInput, "attend");

		await waitFor(() => expect(form()?.getValues("verification")).toBe(true));
	});

	it("should render review step", async () => {
		renderWithForm(
			<Router history={history}>
				<Route path="/profiles/:profileId/dashboard">
					<SecondSignatureRegistrationForm.component profile={profile} activeTab={4} wallet={wallet} />
				</Route>
			</Router>,
			{
				defaultValues: {
					fee: 0,
					fees,
				},
				withProviders: true,
			},
		);

		await expect(screen.findByTestId(reviewStepId)).resolves.toBeVisible();
	});

	it("should render transaction details", async () => {
		const DetailsComponent = () => {
			const { t } = useTranslation();
			return (
				<SecondSignatureRegistrationForm.transactionDetails
					translations={t}
					transaction={transaction}
					wallet={wallet}
				/>
			);
		};
		const transaction = {
			amount: () => secondSignatureFixture.data.amount / 1e8,
			data: () => ({ data: () => secondSignatureFixture.data }),
			fee: () => secondSignatureFixture.data.fee / 1e8,
			id: () => secondSignatureFixture.data.id,
			recipient: () => secondSignatureFixture.data.recipient,
			sender: () => secondSignatureFixture.data.sender,
		} as Contracts.SignedTransactionData;
		const { asFragment } = render(<DetailsComponent />);

		await expect(screen.findByTestId("TransactionFee")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should sign transaction", async () => {
		const form = {
			clearErrors: vi.fn(),
			getValues: () => ({
				fee: "1",
				mnemonic: MNEMONICS[0],
				network: wallet.network(),
				secondMnemonic: MNEMONICS[1],
				senderAddress: wallet.address(),
			}),
			setError: vi.fn(),
			setValue: vi.fn(),
		};
		const signMock = vi
			.spyOn(wallet.transaction(), "signSecondSignature")
			.mockReturnValue(Promise.resolve(secondSignatureFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [secondSignatureFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await signSecondSignatureRegistration({
			env,
			form,
			profile,
		});

		expect(signMock).toHaveBeenCalledWith({ data: { mnemonic: MNEMONICS[1] }, fee: 1 });
		expect(broadcastMock).toHaveBeenCalledWith(secondSignatureFixture.data.id);
		expect(transactionMock).toHaveBeenCalledWith(secondSignatureFixture.data.id);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should sign transaction using encryption password", async () => {
		const walletUsesWIFMock = vi.spyOn(wallet.signingKey(), "exists").mockReturnValue(true);
		const walletWifMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue(passphrase);

		const form = {
			clearErrors: vi.fn(),
			getValues: () => ({
				encryptionPassword: "password",
				fee: "1",
				network: wallet.network(),
				senderAddress: wallet.address(),
			}),
			setError: vi.fn(),
			setValue: vi.fn(),
		};

		const signMock = vi
			.spyOn(wallet.transaction(), "signSecondSignature")
			.mockReturnValue(Promise.resolve(secondSignatureFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [secondSignatureFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);
		const mutatorMock = vi.spyOn(wallet.mutator(), "removeEncryption").mockImplementation(vi.fn());

		await signSecondSignatureRegistration({
			env,
			form,
			profile,
		});

		expect(signMock).toHaveBeenCalledWith({ data: {}, fee: 1 });
		expect(broadcastMock).toHaveBeenCalledWith(secondSignatureFixture.data.id);
		expect(transactionMock).toHaveBeenCalledWith(secondSignatureFixture.data.id);
		expect(mutatorMock).toHaveBeenCalledWith("password");

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		mutatorMock.mockRestore();
		walletUsesWIFMock.mockRestore();
		walletWifMock.mockRestore();
	});
});
