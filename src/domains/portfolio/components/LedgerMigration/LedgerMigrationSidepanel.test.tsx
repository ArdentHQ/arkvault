import {
	env,
	renderResponsiveWithRoute,
	screen,
	waitFor,
	getMainsailProfileId,
	mockNanoSTransport,
} from "@/utils/testing-library";
import { expect, it, describe, beforeEach, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { LedgerMigrationSidepanel } from "./LedgerMigrationSidepanel";
import userEvent from "@testing-library/user-event";
import {
	createLedgerMocks,
	createTransactionMocks,
} from "@/tests/mocks/Ledger";

vi.mock("@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction", () => ({
	useConfirmedTransaction: vi.fn().mockReturnValue({
		isConfirmed: true,
		transaction: undefined,
	}),
}));

describe("LedgerMigrationSidepanel", () => {
	let profile: Contracts.IProfile;
	const route = `/profiles/${getMainsailProfileId()}/dashboard`;
	let publicKeyPaths: Map<string, string>;
	let ledgerMocks: ReturnType<typeof createLedgerMocks>;
	let transactionMocks: ReturnType<typeof createTransactionMocks>;

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);

		publicKeyPaths = new Map([
			["m/44'/1'/1'/0/0", profile.wallets().first().publicKey()!],
			["m/44'/1'/1'/0/1", profile.wallets().last().publicKey()!],
		]);
	});

	afterEach(() => {
		ledgerMocks?.restoreAll();
		transactionMocks?.restoreAll();
	});

	it.each(["sm", "md", "lg", "xl"])("should successfully migrate wallet in %s", async (containerSize) => {
		mockNanoSTransport();
		const wallet = profile.wallets().first();

		// Setup mocks
		ledgerMocks = createLedgerMocks(wallet, publicKeyPaths);
		transactionMocks = await createTransactionMocks(wallet);

		renderResponsiveWithRoute(<LedgerMigrationSidepanel open onOpenChange={vi.fn()} />, containerSize, { route });

		expect(screen.getByTestId("LedgerMigrationSidepanel")).toBeInTheDocument();

		// Wait for and verify each step
		await waitFor(() => {
			expect(screen.getByTestId("LedgerAuthStep")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId("LedgerConnectionStep")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId("LedgerScanStep")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId("LedgerScanStep__continue-button")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("LedgerScanStep__continue-button"));

		await waitFor(() => {
			expect(screen.getByTestId("LedgerMigration__Review-step")).toBeInTheDocument();
		});

		// Complete the migration flow
		await userEvent.click(screen.getByTestId("Overview_accept-responsibility"));
		await userEvent.click(screen.getByTestId("OverviewStep__continue-button"));

		await waitFor(() => {
			expect(screen.getByTestId("LedgerMigration__Review-step")).toBeInTheDocument();
		});

		await waitFor(
			() => {
				expect(screen.getByTestId("LedgerMigration_success")).toBeInTheDocument();
			},
			{ timeout: 4000 },
		);

		await waitFor(() => {
			expect(screen.getByTestId("LedgerTransactionSuccessStep_goto-portfolio")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("LedgerTransactionSuccessStep_goto-portfolio"));
	});

	it.each(["sm", "md", "lg", "xl"])("should fail to migrate and show error in %s", async (containerSize) => {
		mockNanoSTransport();
		const wallet = profile.wallets().first();

		// Setup mocks
		ledgerMocks = createLedgerMocks(wallet, publicKeyPaths);
		transactionMocks = await createTransactionMocks(wallet);

		renderResponsiveWithRoute(<LedgerMigrationSidepanel open onOpenChange={vi.fn()} />, containerSize, { route });

		expect(screen.getByTestId("LedgerMigrationSidepanel")).toBeInTheDocument();

		// Wait for and verify each step
		await waitFor(() => {
			expect(screen.getByTestId("LedgerAuthStep")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId("LedgerConnectionStep")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId("LedgerScanStep")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId("LedgerScanStep__continue-button")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("LedgerScanStep__continue-button"));

		await waitFor(() => {
			expect(screen.getByTestId("LedgerMigration__Review-step")).toBeInTheDocument();
		});

		vi.restoreAllMocks();

		await userEvent.click(screen.getByTestId("Overview_accept-responsibility"));
		await userEvent.click(screen.getByTestId("OverviewStep__continue-button"));

		await waitFor(() => {
			expect(screen.getByTestId("LedgerTransactionErrorStep")).toBeInTheDocument();
		});
	});
});
