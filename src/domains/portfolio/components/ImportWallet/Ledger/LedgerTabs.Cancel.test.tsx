import { vi } from "vitest";
import React from "react";
import { Route } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";
import { server, requestMock, requestMockOnce } from "@/tests/mocks/server";
import { minVersionList } from "@/app/contexts";
import { LedgerTabs } from "./LedgerTabs";

vi.mock("@/app/contexts/Ledger/ledger.transport.factory", () => ({
	LedgerTransportFactory: class {
		supportedTransport() {
			return {
				create: () => ({
					close: vi.fn(),
					exchange: vi.fn().mockResolvedValue(Buffer.from("mock")),
					off: vi.fn(),
					on: vi.fn(),
					send: vi.fn(),
				}),
				listen: (observer: any) => {
					setTimeout(() => observer.next({ descriptor: { id: "mock" }, type: "add" }), 100);
					return { unsubscribe: vi.fn() };
				},
			};
		}
	},
}));
vi.mock("@/app/contexts/Ledger/transport", () => ({
	closeDevices: vi.fn().mockResolvedValue(undefined),
	supportedTransport: vi.fn().mockResolvedValue({ create: vi.fn().mockResolvedValue({ close: vi.fn() }) }),
}));

process.on("unhandledRejection", (reason) => {
	if (reason instanceof Error && reason.message.includes("No transports appear to be supported.")) {
		return;
	}
	throw reason;
});

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
				<Route path="/profiles/:profileId">
					<LedgerTabs
						activeIndex={step}
						onCancel={onCancel}
						onStepChange={vi.fn()}
						onSubmit={vi.fn()}
						onClickEditWalletName={vi.fn()}
					/>
				</Route>
			</FormProvider>
		);
	};

	it("renders the ledger-auth (ListenLedger) step at index 1", async () => {
		render(<TestWrapper step={1} />, { route: `/profiles/${profile.id()}` });
		await waitFor(() => {
			expect(screen.getByTestId("LedgerAuthStep")).toBeInTheDocument();
		});
	});

	it("renders the connection step at index 2", async () => {
		render(<TestWrapper step={2} />, { route: `/profiles/${profile.id()}` });
		await waitFor(() => {
			expect(screen.getByTestId("LedgerConnectionStep")).toBeInTheDocument();
		});
	});

	// TODO: Check unhandled error issue with transports supported for scan step
	/* it("renders the scan step at index 3", async () => {
    const onCancel = vi.fn();
    render(<TestWrapper step={3} onCancel={onCancel} />, {
      route: `/profiles/${profile.id()}`,
    });

    await waitFor(() => {
      expect(screen.getByTestId("LedgerScanStep")).toBeInTheDocument();
    });
  }); */
});
