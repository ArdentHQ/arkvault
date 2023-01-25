import React from "react";
import { createHashHistory } from "history";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { Route } from "react-router-dom";
import { MigrationAdd, SuccessButtonWrapper } from "./MigrationAdd";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import {
	render,
	getDefaultProfileId,
	screen,
	renderResponsiveWithRoute,
	waitFor,
	env,
	renderResponsive,
	mockNanoXTransport,
} from "@/utils/testing-library";
import { translations as migrationTranslations } from "@/domains/migration/i18n";
import * as useMetaMask from "@/domains/migration/hooks/use-meta-mask";
import * as contexts from "@/app/contexts";
import { migrationNetwork } from "@/utils/polygon-migration";
import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";
import { TransactionFixture } from "@/tests/fixtures/transactions";

const history = createHashHistory();
const migrationUrl = `/profiles/${getDefaultProfileId()}/migration/add`;
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let useMigrationsSpy;

const secret = "123";

const arkDevnetNetwork = "ark.devnet";
const arkCoin = "ARK";
const walletListItem = "SearchWalletListItem__select-2";
const continueButton = "MigrationAdd__continue-button";

const renderComponent = () => {
	history.push(migrationUrl);

	return render(
		<Route path="/profiles/:profileId/migration/add">
			<MigrationAdd />
		</Route>,
		{
			history,
			route: migrationUrl,
		},
	);
};

describe("MigrationAdd", () => {
	beforeAll(async () => {
		vi.spyOn(useMetaMask, "useMetaMask").mockReturnValue({
			account: "0x0000000000000000000000000000000000000000",
			connectWallet: vi.fn(),
			connecting: false,
			isOnValidNetwork: true,
			needsMetaMask: false,
			supportsMetaMask: true,
		});

		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);

		wallet = await profile.walletFactory().fromSecret({
			coin: arkCoin,
			network: migrationNetwork(),
			secret,
		});

		await wallet.synchroniser().coin();
		await wallet.synchroniser().identity();

		vi.spyOn(wallet, "balance").mockReturnValue(1000);
		vi.spyOn(wallet, "isSecondSignature").mockReturnValue(false);

		profile.wallets().push(wallet);

		await profile.wallets().findByCoinWithNetwork(arkCoin, arkDevnetNetwork)[0].synchroniser().identity();
	});

	beforeEach(() => {
		useMigrationsSpy = vi.spyOn(contexts, "useMigrations").mockReturnValue({
			migrations: [],
			storeTransactions: () => Promise.resolve({}),
		});
	});

	afterEach(() => {
		useMigrationsSpy.mockRestore();
	});

	it("should render", () => {
		renderComponent();

		expect(screen.getByTestId("header__title")).toBeInTheDocument();

		expect(screen.getByTestId("header__title")).toHaveTextContent(
			migrationTranslations.MIGRATION_ADD.STEP_CONNECT.TITLE,
		);
	});

	it("should render connect step and go back", () => {
		renderComponent();

		expect(screen.getByTestId("header__title")).toHaveTextContent(
			migrationTranslations.MIGRATION_ADD.STEP_CONNECT.TITLE,
		);

		userEvent.click(screen.getByTestId("MigrationAdd__back-button"));

		expect(history.location.pathname).toBe(`/profiles/${getDefaultProfileId()}/migration`);
	});

	it.each(["xs", "sm", "md"])("should render form button wrapper in %s", (breakpoint) => {
		const { asFragment } = renderResponsive(<SuccessButtonWrapper>test</SuccessButtonWrapper>, breakpoint);

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm"])("should render in %s", (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/migration/add">
				<MigrationAdd />
			</Route>,
			breakpoint,
			{
				history,
				route: migrationUrl,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should got to review step and go back", async () => {
		renderComponent();

		const signatory = await profile
			.wallets()
			.findByCoinWithNetwork(arkCoin, arkDevnetNetwork)[0]
			.signatoryFactory()
			.make({
				secret,
			});

		vi.spyOn(wallet.signatoryFactory(), "make").mockResolvedValue(signatory);
		vi.spyOn(wallet, "isMultiSignature").mockReturnValue(false);
		vi.spyOn(wallet, "isLedger").mockReturnValue(false);

		expect(screen.getByTestId("header__title")).toBeInTheDocument();

		expect(screen.getByTestId("header__title")).toHaveTextContent(
			migrationTranslations.MIGRATION_ADD.STEP_CONNECT.TITLE,
		);

		userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId(walletListItem)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(walletListItem));

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));
		await waitFor(() => expect(screen.getByTestId(continueButton)).toBeEnabled());

		userEvent.click(screen.getByTestId(continueButton));

		await expect(screen.findByTestId("MigrationReview")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("MigrationAdd__back-button"));

		expect(history.location.pathname).toBe(`/profiles/${getDefaultProfileId()}/migration/add`);
	});

	it("shows a warning and disables the button if contract is paused", async () => {
		useMigrationsSpy = vi.spyOn(contexts, "useMigrations").mockReturnValue({
			contractIsPaused: true,
		});

		renderComponent();

		expect(screen.getByTestId("ContractPausedAlert")).toBeInTheDocument();

		const signatory = await profile
			.wallets()
			.findByCoinWithNetwork(arkCoin, arkDevnetNetwork)[0]
			.signatoryFactory()
			.make({
				secret,
			});

		vi.spyOn(wallet.signatoryFactory(), "make").mockResolvedValue(signatory);
		vi.spyOn(wallet, "isMultiSignature").mockReturnValue(false);
		vi.spyOn(wallet, "isLedger").mockReturnValue(false);

		expect(screen.getByTestId("header__title")).toBeInTheDocument();

		expect(screen.getByTestId("header__title")).toHaveTextContent(
			migrationTranslations.MIGRATION_ADD.STEP_CONNECT.TITLE,
		);

		userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId(walletListItem)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(walletListItem));

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));
		await waitFor(() => expect(screen.getByTestId(continueButton)).toBeDisabled());
	});

	it("should complete migration steps", async () => {
		renderComponent();

		const signatory = await profile
			.wallets()
			.findByCoinWithNetwork(arkCoin, arkDevnetNetwork)[0]
			.signatoryFactory()
			.make({
				secret,
			});

		vi.spyOn(wallet.signatoryFactory(), "make").mockResolvedValue(signatory);
		vi.spyOn(wallet, "isMultiSignature").mockReturnValue(false);
		vi.spyOn(wallet, "isLedger").mockReturnValue(false);

		expect(screen.getByTestId("header__title")).toBeInTheDocument();

		expect(screen.getByTestId("header__title")).toHaveTextContent(
			migrationTranslations.MIGRATION_ADD.STEP_CONNECT.TITLE,
		);

		userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId(walletListItem)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(walletListItem));

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));
		await waitFor(() => expect(screen.getByTestId(continueButton)).toBeEnabled());

		userEvent.click(screen.getByTestId(continueButton));

		await expect(screen.findByTestId("MigrationReview")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId(continueButton)).toBeEnabled());
		userEvent.click(screen.getByTestId(continueButton));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		expect(history.location.pathname).toBe(`/profiles/${getDefaultProfileId()}/migration/add`);
	});

	it("should complete migration steps", async () => {
		renderComponent();

		const signatory = await profile
			.wallets()
			.findByCoinWithNetwork(arkCoin, arkDevnetNetwork)[0]
			.signatoryFactory()
			.make({
				secret,
			});

		vi.spyOn(wallet.signatoryFactory(), "make").mockResolvedValue(signatory);
		vi.spyOn(wallet, "isMultiSignature").mockReturnValue(false);
		vi.spyOn(wallet, "isLedger").mockReturnValue(false);

		expect(screen.getByTestId("header__title")).toBeInTheDocument();

		expect(screen.getByTestId("header__title")).toHaveTextContent(
			migrationTranslations.MIGRATION_ADD.STEP_CONNECT.TITLE,
		);

		userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId(walletListItem)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(walletListItem));

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));
		await waitFor(() => expect(screen.getByTestId(continueButton)).toBeEnabled());

		userEvent.click(screen.getByTestId(continueButton));

		await expect(screen.findByTestId("MigrationReview")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId(continueButton)).toBeEnabled());
		userEvent.click(screen.getByTestId(continueButton));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__secret"), secret);

		expect(screen.getByTestId("AuthenticationStep__secret")).toHaveValue(secret);

		await waitFor(() => expect(screen.getByTestId("MigrationAdd__send-button")).toBeEnabled());

		// Step 5 (skip ledger confirmation)
		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});

		vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(TransactionFixture);

		userEvent.click(screen.getByTestId("MigrationAdd__send-button"));

		await expect(screen.findByTestId("MigrationPendingStep")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
	});

	it.skip("should redirect to success step once migration finished", async () => {
		const migration = {
			address: "AdDreSs",
			amount: 123,
			id: "ea63bf9a4b3eaf75a1dfff721967c45dce64eb7facf1aef29461868681b5c79b",
			migrationAddress: "BuRnAdDreSs",
			status: MigrationTransactionStatus.Confirmed,
			timestamp: Date.now() / 1000,
		};

		useMigrationsSpy.mockRestore();

		useMigrationsSpy = vi.spyOn(contexts, "useMigrations").mockReturnValue({
			migrations: [migration],
			storeTransactions: () => Promise.resolve({}),
		}).mockReturnValueOnce({
			migrations: [{ ...migration, status: MigrationTransactionStatus.Pending }],
			storeTransactions: () => Promise.resolve({}),
		});

		renderComponent();

		const signatory = await profile
			.wallets()
			.findByCoinWithNetwork(arkCoin, arkDevnetNetwork)[0]
			.signatoryFactory()
			.make({
				secret,
			});

		vi.spyOn(wallet.signatoryFactory(), "make").mockResolvedValue(signatory);
		vi.spyOn(wallet, "isMultiSignature").mockReturnValue(false);
		vi.spyOn(wallet, "isLedger").mockReturnValue(false);

		expect(screen.getByTestId("header__title")).toBeInTheDocument();

		expect(screen.getByTestId("header__title")).toHaveTextContent(
			migrationTranslations.MIGRATION_ADD.STEP_CONNECT.TITLE,
		);

		userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId(walletListItem)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(walletListItem));

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));
		await waitFor(() => expect(screen.getByTestId(continueButton)).toBeEnabled());

		userEvent.click(screen.getByTestId(continueButton));

		await expect(screen.findByTestId("MigrationReview")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId(continueButton)).toBeEnabled());
		userEvent.click(screen.getByTestId(continueButton));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__secret"), secret);

		expect(screen.getByTestId("AuthenticationStep__secret")).toHaveValue(secret);

		await waitFor(() => expect(screen.getByTestId("MigrationAdd__send-button")).toBeEnabled());

		// Step 5 (skip ledger confirmation)
		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});

		vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(TransactionFixture);

		userEvent.click(screen.getByTestId("MigrationAdd__send-button"));

		await waitFor(() => {
			expect(screen.getByTestId("MigrationPendingStep")).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId("MigrationSuccessStep")).toBeInTheDocument();
		});

		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

		userEvent.click(screen.getByTestId("MigrationAdd__back-to-dashboard-button"));

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/dashboard`);

		historySpy.mockRestore();
		signMock.mockRestore();
		broadcastMock.mockRestore();
	});

	it("should authenticate with a ledger wallet", async () => {
		mockNanoXTransport();
		renderComponent();

		const signatory = await profile
			.wallets()
			.findByCoinWithNetwork(arkCoin, arkDevnetNetwork)[0]
			.signatoryFactory()
			.make({
				secret,
			});

		vi.spyOn(wallet.signatoryFactory(), "make").mockResolvedValue(signatory);
		vi.spyOn(wallet, "isMultiSignature").mockReturnValue(false);
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);

		expect(screen.getByTestId("header__title")).toBeInTheDocument();

		expect(screen.getByTestId("header__title")).toHaveTextContent(
			migrationTranslations.MIGRATION_ADD.STEP_CONNECT.TITLE,
		);

		userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId(walletListItem)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(walletListItem));

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));
		await waitFor(() => expect(screen.getByTestId(continueButton)).toBeEnabled());

		userEvent.click(screen.getByTestId(continueButton));

		await expect(screen.findByTestId("MigrationReview")).resolves.toBeVisible();

		// Step 5 (skip ledger confirmation)
		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});

		vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(TransactionFixture);

		await waitFor(() => expect(screen.getByTestId(continueButton)).toBeEnabled());
		userEvent.click(screen.getByTestId(continueButton));

		await waitFor(() => {
			expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();
		});

		signMock.mockRestore();
		broadcastMock.mockRestore();
	});
});
