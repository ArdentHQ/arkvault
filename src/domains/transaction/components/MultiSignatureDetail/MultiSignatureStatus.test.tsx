import { Contracts } from "@payvo/sdk-profiles";
import React from "react";

import { MultiSignatureStatus } from "./MultiSignatureStatus";
import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

describe("MultiSignatureStatus", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render as awaiting our signature", async () => {
		jest.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(true);

		const { container } = render(
			<MultiSignatureStatus
				wallet={wallet}
				transaction={{
					...TransactionFixture,
					min: () => 2,
					publicKeys: () => [wallet.publicKey()!, profile.wallets().last().publicKey()],
					wallet: () => wallet,
				}}
				isOpen
			/>,
		);

		await expect(screen.findByText(translations.MULTISIGNATURE.AWAITING_OUR_SIGNATURE)).resolves.toBeVisible();

		expect(container).toMatchSnapshot();

		jest.restoreAllMocks();
	});

	it("should render as awaiting other signatures", async () => {
		jest.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(true);
		jest.spyOn(wallet.coin().multiSignature(), "remainingSignatureCount").mockReturnValue(1);

		const { container } = render(
			<MultiSignatureStatus
				wallet={wallet}
				transaction={{
					...TransactionFixture,
					min: () => 2,
					publicKeys: () => [wallet.publicKey()!, profile.wallets().last().publicKey()],
					wallet: () => wallet,
				}}
				isOpen
			/>,
		);

		await expect(screen.findByText("Awaiting 1 other signature")).resolves.toBeVisible();

		expect(container).toMatchSnapshot();

		jest.restoreAllMocks();
	});

	it("should render as awaiting confirmations", async () => {
		jest.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(true);

		const { container } = render(
			<MultiSignatureStatus
				wallet={wallet}
				transaction={{
					...TransactionFixture,
					min: () => 2,
					publicKeys: () => [wallet.publicKey()!, profile.wallets().last().publicKey()],
					wallet: () => wallet,
				}}
				isOpen
			/>,
		);

		await expect(screen.findByText(translations.MULTISIGNATURE.AWAITING_CONFIRMATIONS)).resolves.toBeVisible();

		expect(container).toMatchSnapshot();

		jest.restoreAllMocks();
	});

	it("should render as multiSignature ready", async () => {
		jest.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(false);
		jest.spyOn(wallet.coin().multiSignature(), "isMultiSignatureReady").mockReturnValue(true);

		const { container } = render(
			<MultiSignatureStatus
				wallet={wallet}
				transaction={{
					...TransactionFixture,
					min: () => 2,
					publicKeys: () => [wallet.publicKey()!, profile.wallets().last().publicKey()],
					wallet: () => wallet,
				}}
				isOpen
			/>,
		);

		await expect(screen.findByText(translations.MULTISIGNATURE.READY)).resolves.toBeVisible();

		expect(container).toMatchSnapshot();

		jest.restoreAllMocks();
	});

	it("should show as awaiting final signature", async () => {
		jest.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		jest.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(false);
		jest.spyOn(wallet.coin().multiSignature(), "isMultiSignatureReady").mockImplementation(() => {
			throw new Error("error");
		});

		const { container } = render(
			<MultiSignatureStatus
				wallet={wallet}
				transaction={{
					...TransactionFixture,
					min: () => 2,
					publicKeys: () => [wallet.publicKey()!, profile.wallets().last().publicKey()],
					wallet: () => wallet,
				}}
				isOpen
			/>,
		);

		await expect(screen.findByText(translations.MULTISIGNATURE.AWAITING_FINAL_SIGNATURE)).resolves.toBeVisible();

		expect(container).toMatchSnapshot();

		jest.restoreAllMocks();
	});
});
