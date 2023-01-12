import React from "react";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { MigrationAdd } from "./MigrationAdd";
import { render, getDefaultProfileId, screen, waitFor, env } from "@/utils/testing-library";
import { translations as migrationTranslations } from "@/domains/migration/i18n";
import * as useMetaMask from "@/domains/migration/hooks/use-meta-mask";
import userEvent from "@testing-library/user-event";
import { migrationNetwork } from "@/utils/polygon-migration";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";

const history = createHashHistory();
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secret = "123";

const createTransactionMock = async (wallet: Contracts.IReadWriteWallet) => {
	const transaction = new DTO.ExtendedSignedTransactionData(
		await wallet
			.coin()
			.transaction()
			.transfer({
				data: {
					amount: 1,
					to: wallet.address(),
				},
				fee: 1,
				nonce: "1",
				signatory: await wallet
					.coin()
					.signatory()
					.multiSignature({
						min: 2,
						publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
					}),
			}),
		wallet,
	);

	return vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(transaction);
};
const renderComponent = () => {
	const migrationUrl = `/profiles/${getDefaultProfileId()}/migration/add`;
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

	it("should render", () => {
		renderComponent();

		expect(screen.getByTestId("header__title")).toBeInTheDocument();

		expect(screen.getByTestId("header__title")).toHaveTextContent(
			migrationTranslations.MIGRATION_ADD.STEP_CONNECT.TITLE,
		);
	});

	it("should complete migration steps", async () => {
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

		await expect(screen.findByTestId("SearchWalletListItem__select-0")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("SearchWalletListItem__select-0"));

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));
		await waitFor(() => expect(screen.getByTestId("MigrationAdd__continue-btn")).toBeEnabled());

		userEvent.click(screen.getByTestId("MigrationAdd__continue-btn"));

		await expect(screen.findByTestId("MigrationReview")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("MigrationAdd__continue-btn")).toBeEnabled());
		userEvent.click(screen.getByTestId("MigrationAdd__continue-btn"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__secret"), secret);

		expect(screen.getByTestId("AuthenticationStep__secret")).toHaveValue(secret);

		await waitFor(() => expect(screen.getByTestId("MigrationAdd__continue-btn")).toBeEnabled());

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		await createTransactionMock(wallet);

		userEvent.click(screen.getByTestId("MigrationAdd__continue-btn"));

		await expect(screen.findByTestId("BackToDashboard__button")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
	});
});
