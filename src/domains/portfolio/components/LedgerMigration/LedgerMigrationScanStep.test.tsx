import {
	env,
	getMainsailProfileId,
	mockNanoSTransport,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";
import { expect, it, describe, beforeEach, afterAll, vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { MigrationLedgerScanStep } from "./LedgerMigrationScanStep";
import { Networks } from "@/app/lib/mainsail";

vi.mock("@/app/contexts/Ledger", () => ({
	useLedgerScanner: vi.fn().mockReturnValue({
		wallets: [
			{
				address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
				balance: "100",
				path: "m/44'/1'/0'/0/1",
			},
		],
		selectedWallets: [
			{
				address: "0x125b484e51Ad990b5b3140931f3BD8eAee85Db23",
				balance: "0",
				path: "m/44'/1'/0'/0/0",
			},
			{
				address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
				balance: "100",
				path: "m/44'/1'/0'/0/1",
			},
			{
				address: "0xB64b3619cEF2642E36B6093da95BA2D14Fa9b52f",
				balance: undefined as unknown as string,
				path: "m/44'/1'/0'/0/2",
			},
		],
		loadedWallets: [
			{
				address: "0x125b484e51Ad990b5b3140931f3BD8eAee85Db23",
				balance: "0",
				path: "m/44'/1'/0'/0/0",
			},
			{
				address: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
				balance: "100",
				path: "m/44'/1'/0'/0/1",
			},
			{
				address: "0xB64b3619cEF2642E36B6093da95BA2D14Fa9b52f",
				balance: undefined as unknown as string,
				path: "m/44'/1'/0'/0/2",
			},
		],
		isScanning: false,
		canRetry: true,
		error: null,
		scan: vi.fn(),
		abortScanner: vi.fn(),
		isSelected: vi.fn().mockReturnValue(false),
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
			flushTransactions: vi.fn(),
			createTransactions: vi.fn().mockResolvedValue(undefined),
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
});