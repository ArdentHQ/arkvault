import React from "react";
import {
	SectionBodyItem,
	SectionHeaderMobile,
	SingleImport,
	ImportedLedgerMobileItem,
} from "./LedgerImportStep.blocks";
import { render, screen, env, getMainsailProfileId, renderResponsiveWithRoute } from "@/utils/testing-library";
import { vi } from "vitest";
import { Contracts } from "@/app/lib/profiles";
import { getDefaultAlias } from "@/domains/wallet/utils/get-default-alias";
import { BigNumber } from "@/app/lib/helpers";

describe("SectionHeaderMobile", () => {
	it("should render", () => {
		render(<SectionHeaderMobile title="Test" />);

		expect(screen.getByTestId("SectionHeaderMobile__wrapper")).toBeTruthy();
	});

	it("should render title", () => {
		render(<SectionHeaderMobile title="Test title" />);

		expect(screen.getByText("Test title")).toBeTruthy();
	});
});

describe("SectionBodyItem", () => {
	it("should render", () => {
		render(
			<SectionBodyItem title="Test title">
				<div>Test</div>
			</SectionBodyItem>,
		);

		expect(screen.getByTestId("SectionBodyItem__wrapper")).toBeTruthy();
	});

	it("should render title", () => {
		render(
			<SectionBodyItem title="Test title">
				<div>Test</div>
			</SectionBodyItem>,
		);

		expect(screen.getByText("Test title")).toBeTruthy();
	});

	it("should render children", () => {
		render(
			<SectionBodyItem title="Test title">
				<div>Test</div>
			</SectionBodyItem>,
		);

		expect(screen.getByText("Test")).toBeTruthy();
	});
});

describe("SingleImport", () => {
	let profile: Contracts.IProfile;
	const derivationPath = "m/44'/111'/0'/0/0";

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
	});

	beforeEach(async () => {
		await env.profiles().restore(profile);
	});

	it("should render", async () => {
		const wallet = await profile.walletFactory().fromAddressWithDerivationPath({
			address: "0x2c1DE3b4Dbb4aDebEbB5dcECAe825bE2a9fc6eb6",
			coin: "Mainsail",
			network: "mainsail.devnet",
			path: derivationPath,
		});

		wallet.mutator().alias(getDefaultAlias({ profile }));
		profile.wallets().push(wallet);

		const ledgerWallets = [{ address: wallet.address(), balance: BigNumber.ZERO, path: derivationPath }];

		renderResponsiveWithRoute(
			<SingleImport
				network={wallet.network()}
				onClickEditWalletName={() => {}}
				profile={profile}
				wallets={ledgerWallets}
			/>,
			"lg",
			{ route: `/profiles/${getMainsailProfileId()}/dashboard` },
		);

		expect(screen.getByTestId("SingleImport__container")).toBeTruthy();
	});
});

describe("ImportedLedgerMobileItem", () => {
	it("should render mobile item", () => {
		render(
			<ImportedLedgerMobileItem
				address="0x2c1DE3b4Dbb4aDebEbB5dcECAe825bE2a9fc6eb6"
				balance={1000}
				coin="ARK"
				name="Test Wallet"
				onClick={() => {}}
			/>,
		);

		expect(screen.getByTestId("LedgerMobileItem__wrapper")).toBeTruthy();
	});
});
