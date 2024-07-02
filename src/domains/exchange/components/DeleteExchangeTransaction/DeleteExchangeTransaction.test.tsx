import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { translations } from "@/domains/exchange/i18n";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

import { DeleteExchangeTransaction } from "./DeleteExchangeTransaction";

let profile: Contracts.IProfile;
let exchangeTransaction: Contracts.IExchangeTransaction;

const onDelete = vi.fn();

describe("DeleteExchangeTransaction", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		exchangeTransaction = profile.exchangeTransactions().create({
			input: {
				address: "inputAddress",
				amount: 1,
				ticker: "btc",
			},
			orderId: "orderId",
			output: {
				address: "outputAddress",
				amount: 100,
				ticker: "ark",
			},
			provider: "provider",
		});
	});

	afterEach(() => {
		onDelete.mockRestore();
	});

	it("should not render if not open", () => {
		const { asFragment } = render(
			<DeleteExchangeTransaction
				exchangeTransaction={exchangeTransaction}
				profile={profile}
				onDelete={onDelete}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal", () => {
		const { asFragment } = render(
			<DeleteExchangeTransaction
				isOpen={true}
				exchangeTransaction={exchangeTransaction}
				profile={profile}
				onDelete={onDelete}
			/>,
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(
			translations.MODAL_DELETE_EXCHANGE_TRANSACTION.TITLE,
		);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(
			translations.MODAL_DELETE_EXCHANGE_TRANSACTION.DESCRIPTION,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should delete exchange transaction", async () => {
		render(
			<DeleteExchangeTransaction
				isOpen={true}
				exchangeTransaction={exchangeTransaction}
				profile={profile}
				onDelete={onDelete}
			/>,
		);

		await userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => expect(onDelete).toHaveBeenCalledWith(exchangeTransaction));

		expect(() => profile.exchangeTransactions().findById(exchangeTransaction.id())).toThrow("Failed to find");
	});
});
