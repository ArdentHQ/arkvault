import React from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { MigrationAuthenticationStep } from "./MigrationAuthenticationStep";
import {
	render,
	screen,
	env,
	getDefaultProfileId,
	waitFor,
	MNEMONICS,
	mockNanoXTransport,
} from "@/utils/testing-library";
import { Form } from "@/app/components/Form";
import { useMigrationForm } from "@/domains/migration/hooks/use-migration-form";
import { server, requestMock } from "@/tests/mocks/server";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let migrationUrl: string;

const history = createHashHistory();

const AuthenticationStepWrapper = ({
	wallet,
	onContinue,
	onError,
	onBack,
}: {
	wallet: Contracts.IReadWriteWallet;
	onContinue: (transaction: DTO.ExtendedSignedTransactionData) => void;
	onBack: () => void;
	onError?: (error: Error) => void;
}) => {
	const form = useMigrationForm();

	return (
		<Route path="/profiles/:profileId/migration/add">
			<Form context={form}>
				<MigrationAuthenticationStep
					wallet={wallet}
					onContinue={onContinue}
					onBack={onBack}
					onError={onError}
				/>
			</Form>
		</Route>
	);
};

describe("MigrationAuthenticationStep", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		migrationUrl = `/profiles/${profile.id()}/migration/add`;
		history.push(migrationUrl);
		server.use(requestMock("https://ark-test-musig.arkvault.io/", { result: [] }, { method: "post" }));
	});

	it("should render authentication step", async () => {
		const { asFragment } = render(
			<AuthenticationStepWrapper wallet={wallet} onContinue={vi.fn()} onBack={vi.fn()} onError={vi.fn()} />,

			{
				history,
				route: migrationUrl,
			},
		);

		expect(asFragment()).toMatchSnapshot();
		await waitFor(() => {
			expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();
		});
	});

	it("should error in authentication step with a ledger wallet", async () => {
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		const onError = vi.fn();

		render(
			<AuthenticationStepWrapper wallet={wallet} onContinue={vi.fn()} onBack={vi.fn()} onError={onError} />,

			{
				history,
				route: migrationUrl,
			},
		);

		await waitFor(() => {
			expect(onError).toHaveBeenCalled();
		});

		vi.restoreAllMocks();
	});

	it("should render ledger authentication step", async () => {
		mockNanoXTransport();
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);

		const signatory = await wallet.signatoryFactory().make({
			mnemonic: MNEMONICS[0],
		});

		vi.spyOn(wallet.coin().transaction(), "estimateExpiration").mockResolvedValue("123");
		vi.spyOn(wallet.transaction(), "signTransfer").mockResolvedValue("123");
		vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({});
		vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({ errors: [] });
		vi.spyOn(wallet.signatoryFactory(), "make").mockResolvedValue(signatory);

		const { asFragment } = render(
			<AuthenticationStepWrapper wallet={wallet} onContinue={vi.fn()} onBack={vi.fn()} onError={vi.fn()} />,

			{
				history,
				route: migrationUrl,
			},
		);

		expect(asFragment()).toMatchSnapshot();

		await waitFor(() => {
			expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();
		});

		vi.restoreAllMocks();
	});
});
