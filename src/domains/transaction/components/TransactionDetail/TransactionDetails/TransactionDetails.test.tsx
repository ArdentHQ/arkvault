import React from "react";
import { screen, renderResponsive, render, env, getDefaultProfileId } from "@/utils/testing-library";
import { TransactionDetails } from "./TransactionDetails";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { Contracts } from "@ardenthq/sdk-profiles";

describe("TransactionDetails", () => {
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		const profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	it.each(["sm", "md", "lg"])("should render in %s", (breakpoint: string) => {
		renderResponsive(
			<TransactionDetails transaction={{ ...TransactionFixture, wallet: () => wallet }} />,
			breakpoint,
		);

		expect(screen.getAllByTestId("DetailLabelText")).toHaveLength(4);
	});

	it("should render without block id", () => {
		render(<TransactionDetails transaction={{ ...TransactionFixture, blockId: () => null }} />);

		expect(screen.queryByText(TransactionFixture.blockId())).not.toBeInTheDocument();
	});

	it("should not refresh when transaction is already confirmed", () => {
		const clientMock = vi.fn();

		render(
			<TransactionDetails
				transaction={{
					...TransactionFixture,
					isConfirmed: () => true,
					wallet: () => wallet,
				}}
				isConfirmed={true}
			/>,
		);

		expect(clientMock).not.toHaveBeenCalled();
	});

	it("should refresh transaction when isConfirmed prop changes to true", async () => {
		const confirmedTransaction = {
			...TransactionFixture,
			isConfirmed: () => true,
			timestamp: () => ({
				format: () => "2021-09-01 12:00",
				unix: () => 1_630_497_600,
			}),
		};

		const clientMock = vi.spyOn(wallet.coin().client(), "transaction").mockResolvedValue(confirmedTransaction);

		render(
			<TransactionDetails
				transaction={{ ...TransactionFixture, isConfirmed: () => false, wallet: () => wallet }}
				isConfirmed={true}
			/>,
		);

		await vi.waitFor(() => expect(clientMock).toHaveBeenCalled());

		clientMock.mockRestore();
	});
});
