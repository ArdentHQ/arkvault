import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { MigrationAuthenticationStep } from "./MigrationAuthenticationStep";
import { render, env, getDefaultProfileId, waitFor, mockNanoXTransport } from "@/utils/testing-library";
import { Form } from "@/app/components/Form";
import { useMigrationForm } from "@/domains/migration/hooks/use-migration-form";
import { server, requestMock } from "@/tests/mocks/server";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let migrationUrl: string;

const history = createHashHistory();

vi.mock("@/domains/migration/hooks/use-migration-transaction", () => ({
	useMigrationTransaction: () => ({
		abortTransaction: vi.fn(),
		sendTransaction: () => {
			console.log("SEND TRNSACTION");
			throw new Error("error");
		},
	}),
}));

const AuthenticationStepWrapper = () => {
	const form = useMigrationForm();
	form.setValue("wallet", wallet);

	return (
		<Route path="/profiles/:profileId/migration/add">
			<Form context={form}>
				<MigrationAuthenticationStep />
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

	// TODO: Move  to MigrationAdd.test.tsx
	it.skip("should error in authentication step with a ledger wallet", async () => {
		mockNanoXTransport();

		console.log({ wallet });
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		const onError = vi.fn();

		render(
			<AuthenticationStepWrapper />,

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
