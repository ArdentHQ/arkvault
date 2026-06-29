import { env, getMainsailProfileId, mockNanoSTransport, render, screen, waitFor } from "@/utils/testing-library";
import { useLedgerScanner } from "@/app/contexts/Ledger";
import userEvent from "@testing-library/user-event";
import { expect, it, describe, beforeEach, afterAll, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { MigrationLedgerScanStep } from "./LedgerMigrationScanStep";
import { Networks } from "@/app/lib/mainsail";

const TEST_ADDRESS = "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6";
const TEST_PATH = "m/44'/1'/0'/0/1";

vi.mock("@/app/contexts/Ledger", () => ({
	useLedgerScanner: vi.fn().mockReturnValue({
		abortScanner: vi.fn(),
		canRetry: true,
		error: null,
		isScanning: false,
		isSelected: vi.fn().mockReturnValue(false),
		loadedWallets: [
			{
				address: TEST_ADDRESS,
				balance: "0",
				path: "m/44'/1'/0'/0/0",
			},
			{
				address: TEST_ADDRESS,
				balance: "100",
				path: TEST_PATH,
			},
			{
				address: "0xB64b3619cEF2642E36B6093da95BA2D14Fa9b52f",
				balance: undefined as unknown as string,
				path: "m/44'/1'/0'/0/2",
			},
		],
		scan: vi.fn(),
		selectedWallets: [
			{
				address: TEST_ADDRESS,
				balance: "0",
				path: "m/44'/1'/0'/0/0",
			},
			{
				address: TEST_ADDRESS,
				balance: "100",
				path: TEST_PATH,
			},
			{
				address: "0xB64b3619cEF2642E36B6093da95BA2D14Fa9b52f",
				balance: undefined as unknown as string,
				path: "m/44'/1'/0'/0/2",
			},
		],
		wallets: [
			{
				address: TEST_ADDRESS,
				balance: "100",
				path: TEST_PATH,
			},
		],
	}),
}));

describe("MigrationLedgerScanStep", () => {
	let profile: Contracts.IProfile;
	let network: Networks.Network;
	let migrator: any;

	beforeEach(async () => {
		mockNanoSTransport();
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);
		network = profile.wallets().first().network();

		migrator = {
			createTransactions: vi.fn().mockResolvedValue(undefined),
			flushTransactions: vi.fn(),
		};
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("should filter addresses with balance greater than zero", async () => {
		const createTransactionsSpy = vi.spyOn(migrator, "createTransactions");

		render(
			<MigrationLedgerScanStep
				migrator={migrator as any}
				profile={profile}
				network={network}
				onContinue={vi.fn()}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("LedgerScanStep")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(createTransactionsSpy).toHaveBeenCalled();
		});
	});

	it("should call onContinue when clicking the continue button", async () => {
		const onContinueMock = vi.fn();

		vi.mocked(useLedgerScanner).mockReturnValue({
			abortScanner: vi.fn(),
			canRetry: true,
			error: null,
			isScanning: false,
			isSelected: vi.fn().mockReturnValue(false),
			loadedWallets: [
				{
					address: TEST_ADDRESS,
					balance: "100",
					path: TEST_PATH,
				},
			],
			scan: vi.fn(),
			selectedWallets: [
				{
					address: TEST_ADDRESS,
					balance: "100",
					path: TEST_PATH,
				},
			],
			wallets: [],
		});

		render(
			<MigrationLedgerScanStep
				migrator={migrator as any}
				profile={profile}
				network={network}
				onContinue={onContinueMock}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("LedgerScanStep")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId("LedgerScanStep__continue-button")).not.toBeDisabled();
		});

		await userEvent.click(screen.getByTestId("LedgerScanStep__continue-button"));

		expect(onContinueMock).toHaveBeenCalled();
	});
});
