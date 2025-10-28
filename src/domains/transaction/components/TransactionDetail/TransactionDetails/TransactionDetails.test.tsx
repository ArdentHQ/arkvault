import React from "react";
import { screen, render, env, getDefaultProfileId, renderResponsiveWithRoute, waitFor } from "@/utils/testing-library";
import { TransactionDetails } from "./TransactionDetails";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { Contracts } from "@/app/lib/profiles";
import { requestMock, server } from "@/tests/mocks/server";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";

describe("TransactionDetails", () => {
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		const profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		server.use(
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/blocks/*",
				{ data: {} }, // Basic mock for block data
			),
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions/ea63bf9a4b3eaf75a1dfff721967c45dce64eb7facf1aef29461868681b5c79b",
				transactionFixture,
			),
		);
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

	it("should display block number after refreshing unconfirmed transaction", async () => {
		const unconfirmedTransaction = {
			...TransactionFixture,
			blockHash: () => {},
			isConfirmed: () => false,
			wallet: () => wallet,
		};

		render(<TransactionDetails transaction={unconfirmedTransaction as any} isConfirmed={true} />);

		expect(screen.getByText("N/A")).toBeInTheDocument();


		await waitFor(() => {
			expect(screen.queryByText("N/A")).not.toBeInTheDocument();
		});
	});
});
