/* eslint-disable @typescript-eslint/require-await */
import React from "react";
import { generateTestingUtils } from "eth-testing";
import userEvent from "@testing-library/user-event";
import { useMetaMask } from "./use-meta-mask";
import { render, screen } from "@/utils/testing-library";

const TestComponent: React.FC = () => {
	const { initialized, account, chainId, connectWallet, isOnPolygonNetwork, needsMetaMask } = useMetaMask();

	if (!initialized) {
		return null;
	}

	if (needsMetaMask) {
		return <div data-testid="TestComponent__requiremetamask">Metamask is required</div>;
	}

	if (!account) {
		return <button data-testid="TestComponent__connect" onClick={connectWallet} />;
	}

	return (
		<div data-testid="TestComponent">
			<ul>
				<li>{!!chainId && <div data-testid="TestComponent__chain">{chainId}</div>}</li>
				<li>{account && <div data-testid="TestComponent__account">{account}</div>}</li>
				<li>
					{isOnPolygonNetwork ? (
						<div data-testid="TestComponent__isonpolygon" />
					) : (
						<div data-testid="TestComponent__notinpolygon" />
					)}
				</li>
			</ul>
		</div>
	);
};

const testingUtils = generateTestingUtils({ providerType: "MetaMask" });

describe("useMetaMask", () => {
	describe("without metamask", () => {
		it("should require metamask", async () => {
			render(<TestComponent />);

			await expect(screen.findByTestId("TestComponent__requiremetamask")).resolves.toBeVisible();
		});
	});

	describe("with metamask", () => {
		beforeAll(() => {
			// Manually inject the mocked provider in the window as MetaMask does
			global.window.ethereum = testingUtils.getProvider();
		});

		afterAll(() => {
			delete global.window.ethereum;
		});

		afterEach(() => {
			// Clear all mocks between tests
			testingUtils.clearAllMocks();
		});

		it("should connect", async () => {
			testingUtils.mockNotConnectedWallet();

			testingUtils.mockChainId(137);

			testingUtils.mockRequestAccounts([
				"0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf",
				{
					chainId: 137,
				},
			]);

			render(<TestComponent />);

			await expect(screen.findByTestId("TestComponent__connect")).resolves.toBeVisible();

			userEvent.click(screen.getByTestId("TestComponent__connect"));

			await expect(screen.findByTestId("TestComponent")).resolves.toBeVisible();

			expect(screen.getByTestId("TestComponent__chain")).toHaveTextContent("137");
		});

		describe("on polygon", () => {
			beforeEach(() => {
				testingUtils.mockConnectedWallet(["0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf"], {
					chainId: 137,
				});
			});

			it("should detect when is on polygon network", async () => {
				render(<TestComponent />);

				await expect(screen.findByTestId("TestComponent__isonpolygon")).resolves.toBeVisible();
			});

			it("should detect the account", async () => {
				render(<TestComponent />);

				await expect(screen.findByTestId("TestComponent__account")).resolves.toBeVisible();

				expect(screen.getByTestId("TestComponent__account")).toHaveTextContent(
					"0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf",
				);
			});
		});

		describe("not on polygon", () => {
			beforeEach(() => {
				testingUtils.mockConnectedWallet(["0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf"]);
			});

			it("should detect when not in polygon network", async () => {
				render(<TestComponent />);

				await expect(screen.findByTestId("TestComponent__chain")).resolves.toBeVisible();

				expect(screen.getByTestId("TestComponent__chain")).toHaveTextContent("1");
			});
		});
	});
});
