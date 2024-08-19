/* eslint-disable @typescript-eslint/require-await */
import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route } from "react-router-dom";

import { AddRecipient } from "./AddRecipient";
import { buildTranslations } from "@/app/i18n/helpers";
import { env, getDefaultProfileId, MNEMONICS, render, screen, waitFor, within } from "@/utils/testing-library";

const translations = buildTranslations();

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let network: Networks.Network;

const renderWithFormProvider = (children: any, defaultValues?: any) => {
	const Wrapper = () => {
		const form = useForm({
			defaultValues: {
				fee: 0,
				network,
				senderAddress: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
				...defaultValues,
			},
			mode: "onChange",
			shouldUnregister: false,
		});

		return <FormProvider {...form}>{children}</FormProvider>;
	};

	return render(
		<Route path="/profiles/:profileId">
			<Wrapper />
		</Route>,
		{
			route: `/profiles/${profile.id()}`,
		},
	);
};

const selectFirstRecipient = async () =>
	await userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
const recipientList = () => screen.getAllByTestId("AddRecipientItem");
const addRecipientButton = () => screen.getByTestId("AddRecipient__add-button");

const fillFieldsWithValidAddressAndAmount = async (address: string, amount: string | number) => {
	const amoutInput = screen.getByTestId("AddRecipient__amount");
	const addressInput = screen.getByTestId("SelectDropdown__input");

	await userEvent.clear(amoutInput);
	await userEvent.type(amoutInput, String(amount));

	await waitFor(() => expect(amoutInput).toHaveValue(String(amount)));

	await userEvent.clear(addressInput);
	await userEvent.type(addressInput, address);

	await waitFor(() => expect(addressInput).toHaveValue(address));
};

const selectRecipientID = "SelectRecipient__select-recipient";

describe("AddRecipient", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().findByAddressWithNetwork("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", "ark.devnet")!;
		network = wallet.network();
	});

	const Component = () => {
		const form = useForm({
			defaultValues: { fee: 0, network, senderAddress: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" },
			mode: "onChange",
		});

		useEffect(() => {
			form.register("network");
			form.register("senderAddress");
		}, []);

		return (
			<Route path="/profiles/:profileId">
				<FormProvider {...form}>
					<AddRecipient profile={profile} wallet={wallet} onChange={vi.fn()} recipients={[]} />
				</FormProvider>
			</Route>
		);
	};

	it("should render", async () => {
		const { container } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} recipients={[]} onChange={vi.fn()} />,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render with empty array of recipients as default", async () => {
		const { container } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} onChange={vi.fn()} />,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render with single recipient data", async () => {
		const values = {
			amount: "1",
			recipientAddress: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
		};

		const { container } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} recipients={[]} onChange={vi.fn()} />,
			values,
		);

		await waitFor(() => {
			expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1");
		});

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue("D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax");
		expect(container).toMatchSnapshot();
	});

	it("should render with multiple recipients switch", async () => {
		const { container } = renderWithFormProvider(
			<AddRecipient
				onChange={vi.fn()}
				profile={profile}
				recipients={[]}
				showMultiPaymentOption
				wallet={wallet}
			/>,
		);

		await waitFor(() => expect(screen.getByTestId("SelectDropdown__input")).not.toHaveValue());

		expect(container).toMatchSnapshot();
	});

	it("should render without the single & multiple switch", async () => {
		const { container } = renderWithFormProvider(
			<AddRecipient
				onChange={vi.fn()}
				profile={profile}
				recipients={[]}
				showMultiPaymentOption={false}
				wallet={wallet}
			/>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should set amount", async () => {
		const onChange = vi.fn();
		const findDelegateSpy = vi.spyOn(env.delegates(), "findByAddress").mockImplementation(
			() =>
				({
					username: () => "delegate username",
				}) as any,
		);

		const address = "bP6T9GQ3kqP6T9GQ3kqP6T9GQ3kqTTTP6T9GQ3kqT";
		const amount = 1;

		renderWithFormProvider(<AddRecipient profile={profile} wallet={wallet} onChange={onChange} recipients={[]} />);

		await fillFieldsWithValidAddressAndAmount(address, 1);

		expect(onChange).toHaveBeenCalledWith([
			{
				address: address,
				alias: "delegate username",
				amount: amount,
				isDelegate: true,
			},
		]);

		findDelegateSpy.mockRestore();
	});

	it("should select recipient", async () => {
		renderWithFormProvider(<AddRecipient profile={profile} wallet={wallet} recipients={[]} onChange={vi.fn()} />);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId(selectRecipientID));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await selectFirstRecipient();

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		const selectedAddressValue = profile.wallets().first().address();

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(selectedAddressValue);
	});

	it("should set available amount", async () => {
		const { container } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} recipients={[]} onChange={vi.fn()} />,
		);

		await userEvent.click(screen.getByTestId("AddRecipient__send-all"));

		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue(`${wallet.balance()}`));

		expect(container).toMatchSnapshot();
	});

	it("should show zero amount if wallet has zero or insufficient balance", async () => {
		const emptyProfile = await env.profiles().create("Empty");

		const emptyWallet = await emptyProfile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[0],
			network: "ark.devnet",
		});

		vi.spyOn(emptyWallet, "balance").mockReturnValue(0);
		vi.spyOn(emptyWallet.network(), "isTest").mockReturnValue(false);

		emptyProfile.wallets().push(emptyWallet);

		const { container } = renderWithFormProvider(
			<AddRecipient profile={emptyProfile} wallet={emptyWallet} recipients={[]} onChange={vi.fn()} />,
		);

		await userEvent.click(screen.getByTestId("AddRecipient__send-all"));

		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("0"));

		expect(container).toMatchSnapshot();
	});

	it("should show available balance after fee", async () => {
		vi.spyOn(wallet, "balance").mockReturnValue(12);
		vi.spyOn(wallet.network(), "isTest").mockReturnValue(false);

		const { container } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} recipients={[]} onChange={vi.fn()} />,
			{
				fee: 8,
			},
		);

		expect(screen.getByTestId("AddRecipient__available")).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId("AddRecipient__available")).toHaveTextContent("4"));

		expect(container).toMatchSnapshot();
	});

	it("should hide available balance if fee > balance", async () => {
		vi.spyOn(wallet, "balance").mockReturnValue(12);
		vi.spyOn(wallet.network(), "isTest").mockReturnValue(false);

		const { container } = renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} recipients={[]} onChange={vi.fn()} />,
			{
				fee: 12.1,
			},
		);

		await waitFor(() => expect(screen.queryByText("AddRecipient__available")).not.toBeInTheDocument());

		expect(container).toMatchSnapshot();
	});

	it("should toggle between single and multiple recipients", async () => {
		renderWithFormProvider(<AddRecipient profile={profile} wallet={wallet} recipients={[]} onChange={vi.fn()} />);

		const singleButton = screen.getByText(translations.TRANSACTION.SINGLE);
		const multipleButton = screen.getByText(translations.TRANSACTION.MULTIPLE);

		const recipientLabel = "Recipient #1";

		expect(screen.queryByText(recipientLabel)).not.toBeInTheDocument();

		await userEvent.click(multipleButton);

		await expect(screen.findByText(recipientLabel)).resolves.toBeVisible();

		await userEvent.click(singleButton);

		await waitFor(() => expect(screen.queryByText(recipientLabel)).not.toBeInTheDocument());
	});

	it("should clear the value when changing from multiple to single if more than one wallet is added", async () => {
		const onChange = vi.fn();

		let form: ReturnType<typeof useForm>;

		const Component = () => {
			form = useForm({
				defaultValues: { fee: 0, network, senderAddress: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" },
				mode: "onChange",
				shouldUnregister: false,
			});

			useEffect(() => {
				form.register("network");
				form.register("senderAddress");
			}, []);

			return (
				<Route path="/profiles/:profileId">
					<FormProvider {...form}>
						<AddRecipient
							profile={profile}
							wallet={wallet}
							onChange={onChange}
							recipients={[
								{
									address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
									amount: 1,
								},
								{
									address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ay",
									amount: 1,
								},
							]}
						/>
					</FormProvider>
				</Route>
			);
		};

		render(<Component />, {
			route: `/profiles/${profile.id()}`,
		});

		const singleButton = screen.getByText(translations.TRANSACTION.SINGLE);
		const multipleButton = screen.getByText(translations.TRANSACTION.MULTIPLE);

		const amount = "1";
		const recipientLabel = "Recipient #1";

		await userEvent.click(multipleButton);

		await expect(screen.findByText(recipientLabel)).resolves.toBeVisible();

		await fillFieldsWithValidAddressAndAmount("D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax", amount);
		await waitFor(() => expect(addRecipientButton()).toBeEnabled());
		await userEvent.click(addRecipientButton());

		await waitFor(() => expect(recipientList()).toHaveLength(3));

		await userEvent.click(singleButton);

		await waitFor(() => expect(screen.queryByText(recipientLabel)).not.toBeInTheDocument());

		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("");

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue("");

		expect(onChange).toHaveBeenCalledWith([]);
	});

	it("should keep values while toggling between single and multiple recipients", async () => {
		renderWithFormProvider(<AddRecipient profile={profile} wallet={wallet} recipients={[]} onChange={vi.fn()} />);

		const singleButton = screen.getByText(translations.TRANSACTION.SINGLE);
		const multipleButton = screen.getByText(translations.TRANSACTION.MULTIPLE);

		const address = "bP6T9GQ3kqP6T9GQ3kqP6T9GQ3kqTTTP6T9GQ3kqT";
		const amount = "1";
		const recipientLabel = "Recipient #1";

		await fillFieldsWithValidAddressAndAmount(address, amount);

		await userEvent.click(multipleButton);

		await expect(screen.findByText(recipientLabel)).resolves.toBeVisible();

		await userEvent.click(singleButton);

		await waitFor(() => expect(screen.queryByText(recipientLabel)).not.toBeInTheDocument());

		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue(amount);

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(address);
	});

	it("should prevent adding invalid recipient address in multiple type", async () => {
		const values = {
			amount: 1,
			recipientAddress: "bP6T9GQ3kqP6T9GQ3kqP6T9GQ3kqTTTP6T9GQ3kqT",
		};

		let form: ReturnType<typeof useForm>;

		const Component = () => {
			form = useForm({
				defaultValues: { fee: 0, network, senderAddress: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" },
				mode: "onChange",
				shouldUnregister: false,
			});

			useEffect(() => {
				form.register("network");
				form.register("senderAddress");
			}, []);

			return (
				<Route path="/profiles/:profileId">
					<FormProvider {...form}>
						<AddRecipient
							profile={profile}
							wallet={wallet}
							onChange={vi.fn()}
							recipients={[
								{
									address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
									amount: undefined,
								},
								{
									address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
									amount: 1,
								},
								{
									address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ay",
									amount: 1,
								},
							]}
						/>
					</FormProvider>
				</Route>
			);
		};

		render(<Component />, {
			route: `/profiles/${profile.id()}`,
		});

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), values.amount.toString());

		// Invalid address
		await userEvent.clear(screen.getByTestId("SelectDropdown__input"));
		await userEvent.type(screen.getByTestId("SelectDropdown__input"), values.recipientAddress);

		await waitFor(() => {
			expect(+form.getValues("amount")).toBe(values.amount);
		});

		expect(addRecipientButton()).toBeInTheDocument();

		await waitFor(() => {
			expect(addRecipientButton()).toBeDisabled();
		});

		// Valid address
		await userEvent.clear(screen.getByTestId("SelectDropdown__input"));
		await userEvent.type(screen.getByTestId("SelectDropdown__input"), "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");

		await waitFor(() => expect(addRecipientButton()).toBeEnabled());

		await userEvent.click(addRecipientButton());

		await waitFor(() => expect(recipientList()).toHaveLength(4));
	});

	it("should disable recipient fields if network is not filled", async () => {
		const values = {
			amount: 1,
			network: undefined,
		};

		renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} onChange={vi.fn()} recipients={[]} />,
			values,
		);

		await waitFor(() => {
			expect(screen.getByTestId("SelectDropdown__input")).toBeDisabled();
		});

		expect(screen.getByTestId("AddRecipient__amount")).toBeDisabled();
	});

	it("should disable recipient fields if sender address is not filled", async () => {
		const values = {
			amount: 1,
			senderAddress: undefined,
		};

		renderWithFormProvider(
			<AddRecipient profile={profile} wallet={wallet} onChange={vi.fn()} recipients={[]} />,
			values,
		);

		await waitFor(() => {
			expect(screen.getByTestId("SelectDropdown__input")).toBeDisabled();
		});

		expect(screen.getByTestId("AddRecipient__amount")).toBeDisabled();
	});

	it("should show wallet name in recipients' list for multiple type", async () => {
		render(<Component />, { route: `/profiles/${profile.id()}` });

		expect(screen.getByTestId("SelectDropdown__input")).not.toHaveValue();

		await userEvent.click(screen.getByText(translations.TRANSACTION.MULTIPLE));

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId(selectRecipientID));

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD"),
		);

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");

		await userEvent.click(addRecipientButton());

		await waitFor(() => expect(recipientList()).toHaveLength(1));

		expect(screen.getAllByTestId("Address__alias")).toHaveLength(1);
		expect(screen.getByText("ARK Wallet 1")).toBeInTheDocument();
	});

	it("should show error for low balance", async () => {
		renderWithFormProvider(<AddRecipient profile={profile} wallet={wallet} onChange={vi.fn()} recipients={[]} />);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId(selectRecipientID));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await selectFirstRecipient();

		await waitFor(() => expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument());

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "10000000000");

		await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();
	});

	it("should show error for zero balance", async () => {
		const mockWalletBalance = vi.spyOn(wallet, "balance").mockReturnValue(0);

		renderWithFormProvider(<AddRecipient profile={profile} wallet={wallet} onChange={vi.fn()} recipients={[]} />);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId(selectRecipientID));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await selectFirstRecipient();

		await waitFor(() => expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument());

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "0.1");

		await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();

		mockWalletBalance.mockRestore();
	});

	it("should show error for invalid address", async () => {
		renderWithFormProvider(<AddRecipient profile={profile} wallet={wallet} onChange={vi.fn()} recipients={[]} />);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId(selectRecipientID));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await waitFor(() => expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument());

		await selectFirstRecipient();

		await userEvent.clear(screen.getByTestId("SelectDropdown__input"));
		await userEvent.type(screen.getByTestId("SelectDropdown__input"), "abc");

		await waitFor(() =>
			expect(screen.getAllByTestId("Input__error")[0]).toHaveAttribute(
				"data-errortext",
				translations.COMMON.VALIDATION.RECIPIENT_INVALID,
			),
		);
	});

	it("should remove recipient in multiple tab", async () => {
		const values = {
			amount: 1,
			recipientAddress: "DFJ5Z51F1euNNdRUQJKQVdG4h495LZkc6T",
		};

		let form: ReturnType<typeof useForm>;

		const Component = () => {
			form = useForm({
				defaultValues: { fee: 0, network, senderAddress: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" },
				mode: "onChange",
			});

			useEffect(() => {
				form.register("network");
				form.register("senderAddress");
			}, []);

			return (
				<Route path="/profiles/:profileId">
					<FormProvider {...form}>
						<AddRecipient
							profile={profile}
							wallet={wallet}
							onChange={vi.fn()}
							recipients={[
								{
									address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
									amount: 1,
								},
								{
									address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ay",
									amount: 1,
								},
							]}
						/>
					</FormProvider>
				</Route>
			);
		};

		render(<Component />, {
			route: `/profiles/${profile.id()}`,
		});

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), values.amount.toString());

		await waitFor(() => expect(recipientList()).toHaveLength(2));

		const removeButton = within(recipientList()[0]).getAllByTestId("AddRecipientItem--deleteButton");

		expect(removeButton[0]).toBeInTheDocument();

		await userEvent.click(removeButton[0]);

		await waitFor(() => expect(recipientList()).toHaveLength(1));
	});

	it("should not override default values in single tab", async () => {
		const values = {
			amount: 1,
			recipientAddress: "DFJ5Z51F1euNNdRUQJKQVdG4h495LZkc6T",
		};

		let form: ReturnType<typeof useForm>;

		const Component = () => {
			form = useForm({
				defaultValues: { fee: 0, network, senderAddress: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", ...values },
				mode: "onChange",
			});

			useEffect(() => {
				form.register("network");
				form.register("senderAddress");
			}, []);

			return (
				<FormProvider {...form}>
					<AddRecipient profile={profile} wallet={wallet} onChange={vi.fn()} recipients={[]} />
				</FormProvider>
			);
		};

		render(<Component />);

		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));
	});

	it("should fill inputs in the single tab if one recipient is added in the multiple tab", async () => {
		const values = {
			amount: 1,
			recipientAddress: "DFJ5Z51F1euNNdRUQJKQVdG4h495LZkc6T",
		};

		render(<Component />, {
			route: `/profiles/${profile.id()}`,
		});

		await userEvent.click(screen.getByText(translations.TRANSACTION.MULTIPLE));

		await userEvent.clear(screen.getByTestId("SelectDropdown__input"), values.recipientAddress);
		await userEvent.type(screen.getByTestId("SelectDropdown__input"), values.recipientAddress);

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"), values.amount.toString());
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), values.amount.toString());

		await userEvent.click(addRecipientButton());

		await waitFor(() => expect(recipientList()).toHaveLength(1));

		await userEvent.click(screen.getByText(translations.TRANSACTION.SINGLE));

		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue(values.amount.toString()));
	});

	it("should prevent adding more recipients than the coin supports", async () => {
		const mockMultiPaymentRecipients = vi.spyOn(wallet.network(), "multiPaymentRecipients").mockReturnValue(1);

		renderWithFormProvider(
			<AddRecipient
				recipients={[
					{
						address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
						amount: 1,
					},
				]}
				profile={profile}
				wallet={wallet}
				onChange={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getByText(translations.TRANSACTION.MULTIPLE));

		await expect(screen.findByTestId(selectRecipientID)).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId(selectRecipientID));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await selectFirstRecipient();

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");

		await waitFor(() => expect(addRecipientButton()).toBeDisabled());

		mockMultiPaymentRecipients.mockRestore();
	});
});
