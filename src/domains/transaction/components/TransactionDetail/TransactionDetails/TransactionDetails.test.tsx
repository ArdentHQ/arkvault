import React from "react";
import { screen, renderResponsive, render, env, getDefaultProfileId } from "@/utils/testing-library";
import { TransactionDetails } from "./TransactionDetails";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { Contracts } from "@ardenthq/sdk-profiles";

describe("TransactionDetails", () => {
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	it.each(["sm", "md", "lg"])("should render in %s", (breakpoint: string) => {
		renderResponsive(<TransactionDetails transaction={{ ...TransactionFixture, wallet: () => wallet }} />, breakpoint);

		expect(screen.getAllByTestId("DetailLabelText")).toHaveLength(4);
	});

	it("should render without block id", () => {
		render(<TransactionDetails transaction={{ ...TransactionFixture, blockId: () => null }} />);

		expect(screen.queryByText(TransactionFixture.blockId())).not.toBeInTheDocument();
	});
});
