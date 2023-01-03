import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { MigrationConnectStep } from "./MigrationConnectStep";
import { translations as migrationTranslations } from "@/domains/migration/i18n";
import { render, screen, env, getDefaultProfileId } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const history = createHashHistory();

const renderComponent = (profileId = profile.id()) => {
	const migrationUrl = `/profiles/${profileId}/migration/add`;
	history.push(migrationUrl);

	return render(
		<Route path="/profiles/:profileId/migration/add">
			<MigrationConnectStep />
		</Route>,
		{
			history,
			route: migrationUrl,
		},
	);
};

// 88,99,107,115-117,125,134,255
describe("MigrationConnectStep", () => {
	let arkMainnetWallet: Contracts.IReadWriteWallet;
	let arkMainnetWalletSpy: any;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		const { wallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: "ark.mainnet",
		});

		arkMainnetWallet = wallet;

		profile.wallets().push(arkMainnetWallet);
	});

	it("should render ", () => {
		renderComponent();
		expect(screen.getByText(migrationTranslations.MIGRATION_ADD.STEP_CONNECT.FORM.ARK_ADDRESS)).toBeInTheDocument();
		expect(
			screen.getByText(migrationTranslations.MIGRATION_ADD.STEP_CONNECT.FORM.AMOUNT_YOU_SEND),
		).toBeInTheDocument();
		expect(
			screen.getByText(migrationTranslations.MIGRATION_ADD.STEP_CONNECT.FORM.POLYGON_MIGRATION_ADDRESS),
		).toBeInTheDocument();
		expect(
			screen.getByText(migrationTranslations.MIGRATION_ADD.STEP_CONNECT.FORM.AMOUNT_YOU_GET),
		).toBeInTheDocument();
	});

	describe("with valid wallets", () => {
		beforeAll(() => {
			arkMainnetWalletSpy = vi.spyOn(arkMainnetWallet, "balance").mockReturnValue(0.1);
		});
		afterAll(() => {
			arkMainnetWalletSpy.mockRestore();
		});

		it("should include mainnet wallets with enough balance", () => {
			renderComponent();

			expect(screen.getByTestId("SelectAddress__input")).not.toBeDisabled();
		});
	});

	describe("with invalid wallets", () => {
		beforeAll(() => {
			arkMainnetWalletSpy = vi.spyOn(arkMainnetWallet, "balance").mockReturnValue(0.03);
		});

		afterAll(() => {
			arkMainnetWalletSpy.mockRestore();
		});

		it("should not include wallets without balance", () => {
			renderComponent();

			expect(screen.getByTestId("SelectAddress__input")).toBeDisabled();
		});
	});
});
