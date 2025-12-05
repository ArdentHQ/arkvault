import React from "react";
import { DTO } from "@/app/lib/profiles";

import { TransactionType } from "./TransactionType";
import { translations } from "@/domains/transaction/i18n";
import { renderResponsive, render, screen } from "@/utils/testing-library";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import userEvent from "@testing-library/user-event";

describe("TransactionType", () => {
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
						type: () => "0x60006000",
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.CONTRACT_DEPLOYMENT);
		expect(container).toHaveTextContent("0x60006000");
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
});
