import React from "react";
import { DTO } from "@/app/lib/profiles";

import { TransactionType } from "./TransactionType";
import { translations } from "@/domains/transaction/i18n";
import { renderResponsive, render, env } from "@/utils/testing-library";

describe("TransactionType", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsive(
			<TransactionType
				transaction={
					{
						isIpfs: () => false,
						isMultiSignatureRegistration: () => false,
						isValidatorRegistration: () => false,
						isValidatorResignation: () => false,
						isVote: () => false,
						type: () => "multiPayment",
						username: () => "validator",
						wallet: () => ({
							username: () => "validator",
						}),
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
			breakpoint,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.MULTI_PAYMENT);
	});

	it("should render validator registration", () => {
		const { container } = render(
			<TransactionType
				transaction={
					{
						isIpfs: () => false,
						isMultiSignatureRegistration: () => false,
						isValidatorRegistration: () => true,
						isValidatorResignation: () => false,
						isVote: () => false,
						type: () => "validatorRegistration",
						username: () => "validator",
						wallet: () => ({
							username: () => "validator",
						}),
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.VALIDATOR_REGISTRATION);
		expect(container).toHaveTextContent("validator");
	});

	it("should render validator resignation", () => {
		const { container } = render(
			<TransactionType
				transaction={
					{
						isIpfs: () => false,
						isMultiSignatureRegistration: () => false,
						isValidatorRegistration: () => false,
						isValidatorResignation: () => true,
						isVote: () => false,
						type: () => "validatorResignation",
						username: () => "validator",
						wallet: () => ({
							username: () => "validator",
						}),
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.VALIDATOR_RESIGNATION);
		expect(container).toHaveTextContent("validator");
	});

	it("should render multisignature registration", () => {
		const hash = "QmVqNrDfr2dxzQUo4VN3zhG4NV78uYFmRpgSktWDc2eeh2";
		const { container } = render(
			<TransactionType
				transaction={
					{
						get: () => ({
							min: 2,
							publicKeys: [
								"03af2feb4fc97301e16d6a877d5b135417e8f284d40fac0f84c09ca37f82886c51",
								"03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc",
							],
						}),
						hash: () => hash,
						isIpfs: () => false,
						isMultiSignatureRegistration: () => true,
						isValidatorRegistration: () => false,
						isValidatorResignation: () => false,
						isVote: () => false,
						type: () => "multiSignature",
						username: () => "validator",
						wallet: () => env.profiles().first().wallets().first(),
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent("Multisignature");
	});

	it("should render username if username registration", () => {
		const { container } = render(
			<TransactionType
				transaction={
					{
						isUsernameRegistration: () => true,
						wallet: () => ({
							username: () => "validator",
						}),
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent("validator");
	});
});
