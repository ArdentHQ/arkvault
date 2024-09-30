import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";

import { getMultiSignatureInfo, MultiSignatureDetailStep, Paginator, transactionPublicKeys } from "./MultiSignatureDetail.helpers";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	syncDelegates,
	triggerMessageSignOnce,
} from "@/utils/testing-library";

describe("MultiSignatureDetail Helpers", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let transaction: DTO.ExtendedSignedTransactionData;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		await syncDelegates(profile);

		wallet = profile.wallets().first();

		await wallet.synchroniser().identity();

		await triggerMessageSignOnce(wallet);
	});

	beforeEach(async () => {
		transaction = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.multiSignature({
					data: {
						mandatoryKeys: [],
						min: 2,
						numberOfSignatures: 2,
						optionalKeys: [],
						publicKeys: [],
						senderPublicKey: wallet.publicKey(),
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
	});

	it("should extract multisignature info", () => {
		const { min, publicKeys } = getMultiSignatureInfo(transaction);

		expect(min).toBe(2);
		expect(publicKeys).toHaveLength(2);
	});

	it("should extract multisignature info mapping mandatoryKeys and numberOfSignatures to min and publicKeys", () => {
		vi.spyOn(transaction, "get").mockReturnValue({
			mandatoryKeys: [],
			numberOfSignatures: 2,
			optionalKeys: [],
		});

		const { min, publicKeys } = getMultiSignatureInfo(transaction);

		expect(min).toBe(2);
		expect(publicKeys).toHaveLength(0);
	});

	it("should render Paginator with broadcast only button", () => {
		render(
			<Paginator
				canBeBroadcasted
				canBeSigned={false}
				isCreator
				activeStep={MultiSignatureDetailStep.SummaryStep}
			/>,
		);

		expect(screen.getByTestId("MultiSignatureDetail__broadcast")).toBeInTheDocument();
	});

	it("should return min & zero length public keys if transaction is undefined", () => {
		vi.spyOn(transaction, "get").mockReturnValue({
			mandatoryKeys: [],
			numberOfSignatures: 2,
			optionalKeys: [],
		});

		const { min, publicKeys } = transactionPublicKeys();

		expect(min).toBe(undefined);
		expect(publicKeys).toHaveLength(0);
	});
});
