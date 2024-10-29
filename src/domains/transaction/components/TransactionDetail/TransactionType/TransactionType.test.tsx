import React from "react";
import { DTO } from "@ardenthq/sdk-profiles";

import { TransactionType } from "./TransactionType";
import { translations } from "@/domains/transaction/i18n";
import { renderResponsive, render, env } from "@/utils/testing-library";

describe("TransactionType", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsive(
			<TransactionType
				transaction={
					{
						isDelegateRegistration: () => false,
						isDelegateResignation: () => false,
						isIpfs: () => false,
						isMultiSignatureRegistration: () => false,
						isVote: () => false,
						type: () => "multiPayment",
						username: () => "delegate",
						wallet: () => ({
							username: () => "delegate",
						}),
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
			breakpoint,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.MULTI_PAYMENT);
	});

	it("should render delegate registration", () => {
		const { container } = render(
			<TransactionType
				transaction={
					{
						isDelegateRegistration: () => true,
						isDelegateResignation: () => false,
						isIpfs: () => false,
						isMultiSignatureRegistration: () => false,
						isVote: () => false,
						type: () => "delegateRegistration",
						username: () => "delegate",
						wallet: () => ({
							username: () => "delegate",
						}),
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.DELEGATE_REGISTRATION);
		expect(container).toHaveTextContent("delegate");
	});

	it("should render delegate resignation", () => {
		const { container } = render(
			<TransactionType
				transaction={
					{
						isDelegateRegistration: () => false,
						isDelegateResignation: () => true,
						isIpfs: () => false,
						isMultiSignatureRegistration: () => false,
						isVote: () => false,
						type: () => "delegateResignation",
						username: () => "delegate",
						wallet: () => ({
							username: () => "delegate",
						}),
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.DELEGATE_RESIGNATION);
		expect(container).toHaveTextContent("delegate");
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
						isDelegateRegistration: () => false,
						isDelegateResignation: () => false,
						isIpfs: () => false,
						isMultiSignatureRegistration: () => true,
						isVote: () => false,
						type: () => "multiSignature",
						username: () => "delegate",
						wallet: () => env.profiles().first().wallets().first(),
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent("Multisignature");
	});
	it("should render ipfs", () => {
		const hash = "QmVqNrDfr2dxzQUo4VN3zhG4NV78uYFmRpgSktWDc2eeh2";
		const { container } = render(
			<TransactionType
				transaction={
					{
						hash: () => hash,
						isDelegateRegistration: () => false,
						isDelegateResignation: () => false,
						isIpfs: () => true,
						isMultiSignatureRegistration: () => false,
						isVote: () => false,
						type: () => "delegateResignation",
						username: () => "delegate",
						wallet: () => ({
							username: () => "delegate",
						}),
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.DELEGATE_RESIGNATION);
		expect(container).toHaveTextContent(hash.slice(0, 4));
	});
});
