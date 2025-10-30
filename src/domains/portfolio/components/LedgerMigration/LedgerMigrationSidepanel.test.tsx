import React, { useEffect } from "react";
import {
	env,
	render,
	screen,
	waitFor,
	getMainsailProfileId,
	mockNanoSTransport,
	MAINSAIL_MNEMONICS,
} from "@/utils/testing-library";
import { expect, it, describe, beforeEach, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { LedgerMigrationSidepanel } from "./LedgerMigrationSidepanel";
import { minVersionList } from "@/app/contexts";
import userEvent from "@testing-library/user-event";
import { WalletData } from "@/app/lib/mainsail/wallet.dto";
import { BigNumber } from "@/app/lib/helpers";

vi.mock("@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction", () => ({
	useConfirmedTransaction: vi.fn().mockReturnValue({
		isConfirmed: true,
		transaction: undefined,
	}),
}));

// Mock setup helpers
const createLedgerMocks = (wallet: Contracts.IReadWriteWallet, publicKeyPaths: Map<string, string>) => {
	const isEthBasedAppSpy = vi.spyOn(wallet.ledger(), "isEthBasedApp").mockResolvedValue(true);
	const versionSpy = vi.spyOn(wallet.ledger(), "getVersion").mockResolvedValue(minVersionList[wallet.network().coin()]);
	const publicKeySpy = vi.spyOn(wallet.ledger(), "getPublicKey").mockResolvedValue(publicKeyPaths.values().next().value!);
	const scanSpy = vi.spyOn(wallet.ledger(), "scan").mockResolvedValue({
		"m/44'/1'/1'/0/0": new WalletData({ config: wallet.network().config() }).fill({
			address: wallet.address(),
			balance: 10,
			publicKey: wallet.publicKey(),
		})
	});
	const extendedPublicKeySpy = vi.spyOn(wallet.ledger(), "getExtendedPublicKey").mockResolvedValue(wallet.publicKey()!);

	return {
		isEthBasedAppSpy,
		versionSpy,
		publicKeySpy,
		scanSpy,
		extendedPublicKeySpy,
		restoreAll: () => {
			isEthBasedAppSpy.mockRestore();
			versionSpy.mockRestore();
			publicKeySpy.mockRestore();
			scanSpy.mockRestore();
			extendedPublicKeySpy.mockRestore();
		}
	};
};

const createTransactionMocks = async (wallet: Contracts.IReadWriteWallet) => {
	const signatory = await wallet.signatoryFactory().fromSigningKeys({ key: MAINSAIL_MNEMONICS[0] });
	const hash = await wallet.transaction().signTransfer({
		data: { amount: 1, to: wallet.profile().wallets().last().address() },
		gasLimit: BigNumber.make(1),
		gasPrice: BigNumber.make(1),
		signatory,
	});

	const signatorySpy = vi.spyOn(wallet.signatoryFactory(), "fromSigningKeys").mockResolvedValue(signatory);
	const signSpy = vi.spyOn(wallet.transaction(), "signTransfer").mockResolvedValue(hash);
	const broadcastSpy = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({ accepted: [hash], errors: [] });

	return {
		signatorySpy,
		signSpy,
		broadcastSpy,
		restoreAll: () => {
			signatorySpy.mockRestore();
			signSpy.mockRestore();
			broadcastSpy.mockRestore();
		}
	};
};

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

	it("should successfully migrate wallet", async () => {
		mockNanoSTransport();
		const wallet = profile.wallets().first();

		// Setup mocks
		ledgerMocks = createLedgerMocks(wallet, publicKeyPaths);
		transactionMocks = await createTransactionMocks(wallet);

		render(<LedgerMigrationSidepanel open onOpenChange={vi.fn()} />, { route });

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

		await waitFor(() => {
			expect(screen.getByTestId("LedgerMigration_success")).toBeInTheDocument();
		}, { timeout: 4000 });
	});
});
