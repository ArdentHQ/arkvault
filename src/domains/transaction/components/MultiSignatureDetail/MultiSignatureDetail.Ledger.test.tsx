import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";

import {
	env,
	getDefaultProfileId,
	mockNanoXTransport,
	render,
	screen,
	syncDelegates,
	waitFor,
} from "@/utils/testing-library";

import { MultiSignatureDetail } from "./MultiSignatureDetail";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const fixtures: Record<string, any> = {
	multiSignature: undefined,
	transfer: undefined,
};

vi.mock("@/app/hooks/use-ledger-model-status", () => ({
	useLedgerModelStatus: () => ({ isLedgerModelSupported: true }),
}));

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const mockPendingTransfers = (wallet: Contracts.IReadWriteWallet) => {
	vi.spyOn(wallet.transaction(), "signed").mockReturnValue({
		[fixtures.transfer.id()]: fixtures.transfer,
	});

	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(fixtures.transfer);
};

describe("MultiSignatureDetail", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		await syncDelegates(profile);

		wallet = profile.wallets().first();

		await wallet.synchroniser().identity();
	});

	beforeEach(async () => {
		fixtures.transfer = new DTO.ExtendedSignedTransactionData(
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

		fixtures.multiSignature = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.multiSignature({
					data: {
						min: 2,
						publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						senderPublicKey: wallet.publicKey()!,
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

		vi.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);
	});

	it("should go to authentication step with a ledger wallet", async () => {
		mockPendingTransfers(wallet);
		mockNanoXTransport();

		vi.spyOn(wallet, "isLedger").mockReturnValue(true);

		vi.spyOn(wallet.transaction(), "canBeBroadcasted").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "canBeSigned").mockReturnValue(true);
		vi.spyOn(wallet.transaction(), "sync").mockResolvedValue(void 0);

		render(
			<Route path="/profiles/:profileId">
				<MultiSignatureDetail profile={profile} transaction={fixtures.transfer} wallet={wallet} isOpen />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getByTestId("Paginator__sign")));

		await userEvent.click(screen.getByTestId("Paginator__sign"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		vi.restoreAllMocks();
	});
});
