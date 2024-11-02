import { Contracts } from "@ardenthq/sdk";
import { Contracts as ProfilesContracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";
import { FormProvider, useForm, UseFormMethods } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Route } from "react-router-dom";

import { MultiSignatureRegistrationForm } from "./MultiSignatureRegistrationForm";
import { translations } from "@/domains/transaction/i18n";
import multiSignatureFixture from "@/tests/fixtures/coins/ark/devnet/transactions/multisignature-registration.json";
import { TransactionFees } from "@/types";
import { env, getDefaultProfileId, render, RenderResult, screen, syncFees, waitFor } from "@/utils/testing-library";

const truncatedAddress = (address) => address.slice(0, 5) + "..." + address.slice(-5);

describe("MultiSignature Registration Form", () => {
	let profile: ProfilesContracts.IProfile;
	let wallet: ProfilesContracts.IReadWriteWallet;
	let wallet2: ProfilesContracts.IReadWriteWallet;
	let fees: TransactionFees;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
		wallet2 = profile.wallets().last();
		fees = {
			avg: 5,
			isDynamic: true,
			max: 5,
			min: 15,
			static: 5,
		};

		await profile.sync();
		await syncFees(profile);
	});

	const renderComponent = (properties?: any) => {
		let form: UseFormMethods<any> | undefined;

		const activeTab = properties?.activeTab ?? 1;
		const defaultValues = properties?.defaultValues ?? { fees };

		const Component = () => {
			form = useForm({
				defaultValues,
				mode: "onChange",
			});

			const { register } = form;

			useEffect(() => {
				register("fee");
				register("fees");
				register("inputFeeSettings");
				register("minParticipants");
				register("participants");
			}, [register]);

			return (
				<FormProvider {...form}>
					<MultiSignatureRegistrationForm.component profile={profile} activeTab={activeTab} wallet={wallet} />
				</FormProvider>
			);
		};

		const utils: RenderResult = render(
			<Route path="/profiles/:profileId">
				<Component />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		return { ...utils, form };
	};

	it("should render form step", async () => {
		fees.isDynamic = false;

		const { asFragment } = renderComponent();

		await waitFor(() => expect(screen.queryAllByTestId("AddParticipantItem")).toHaveLength(1));

		await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue(String(fees.static)));

		expect(asFragment()).toMatchSnapshot();

		fees.isDynamic = true;
	});

	it("should set fee if dynamic", async () => {
		renderComponent();

		userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		await waitFor(() => expect(screen.getByTestId("InputCurrency")).toBeVisible());

		await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("10"));
	});

	it("should fill form", async () => {
		const { form } = renderComponent();
		const participantsCount = 2;

		await userEvent.click(screen.getByText(translations.FEES.AVERAGE));

		await waitFor(() =>
			expect(form?.formState.errors.feeCalculation.message).toBe("fee calculation not completed"),
		);
		await waitFor(() => expect(form?.formState.errors.feeCalculation).toBeUndefined());

		await waitFor(() => expect(form?.getValues("minParticipants")).toBe(participantsCount));
		await waitFor(() => expect(form?.getValues("fee")).toBe(fees.avg * participantsCount));

		await userEvent.clear(screen.getByTestId("SelectDropdown__input"));
		await userEvent.type(screen.getByTestId("SelectDropdown__input"), wallet2.address());

		await userEvent.click(screen.getByText(translations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() =>
			expect(form?.getValues("participants")).toStrictEqual([
				{
					address: wallet.address(),
					alias: wallet.alias(),
					publicKey: wallet.publicKey(),
				},
				{
					address: wallet2.address(),
					alias: wallet2.alias(),
					publicKey: wallet2.publicKey(),
				},
			]),
		);
	});

	it("should set min participants", async () => {
		const { form } = renderComponent();
		const participantsCount = 2;

		await userEvent.click(screen.getByText(translations.FEES.AVERAGE));

		await waitFor(() =>
			expect(form?.formState.errors.feeCalculation.message).toBe("fee calculation not completed"),
		);

		await waitFor(() => expect(form?.formState.errors.feeCalculation).toBeUndefined());

		await waitFor(() => expect(form?.getValues("minParticipants")).toBe(participantsCount));
		await waitFor(() => expect(form?.getValues("fee")).toBe(fees.avg * participantsCount));

		await userEvent.clear(screen.getByTestId("MultiSignatureRegistrationForm__min-participants"));
		await userEvent.type(screen.getByTestId("MultiSignatureRegistrationForm__min-participants"), "3");

		await waitFor(() => expect(form?.getValues("minParticipants")).toBe("3"));
	});

	it("should show name of wallets in form step", async () => {
		const { form } = renderComponent();

		await waitFor(() => expect(screen.getAllByTestId("Address__alias")).toHaveLength(2));

		await userEvent.clear(screen.getByTestId("SelectDropdown__input"));
		await userEvent.type(screen.getByTestId("SelectDropdown__input"), wallet2.address());

		await userEvent.click(screen.getByText(translations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => expect(form?.getValues("participants")).toHaveLength(2));

		expect(screen.getByText("Participant #1")).toBeInTheDocument();
		expect(screen.getAllByTestId("AddParticipantItem")[0]).toHaveTextContent("ARK Wallet 1");
		expect(screen.getByText("Participant #2")).toBeInTheDocument();
		expect(screen.getAllByTestId("AddParticipantItem")[1]).toHaveTextContent("ARK Wallet 2");
	});

	it("should render review step", () => {
		const { asFragment } = renderComponent({
			activeTab: 2,
			defaultValues: {
				fee: fees.avg,
				fees,
				minParticipants: 2,
				participants: [
					{
						address: wallet.address(),
						publicKey: wallet.publicKey()!,
					},
					{
						address: wallet2.address(),
						publicKey: wallet2.publicKey()!,
					},
				],
			},
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show name of wallets in review step", async () => {
		renderComponent({
			activeTab: 2,
			defaultValues: {
				fee: fees.avg,
				fees,
				minParticipants: 2,
				participants: [
					{
						address: wallet.address(),
						alias: wallet.alias(),
						publicKey: wallet.publicKey()!,
					},
					{
						address: wallet2.address(),
						alias: wallet2.alias(),
						publicKey: wallet2.publicKey()!,
					},
				],
			},
		});

		expect(screen.getByText(wallet.address())).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getAllByText(truncatedAddress(wallet2.address()))).toHaveLength(1);
		});

		await waitFor(() => {
			expect(screen.getAllByText(truncatedAddress(wallet.address()))).toHaveLength(1);
		});
	});

	it("should render transaction details", async () => {
		const DetailsComponent = () => {
			const { t } = useTranslation();
			return (
				<MultiSignatureRegistrationForm.transactionDetails
					translations={t}
					transaction={transaction}
					wallet={wallet}
				/>
			);
		};
		const transaction = {
			amount: () => multiSignatureFixture.data.amount / 1e8,
			data: () => ({ data: () => multiSignatureFixture.data }),
			fee: () => multiSignatureFixture.data.fee / 1e8,
			id: () => multiSignatureFixture.data.id,
			recipient: () => multiSignatureFixture.data.recipient,
			sender: () => multiSignatureFixture.data.sender,
		} as Contracts.SignedTransactionData;
		const { asFragment } = render(<DetailsComponent />);

		await expect(screen.findByTestId("TransactionFee")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should set final fee based on participants", async () => {
		const { form } = renderComponent({
			defaultValues: {
				minParticipants: 2,
				participants: [
					{
						address: wallet.address(),
						alias: wallet.alias(),
						publicKey: wallet.publicKey(),
					},
					{
						address: wallet2.address(),
						alias: wallet2.alias(),
						publicKey: wallet2.publicKey(),
					},
				],
			},
		});

		await waitFor(() => expect(form?.getValues("participants")).toHaveLength(2));

		await waitFor(() => expect(form?.getValues("fee")?.toString()).toBe(`${fees.static + fees.static * 2}`));
	});

	it("should keep the minimum required signatures", async () => {
		const { form } = renderComponent({
			defaultValues: {
				minParticipants: 2,
				participants: [
					{
						address: wallet.address(),
						alias: wallet.alias(),
						publicKey: wallet.publicKey(),
					},
					{
						address: wallet2.address(),
						alias: wallet2.alias(),
						publicKey: wallet2.publicKey(),
					},
				],
			},
		});

		await waitFor(() => expect(form?.getValues("minParticipants")).toBe(2));

		const removeButton = screen.getAllByTestId("AddParticipantItem--deleteButton")[1];

		expect(removeButton).toBeInTheDocument();
		expect(removeButton).toBeEnabled();

		userEvent.click(removeButton);

		await waitFor(() => expect(form?.getValues("minParticipants")).toBe(2));
	});

	it("should limit min required signatures to max participants", async () => {
		const { form } = renderComponent({
			defaultValues: {
				minParticipants: 3,
				participants: [
					{
						address: wallet.address(),
						alias: wallet.alias(),
						publicKey: wallet.publicKey(),
					},
					{
						address: wallet2.address(),
						alias: wallet2.alias(),
						publicKey: wallet2.publicKey(),
					},
				],
			},
		});

		await waitFor(() => expect(form?.getValues("minParticipants")).toBe(2));
	});
});
