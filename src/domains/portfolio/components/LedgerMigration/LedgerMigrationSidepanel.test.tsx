import {
	env,
	renderResponsiveWithRoute,
	screen,
	waitFor,
	getMainsailProfileId,
	mockNanoSTransport,
} from "@/utils/testing-library";
import { expect, it, describe, beforeEach, afterAll, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { LedgerMigrationSidepanel } from "./LedgerMigrationSidepanel";
import userEvent from "@testing-library/user-event";
import { createTransactionMocks } from "@/tests/mocks/Ledger";
import { WalletData } from "@/app/lib/mainsail/wallet.dto";

vi.mock("@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction", () => ({
	useConfirmedTransaction: vi.fn().mockReturnValue({
		isConfirmed: true,
		transaction: undefined,
	}),
}));

describe("LedgerMigrationSidepanel", () => {
	const ledgerContinueButton = "LedgerScanStep__continue-button";
	const ledgerReviewStepTestId = "LedgerMigration__Review-step";

	let profile: Contracts.IProfile;
	const route = `/profiles/${getMainsailProfileId()}/dashboard`;
	let publicKeyPaths: Map<string, string>;

	beforeEach(async () => {
		mockNanoSTransport();
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);

		const mockPublicKey = "0293b9fd80d472bbf678404d593705268cf09324115f73103bc1477a3933350041";
		publicKeyPaths = new Map([
			["m/44'/1'/0'/0/0", profile.wallets().first().publicKey()!],
			["m/44'/1'/111'/0/0", profile.wallets().last().publicKey()!],
			["m/44'/60'/0'/0/0", mockPublicKey],
		]);

		const wallet = profile.wallets().first();
		await createTransactionMocks(wallet);

		vi.spyOn(wallet.ledger(), "getExtendedPublicKey").mockImplementation((path) => publicKeyPaths.get(path));

		vi.spyOn(profile.ledger().scanner({ scannedWallets: [] }), "scan").mockImplementationOnce((options) => {
			console.log({ options });
			return Promise.resolve({
				"m/44'/1'/0'/0/0": new WalletData({ config: wallet.network().config() }).fill({
					address: wallet.address(),
					balance: 10,
					publicKey: wallet.publicKey(),
				}),
				"m/44'/1'/111'/0/0": new WalletData({ config: wallet.network().config() }).fill({
					address: profile.wallets().last().address(),
					balance: 10,
					publicKey: profile.wallets().last().publicKey(),
				}),
			});
		});

		vi.spyOn(profile.wallets(), "push").mockImplementation(vi.fn());
		vi.spyOn(profile.wallets(), "forget").mockImplementation(vi.fn());
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it.each(["sm", "md", "lg", "xl"])("should successfully migrate to one wallet in %s", async (containerSize) => {
		// Setup mocks
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
			expect(screen.getByTestId("MigrateToOneCheckbox")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("MigrateToOneCheckbox"));

		await waitFor(() => {
			expect(screen.getByTestId(ledgerContinueButton)).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId(ledgerContinueButton)).not.toBeDisabled();
		});

		await userEvent.click(screen.getByTestId(ledgerContinueButton));

		await waitFor(() => {
			expect(screen.getByTestId(ledgerReviewStepTestId)).toBeInTheDocument();
		});

		// Complete the migration flow
		await userEvent.click(screen.getByTestId("Overview_accept-responsibility"));
		await userEvent.click(screen.getByTestId("OverviewStep__continue-button"));

		await waitFor(() => {
			expect(screen.getByTestId(ledgerReviewStepTestId)).toBeInTheDocument();
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

	it.each(["sm", "md", "lg", "xl"])("should successfully migrate wallet in %s", async (containerSize) => {
		mockNanoSTransport();
		const wallet = profile.wallets().first();
		// Setup mocks
		const mocky = await createTransactionMocks(wallet);

		const publicKeySpy = vi
			.spyOn(wallet.ledger(), "getExtendedPublicKey")
			.mockImplementation((path) => publicKeyPaths.get(path));

		const scanSpy = vi
			.spyOn(profile.ledger().scanner({ scannedWallets: [] }), "scan")
			.mockImplementation((options) => {
				console.log({ options });
				return Promise.resolve({
					"m/44'/1'/0'/0/0": new WalletData({ config: wallet.network().config() }).fill({
						address: wallet.address(),
						balance: 10,
						publicKey: wallet.publicKey(),
					}),
					"m/44'/1'/111'/0/0": new WalletData({ config: wallet.network().config() }).fill({
						address: profile.wallets().last().address(),
						balance: 10,
						publicKey: profile.wallets().last().publicKey(),
					}),
				});
			});

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
			expect(screen.getByTestId(ledgerContinueButton)).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId(ledgerContinueButton));

		await waitFor(() => {
			expect(screen.getByTestId(ledgerReviewStepTestId)).toBeInTheDocument();
		});

		// Complete the migration flow
		await userEvent.click(screen.getByTestId("Overview_accept-responsibility"));
		await userEvent.click(screen.getByTestId("OverviewStep__continue-button"));

		await waitFor(() => {
			expect(screen.getByTestId(ledgerReviewStepTestId)).toBeInTheDocument();
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
		publicKeySpy.mockRestore();
		scanSpy.mockRestore();
		mocky.restoreAll();
	});

	it.each(["sm", "md", "lg", "xl"])("should fail to migrate and show error in %s", async (containerSize) => {
		mockNanoSTransport();
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
			expect(screen.getByTestId(ledgerContinueButton)).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId(ledgerContinueButton));

		await waitFor(() => {
			expect(screen.getByTestId(ledgerReviewStepTestId)).toBeInTheDocument();
		});

		vi.restoreAllMocks();

		await userEvent.click(screen.getByTestId("Overview_accept-responsibility"));
		await userEvent.click(screen.getByTestId("OverviewStep__continue-button"));

		await waitFor(() => {
			expect(screen.getByTestId("LedgerTransactionErrorStep")).toBeInTheDocument();
		});
	});
});
