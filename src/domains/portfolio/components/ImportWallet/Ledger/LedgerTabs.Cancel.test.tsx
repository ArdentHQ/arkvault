import { vi } from "vitest";
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { env, getDefaultProfileId, render, screen, waitFor, mockConnectedTransport } from "@/utils/testing-library";
import { server, requestMock, requestMockOnce } from "@/tests/mocks/server";
import { minVersionList } from "@/app/contexts";
import { LedgerTabs } from "./LedgerTabs";

describe("LedgerTabs - cancel flow", () => {
	let profile: any, wallet: any;

	beforeAll(async () => {
		process.env.MOCK_AVAILABLE_NETWORKS = "false";

		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();
		wallet.coin = vi.fn().mockReturnValue({
			__construct: vi.fn(),
			ledger: vi.fn().mockReturnValue({
				getExtendedPublicKey: vi.fn().mockResolvedValue(wallet.publicKey()),
				getPublicKey: vi.fn(),
				getVersion: vi.fn().mockResolvedValue(minVersionList[wallet.network().coin()]),
			}),
		});
		await wallet.synchroniser().identity();
	});

	beforeEach(() => {
		server.use(
			requestMockOnce("https://ark-test.arkvault.io/api/wallets", {
				data: [
					{ address: "0xB8Be76b31E402a2D89294Aa107056484Bef94362", balance: "2" },
					{ address: "0x03BC306C369A55c0336EB003bB07F29E5c150F36", balance: "3" },
				],
				meta: {},
			}),
			requestMock("https://ark-test.arkvault.io/api/wallets", { data: [], meta: {} }),
		);
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	const TestWrapper: React.FC<{ step: number; onCancel?: () => void }> = ({ step, onCancel = vi.fn() }) => {
		const methods = useForm();
		return (
			<FormProvider {...methods}>
				<LedgerTabs
					activeIndex={step}
					onCancel={onCancel}
					onStepChange={vi.fn()}
					onSubmit={vi.fn()}
					onClickEditWalletName={vi.fn()}
				/>
				,
			</FormProvider>
		);
	};

	it("renders the ledger-auth (ListenLedger) step at index 1", async () => {
		mockConnectedTransport();
		render(<TestWrapper step={1} />, { route: `/profiles/${profile.id()}` });
		await waitFor(() => {
			expect(screen.getByTestId("LedgerAuthStep")).toBeInTheDocument();
		});
	});

	it("renders the connection step at index 2", async () => {
		mockConnectedTransport();
		render(<TestWrapper step={2} />, { route: `/profiles/${profile.id()}` });
		await waitFor(() => {
			expect(screen.getByTestId("LedgerConnectionStep")).toBeInTheDocument();
		});
	});

	it("renders the scan step at index 3", async () => {
		mockConnectedTransport();
		const onCancel = vi.fn();
		render(<TestWrapper step={3} onCancel={onCancel} />, {
			route: `/profiles/${profile.id()}`,
		});

		await waitFor(() => {
			expect(screen.getByTestId("LedgerScanStep")).toBeInTheDocument();
		});
	});
});
