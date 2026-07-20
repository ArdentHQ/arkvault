import {
	env,
	getMainsailProfileId,
	mockLedgerTransportError,
	mockNanoXTransport,
	render,
	screen,
	syncValidators,
	syncFees,
	waitFor,
} from "@/utils/testing-library";

import { Contracts } from "@/app/lib/profiles";
import { SendValidatorResignationSidePanel } from "./SendValidatorResignationSidePanel";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const renderPanel = async () => {
	const mockOnOpenChange = vi.fn();

	const view = render(<SendValidatorResignationSidePanel open={true} onOpenChange={mockOnOpenChange} />, {
		route: `/profiles/${profile.id()}/dashboard`,
		withProviders: true,
	});

	await expect(screen.findByTestId("SendRegistrationSidePanel")).resolves.toBeVisible();

	return { ...view, mockOnOpenChange };
};

const continueButton = () => screen.getByTestId("SendRegistration__continue-button");
const formStep = () => screen.findByTestId("SendValidatorResignation__form-step");
const reviewStepID = "SendValidatorResignation__review-step";

describe("SendValidatorResignationSidePanel", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId())!;

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile
			.wallets()
			.findByAddressWithNetwork("0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6", "mainsail.devnet")!;

		await wallet.synchroniser().identity();
		await syncValidators(profile);
		await syncFees(profile);

		vi.spyOn(env.fees(), "sync").mockImplementation(vi.fn());
	});

	it("should skip authentication step for a ledger wallet", async () => {
		const nanoXMock = mockNanoXTransport();
		const isLedgerSpy = vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.queryByTestId("AuthenticationStep")).not.toBeInTheDocument();

		nanoXMock.mockRestore();
		isLedgerSpy.mockRestore();
	});

	it("should abort and show an error when the ledger device is not available", async () => {
		const listenSpy = mockLedgerTransportError("Access denied to use Ledger device");
		const isLedgerSpy = vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("ErrorStep__errorMessage")).resolves.toHaveValue(
			"Access denied to use Ledger device.",
		);

		listenSpy.mockRestore();
		isLedgerSpy.mockRestore();
	});
});
