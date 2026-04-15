import {
	env,
	getMainsailProfileId,
	mockNanoXTransport,
	render,
	screen,
	syncValidators,
	syncFees,
	waitFor,
	within,
} from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import { BigNumber } from "@/app/lib/helpers";
import { Contracts } from "@/app/lib/profiles";
import { DateTime } from "@/app/lib/intl";
import { SendRegistrationSidePanel } from "./SendRegistrationSidePanel";
import ValidatorRegistrationFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/validator-registration.json";
import userEvent from "@testing-library/user-event";
import { PublicKeyService } from "@/app/lib/mainsail/public-key.service";
import { afterAll, vi } from "vitest";
import * as ReactRouter from "react-router";
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secondWallet: Contracts.IReadWriteWallet;
let useSearchParamsMock;

const defaultValidatorPublicKey =
	"9572d4dacfb9f44314f1091abb4c58b7d9a3c4af00d57de16c3d54f1a5e4d7c45712624842a9dc8303d8ae9db434a27c";

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

vi.mock("@/app/hooks/use-ledger-model-status", () => ({
	useLedgerModelStatus: () => ({ isLedgerModelSupported: true }),
}));

const renderPanel = async (
	registrationType: "validatorRegistration" | "usernameRegistration" = "validatorRegistration",
) => {
	const mockOnOpenChange = vi.fn();

	const view = render(
		<SendRegistrationSidePanel open={true} onOpenChange={mockOnOpenChange} registrationType={registrationType} />,
		{
			route: `/profiles/${profile.id()}/dashboard`,
			withProviders: true,
		},
	);

	await expect(screen.findByTestId("SendRegistrationSidePanel")).resolves.toBeVisible();

	return { ...view, mockOnOpenChange };
};

const continueButton = () => screen.getByTestId("SendRegistration__continue-button");
const formStep = () => screen.findByTestId("ValidatorRegistrationForm_form-step");
const reviewStepID = "ValidatorRegistrationForm__review-step";

describe("SendRegistrationSidePanel", () => {
	beforeAll(async () => {
		useSearchParamsMock = vi
			.spyOn(ReactRouter, "useSearchParams")
			.mockReturnValue([new URLSearchParams(), vi.fn()]);

		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile
			.wallets()
			.findByAddressWithNetwork("0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6", "mainsail.devnet")!;

		secondWallet = profile.wallets().push(
			await profile.walletFactory().fromAddress({
				address: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
				network: "mainsail.devnet",
			}),
		);

		vi.spyOn(wallet, "isValidator").mockImplementation(() => false);

		vi.spyOn(PublicKeyService.prototype, "verifyPublicKeyWithBLS").mockReturnValue(true);

		await wallet.synchroniser().identity();
		await secondWallet.synchroniser().identity();

		await syncValidators(profile);
		await syncFees(profile);

		vi.spyOn(env.fees(), "sync").mockImplementation(vi.fn());
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	beforeEach(() => {
		vi.useFakeTimers({
			shouldAdvanceTime: true,
			toFake: ["setInterval", "clearInterval", "Date"],
		});

		server.use(
			requestMock("https://dwallets-evm.mainsailhq.com/api*", {
				meta: {
					count: 0,
				},
			}),
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions/a10a238d4ea8076532ba38282be6f35b4dd652066312d2fe7c45ba8c91c9c837",
				ValidatorRegistrationFixture,
			),
		);
	});

	afterAll(() => {
		useSearchParamsMock.mockRestore();
	});

	it("should skip authentication step for a ledger wallet", async () => {
		mockNanoXTransport();
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		await renderPanel();

		// Step 1
		await expect(formStep()).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("Input__validator_public_key"));
		await userEvent.type(screen.getByTestId("Input__validator_public_key"), defaultValidatorPublicKey);
		await waitFor(() =>
			expect(screen.getByTestId("Input__validator_public_key")).toHaveValue(defaultValidatorPublicKey),
		);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		const fees = within(screen.getByTestId("InputFee")).getAllByTestId("ButtonGroupOption");
		await userEvent.click(fees[1]);

		// remove focus from fee button
		await userEvent.click(document.body);

		await userEvent.click(screen.getByTestId("SendRegistration__back-button"));

		await expect(formStep()).resolves.toBeVisible();

		// remove focus from back button
		await userEvent.click(document.body);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.queryByTestId("AuthenticationStep")).not.toBeInTheDocument();

		vi.restoreAllMocks();
	});
});
