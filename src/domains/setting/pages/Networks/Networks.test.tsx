import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Route } from "react-router-dom";
import { UUID } from "@ardenthq/sdk-cryptography";
import { vi } from "vitest";
import NetworksSettings from "@/domains/setting/pages/Networks";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	within,
	waitFor,
	mockProfileWithOnlyPublicNetworks,
} from "@/utils/testing-library";
import { translations as settingsTranslations } from "@/domains/setting/i18n.ts";
import { toasts } from "@/app/services";
import { requestMock, server } from "@/tests/mocks/server";

let profile: Contracts.IProfile;

const networkListItemCheckboxTestId = "NetworksListNetwork-checkbox";
const customNetworkItemToggleTestId = "CustomNetworksListNetwork-checkbox";
const networkFormModalAlertTestId = "NetworkFormModal-alert";
const removeCustomNetworkOptionTestId = "dropdown__option--2";
const deleteCustomNetworkSubmitButtonTestId = "DeleteResource__submit-button";
const knowWalletTestUrl = "https://know-wallets.test";
const explorerUrl = "https://explorer.test.com";

const submitButton = () => screen.getByTestId("Networks--submit-button");

const customNetworksAddButton = () => screen.getByTestId("CustomNetworksList--add");

const customNetworksWrapper = () => screen.getByTestId("NetworksList--custom");

const customNetworksToggle = () => screen.getByTestId("Plugin-settings__networks--useCustomNetworks");

const customNetworkFormSaveButton = () => screen.getByTestId("NetworkFormModal--save");

const customNetworkFormModalNameField = () => screen.getByTestId("NetworkFormModal--name");

const customNetworkFormModalServerField = () => screen.getByTestId("NetworkFormModal--address");

const customNetworkFirstNetwork = () => screen.getAllByTestId("CustomNetworksListNetwork")[0];

const customNetworkSecondNetwork = () => screen.getAllByTestId("CustomNetworksListNetwork")[1];

const customNetworkFirstNetworkMenu = () =>
	within(customNetworkFirstNetwork()).getByTestId("CustomNetworksListNetwork-menu");

const customNetworkSecondNetworkMenu = () =>
	within(customNetworkSecondNetwork()).getByTestId("CustomNetworksListNetwork-menu");

const customNetworkMenuEditOption = () => screen.getByTestId("dropdown__option--0");

describe("Network Settings", () => {
	let mockProfileWithOnlyPublicNetworksReset: () => void;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	beforeEach(() => {
		mockProfileWithOnlyPublicNetworksReset = mockProfileWithOnlyPublicNetworks(profile);
	});

	afterEach(() => {
		mockProfileWithOnlyPublicNetworksReset();
	});

	it("should render networks settings section", () => {
		const { container, asFragment } = render(
			<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
			{
				route: `/profiles/${profile.id()}/settings/networks`,
			},
		);

		expect(container).toBeInTheDocument();

		expect(screen.getAllByTestId("list-divided-item__wrapper")).toHaveLength(2);

		expect(submitButton()).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should check the main network by default", () => {
		const { container, asFragment } = render(
			<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
			{
				route: `/profiles/${profile.id()}/settings/networks`,
			},
		);

		expect(container).toBeInTheDocument();

		expect(screen.getAllByTestId("NetworksList")).toHaveLength(1);

		expect(screen.getAllByTestId("NetworksListNetwork")).toHaveLength(2);

		const checkboxes = screen.getAllByTestId(networkListItemCheckboxTestId);

		expect(checkboxes).toHaveLength(2);

		expect(checkboxes[0]).toBeChecked();
		expect(checkboxes[1]).not.toBeChecked();

		expect(asFragment()).toMatchSnapshot();
	});

	it("can uncheck and check an item", () => {
		const { container } = render(
			<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
			{
				route: `/profiles/${profile.id()}/settings/networks`,
			},
		);

		expect(container).toBeInTheDocument();

		const checkboxes = screen.getAllByTestId(networkListItemCheckboxTestId);

		userEvent.click(screen.getAllByTestId("NetworksListNetwork")[1]);

		expect(checkboxes[0]).toBeChecked();
		expect(checkboxes[1]).toBeChecked();

		userEvent.click(screen.getAllByTestId("NetworksListNetwork")[1]);

		expect(checkboxes[1]).not.toBeChecked();
	});

	it("shows a warning if user tries to unselect all items", () => {
		const toastSpy = vi.spyOn(toasts, "warning");

		const { container } = render(
			<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
			{
				route: `/profiles/${profile.id()}/settings/networks`,
			},
		);

		expect(container).toBeInTheDocument();

		expect(toastSpy).not.toHaveBeenCalled();

		userEvent.click(screen.getAllByTestId("NetworksListNetwork")[0]);

		expect(toastSpy).toHaveBeenCalledWith(settingsTranslations.NETWORKS.MESSAGES.AT_LEAST_ONE_DEFAULT_NETWORK);

		toastSpy.mockRestore();
	});

	it("stores the selected networks", async () => {
		const toastSpy = vi.spyOn(toasts, "success");
		const networksFillSpy = vi.spyOn(profile.networks(), "fill").mockImplementation(vi.fn());
		const networksForgetSpy = vi.spyOn(profile.networks(), "forget").mockImplementation(vi.fn());

		const { container } = render(
			<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
			{
				route: `/profiles/${profile.id()}/settings/networks`,
			},
		);

		expect(container).toBeInTheDocument();

		expect(screen.getAllByTestId("NetworksList")).toHaveLength(1);

		const mainListWrapper = within(screen.getByTestId("NetworksList--main"));

		const publicNetworks = mainListWrapper.getAllByTestId("NetworksListNetwork");

		// select "Ark devnet"
		userEvent.click(publicNetworks[1]);

		// Unselect "ark mainnet"
		userEvent.click(publicNetworks[0]);

		expect(submitButton()).toBeEnabled();

		userEvent.click(submitButton());

		await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(settingsTranslations.GENERAL.SUCCESS));

		expect(networksForgetSpy).toHaveBeenCalledTimes(1);

		expect(networksFillSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				"ark.devnet": expect.any(Object),
			}),
		);

		networksFillSpy.mockRestore();

		networksForgetSpy.mockRestore();

		toastSpy.mockRestore();
	});

	describe("Custom networks", () => {
		const customServerName = "My custom network";
		const customServerAddress = "https://my-server.com";
		const customNetworkItemTestId = "CustomNetworksListNetwork";

		const configurationUrl = `${customServerAddress}/api/node/configuration`;
		const cryptoConfigurationUrl = `${customServerAddress}/api/node/configuration/crypto`;

		const mockServerCryptoConfiguration = (url: string, networkName = "testnet") => {
			server.use(
				requestMock(`${url}/api/node/configuration`, networkConfigurationResponse),
				requestMock(`${url}/api/node/configuration/crypto`, {
					data: {
						network: {
							name: networkName,
						},
					},
				}),
			);
		};

		const networkConfigurationResponse = {
			data: {
				constants: {
					activeDelegates: 51,
					aip11: true,
					block: { idFullSha256: true, maxPayload: 11_000_000, maxTransactions: 150, version: 0 },
					blocktime: 8,
					epoch: "2021-01-21T21:21:21.000Z",
					fees: {
						staticFees: {
							delegateRegistration: 2_500_000_000,
							delegateResignation: 2_500_000_000,
							ipfs: 500_000_000,
							multiPayment: 10_000_000,
							multiSignature: 500_000_000,
							secondSignature: 500_000_000,
							transfer: 10_000_000,
							vote: 100_000_000,
						},
					},
					height: 195_000,
					htlcEnabled: false,
					reward: 100_000_000,
					vendorFieldLength: 255,
				},
				core: { version: "2.7.24" },
				explorer: "https://explorer.sh",
				nethash: "7fadccaae136bfa7655aa1e1f2de440804abbf64af9f380ccfbef916e18b485c",
				ports: {
					"@arkecosystem/core-api": 5103,
					"@arkecosystem/core-p2p": null,
					"@arkecosystem/core-webhooks": null,
				},
				slip44: 2,
				symbol: "XQR",
				token: "XQR",
				transactionPool: {
					dynamicFees: {
						addonBytes: {
							delegateRegistration: 400_000,
							delegateResignation: 400_000,
							htlcClaim: 0,
							htlcLock: 100,
							htlcRefund: 0,
							ipfs: 250,
							multiPayment: 500,
							multiSignature: 500,
							secondSignature: 250,
							transfer: 100,
							vote: 100,
						},
						enabled: true,
						minFeeBroadcast: 3000,
						minFeePool: 3000,
					},
				},
				version: 75,
				wif: 26,
			},
		};

		it("should show the custom networks as unchecked", () => {
			const { container } = render(
				<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
				{
					route: `/profiles/${profile.id()}/settings/networks`,
				},
			);

			expect(container).toBeInTheDocument();

			expect(screen.queryByTestId("NetworksList--custom")).not.toBeInTheDocument();

			expect(customNetworksToggle()).toBeInTheDocument();

			expect(customNetworksToggle()).not.toBeChecked();
		});

		it("should show the custom networks container when toggle is enabled", () => {
			render(
				<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
				{
					route: `/profiles/${profile.id()}/settings/networks`,
				},
			);

			userEvent.click(customNetworksToggle());

			expect(customNetworksToggle()).toBeChecked();

			expect(customNetworksWrapper()).toBeInTheDocument();

			expect(customNetworksAddButton()).toBeInTheDocument();
		});

		it("can press the add button and show the add modal", () => {
			render(
				<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
				{
					route: `/profiles/${profile.id()}/settings/networks`,
				},
			);

			userEvent.click(customNetworksToggle());

			userEvent.click(customNetworksAddButton());

			expect(screen.getByTestId("NetworkFormModal")).toBeInTheDocument();
		});

		it("can cancel adding a custom network", () => {
			render(
				<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
				{
					route: `/profiles/${profile.id()}/settings/networks`,
				},
			);

			userEvent.click(customNetworksToggle());

			userEvent.click(customNetworksAddButton());

			userEvent.click(screen.getByTestId("NetworkFormModal--cancel"));

			expect(screen.queryByTestId("NetworkFormModal")).not.toBeInTheDocument();
		});

		it("can fill the add modal form", async () => {
			render(
				<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
				{
					route: `/profiles/${profile.id()}/settings/networks`,
				},
			);

			userEvent.click(customNetworksToggle());

			userEvent.click(customNetworksAddButton());

			await waitFor(() => expect(customNetworkFormSaveButton()).toBeDisabled());

			userEvent.paste(customNetworkFormModalNameField(), customServerName);

			expect(customNetworkFormModalNameField()).toHaveValue(customServerName);

			userEvent.paste(customNetworkFormModalServerField(), customServerAddress);

			expect(customNetworkFormModalServerField()).toHaveValue(customServerAddress);

			await waitFor(() => expect(customNetworkFormSaveButton()).toBeEnabled());
		});

		it.each(["mainnet", "testnet"])(
			"stores the new network with data that came from the request",
			async (networkName) => {
				const uuidSpy = vi.spyOn(UUID, "random").mockReturnValue("random-uuid");
				const toastSpy = vi.spyOn(toasts, "success");
				const networksFillSpy = vi.spyOn(profile.networks(), "fill").mockImplementation(vi.fn());
				const networksForgetSpy = vi.spyOn(profile.networks(), "forget").mockImplementation(vi.fn());

				mockServerCryptoConfiguration(customServerAddress, networkName);

				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworksToggle());
				userEvent.click(customNetworksAddButton());
				userEvent.paste(customNetworkFormModalNameField(), customServerName);
				userEvent.paste(customNetworkFormModalServerField(), customServerAddress);

				await waitFor(() => expect(customNetworkFormSaveButton()).toBeEnabled());

				userEvent.click(customNetworkFormSaveButton());

				await expect(screen.findByTestId(customNetworkItemTestId)).resolves.toBeVisible();

				expect(submitButton()).toBeEnabled();

				userEvent.click(submitButton());

				await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(settingsTranslations.GENERAL.SUCCESS));

				expect(networksFillSpy).toHaveBeenCalledWith(
					expect.objectContaining({
						"random-uuid.custom": expect.objectContaining({
							id: "random-uuid.custom",
						}),
					}),
				);

				networksFillSpy.mockRestore();
				networksForgetSpy.mockRestore();
				toastSpy.mockRestore();
				uuidSpy.mockRestore();
			},
		);

		it("shows an error when network is unreachable", async () => {
			server.use(requestMock(configurationUrl, {}, { status: 404 }));

			render(
				<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
				{
					route: `/profiles/${profile.id()}/settings/networks`,
				},
			);

			userEvent.click(customNetworksToggle());
			userEvent.click(customNetworksAddButton());
			userEvent.paste(customNetworkFormModalNameField(), customServerName);
			userEvent.paste(customNetworkFormModalServerField(), customServerAddress);

			await waitFor(() => expect(customNetworkFormSaveButton()).toBeEnabled());

			userEvent.click(customNetworkFormSaveButton());

			await expect(screen.findByTestId(networkFormModalAlertTestId)).resolves.toBeVisible();
		});

		it("shows an error when network response is invalid json", async () => {
			server.use(
				requestMock(configurationUrl, "invalid json"),
				requestMock(cryptoConfigurationUrl, "invalid json"),
			);

			render(
				<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
				{
					route: `/profiles/${profile.id()}/settings/networks`,
				},
			);

			userEvent.click(customNetworksToggle());
			userEvent.click(customNetworksAddButton());
			userEvent.paste(customNetworkFormModalNameField(), customServerName);
			userEvent.paste(customNetworkFormModalServerField(), customServerAddress);

			await waitFor(() => expect(customNetworkFormSaveButton()).toBeEnabled());

			userEvent.click(customNetworkFormSaveButton());

			await expect(screen.findByTestId(networkFormModalAlertTestId)).resolves.toBeVisible();
		});

		it("invalidates long name", async () => {
			render(
				<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
				{
					route: `/profiles/${profile.id()}/settings/networks`,
				},
			);

			userEvent.click(customNetworksToggle());
			userEvent.click(customNetworksAddButton());
			userEvent.paste(customNetworkFormModalNameField(), "a".repeat(43));

			await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();

			expect(customNetworkFormSaveButton()).toBeDisabled();
		});

		it("invalidates invalid server", async () => {
			render(
				<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
				{
					route: `/profiles/${profile.id()}/settings/networks`,
				},
			);

			userEvent.click(customNetworksToggle());
			userEvent.click(customNetworksAddButton());
			userEvent.paste(customNetworkFormModalServerField(), "/invalid-addres");

			await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();

			expect(customNetworkFormSaveButton()).toBeDisabled();
		});

		describe("with custom networks", () => {
			let customNetworksMock: vi.SpyInstance;

			const customNetworksStub: any = {
				test: {
					custom: {
						constants: {
							slip44: 42,
						},
						currency: {
							symbol: "TIC",
							ticker: "TIC",
						},
						hosts: [
							{
								host: explorerUrl,
								type: "explorer",
							},
							{
								host: customServerAddress,
								type: "full",
							},
						],
						id: "test.custom",
						meta: {
							enabled: true,
							nethash: "7fadccaae136bfa7655aa1e1f2de440804abbf64af9f380ccfbef916e18b485c",
						},
						name: customServerName,
						slip44: 44,
						type: "test",
					},
				},
				test2: {
					custom: {
						coin: "Test 2",
						constants: {
							slip44: 42,
						},
						currency: {
							symbol: "WAT",
							ticker: "WAT",
						},
						hosts: [
							{
								host: explorerUrl,
								type: "explorer",
							},
							{
								host: customServerAddress,
								type: "full",
							},
						],
						id: "test2.custom",
						meta: {
							enabled: false,
							nethash: "7fadccaae136bfa7655aa1e1f2de440804abbf64af9f380ccfbef916e18b485c",
						},
						name: "Test Network 2",
						type: "live",
					},
				},
			};

			beforeEach(() => {
				customNetworksMock = vi.spyOn(profile.networks(), "all").mockReturnValue(customNetworksStub);
			});

			afterEach(() => {
				customNetworksMock.mockRestore();
			});

			it("shows the custom networks", () => {
				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				expect(customNetworksToggle()).toBeChecked();

				expect(customNetworksWrapper()).toBeInTheDocument();

				expect(screen.getAllByTestId(customNetworkItemTestId)).toHaveLength(2);
				// First element is selected
				expect(within(customNetworkFirstNetwork()).getByTestId(customNetworkItemToggleTestId)).toBeChecked();
				// second element is not selected
				expect(
					within(screen.getAllByTestId(customNetworkItemTestId)[1]).getByTestId(
						customNetworkItemToggleTestId,
					),
				).not.toBeChecked();
			});

			it("select/unselect a custom network", () => {
				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				expect(customNetworksToggle()).toBeChecked();

				expect(customNetworksWrapper()).toBeInTheDocument();

				userEvent.click(customNetworkFirstNetwork());

				expect(
					within(customNetworkFirstNetwork()).getByTestId(customNetworkItemToggleTestId),
				).not.toBeChecked();

				userEvent.click(customNetworkFirstNetwork());

				expect(within(customNetworkFirstNetwork()).getByTestId(customNetworkItemToggleTestId)).toBeChecked();
			});

			it("keeps the state of selected network if custom networks are enabled/disabled", () => {
				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				expect(customNetworksToggle()).toBeChecked();

				expect(customNetworksWrapper()).toBeInTheDocument();

				// Disable custom networks
				userEvent.click(customNetworksToggle());

				// Enable custom networks again
				userEvent.click(customNetworksToggle());

				// Network 1 should still be selected
				expect(within(customNetworkFirstNetwork()).getByTestId(customNetworkItemToggleTestId)).toBeChecked();

				// Network 2 should still be unselected
				expect(
					within(customNetworkSecondNetwork()).getByTestId(customNetworkItemToggleTestId),
				).not.toBeChecked();
			});

			it("show/hide network details", async () => {
				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworkFirstNetworkMenu());

				expect(screen.getByTestId("dropdown__option--1")).toBeInTheDocument();

				userEvent.click(screen.getByTestId("dropdown__option--1"));

				await expect(
					screen.findByText(settingsTranslations.NETWORKS.DETAILS_MODAL.TITLE),
				).resolves.toBeVisible();

				userEvent.click(screen.getByTestId("Modal__close-button"));

				expect(screen.queryByText(settingsTranslations.NETWORKS.DETAILS_MODAL.TITLE)).not.toBeInTheDocument();
			});

			it("removes a custom network", async () => {
				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworkFirstNetworkMenu());

				expect(screen.getByTestId(removeCustomNetworkOptionTestId)).toBeInTheDocument();

				userEvent.click(screen.getByTestId(removeCustomNetworkOptionTestId));

				await expect(
					screen.findByText(settingsTranslations.NETWORKS.DELETE_MODAL.TITLE),
				).resolves.toBeVisible();

				expect(screen.getByTestId(deleteCustomNetworkSubmitButtonTestId)).toBeDisabled();

				userEvent.paste(screen.getByTestId("NetworksSettings--confirmName"), customServerName);

				expect(screen.getByTestId(deleteCustomNetworkSubmitButtonTestId)).toBeEnabled();

				userEvent.click(screen.getByTestId(deleteCustomNetworkSubmitButtonTestId));

				expect(screen.getAllByTestId(customNetworkItemTestId)).toHaveLength(1);
			});

			it("removes deleted custom network contacts and addresses", async () => {
				const toastSpy = vi.spyOn(toasts, "success");
				const networksForgetSpy = vi.spyOn(profile.networks(), "forget").mockImplementation(vi.fn());

				const firstContact = profile.contacts().values()[0];
				const firstContactAddress = firstContact.addresses().values()[0];

				const addressNetworkSpy = vi.spyOn(firstContactAddress, "network").mockReturnValue("test.custom");
				const forgetAddressSpy = vi.spyOn(firstContact.addresses(), "forget");
				const forgetContactSpy = vi.spyOn(profile.contacts(), "forget");

				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworkFirstNetworkMenu());

				expect(screen.getByTestId(removeCustomNetworkOptionTestId)).toBeInTheDocument();

				userEvent.click(screen.getByTestId(removeCustomNetworkOptionTestId));

				await expect(
					screen.findByText(settingsTranslations.NETWORKS.DELETE_MODAL.TITLE),
				).resolves.toBeVisible();

				expect(screen.getByTestId(deleteCustomNetworkSubmitButtonTestId)).toBeDisabled();

				userEvent.paste(screen.getByTestId("NetworksSettings--confirmName"), customServerName);

				expect(screen.getByTestId(deleteCustomNetworkSubmitButtonTestId)).toBeEnabled();

				userEvent.click(screen.getByTestId(deleteCustomNetworkSubmitButtonTestId));

				expect(screen.getAllByTestId(customNetworkItemTestId)).toHaveLength(1);

				expect(submitButton()).toBeEnabled();

				userEvent.click(submitButton());

				await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(settingsTranslations.GENERAL.SUCCESS));

				expect(forgetAddressSpy).toHaveBeenCalledWith(firstContactAddress.id());
				expect(forgetContactSpy).toHaveBeenCalledWith(firstContact.id());

				toastSpy.mockRestore();
				networksForgetSpy.mockRestore();
				addressNetworkSpy.mockRestore();
				forgetAddressSpy.mockRestore();
			});

			it("removes deleted custom network wallets", async () => {
				const toastSpy = vi.spyOn(toasts, "success");
				const networksForgetSpy = vi.spyOn(profile.networks(), "forget").mockImplementation(vi.fn());

				const firstWallet = profile.wallets().values()[0];
				const walletNetworkSpy = vi.spyOn(firstWallet.network(), "id").mockReturnValue("test.custom");
				const forgetWalletSpy = vi.spyOn(profile.wallets(), "forget");

				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworkFirstNetworkMenu());

				expect(screen.getByTestId(removeCustomNetworkOptionTestId)).toBeInTheDocument();

				userEvent.click(screen.getByTestId(removeCustomNetworkOptionTestId));

				await expect(
					screen.findByText(settingsTranslations.NETWORKS.DELETE_MODAL.TITLE),
				).resolves.toBeVisible();

				expect(screen.getByTestId(deleteCustomNetworkSubmitButtonTestId)).toBeDisabled();

				userEvent.paste(screen.getByTestId("NetworksSettings--confirmName"), customServerName);

				expect(screen.getByTestId(deleteCustomNetworkSubmitButtonTestId)).toBeEnabled();

				userEvent.click(screen.getByTestId(deleteCustomNetworkSubmitButtonTestId));

				expect(screen.getAllByTestId(customNetworkItemTestId)).toHaveLength(1);

				expect(submitButton()).toBeEnabled();

				userEvent.click(submitButton());

				await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(settingsTranslations.GENERAL.SUCCESS));

				expect(forgetWalletSpy).toHaveBeenCalledWith(firstWallet.id());

				toastSpy.mockRestore();
				networksForgetSpy.mockRestore();
				forgetWalletSpy.mockRestore();
				walletNetworkSpy.mockRestore();
			});

			it("cancels removing a custom network", async () => {
				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworkFirstNetworkMenu());

				expect(screen.getByTestId(removeCustomNetworkOptionTestId)).toBeInTheDocument();

				userEvent.click(screen.getByTestId(removeCustomNetworkOptionTestId));

				await expect(
					screen.findByText(settingsTranslations.NETWORKS.DELETE_MODAL.TITLE),
				).resolves.toBeVisible();

				userEvent.click(screen.getByTestId("DeleteResource__cancel-button"));

				expect(screen.getAllByTestId(customNetworkItemTestId)).toHaveLength(2);
			});

			it("adds a new network when already have other networks", async () => {
				mockServerCryptoConfiguration("https://new-address1.test");

				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworksAddButton());
				userEvent.paste(customNetworkFormModalNameField(), "new name");
				userEvent.paste(customNetworkFormModalServerField(), "https://new-address1.test");

				await waitFor(() => expect(customNetworkFormSaveButton()).toBeEnabled());

				userEvent.click(customNetworkFormSaveButton());

				await waitFor(() => expect(screen.getAllByTestId(customNetworkItemTestId)).toHaveLength(3));
			});

			it("edits a custom network address", async () => {
				mockServerCryptoConfiguration("https://new-address.test");

				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworkFirstNetworkMenu());
				userEvent.click(customNetworkMenuEditOption());

				await expect(screen.findByTestId("UpdateNetworkFormModal")).resolves.toBeVisible();

				expect(customNetworkFormModalNameField()).toHaveValue(customServerName);

				expect(customNetworkFormModalServerField()).toHaveValue(customServerAddress);

				userEvent.clear(customNetworkFormModalServerField());
				userEvent.paste(customNetworkFormModalServerField(), "https://new-address.test");

				expect(customNetworkFormModalServerField()).toHaveValue("https://new-address.test");

				expect(screen.getByTestId("NetworkFormModal--slip44")).toHaveValue("42");

				expect(screen.getByTestId("NetworkFormModal--explorer")).toHaveValue(explorerUrl);

				await waitFor(() => expect(customNetworkFormSaveButton()).toBeEnabled());

				userEvent.click(customNetworkFormSaveButton());

				await waitFor(() => expect(customNetworkFirstNetwork()).toHaveTextContent(customServerName));
			});

			it.each(["mainnet", "testnet"])("edits a live network", async (networkName) => {
				mockServerCryptoConfiguration(customServerAddress, networkName);

				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworkSecondNetworkMenu());

				userEvent.click(customNetworkMenuEditOption());

				await expect(screen.findByTestId("UpdateNetworkFormModal")).resolves.toBeVisible();

				userEvent.clear(customNetworkFormModalNameField());

				userEvent.paste(customNetworkFormModalNameField(), "New name");

				expect(customNetworkFormModalNameField()).toHaveValue("New name");

				await waitFor(() => expect(customNetworkFormSaveButton()).toBeEnabled());

				userEvent.click(customNetworkFormSaveButton());

				await waitFor(() => expect(customNetworkSecondNetwork()).toHaveTextContent("New name"));
			});

			it("edits a valid known wallet url", async () => {
				mockServerCryptoConfiguration(customServerAddress);

				server.use(
					requestMock(knowWalletTestUrl, [
						{
							address: "Whatever",
							name: "Hot Wallet",
							type: "team",
						},
					]),
				);

				mockServerCryptoConfiguration(customServerAddress);

				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworkFirstNetworkMenu());
				userEvent.click(customNetworkMenuEditOption());

				await expect(screen.findByTestId("UpdateNetworkFormModal")).resolves.toBeVisible();

				userEvent.paste(screen.getByTestId("NetworkFormModal--knownWallets"), "https://know-wallets.test");

				await waitFor(() => expect(customNetworkFormSaveButton()).toBeEnabled());

				userEvent.click(customNetworkFormSaveButton());

				await waitFor(() => expect(screen.queryByTestId("UpdateNetworkFormModal")).not.toBeInTheDocument());
			});

			it.each([
				[200, "invalid-response"],
				[200, [{ other: "propery" }]],
				[404, []],
			])("shows an error if the know wallet url has a invalid response", async (status, data) => {
				mockServerCryptoConfiguration(customServerAddress);

				server.use(requestMock("https://know-wallets.test", data, { status }));

				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworkFirstNetworkMenu());
				userEvent.click(customNetworkMenuEditOption());

				await expect(screen.findByTestId("UpdateNetworkFormModal")).resolves.toBeVisible();

				userEvent.paste(screen.getByTestId("NetworkFormModal--knownWallets"), "https://know-wallets.test");

				await waitFor(() => expect(customNetworkFormSaveButton()).toBeEnabled());

				userEvent.click(customNetworkFormSaveButton());

				await waitFor(() =>
					expect(screen.getByTestId("Input__error")).toHaveAttribute(
						"data-errortext",
						settingsTranslations.NETWORKS.FORM.INVALID_KNOWN_WALLETS_URL,
					),
				);
			});

			it("edits a custom network name and keeps at selected", async () => {
				mockServerCryptoConfiguration(customServerAddress, "testnet whatever");

				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				expect(within(customNetworkFirstNetwork()).getByTestId(customNetworkItemToggleTestId)).toBeChecked();

				userEvent.click(customNetworkFirstNetworkMenu());
				userEvent.click(customNetworkMenuEditOption());

				await expect(screen.findByTestId("UpdateNetworkFormModal")).resolves.toBeVisible();

				expect(customNetworkFormModalNameField()).toHaveValue(customServerName);

				expect(customNetworkFormModalServerField()).toHaveValue(customServerAddress);

				expect(screen.getByTestId("NetworkFormModal--slip44")).toHaveValue("42");

				expect(screen.getByTestId("NetworkFormModal--explorer")).toHaveValue(explorerUrl);

				userEvent.clear(customNetworkFormModalNameField());
				userEvent.paste(customNetworkFormModalNameField(), "New name");

				expect(customNetworkFormModalNameField()).toHaveValue("New name");

				await waitFor(() => expect(customNetworkFormSaveButton()).toBeEnabled());

				userEvent.click(customNetworkFormSaveButton());

				await waitFor(() => {
					expect(
						within(customNetworkFirstNetwork()).getByTestId(customNetworkItemToggleTestId),
					).toBeChecked();
				});
			});

			it("edits a custom network name if was not previously selected", async () => {
				mockServerCryptoConfiguration(customServerAddress);

				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				// Mark first network as not selected
				userEvent.click(within(customNetworkFirstNetwork()).getByTestId(customNetworkItemToggleTestId));

				expect(
					within(customNetworkFirstNetwork()).getByTestId(customNetworkItemToggleTestId),
				).not.toBeChecked();

				userEvent.click(customNetworkFirstNetworkMenu());
				userEvent.click(customNetworkMenuEditOption());

				await expect(screen.findByTestId("UpdateNetworkFormModal")).resolves.toBeVisible();

				expect(customNetworkFormModalNameField()).toHaveValue(customServerName);

				expect(customNetworkFormModalServerField()).toHaveValue(customServerAddress);

				expect(screen.getByTestId("NetworkFormModal--slip44")).toHaveValue("42");

				expect(screen.getByTestId("NetworkFormModal--explorer")).toHaveValue(explorerUrl);

				userEvent.clear(customNetworkFormModalNameField());
				userEvent.paste(customNetworkFormModalNameField(), "New name");

				expect(customNetworkFormModalNameField()).toHaveValue("New name");

				await waitFor(() => expect(customNetworkFormSaveButton()).toBeEnabled());

				userEvent.click(customNetworkFormSaveButton());

				await waitFor(() => {
					expect(
						within(customNetworkFirstNetwork()).getByTestId(customNetworkItemToggleTestId),
					).not.toBeChecked();
				});
			});

			it("fill network form considering optional data", async () => {
				customNetworksMock.mockRestore();

				customNetworksMock = vi.spyOn(profile.networks(), "all").mockReturnValue({
					test: {
						custom: {
							...customNetworksStub.test.custom,
							hosts: [
								// Doesnt have `explorer` host
								{
									host: customServerAddress,
									type: "full",
								},
							],
							knownWallets: undefined,
						},
					},
				} as any);

				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworkFirstNetworkMenu());
				userEvent.click(customNetworkMenuEditOption());

				await expect(screen.findByTestId("UpdateNetworkFormModal")).resolves.toBeVisible();

				expect(screen.getByTestId("NetworkFormModal--explorer")).toHaveValue("");

				expect(screen.getByTestId("NetworkFormModal--knownWallets")).toHaveValue("");
			});

			it("can cancel editing a custom network", async () => {
				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworkFirstNetworkMenu());
				userEvent.click(customNetworkMenuEditOption());

				await expect(screen.findByTestId("UpdateNetworkFormModal")).resolves.toBeVisible();

				userEvent.click(screen.getByTestId("NetworkFormModal--cancel"));

				expect(screen.queryByTestId("UpdateNetworkFormModal")).not.toBeInTheDocument();
			});

			it("shows an error when network is unreachable when editing", async () => {
				server.use(requestMock(configurationUrl, {}, { status: 404 }));

				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworkFirstNetworkMenu());

				userEvent.click(customNetworkMenuEditOption());

				await expect(screen.findByTestId("UpdateNetworkFormModal")).resolves.toBeVisible();

				userEvent.clear(customNetworkFormModalNameField());

				userEvent.paste(customNetworkFormModalNameField(), "New name");

				expect(customNetworkFormModalNameField()).toHaveValue("New name");

				await waitFor(() => expect(customNetworkFormSaveButton()).toBeEnabled());

				userEvent.click(customNetworkFormSaveButton());

				await expect(screen.findByTestId(networkFormModalAlertTestId)).resolves.toBeVisible();
			});

			it("shows an error when network nethash is different to the original one", async () => {
				server.use(
					requestMock(configurationUrl, {
						data: {
							...networkConfigurationResponse.data,
							nethash: "whatever",
						},
					}),
					requestMock(cryptoConfigurationUrl, {
						data: {
							network: {
								name: customServerName,
							},
						},
					}),
				);

				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworkFirstNetworkMenu());
				userEvent.click(customNetworkMenuEditOption());

				await expect(screen.findByTestId("UpdateNetworkFormModal")).resolves.toBeVisible();

				userEvent.clear(customNetworkFormModalNameField());
				userEvent.paste(customNetworkFormModalNameField(), "New name");

				expect(customNetworkFormModalNameField()).toHaveValue("New name");

				await waitFor(() => expect(customNetworkFormSaveButton()).toBeEnabled());

				userEvent.click(customNetworkFormSaveButton());

				await expect(
					screen.findByText(settingsTranslations.NETWORKS.FORM.NETWORK_HASH_MISMATCH),
				).resolves.toBeVisible();
			});

			it("shows an error when network response is invalid json when editing", async () => {
				server.use(
					requestMock(configurationUrl, "invalid json"),
					requestMock(cryptoConfigurationUrl, "invalid json"),
				);

				render(
					<Route path="/profiles/:profileId/settings/networks" element={<NetworksSettings/>}/>,
					{
						route: `/profiles/${profile.id()}/settings/networks`,
					},
				);

				userEvent.click(customNetworkFirstNetworkMenu());
				userEvent.click(customNetworkMenuEditOption());

				await expect(screen.findByTestId("UpdateNetworkFormModal")).resolves.toBeVisible();

				userEvent.clear(customNetworkFormModalNameField());
				userEvent.paste(customNetworkFormModalNameField(), "New name");

				expect(customNetworkFormModalNameField()).toHaveValue("New name");

				await waitFor(() => expect(customNetworkFormSaveButton()).toBeEnabled());

				userEvent.click(customNetworkFormSaveButton());

				await expect(screen.findByTestId(networkFormModalAlertTestId)).resolves.toBeVisible();
			});
		});
	});
});
