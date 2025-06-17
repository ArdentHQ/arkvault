import React from "react";
import { screen, render, env, getDefaultProfileId, renderResponsiveWithRoute } from "@/utils/testing-library";
import { TransactionDetails } from "./TransactionDetails";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { Contracts } from "@/app/lib/profiles";

describe("TransactionDetails", () => {
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		const profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	it.each(["sm", "md", "lg"])("should render in %s", (breakpoint: string) => {
		renderResponsiveWithRoute(
			<TransactionDetails transaction={{ ...TransactionFixture, wallet: () => wallet }} />,
			breakpoint,
			{
				route: "/",
			},
		);

		expect(screen.getAllByTestId("DetailLabelText")).toHaveLength(4);
	});

	it("should render without block id", () => {
		render(<TransactionDetails transaction={{ ...TransactionFixture, blockHash: () => null }} />);

		expect(screen.queryByText(TransactionFixture.blockHash())).not.toBeInTheDocument();
	});
});
