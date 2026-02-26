import React from "react";
import { Contracts, DTO } from "@/app/lib/profiles";

import { TransactionType } from "./TransactionType";
import { translations } from "@/domains/transaction/i18n";
import { renderResponsive, render, screen, env, getDefaultProfileId } from "@/utils/testing-library";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import userEvent from "@testing-library/user-event";
import { WalletTokenRepository } from "@/app/lib/profiles/wallet-token.repository";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";
import { WalletTokenCollection } from "@/app/lib/mainsail/wallet-token.collection";

describe("TransactionType", () => {
	let profile: Contracts.IProfile;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsive(
			<TransactionType
				transaction={
					{
						...TransactionFixture,
						type: () => "multiPayment",
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
			breakpoint,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.PAY);
	});

	it("should render validator registration", () => {
		const { container } = render(
			<TransactionType
				transaction={
					{
						...TransactionFixture,
						isValidatorRegistration: () => true,
						type: () => "validatorRegistration",
						validatorPublicKey: () => "validator",
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.REGISTER_VALIDATOR);
		expect(container).toHaveTextContent("validator");
	});

	it("should render contract deployment - signed transaction", () => {
		const { container } = render(
			<TransactionType
				transaction={
					{
						...TransactionFixture,
						data: () => ({
							data: () => ({
								data: "0x60006000F3",
							}),
						}),
						isConfirmed: () => false,
						isContractDeployment: () => true,
						to: () => null,
						type: () => "0x60006000",
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.CONTRACT_DEPLOYMENT);
		expect(container).toHaveTextContent("0x60006000");
	});

	it("should render approve transaction details", () => {
		const repo = new WalletTokenRepository(profile.activeNetwork(), profile);

		repo.create({
			token: new TokenDTO({
				address: "0xabc",
				decimals: 18,
				deploymentHash: "0xabc",
				name: "ABC",
				symbol: "ABC",
				totalSupply: "10000",
			}),
			walletToken: new WalletTokenDTO({
				address: profile.wallets().first().address(),
				balance: "100",
				tokenAddress: "0xabc",
			}),
		});

		vi.spyOn(profile.tokens(), "selected").mockReturnValue(
			new WalletTokenCollection(repo.values(), {
				last: undefined,
				next: undefined,
				prev: undefined,
				self: undefined,
			}),
		);

		const { container } = render(
			<TransactionType
				transaction={
					{
						...TransactionFixture,
						data: () => ({
							data: {
								data: "0x095ea7b30000000000000000000000000fdab71f04adadf40964c5fd9c95886740f0591c00000000000000000000000000000000000000000000d3c21bcecceda0000000",
							},
						}),
						isApprove: () => true,
						approveDetails: () => {
							return { amount: 500000000000, address: "0xabd" };
						},
						isConfirmed: () => true,
						to: () => "0xabc",
						wallet: () => profile.wallets().first(),
					} as DTO.ExtendedConfirmedTransactionData
				}
			/>,
			{
				route: `/profiles/${profile.id()}/dashboard`,
			},
		);

		expect(container).toHaveTextContent("Approve");
		expect(container).toHaveTextContent("0.0000005 ABC for use by 0xabd on behalf of Mainsail Wallet");
	});

	it("should render contract deployment - confirmed transaction", () => {
		const { container } = render(
			<TransactionType
				transaction={
					{
						...TransactionFixture,
						data: () => ({
							data: {
								data: "0x60006000F3",
							},
						}),
						isConfirmed: () => true,
						isContractDeployment: () => true,
						to: () => false,
						type: () => "0x60006000",
					} as DTO.ExtendedConfirmedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.CONTRACT_DEPLOYMENT);
		expect(container).toHaveTextContent("0x60006000");
	});

	it("should show full bytecode for contract deployment", async () => {
		const bytecode = "0x608060405234801561001057600080fd5b506040518060400160405280600681526020017f4441524b323000";

		const { container } = render(
			<TransactionType
				transaction={
					{
						...TransactionFixture,
						data: () => ({
							data: {
								data: bytecode,
							},
						}),
						isConfirmed: () => true,
						isContractDeployment: () => true,
						isValidatorRegistration: () => false,
						to: () => null,
						type: () => "0x608060405",
					} as DTO.ExtendedConfirmedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.CONTRACT_DEPLOYMENT);

		await userEvent.click(screen.getByTestId("ContractDeploymentForm--ShowFullByteCode"));

		expect(container).toHaveTextContent(bytecode);
	});

	it("should render username if username registration", () => {
		const { container } = render(
			<TransactionType
				transaction={
					{
						...TransactionFixture,
						isUsernameRegistration: () => true,
						username: () => "validator",
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent("validator");
	});

	it("should render validator registration", () => {
		const { container } = render(
			<TransactionType
				transaction={
					{
						...TransactionFixture,
						isValidatorRegistration: () => true,
						username: () => "validator",
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent("Public Key");
	});
});
