import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";
import { expect, it, describe, beforeEach } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { TransactionRowMobile } from "./TransactionRowMobile";

describe("TransactionRowMobile", () => {
	let profile: Contracts.IProfile;

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);
	});

	it("should render", async () => {
		const transaction = profile.draftTransactionFactory().transfer()
		transaction.setSender(profile.wallets().first())
		transaction.addRecipientWallet(profile.wallets().last())
		transaction.setAmount(1)
		const completedMock = vi.spyOn(transaction, "isCompleted").mockReturnValue(true)

		render(<TransactionRowMobile transaction={transaction} />)
		expect(screen.getByTestId("Link__external")).toBeInTheDocument()
		completedMock.mockRestore()
	});
});
