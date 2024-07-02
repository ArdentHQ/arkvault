import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import { translations } from "@/domains/transaction/i18n";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

import { MultiSignatureStatus } from "./MultiSignatureStatus";

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
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(true);

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

		vi.restoreAllMocks();
	});

	it("should render as awaiting other signatures", async () => {
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(true);
		vi.spyOn(wallet.coin().multiSignature(), "remainingSignatureCount").mockReturnValue(1);

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

		vi.restoreAllMocks();
	});

	it("should render as awaiting confirmations", async () => {
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(true);

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

		vi.restoreAllMocks();
	});

	it("should render as multiSignature ready", async () => {
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(false);
		vi.spyOn(wallet.coin().multiSignature(), "isMultiSignatureReady").mockReturnValue(true);

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

		vi.restoreAllMocks();
	});

	it("should show as awaiting final signature", async () => {
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingConfirmation").mockReturnValue(false);
		vi.spyOn(wallet.coin().multiSignature(), "isMultiSignatureReady").mockImplementation(() => {
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

		vi.restoreAllMocks();
	});
});
