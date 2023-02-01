import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
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

vi.mock("@/domains/migration/hooks/use-migration-transaction", () => ({
	useMigrationTransaction: () => ({
		abortTransaction: vi.fn(),
		sendTransaction: vi.fn(),
	}),
}));

describe("MigrationAuthenticationStep", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		server.use(requestMock("https://ark-test-musig.arkvault.io/", { result: [] }, { method: "post" }));

		migrationUrl = `/profiles/${profile.id()}/migration/add`;
		history.push(migrationUrl);
	});

	it("should render authentication step", async () => {
		const { result: form } = renderHook(() => useMigrationForm());

		form.current.setValue("wallet", wallet);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/migration/add">
				<Form context={form.current}>
					<MigrationAuthenticationStep />
				</Form>
			</Route>,
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

	it("should render ledger authentication step", async () => {
		const { result: form } = renderHook(() => useMigrationForm());

		form.current.setValue("wallet", wallet);

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
			<Route path="/profiles/:profileId/migration/add">
				<Form context={form.current}>
					<MigrationAuthenticationStep />
				</Form>
			</Route>,
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
