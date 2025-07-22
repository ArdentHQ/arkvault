import React from "react";
import { DTO } from "@/app/lib/profiles";

import { TransactionType } from "./TransactionType";
import { translations } from "@/domains/transaction/i18n";
import { renderResponsive, render } from "@/utils/testing-library";
import { TransactionFixture } from "@/tests/fixtures/transactions";

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
