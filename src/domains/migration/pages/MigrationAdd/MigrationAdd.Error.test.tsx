import React from "react";
import { createHashHistory } from "history";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { Route } from "react-router-dom";
import { MigrationAdd } from "./MigrationAdd";
import { render, getDefaultProfileId, screen, waitFor, env } from "@/utils/testing-library";
import { translations as migrationTranslations } from "@/domains/migration/i18n";
import * as useMetaMask from "@/domains/migration/hooks/use-meta-mask";
import { migrationNetwork } from "@/utils/polygon-migration";
import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";
import { TransactionFixture } from "@/tests/fixtures/transactions";

vi.mock("@/domains/migration/hooks/use-migration-transaction", () => ({
	useMigrationTransaction: () => ({
		abortTransaction: vi.fn(),
		sendTransaction: () => {
			throw new Error("error");
		},
	}),
}));

const history = createHashHistory();
const migrationUrl = `/profiles/${getDefaultProfileId()}/migration/add`;
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secret = "123";
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

describe("Migration Error Handling", () => {
	beforeAll(async () => {
		vi.spyOn(useMetaMask, "useMetaMask").mockReturnValue({
			account: "0x0000000000000000000000000000000000000000",
			connectWallet: vi.fn(),
			connecting: false,
			isOnPolygonNetwork: true,
			needsMetaMask: false,
			supportsMetaMask: true,
		});

		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);

		wallet = await profile.walletFactory().fromSecret({
			coin: "ARK",
			network: migrationNetwork(),
			secret,
		});

		await wallet.synchroniser().coin();
		await wallet.synchroniser().identity();

		vi.spyOn(wallet, "balance").mockReturnValue(1000);
		vi.spyOn(wallet, "isSecondSignature").mockReturnValue(false);

		profile.wallets().push(wallet);
	});

	it("should go to error step", async () => {
		renderComponent();

		await profile.wallets().findByCoinWithNetwork("ARK", "ark.devnet")[0].synchroniser().identity();

		const signatory = await profile
			.wallets()
			.findByCoinWithNetwork("ARK", "ark.devnet")[0]
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

		await expect(screen.findByTestId("SearchWalletListItem__select-2")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("SearchWalletListItem__select-2"));

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

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
	});

	it("should go to error step and then go back", async () => {
		renderComponent();

		await profile.wallets().findByCoinWithNetwork("ARK", "ark.devnet")[0].synchroniser().identity();

		const signatory = await profile
			.wallets()
			.findByCoinWithNetwork("ARK", "ark.devnet")[0]
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

		await expect(screen.findByTestId("SearchWalletListItem__select-2")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("SearchWalletListItem__select-2"));

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

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("ErrorStep__wallet-button"));

		expect(history.location.pathname).toBe(`/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}`);
		signMock.mockRestore();
		broadcastMock.mockRestore();
	});
});
