import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";

import {
	env,
	getDefaultProfileId,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
} from "@/utils/testing-library";
import { SendExchangeTransfer } from "./SendExchangeTransfer";
import userEvent from "@testing-library/user-event";
import { afterAll, expect, MockInstance } from "vitest";
import * as environmentHooks from "@/app/hooks/env";

let profile: Contracts.IProfile;
let exchangeTransaction: Contracts.IExchangeTransaction;

let resetProfileNetworksMock: () => void;
let useActiveProfileSpy: MockInstance;

describe("ExchangeStatus", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

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
	});

	afterAll(() => {
		resetProfileNetworksMock();
		useActiveProfileSpy.mockRestore();
	});

	it("should trigger `onClose`", async () => {
		const onClose = vi.fn();

		render(
			<SendExchangeTransfer
				profile={profile}
				network={profile.wallets().first().network()}
				exchangeTransaction={exchangeTransaction}
				onClose={onClose}
				onSuccess={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getByTestId("ExchangeTransfer__cancel-button"));
		expect(onClose).toHaveBeenCalledOnce();
	});
});
