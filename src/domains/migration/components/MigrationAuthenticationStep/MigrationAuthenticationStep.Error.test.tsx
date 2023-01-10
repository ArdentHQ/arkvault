import React from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { MigrationAuthenticationStep } from "./MigrationAuthenticationStep";
import { render, env, getDefaultProfileId, waitFor } from "@/utils/testing-library";
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

describe("MigrationAuthenticationStep Error", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		migrationUrl = `/profiles/${profile.id()}/migration/add`;
		history.push(migrationUrl);
		server.use(requestMock("https://ark-test-musig.arkvault.io/", { result: [] }, { method: "post" }));
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
});
