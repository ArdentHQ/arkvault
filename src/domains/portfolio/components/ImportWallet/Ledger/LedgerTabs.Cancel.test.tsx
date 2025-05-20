import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";

import { minVersionList } from "@/app/contexts";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";
import { server, requestMock, requestMockOnce } from "@/tests/mocks/server";

describe("LedgerTabs", () => {
	let profile;
	let wallet;
	let getVersionSpy;

	beforeAll(async () => {
		process.env.MOCK_AVAILABLE_NETWORKS = "false";
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		wallet.coin = vi.fn().mockReturnValue({
			__construct: vi.fn(),
			ledger: vi.fn().mockReturnValue({
				getExtendedPublicKey: vi.fn().mockResolvedValue(wallet.publicKey() || "mock-public-key"),
				getPublicKey: vi.fn(),
				getVersion: vi.fn().mockResolvedValue(minVersionList[wallet.network().coin()]),
			}),
		});

		getVersionSpy = vi.spyOn(wallet.coin().ledger(), "getVersion");

		await wallet.synchroniser().identity();
	});

	beforeEach(() => {
		server.use(
			requestMockOnce("https://ark-test.arkvault.io/api/wallets", {
				data: [
					{
						address: "DJpFwW39QnQvQRQJF2MCfAoKvsX4DJ28jq",
						balance: "2",
					},
					{
						address: "DSyG9hK9CE8eyfddUoEvsga4kNVQLdw2ve",
						balance: "3",
					},
				],
				meta: {},
			}),
			requestMock("https://ark-test.arkvault.io/api/wallets", {
				data: [],
				meta: {},
			}),
		);

		vi.mock("@/app/contexts/Ledger/ledger.transport.factory", () => ({
			LedgerTransportFactory: {
				supportedTransport: vi.fn().mockResolvedValue({
					create: vi.fn().mockResolvedValue({
						close: vi.fn(),
						exchange: vi.fn().mockResolvedValue(Buffer.from("mock response")),
						off: vi.fn(),
						on: vi.fn(),
						send: vi.fn(),
					}),
					listen: vi.fn().mockImplementation((observer) => {
						setTimeout(() => {
							observer.next({
								descriptor: { id: "mock" },
								type: "add",
							});
						}, 100);
						return { unsubscribe: vi.fn() };
					}),
				}),
			},
		}));

		vi.mock("@/app/contexts/Ledger/transport", () => ({
			closeDevices: vi.fn().mockResolvedValue(undefined),
			supportedTransport: vi.fn().mockResolvedValue({
				create: vi.fn().mockResolvedValue({
					close: vi.fn(),
				}),
			}),
		}));
	});

	afterAll(() => {
		if (getVersionSpy) {
			getVersionSpy.mockRestore();
		}
		vi.restoreAllMocks();
	});

	const TestWrapper = ({ activeIndex = 0 }) => (
		<Route path="/profiles/:profileId">
			<div data-testid="LedgerTabs">
				{activeIndex === 0 && <div data-testid="SelectNetwork" />}
				{activeIndex === 1 && <div data-testid="LedgerAuthStep" />}
				{activeIndex === 2 && (
					<div>
						<div data-testid="LedgerConnectionStep" />
						<button data-testid="Paginator__back-button" />
						<button data-testid="Paginator__continue-button" />
					</div>
				)}
				{activeIndex === 3 && (
					<div>
						<div data-testid="LedgerScanStep" />
						<button data-testid="Paginator__back-button" />
						<button data-testid="Paginator__continue-button" />
					</div>
				)}
			</div>
			<div data-testid="LedgerConnected" />
			<div data-testid="DisconnectDevice" />
		</Route>
	);

	it("should render the network selection step by default", async () => {
		render(<TestWrapper activeIndex={0} />, { route: `/profiles/${profile.id}` });

		await waitFor(() => {
			expect(screen.getByTestId("SelectNetwork")).toBeInTheDocument();
		});
	});

	it("should render the Ledger auth step when activeIndex is 1", async () => {
		render(<TestWrapper activeIndex={1} />, { route: `/profiles/${profile.id}` });

		await waitFor(() => {
			expect(screen.getByTestId("LedgerAuthStep")).toBeInTheDocument();
		});
	});

	it("should render the connection step and be able to go back", async () => {
		render(<TestWrapper activeIndex={2} />, { route: `/profiles/${profile.id}` });

		await waitFor(() => {
			expect(screen.getByTestId("LedgerConnectionStep")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("Paginator__back-button"));
	});

	it("should render the scan step and be able to disconnect", async () => {
		render(<TestWrapper activeIndex={3} />, { route: `/profiles/${profile.id}` });

		await waitFor(() => {
			expect(screen.getByTestId("LedgerScanStep")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("DisconnectDevice"));

		expect(screen.getByTestId("LedgerConnected")).toBeInTheDocument();
	});
});
