import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";

import { waitFor } from "@testing-library/react";
import { ConfirmRemovePendingTransaction } from "./ConfirmRemovePendingTransaction";
import { minVersionList, useLedgerContext } from "@/app/contexts";
import { translations } from "@/domains/transaction/i18n";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	mockNanoXTransport,
	render,
	screen,
} from "@/utils/testing-library";

const submitButton = () => screen.getByTestId("DeleteResource__submit-button");
const cancelButton = () => screen.getByTestId("DeleteResource__cancel-button");

const Wrapper = ({ children }: { children: React.ReactNode }) => {
	const { listenDevice } = useLedgerContext();

	useEffect(() => {
		listenDevice();
	}, []);

	return <>{children}</>;
};

describe("ConfirmRemovePendingTransaction", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let transferFixture: DTO.ExtendedSignedTransactionData;
	let multiSignatureFixture: DTO.ExtendedSignedTransactionData;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().first();

		await profile.sync();

		transferFixture = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: wallet.address(),
					},
					fee: 0.1,
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

		multiSignatureFixture = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.multiSignature({
					data: {
						min: 2,
						publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						senderPublicKey: wallet.publicKey()!,
					},
					fee: 0.1,
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

	it("should not render if transaction type is not available", () => {
		const transaction = transferFixture;

		vi.spyOn(transaction, "type").mockReturnValue(undefined);

		const { asFragment } = render(<ConfirmRemovePendingTransaction profile={profile} transaction={transaction} />);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render multisignature transaction", () => {
		const { asFragment } = render(
			<ConfirmRemovePendingTransaction profile={profile} transaction={transferFixture} />,
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(submitButton()).toBeInTheDocument();
		expect(cancelButton()).toBeInTheDocument();

		expect(
			screen.getByTestId(
				`ConfirmRemovePendingTransaction__${translations.TRANSACTION_TYPES.TRANSFER}-${translations.TRANSACTION}`,
			),
		).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render multisignature registration", () => {
		const { asFragment } = render(
			<ConfirmRemovePendingTransaction profile={profile} transaction={multiSignatureFixture} />,
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(submitButton()).toBeInTheDocument();
		expect(cancelButton()).toBeInTheDocument();

		expect(
			screen.getByTestId(
				`ConfirmRemovePendingTransaction__${translations.TRANSACTION_TYPES.MULTI_SIGNATURE}-${translations.REGISTRATION}`,
			),
		).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle close", async () => {
		const onClose = vi.fn();
		render(
			<ConfirmRemovePendingTransaction profile={profile} transaction={multiSignatureFixture} onClose={onClose} />,
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(submitButton()).toBeInTheDocument();
		expect(cancelButton()).toBeInTheDocument();

		expect(
			screen.getByTestId(
				`ConfirmRemovePendingTransaction__${translations.TRANSACTION_TYPES.MULTI_SIGNATURE}-${translations.REGISTRATION}`,
			),
		).toBeInTheDocument();

		await userEvent.click(cancelButton());

		expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should handle remove", async () => {
		const onRemove = vi.fn();

		render(
			<ConfirmRemovePendingTransaction
				profile={profile}
				transaction={multiSignatureFixture}
				onRemove={onRemove}
			/>,
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(submitButton()).toBeInTheDocument();
		expect(cancelButton()).toBeInTheDocument();

		expect(
			screen.getByTestId(
				`ConfirmRemovePendingTransaction__${translations.TRANSACTION_TYPES.MULTI_SIGNATURE}-${translations.REGISTRATION}`,
			),
		).toBeInTheDocument();

		expect(submitButton()).toBeDisabled();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), getDefaultWalletMnemonic());

		await waitFor(() => {
			expect(submitButton()).toBeEnabled();
		});

		await userEvent.click(submitButton());

		expect(onRemove).toHaveBeenCalledWith(expect.any(DTO.ExtendedSignedTransactionData));
	});

	it("should handle remove with ledger wallet", async () => {
		const onRemove = vi.fn();

		vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue(minVersionList[wallet.network().coin()]);

		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		vi.spyOn(wallet, "isLedgerNanoX").mockReturnValue(true);

		vi.spyOn(wallet.coin(), "__construct").mockImplementation(vi.fn());

		const getPublicKeyMock = vi.spyOn(wallet.coin().ledger(), "getPublicKey").mockResolvedValue(wallet.publicKey());

		const ledgerTransportMock = mockNanoXTransport();

		render(
			<Wrapper>
				<ConfirmRemovePendingTransaction
					profile={profile}
					transaction={multiSignatureFixture}
					onRemove={onRemove}
				/>
			</Wrapper>,
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(submitButton()).toBeInTheDocument();
		expect(cancelButton()).toBeInTheDocument();

		expect(
			screen.getByTestId(
				`ConfirmRemovePendingTransaction__${translations.TRANSACTION_TYPES.MULTI_SIGNATURE}-${translations.REGISTRATION}`,
			),
		).toBeInTheDocument();

		expect(submitButton()).toBeDisabled();

		await waitFor(() => {
			expect(submitButton()).toBeEnabled();
		});

		await userEvent.click(submitButton());

		expect(onRemove).toHaveBeenCalledWith(expect.any(DTO.ExtendedSignedTransactionData));

		ledgerTransportMock.mockRestore();
		getPublicKeyMock.mockRestore();
	});
});
