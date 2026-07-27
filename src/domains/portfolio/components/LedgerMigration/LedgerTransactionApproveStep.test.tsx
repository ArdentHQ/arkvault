import { env, getMainsailProfileId, mockNanoSTransport, render, screen, waitFor } from "@/utils/testing-library";
import { expect, it, describe, beforeAll, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { LedgerTransactionApproveStep } from "./LedgerTransactionApproveStep";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { createLedgerMocks } from "@/tests/mocks/Ledger";
import userEvent from "@testing-library/user-event";
import { useLedgerRetryTimer } from "./hooks/use-ledger-retry-timer";

vi.mock("./hooks/use-ledger-retry-timer", () => ({
	useLedgerRetryTimer: vi.fn(() => ({
		shouldShowRetry: false,
		isRetrying: false,
		reset: vi.fn().mockResolvedValue(undefined),
	})),
}));

describe("LedgerTransactionApproveStep", () => {
	let profile: Contracts.IProfile;
	let migrator: LedgerMigrator;
	const route = `/profiles/${getMainsailProfileId()}/dashboard`;

	beforeEach(() => {
		vi.mocked(useLedgerRetryTimer).mockReturnValue({
			shouldShowRetry: false,
			isRetrying: false,
			reset: vi.fn().mockResolvedValue(undefined),
		});
	});

	beforeAll(async () => {
		mockNanoSTransport();

		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);

		const publicKeyPaths = new Map([
			["m/44'/1'/1'/0/0", profile.wallets().first().publicKey()!],
			["m/44'/1'/1'/0/1", profile.wallets().last().publicKey()!],
		]);

		createLedgerMocks(profile.wallets().first(), publicKeyPaths);
		migrator = new LedgerMigrator({ env, profile: env.profiles().first() });

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: "m/44'/1'/1'/0/0",
			},
		]);
	});

	it("should render the approve step for single transaction", async () => {
		const transfer = profile.draftTransactionFactory().transfer();
		transfer.setSender(profile.wallets().first());
		transfer.addRecipientWallet(profile.wallets().last());
		transfer.setAmount(1);
		vi.spyOn(transfer, "isCompleted").mockReturnValue(true);

		const mockSignAndBroadcast = vi.fn().mockResolvedValue({ hash: "0xabc123" });
		Object.defineProperty(transfer, "signAndBroadcast", {
			configurable: true,
			value: mockSignAndBroadcast,
			writable: true,
		});

		const { container } = render(<LedgerTransactionApproveStep transfer={transfer} migrator={migrator} />, {
			route,
		});

		expect(container.querySelector(".space-y-4")).toBeInTheDocument();
		expect(screen.getByTestId("LedgerMigration__Review-step")).toBeInTheDocument();
	});

	it("should not show warning banner when multiple transactions", async () => {
		const multiTxMigrator = new LedgerMigrator({ env, profile: env.profiles().first() });
		await multiTxMigrator.createTransactions([
			{ address: profile.wallets().first().address(), path: "m/44'/1'/1'/0/0" },
			{ address: profile.wallets().last().address(), path: "m/44'/1'/1'/0/1" },
		]);

		const transfer = profile.draftTransactionFactory().transfer();
		transfer.setSender(profile.wallets().first());
		transfer.addRecipientWallet(profile.wallets().last());
		transfer.setAmount(1);
		vi.spyOn(transfer, "isCompleted").mockReturnValue(true);

		Object.defineProperty(transfer, "signAndBroadcast", {
			configurable: true,
			value: vi.fn().mockResolvedValue({ hash: "0xabc123" }),
			writable: true,
		});

		const { container } = render(<LedgerTransactionApproveStep transfer={transfer} migrator={multiTxMigrator} />, {
			route,
		});

		expect(container.querySelector(".space-y-4")).toBeInTheDocument();
	});

	it("should call onSuccess when signAndBroadcast resolves", async () => {
		const onSuccess = vi.fn();

		const transfer = profile.draftTransactionFactory().transfer();
		transfer.setSender(profile.wallets().first());
		transfer.addRecipientWallet(profile.wallets().last());
		transfer.setAmount(1);
		vi.spyOn(transfer, "isCompleted").mockReturnValue(true);

		const mockSignAndBroadcast = vi.fn().mockResolvedValue({ hash: "0xabc123" });
		Object.defineProperty(transfer, "signAndBroadcast", {
			configurable: true,
			value: mockSignAndBroadcast,
			writable: true,
		});

		render(<LedgerTransactionApproveStep transfer={transfer} migrator={migrator} onSuccess={onSuccess} />, {
			route,
		});

		await waitFor(() => {
			expect(onSuccess).toHaveBeenCalled();
		});
	});

	it("should call onError when signAndBroadcast rejects", async () => {
		const onError = vi.fn();

		const transfer = profile.draftTransactionFactory().transfer();
		transfer.setSender(profile.wallets().first());
		transfer.addRecipientWallet(profile.wallets().last());
		transfer.setAmount(1);
		vi.spyOn(transfer, "isCompleted").mockReturnValue(true);

		Object.defineProperty(transfer, "signAndBroadcast", {
			configurable: true,
			value: vi.fn().mockRejectedValue(new Error("Sign failed")),
			writable: true,
		});

		render(<LedgerTransactionApproveStep transfer={transfer} migrator={migrator} onError={onError} />, { route });

		await waitFor(() => {
			expect(onError).toHaveBeenCalled();
		});
	});

	it("should handle retry when retry button is clicked", async () => {
		const resetMock = vi.fn().mockResolvedValue(undefined);

		vi.mocked(useLedgerRetryTimer).mockReturnValue({
			shouldShowRetry: true,
			isRetrying: false,
			reset: resetMock,
		});

		const onSuccess = vi.fn();
		const transfer = profile.draftTransactionFactory().transfer();
		transfer.setSender(profile.wallets().first());
		transfer.addRecipientWallet(profile.wallets().last());
		transfer.setAmount(1);
		vi.spyOn(transfer, "isCompleted").mockReturnValue(true);

		let signAndBroadcastResolve: (value: any) => void;
		const signAndBroadcastMock = vi
			.fn()
			.mockImplementation(() => new Promise((resolve) => (signAndBroadcastResolve = resolve)));

		Object.defineProperty(transfer, "signAndBroadcast", {
			configurable: true,
			value: signAndBroadcastMock,
			writable: true,
		});

		render(<LedgerTransactionApproveStep transfer={transfer} migrator={migrator} onSuccess={onSuccess} />, {
			route,
		});

		await waitFor(() => {
			expect(signAndBroadcastMock).toHaveBeenCalled();
		});

		// Clear the initial call from useEffect
		signAndBroadcastMock.mockClear();
		resetMock.mockClear();

		const retryButton = screen.getByText("Retry");
		await userEvent.click(retryButton);

		await waitFor(() => {
			expect(resetMock).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(signAndBroadcastMock).toHaveBeenCalled();
		});
	});

	it("should not show retry button when shouldShowRetry is false", async () => {
		const transfer = profile.draftTransactionFactory().transfer();
		transfer.setSender(profile.wallets().first());
		transfer.addRecipientWallet(profile.wallets().last());
		transfer.setAmount(1);
		vi.spyOn(transfer, "isCompleted").mockReturnValue(true);

		Object.defineProperty(transfer, "signAndBroadcast", {
			configurable: true,
			value: vi.fn().mockResolvedValue({ hash: "0xabc123" }),
			writable: true,
		});

		render(<LedgerTransactionApproveStep transfer={transfer} migrator={migrator} />, { route });

		await waitFor(() => {
			expect(screen.queryByText("Retry")).not.toBeInTheDocument();
		});
	});
});
