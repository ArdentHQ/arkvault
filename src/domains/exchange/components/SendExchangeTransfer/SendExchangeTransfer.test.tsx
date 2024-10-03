import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";

import {
	env,
	getDefaultProfileId,
	render,
	screen, syncFees
} from "@/utils/testing-library";
import {SendExchangeTransfer} from "./SendExchangeTransfer";
import userEvent from "@testing-library/user-event";
import {afterAll, expect, MockInstance} from "vitest";
import * as environmentHooks from "@/app/hooks/env";
import { server, requestMock } from "@/tests/mocks/server";
import nodeFeesFixture from "@/tests/fixtures/coins/ark/mainnet/node-fees.json";
import transactionFeesFixture from "@/tests/fixtures/coins/ark/mainnet/transaction-fees.json";
import {within} from "@testing-library/react";

let profile: Contracts.IProfile;
let exchangeTransaction: Contracts.IExchangeTransaction;

let useActiveProfileSpy: MockInstance

describe("SendExchangeTransfer", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		exchangeTransaction = profile.exchangeTransactions().create({
			input: {
				address: "inputAddress",
				amount: 1,
				ticker: "ark",
			},
			orderId: "orderId",
			output: {
				address: "outputAddress",
				amount: 0.005,
				ticker: "eth",
			},
			provider: "provider",
		});

		useActiveProfileSpy = vi.spyOn(environmentHooks, "useActiveProfile").mockImplementation(() => profile);

		server.use(
			requestMock("https://ark-test.arkvault.io/api/node/fees", nodeFeesFixture),
			requestMock("https://ark-test.arkvault.io/api/transactions/fees", transactionFeesFixture),
		);

		await syncFees(profile);
	});

	afterAll(() => {
		useActiveProfileSpy.mockRestore();
	})

	const renderComponent = (properties: Record<string, any> = {}) => {
		render(<SendExchangeTransfer
			profile={profile}
			network={profile.wallets().first().network()}
			exchangeTransaction={exchangeTransaction}
			onClose={vi.fn()}
			onSuccess={vi.fn()}
			{...properties}
		/>);
	}

	const selectSender = async () => {
		await userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByText(/Select Sender/)).resolves.toBeVisible();

		const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");

		await userEvent.click(firstAddress);
	}

	it("should trigger `onClose`", async () => {
		const onClose = vi.fn();

		renderComponent({onClose});

		await userEvent.click(screen.getByTestId("ExchangeTransfer__cancel-button"));
		expect(onClose).toHaveBeenCalledOnce();
	});

	it("should calculate fee", async () => {
		renderComponent();

		await selectSender();

		await expect(screen.findByText("0.049716 DARK")).resolves.toBeVisible();
	});

});
