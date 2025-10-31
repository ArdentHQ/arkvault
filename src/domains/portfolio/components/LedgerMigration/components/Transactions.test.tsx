import { env, getMainsailProfileId, screen, renderResponsiveWithRoute, waitFor } from "@/utils/testing-library";
import { expect, it, describe } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { createLedgerMocks } from "@/tests/mocks/Ledger";
import { Transactions } from "./Transactions";
import userEvent from "@testing-library/user-event";
import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";

describe("Transactions", () => {
	let profile: Contracts.IProfile;
	const senderPath = "m/44'/1'/1'/0/0";
	const recipientPath = "m/44'/66'/1'/0/0";
	let migrator: LedgerMigrator;

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);

		const publicKeyPaths = new Map([
			[senderPath, profile.wallets().first().publicKey()!],
			[recipientPath, profile.wallets().last().publicKey()!],
		]);

		createLedgerMocks(profile.wallets().first(), publicKeyPaths);

		migrator = new LedgerMigrator({ env, profile });

		await migrator.createTransactions([
			{
				address: profile.wallets().first().address(),
				path: senderPath,
			},
			{
				address: profile.wallets().last().address(),
				path: recipientPath,
			},
		]);

		migrator.nextTransaction();

		vi.spyOn(migrator.transactions().at(0)!, "isCompleted").mockReturnValue(true);
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s", async (containerSize) => {
		const { asFragment } = renderResponsiveWithRoute(<Transactions migrator={migrator} />, containerSize, {
			route: `/profiles/${profile.id()}/dashboard`,
		});

		expect(screen.getAllByTestId("Link__external")).toHaveLength(1);
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s with status banner", async (containerSize) => {
		const { asFragment } = renderResponsiveWithRoute(
			<Transactions migrator={migrator} showStatusBanner />,
			containerSize,
			{
				route: `/profiles/${profile.id()}/dashboard`,
			},
		);

		expect(screen.getAllByTestId("Link__external")).toHaveLength(1);
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs"])("should render in %s with status banner and toggle table visibility", async (containerSize) => {
		const { asFragment } = renderResponsiveWithRoute(
			<Transactions migrator={migrator} showStatusBanner />,
			containerSize,
			{
				route: `/profiles/${profile.id()}/dashboard`,
			},
		);

		expect(screen.getAllByTestId("Link__external")).toHaveLength(1);

		await waitFor(() => {
			expect(screen.getByTestId("AlertBanner_success")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("TransactionTableToggleMobile"));
		await waitFor(() => {
			expect(() => screen.getByTestId("TransactionRowMobile")).toThrow();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render in %s with pending status banner", async (containerSize) => {
		vi.spyOn(migrator.currentTransaction(), "signedTransaction").mockReturnValue(undefined);
		vi.spyOn(migrator.currentTransaction(), "isPending").mockReturnValue(true);
		vi.spyOn(migrator.currentTransaction(), "isCompleted").mockReturnValue(false);

		const { asFragment } = renderResponsiveWithRoute(
			<Transactions migrator={migrator} showStatusBanner />,
			containerSize,
			{
				route: `/profiles/${profile.id()}/dashboard`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("AlertBanner_warning")).toBeInTheDocument();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "lg"])("should render in %s with pending status banner", async (containerSize) => {
		vi.spyOn(migrator.currentTransaction(), "signedTransaction").mockReturnValue(undefined);
		vi.spyOn(migrator.currentTransaction(), "isPending").mockReturnValue(true);
		vi.spyOn(migrator.currentTransaction(), "isCompleted").mockReturnValue(false);

		const { asFragment } = renderResponsiveWithRoute(
			<Transactions migrator={migrator} showStatusBanner />,
			containerSize,
			{
				route: `/profiles/${profile.id()}/dashboard`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("AlertBanner_warning")).toBeInTheDocument();
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "lg"])("should render in %s with pending confirmation status banner", async (containerSize) => {
		vi.spyOn(migrator.currentTransaction(), "signedTransaction").mockReturnValue(
			{} as ExtendedSignedTransactionData,
		);
		vi.spyOn(migrator.currentTransaction(), "isPending").mockReturnValue(false);
		vi.spyOn(migrator.currentTransaction(), "isCompleted").mockReturnValue(false);
		vi.spyOn(migrator.currentTransaction(), "isPendingConfirmation").mockReturnValue(true);

		const { asFragment } = renderResponsiveWithRoute(
			<Transactions migrator={migrator} showStatusBanner />,
			containerSize,
			{
				route: `/profiles/${profile.id()}/dashboard`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("AlertBanner_warning")).toBeInTheDocument();
		});

		expect(asFragment()).toMatchSnapshot();
	});
});
