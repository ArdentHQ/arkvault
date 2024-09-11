import React from "react";
import { DTO } from "@ardenthq/sdk-profiles";

import { TransactionType } from "./TransactionType";
import { translations } from "@/domains/transaction/i18n";
import { renderResponsive, render } from "@/utils/testing-library";

describe("TransactionType", () => {
	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { container } = renderResponsive(
			<TransactionType
				transaction={
					{
						isDelegateRegistration: () => false,
						isDelegateResignation: () => false,
						isIpfs: () => false,
						isVote: () => false,
						type: () => "multiPayment",
						wallet: () => ({
							username: () => "delegate",
						}),
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
			breakpoint,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.MULTI_PAYMENT);

		expect(container).toMatchSnapshot();
	});

	it("should render delegate registration", () => {
		const { container } = render(
			<TransactionType
				transaction={
					{
						isDelegateRegistration: () => true,
						isDelegateResignation: () => false,
						isIpfs: () => false,
						isVote: () => false,
						type: () => "delegateRegistration",
						wallet: () => ({
							username: () => "delegate",
						}),
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.DELEGATE_REGISTRATION);
		expect(container).toHaveTextContent("delegate");

		expect(container).toMatchSnapshot();
	});

	it("should render delegate resignation", () => {
		const { container } = render(
			<TransactionType
				transaction={
					{
						isDelegateRegistration: () => false,
						isDelegateResignation: () => true,
						isIpfs: () => false,
						isVote: () => false,
						type: () => "delegateResignation",
						wallet: () => ({
							username: () => "delegate",
						}),
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.DELEGATE_RESIGNATION);
		expect(container).toHaveTextContent("delegate");

		expect(container).toMatchSnapshot();
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
						isVote: () => false,
						type: () => "delegateResignation",
						wallet: () => ({
							username: () => "delegate",
						}),
					} as DTO.ExtendedSignedTransactionData
				}
			/>,
		);

		expect(container).toHaveTextContent(translations.TRANSACTION_TYPES.DELEGATE_RESIGNATION);
		expect(container).toHaveTextContent(hash);

		expect(container).toMatchSnapshot();
	});
});
