import React, { useEffect, useState } from "react";
import userEvent from "@testing-library/user-event";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useMigrationTransaction } from "./use-migration-transaction";
import { useMigrationForm } from "./use-migration-form";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	MNEMONICS,
	mockNanoXTransport,
	waitFor,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

let wallet: Contracts.IReadWriteWallet;
let profile: Contracts.IProfile;
let signatory: any;

const MigrationForm = ({ wallet, profile }: { wallet: Contracts.IReadWriteWallet; profile: Contracts.IProfile }) => {
	const context = useMigrationForm();

	useEffect(() => {
		context.setValue("mnemonic", MNEMONICS[0]);
		context.setValue("recipients", [
			{
				address: "DNBURNBURNBURNBRNBURNBURNBURKz8StY",
				amount: 1,
			},
		]);
		context.setValue("wallet", wallet);
	}, []);

	const { sendTransaction, abortTransaction } = useMigrationTransaction({ context, profile });
	const [signedTransaction, setSignedTransaction] = useState(undefined);

	const handlSendTransaction = async () => {
		const response = await sendTransaction();
		setSignedTransaction(response);
	};

	return (
		<>
			<div data-testid="SendMigrationTransaction" onClick={handlSendTransaction} />
			<div data-testid="AbortTransaction" onClick={abortTransaction} />
			{signedTransaction && <div data-testid="SignedTransaction" />}
		</>
	);
};

describe("useMigrationTransaction hook", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		signatory = await wallet.signatoryFactory().make({
			mnemonic: MNEMONICS[0],
		});
	});

	beforeEach(() => {
		server.use(requestMock("https://ark-test-musig.arkvault.io/", { result: [] }, { method: "post" }));
		vi.spyOn(wallet.coin().transaction(), "estimateExpiration").mockResolvedValue("123");
		vi.spyOn(wallet.transaction(), "signTransfer").mockResolvedValue("123");
		vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({});
		vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({ errors: [] });
		vi.spyOn(wallet.signatoryFactory(), "make").mockResolvedValue(signatory);
	});

	it("should send transaction", async () => {
		render(<MigrationForm profile={profile} wallet={wallet} />);

		expect(screen.getByTestId("SendMigrationTransaction")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SendMigrationTransaction"));
		await waitFor(() => {
			expect(screen.getByTestId("SignedTransaction")).toBeInTheDocument();
		});
	});

	it("should send transaction that uses musig", async () => {
		vi.spyOn(signatory, "actsWithMultiSignature").mockReturnValue(true);
		vi.spyOn(signatory, "hasMultiSignature").mockReturnValue(true);

		render(<MigrationForm profile={profile} wallet={wallet} />);

		expect(screen.getByTestId("SendMigrationTransaction")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SendMigrationTransaction"));

		await waitFor(() => {
			expect(screen.getByTestId("SignedTransaction")).toBeInTheDocument();
		});
	});

	it("should send transaction for ledger wallet", async () => {
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		const ledgerListenSpy = mockNanoXTransport({ type: "unknown" });

		render(<MigrationForm profile={profile} wallet={wallet} />);

		expect(screen.getByTestId("SendMigrationTransaction")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SendMigrationTransaction"));
		ledgerListenSpy.mockRestore();

		await waitFor(() => {
			expect(screen.getByTestId("SignedTransaction")).toBeInTheDocument();
		});
	});

	it("should abortTransaction", () => {
		render(<MigrationForm profile={profile} wallet={wallet} />);

		expect(screen.getByTestId("AbortTransaction")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("AbortTransaction"));
	});
});
