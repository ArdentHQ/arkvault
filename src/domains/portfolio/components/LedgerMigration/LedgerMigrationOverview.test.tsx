import { env, getMainsailProfileId, render, screen, waitFor } from "@/utils/testing-library";
import { expect, it, describe, beforeAll, afterAll } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { LedgerMigrationOverview } from "./LedgerMigrationOverview";
import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";
import { DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import userEvent from "@testing-library/user-event";

describe("LedgerMigrationOverview", () => {
	let profile: Contracts.IProfile;
	let transaction: DraftTransfer;

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);

		transaction = profile.draftTransactionFactory().transfer();
		transaction.setSender(profile.wallets().first());
		transaction.addRecipientWallet(profile.wallets().last());
		transaction.setAmount(1);
		vi.spyOn(transaction, "isCompleted").mockReturnValue(true);

		vi.spyOn(transaction, "signedTransaction").mockReturnValue({
			explorerLink: () => "https://123.com",
			hash: () => "123",
		} as ExtendedSignedTransactionData);
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("should render", () => {
		render(<LedgerMigrationOverview profile={profile} transfer={transaction} />);
		expect(screen.getByTestId("LedgerMigration__Review-step")).toBeInTheDocument();
	});

	it("should open modal to edit name", async () => {
		render(<LedgerMigrationOverview profile={profile} transfer={transaction} />);
		expect(screen.getByTestId("LedgerMigration__Review-step")).toBeInTheDocument();
		expect(screen.getByTestId("LedgerMigration__Review-edit")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("LedgerMigration__Review-edit"));

		await waitFor(() => {
			expect(screen.getByTestId("UpdateWalletName__input")).toBeInTheDocument();
		});
	});
});
