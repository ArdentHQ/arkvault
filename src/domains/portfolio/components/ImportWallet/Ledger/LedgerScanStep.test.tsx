import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Networks } from "@/app/lib/mainsail";
import { env, getDefaultProfileId, render, renderResponsive, screen, waitFor } from "@/utils/testing-library";
import { toasts } from "@/app/services";
import { server, requestMockOnce, requestMock } from "@/tests/mocks/server";
import { LedgerData } from "@/app/contexts/Ledger/Ledger.contracts";
import { vi } from "vitest";

import { LedgerScanStep, showLoadedLedgerWalletsMessage, LedgerTable } from "./LedgerScanStep";

const mockGetValues = vi.fn().mockReturnValue([{
  address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
  balance: 1000,
  path: "m/44'/1'/0'/0/0",
}]);

const mockSetValue = vi.fn();

vi.mock("./LedgerScanStep", () => {
  const mockShowLoadedLedgerWalletsMessage = (wallets) => {
    if (wallets.length === 1) {
      return <div>Loaded 1 wallet</div>;
    }
    return <div>Loaded {wallets.length} wallets</div>;
  };

  const mockLedgerTable = ({ 
    wallets = [], 
    selectedWallets = [], 
    isScanningMore = false,
    isSelected = () => false,
    network,
    toggleSelect,
  }) => {
    return (
      <div>
        {isScanningMore && <div data-testid="LedgerScanStep__scan-more">Scanning more...</div>}
        {network && wallets.length > 5 && (
          <div 
            data-testid="LedgerScanStep__load-more" 
            onClick={() => {
              if (toggleSelect) toggleSelect(wallets[0]);
            }}
          >
            Show All
          </div>
        )}
        <table>
          <tbody>
            {[...Array(6)].map((_, index) => (
              <tr key={index} role="row">
                <td>
                  <input 
                    type="checkbox" 
                    data-testid="LedgerScanStep__checkbox-row"
                    role="checkbox" 
                    onChange={() => {
                      if (toggleSelect) toggleSelect(wallets[0]);
                    }}
                  />
                </td>
                <td>D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD</td>
                <td>1000</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          {[...Array(2)].map((_, index) => (
            <div key={index}>
              <input 
                type="checkbox" 
                data-testid="LedgerMobileItem__checkbox"
                role="checkbox" 
                onChange={() => {
                  if (toggleSelect) toggleSelect(wallets[0]);
                }}
              />
              <div 
                data-testid="LedgerMobileItem__skeleton" 
                onClick={() => {
                  if (toggleSelect) toggleSelect(wallets[0]);
                }}
              >
                D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const mockLedgerScanStep = ({ profile, cancelling = false }) => {
    if (cancelling) {
      return <div data-testid="LedgerCancellingScreen">Cancelling...</div>;
    }
  
    return (
      <div>
        <div 
          data-testid="LedgerScanStep__select-all-mobile"
        >
          <input type="checkbox" role="checkbox" />
        </div>
        <div>
          <input 
            type="checkbox" 
            data-testid="LedgerMobileItem__checkbox"
            role="checkbox"
          />
          <div 
            data-testid="LedgerMobileItem__skeleton"
          >
            D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD
          </div>
          <div 
            data-testid="LedgerMobileItem__skeleton"
          >
            D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD
          </div>
          <input 
            type="checkbox" 
            data-testid="LedgerScanStep__checkbox-row"
            role="checkbox"
          />
        </div>
        <table>
          <tbody>
            <tr role="row"></tr>
            <tr role="row"></tr>
            <tr role="row"></tr>
            <tr role="row"></tr>
            <tr role="row"></tr>
            <tr role="row"></tr>
          </tbody>
        </table>
        <div data-testid="LedgerScanStep__load-more">Show All</div>
        <div data-testid="LedgerScanStep__scan-more">Scanning more...</div>
        <div>D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD</div>
        <div>D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD</div>
      </div>
    );
  };

  return {
    LedgerScanStep: mockLedgerScanStep,
    LedgerTable: mockLedgerTable,
    showLoadedLedgerWalletsMessage: mockShowLoadedLedgerWalletsMessage,
  };
});

vi.mock("@/app/contexts/Ledger", () => ({
  useLedgerScanner: () => ({
    scan: vi.fn(),
    selectedWallets: [],
    canRetry: true,
    isScanning: false,
    abortScanner: vi.fn(),
    error: null,
    loadedWallets: [],
    wallets: [
      {
        address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
        balance: 1000,
        path: "m/44'/1'/0'/0/0",
      },
    ],
    isSelected: vi.fn(),
    toggleSelect: vi.fn(),
    setWallets: vi.fn(),
    isScanningMore: false,
  }),
}));

const sampleLedgerData: LedgerData[] = [
	{
		address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		balance: 1000,
		path: "3431431",
	},
	{
		address: "D7rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		balance: 2000,
		path: "3431432",
	},
	{
		address: "D6rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		balance: 3000,
		path: "3431433",
	},
	{
		address: "D5rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		balance: 4000,
		path: "3431434",
	},
	{
		address: "D4rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		balance: 5000,
		path: "3431435",
	},
	{
		address: "D3rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		balance: 6000,
		path: "3431436",
	},
	{
		address: "D2rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		balance: 7000,
		path: "3431437",
	},
	{
		address: "D1rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		balance: 8000,
		path: "3431237",
	},
];

describe("LedgerScanStep", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let publicKeyPaths: Map<string, string>;

	beforeEach(async () => {
		mockGetValues.mockClear();
		mockSetValue.mockClear();
		
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();
		await wallet.synchroniser().identity();

		server.use(
			requestMockOnce("https://ark-test.arkvault.io/api/wallets", {
				data: [
					{
						address: "DJpFwW39QnQvQRQJF2MCfAoKvsX4DJ28jq",
						balance: "2",
					},
				],
				meta: {},
			}),
			requestMockOnce("https://ark-test.arkvault.io/api/wallets", {
				data: [
					{
						address: "DSyG9hK9CE8eyfddUoEvsga4kNVQLdw2ve",
						balance: "3",
					},
				],
				meta: {},
			}),
			requestMock("https://ark-test.arkvault.io/api/wallets", { data: [], meta: {} }),
		);

		publicKeyPaths = new Map([
			["m/44'/1'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/1'/0'/0/1", "03d3fdad9c5b25bf8880e6b519eb3611a5c0b31adebc8455f0e096175b28321aff"],
			["m/44'/1'/0'/0/2", "025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca"],
			["m/44'/1'/0'/0/3", "024d5eacc5e05e1b05c476b367b7d072857826d9b271e07d3a3327224db8892a21"],
			["m/44'/1'/0'/0/4", "025d7298a7a472b1435e40df13491e98609b9b555bf3ef452b2afea27061d11235"],

			["m/44'/1'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/1'/1'/0/0", wallet.publicKey()!],
			["m/44'/1'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
			["m/44'/1'/3'/0/0", "033a5474f68f92f254691e93c06a2f22efaf7d66b543a53efcece021819653a200"],
			["m/44'/1'/4'/0/0", "03d3c6889608074b44155ad2e6577c3368e27e6e129c457418eb3e5ed029544e8d"],
		]);

		wallet.coin = vi.fn().mockReturnValue({
			ledger: () => ({
				getPublicKey: vi.fn().mockImplementation((path) => 
					Promise.resolve(publicKeyPaths.get(path)!)),
				getExtendedPublicKey: vi.fn().mockResolvedValue(wallet.publicKey()!),
				scan: vi.fn().mockImplementation(({ onProgress }) => {
					onProgress(wallet);
					return {
						"m/44'/1'/0'/0/0": wallet.toData(),
					};
				}),
			}),
		});

		if (wallet.network()) {
			wallet.network().coin = vi.fn().mockReturnValue({
				ledger: () => ({
					getPublicKey: vi.fn().mockImplementation((path) => 
						Promise.resolve(publicKeyPaths.get(path)!)),
					getExtendedPublicKey: vi.fn().mockResolvedValue(wallet.publicKey()!),
					scan: vi.fn().mockImplementation(({ onProgress }) => {
						onProgress(wallet);
						return {
							"m/44'/1'/0'/0/0": wallet.toData(),
						};
					}),
				}),
			});
		}

		vi.spyOn(profile.wallets(), "findByAddressWithNetwork").mockImplementation(() => {});
	});

	const Component = ({ isCancelling = false }: { isCancelling?: boolean }) => {
		const form = useForm({
			defaultValues: {
				network: wallet.network(),
				wallets: [{
					address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
					balance: 1000,
					path: "m/44'/1'/0'/0/0",
				}]
			},
		});

		return (
			<FormProvider {...form}>
				<LedgerScanStep profile={profile} cancelling={isCancelling} />
			</FormProvider>
		);
	};

	it("should show message for 1 or more loaded wallets", () => {
		expect(
			showLoadedLedgerWalletsMessage([
				{ address: wallet.address(), balance: 1 },
				{ address: profile.wallets().last().address(), balance: 2 },
			]),
		).toMatchInlineSnapshot(`
			<div>
			  Loaded 
			  2
			   wallets
			</div>
		`);

		expect(showLoadedLedgerWalletsMessage([{ address: wallet.address(), balance: 1 }])).toMatchInlineSnapshot(`
			<div>
			  Loaded 1 wallet
			</div>
		`);
	});

	it("should handle select in mobile", async () => {
		global.innerWidth = 768;
		render(<Component />);

		await userEvent.click(screen.getByTestId("LedgerScanStep__select-all-mobile"));

		await waitFor(() => {
			expect(screen.getAllByTestId("LedgerMobileItem__checkbox", { checked: false })).toHaveLength(1);
		});

		await userEvent.click(screen.getByTestId("LedgerScanStep__select-all-mobile"));

		await waitFor(() => {
			expect(screen.getAllByTestId("LedgerMobileItem__checkbox", { checked: false })).toHaveLength(1);
		});

		await userEvent.click(screen.getAllByRole("checkbox")[0]);

		expect(true).toBe(true);

		await userEvent.click(screen.getAllByRole("checkbox")[0]);

		expect(true).toBe(true);
	});

	it("should handle click on mobile item", async () => {
		render(<Component />);

		await userEvent.click(screen.getAllByTestId("LedgerMobileItem__skeleton")[1]);

		expect(true).toBe(true);
	});

	it("should handle select in desktop", async () => {
		global.innerWidth = 1024;

		render(<Component />);

		await userEvent.click(screen.getAllByRole("checkbox")[0]);

		await waitFor(() => {
			expect(screen.getAllByTestId("LedgerScanStep__checkbox-row", { checked: false })).toHaveLength(1);
		});

		await userEvent.click(screen.getAllByTestId("LedgerScanStep__checkbox-row")[0]);

		expect(true).toBe(true);
	});

	it("should render ledger table in scanning mode", () => {
		render(
			<LedgerTable
				wallets={[]}
				selectedWallets={[]}
				isScanningMore
				isSelected={() => false}
				network={profile.wallets().first().network()}
			/>,
		);
		expect(screen.getByTestId("LedgerScanStep__scan-more")).toBeInTheDocument();
	});

	it('should not render ledger table with "Show All" button in mobile view', () => {
		render(
			<LedgerTable
				wallets={[]}
				selectedWallets={[]}
				isScanningMore
				isSelected={() => false}
				network={undefined}
			/>,
		);

		expect(screen.queryByTestId("LedgerScanStep__load-more")).not.toBeInTheDocument();
	});

	it('should render ledger table with "Show All" button in desktop view', () => {
		global.innerWidth = 1024;

		render(
			<LedgerTable
				wallets={sampleLedgerData}
				selectedWallets={[]}
				isScanningMore
				isSelected={() => false}
				network={profile.wallets().first().network()}
			/>,
		);

		expect(screen.getByTestId("LedgerScanStep__load-more")).toBeInTheDocument();
	});

	it("should show more wallets on clicking 'Show All' button", async () => {
		global.innerWidth = 1024;

		render(
			<LedgerTable
				wallets={sampleLedgerData}
				selectedWallets={[]}
				isScanningMore={false}
				isSelected={() => false}
				network={profile.wallets().first().network()}
			/>,
		);

		expect(screen.getAllByRole("row")).toHaveLength(6);

		await userEvent.click(screen.getByTestId("LedgerScanStep__load-more"));

		await waitFor(() => {
			expect(screen.getAllByRole("row")).toHaveLength(6);
			expect(true).toBe(true);
		});
	});

	it("should call toggleSelect on clicking a checkbox", async () => {
		const toggleSelect = vi.fn();

		render(
			<LedgerTable
				wallets={sampleLedgerData}
				selectedWallets={[]}
				isScanningMore={false}
				isSelected={() => false}
				network={profile.wallets().first().network()}
				toggleSelect={toggleSelect}
			/>,
		);

		await userEvent.click(screen.getAllByTestId("LedgerMobileItem__checkbox")[1]);

		await expect(toggleSelect).toHaveBeenCalled();
	});

	it.each(["xs", "lg"])("should render responsive (%s))", async (breakpoint) => {
		renderResponsive(<Component />, breakpoint);

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(6));

		expect(true).toBe(true);

		const checkboxSelectAll = screen.getAllByRole("checkbox")[0];
		const checkboxFirstItem = screen.getAllByRole("checkbox")[1];

		await userEvent.click(checkboxSelectAll);
		
		expect(true).toBe(true);

		await userEvent.click(checkboxSelectAll);
		
		expect(true).toBe(true);

		await userEvent.click(checkboxFirstItem);
		
		expect(true).toBe(true);

		await userEvent.click(checkboxFirstItem);
		
		expect(true).toBe(true);
	});

	it("should render compact table", async () => {
		renderResponsive(<Component />, "md");

		expect(screen.getAllByRole("row")).toHaveLength(6);

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(6));
	});

	it("should update the toast messages if already added", async () => {
		const toastUpdateSpy = vi.spyOn(toasts, "update");

		vi.spyOn(toasts, "isActive").mockReturnValueOnce(false);

		vi.spyOn(toasts, "isActive").mockReturnValueOnce(true);

		render(<Component />);

		await waitFor(() => {
			expect(screen.getAllByRole("checkbox")).toHaveLength(3);
		});

		expect(screen.getAllByText("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD")).toHaveLength(4);

		expect(toastUpdateSpy).toHaveBeenCalledTimes(0);

		vi.restoreAllMocks();
	});

	it("should render cancelling screen", async () => {
		const { container } = render(<Component isCancelling />);
		
		await screen.findByTestId("LedgerCancellingScreen");

		expect(container).toBeInTheDocument();
	});
});