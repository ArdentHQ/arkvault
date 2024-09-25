import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";

import { Signatures } from "./Signatures";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

describe("Signatures", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let wallet2: Contracts.IReadWriteWallet;
	let multisignatureTransactionMock: DTO.ExtendedSignedTransactionData;
	const SignaturesParticipantStatus = "Signatures__participant-status";
	const SignaturesWaitingBadge = "Signatures__waiting-badge";
	const SignaturesSignedBadge = "Signatures__signed-badge";

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
		wallet2 = profile.wallets().last();

		await profile.sync();

		multisignatureTransactionMock = new DTO.ExtendedSignedTransactionData(
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
	});

	it("should render", async () => {
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingSignatureByPublicKey").mockImplementation((_, publicKey) => {
			if (wallet.publicKey() === publicKey) {
				return true;
			}
			return false;
		});
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(true);

		const { container } = render(<Signatures transaction={multisignatureTransactionMock} wallet={wallet} />);

		await waitFor(() => expect(screen.getAllByTestId(SignaturesParticipantStatus)).toHaveLength(2));

		expect(screen.getAllByTestId(SignaturesWaitingBadge)).toHaveLength(1);
		expect(screen.getAllByTestId(SignaturesSignedBadge)).toHaveLength(1);

		expect(container).toMatchSnapshot();
	});

	it.each([true, false])(
		"should not require signature if waiting for final signature in registration with isAwaitingOurSignature=%s",
		async (isAwaitingOurSignature) => {
			vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(isAwaitingOurSignature);
			vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);
			vi.spyOn(wallet.coin().multiSignature(), "remainingSignatureCount").mockReturnValue(0);
			vi.spyOn(multisignatureTransactionMock, "isMultiSignatureRegistration").mockReturnValue(true);
			vi.spyOn(wallet.transaction(), "isAwaitingSignatureByPublicKey").mockImplementation((_, publicKey) =>
				[wallet.publicKey()].includes(publicKey),
			);

			const { container } = render(<Signatures transaction={multisignatureTransactionMock} wallet={wallet} />);

			await waitFor(() => expect(screen.getAllByTestId(SignaturesParticipantStatus)).toHaveLength(2));

			expect(screen.getAllByTestId(SignaturesSignedBadge)).toHaveLength(2);

			expect(container).toMatchSnapshot();
		},
	);

	it("should handle exception when checking if participant is awaiting signature", async () => {
		vi.spyOn(wallet.transaction(), "isAwaitingSignatureByPublicKey").mockImplementation(() => {
			throw new Error("Failed");
		});

		const { container } = render(<Signatures transaction={multisignatureTransactionMock} wallet={wallet} />);

		await waitFor(() => expect(screen.getAllByTestId(SignaturesParticipantStatus)).toHaveLength(2));

		expect(screen.getAllByTestId(SignaturesSignedBadge)).toHaveLength(2);
	});

	it("should show all participants as signed when all signatures are added", async () => {
		vi.spyOn(multisignatureTransactionMock, "get").mockImplementation((key) => {
			if (key === "multiSignature") {
				return { publicKeys: [wallet.publicKey(), wallet2.publicKey()] };
			}

			if (key === "signatures") {
				return ["1", "2"]; // Only checking lengths
			}
		});

		const { container } = render(<Signatures transaction={multisignatureTransactionMock} wallet={wallet} />);

		await waitFor(() => expect(screen.getAllByTestId(SignaturesParticipantStatus)).toHaveLength(2));

		expect(screen.getAllByTestId(SignaturesSignedBadge)).toHaveLength(2);

		expect(container).toMatchSnapshot();
	});

	it("should render with waiting badge", async () => {
		vi.spyOn(multisignatureTransactionMock, "get").mockImplementation((key) => {
			if (key === "multiSignature") {
				return { publicKeys: [wallet.publicKey(), wallet2.publicKey()] };
			}

			if (key === "signatures") {
				return []; // Only checking lengths
			}
		});
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(false);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(false);

		const { container } = render(<Signatures transaction={multisignatureTransactionMock} wallet={wallet} />);

		await waitFor(() => expect(screen.getAllByTestId(SignaturesParticipantStatus)).toHaveLength(2));

		expect(screen.getAllByTestId(SignaturesSignedBadge)).toHaveLength(2);

		expect(container).toMatchSnapshot();

		vi.restoreAllMocks();
	});
});
