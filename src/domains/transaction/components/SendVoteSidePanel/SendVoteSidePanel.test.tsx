import { Contracts } from "@/app/lib/profiles";
import {
	env,
	getMainsailProfileId,
	getDefaultMainsailWalletId,
	getDefaultWalletMnemonic,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
	syncValidators,
	syncFees,
	waitFor,
	within,
} from "@/utils/testing-library";
import React from "react";
import { SendVoteSidePanel } from "./SendVoteSidePanel";
import userEvent from "@testing-library/user-event";
import { requestMock, server } from "@/tests/mocks/server";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";

describe("SendVoteSidePanel", () => {
	const passphrase = getDefaultWalletMnemonic();
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let resetProfileNetworksMock: () => void;

	const continueButton = () => screen.getByTestId("SendVote__continue-button");
	const sendButton = () => screen.getByTestId("SendVote__send-button");
	const formStepID = "SendVote__form-step";
	const reviewStepID = "SendVote__review-step";

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findById(getDefaultMainsailWalletId());
		await wallet.synchroniser().identity();

		await syncValidators(profile);
		await syncFees(profile);

		server.use(
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions/f7054cf37ce49e17cf2b06a0aa868cac183bf78e2f1b4a6fe675f2412364fe0a",
				transactionFixture,
			),
		);
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("renders and goes through happy-path to auth step", async () => {
		render(<SendVoteSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${profile.id()}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		// Select sender
		const senderContainer = screen.getByTestId("sender-address");
		await userEvent.click(within(senderContainer).getByTestId("SelectDropdown__input"));
		await waitFor(() => expect(screen.getByTestId("SelectDropdown__option--0")).toBeInTheDocument());
		await userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Choose fee mode just to exercise UI
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await userEvent.click(document.body);

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		await waitFor(() => expect(sendButton()).toBeEnabled());
	});
});
