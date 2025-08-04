import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import React from "react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, vi } from "vitest";
import ServersSettings from "@/domains/setting/pages/Servers";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	fireEvent,
	within,
	renderResponsiveWithRoute,
} from "@/utils/testing-library";
import { translations } from "@/app/i18n/common/i18n";
import { server, requestMock } from "@/tests/mocks/server";
import { act } from "@testing-library/react";

let profile: Contracts.IProfile;
let network: Networks.Network;

const publicBaseUrl = "https://dwallets-evm.mainsailhq.com";

const publicApiUrl = publicBaseUrl + "/api";
const txApiUrl = "https://dwallets-evm.mainsailhq.com/tx/api";
const txApiUrlConfiguration = "https://dwallets-evm.mainsailhq.com/tx/api/configuration";
const evmApiUrl = "https://dwallets-evm.mainsailhq.com/evm/api";

const customServerName = 'Mainsail Devnet "Peer" #1';

vi.mock("@/app/contexts/Navigation/NavigationBlocking", () => ({
	NavigationBlocker: () => <div />,
	NavigationBlockingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const networksStub: any = {
	mainsail: {
		devnet: [
			{
				host: {
					custom: true,
					height: 174_400,
					host: publicApiUrl,
					id: customServerName,
					type: "full",
				},
				name: customServerName,
			},
			{
				host: {
					custom: true,
					host: txApiUrl,
					id: customServerName,
					type: "tx",
				},
				name: customServerName,
			},
			{
				host: {
					custom: true,
					host: evmApiUrl,
					id: customServerName,
					type: "evm",
				},
				name: customServerName,
			},
		],
	},
};

const peerResponse = {
	data: "Hello World!",
};

const peerResponseHeight = {
	data: {
		block: {
			hash: "fbdfadffb76f3ea2a7694615b97f7224c3f92fb00df30a1c2633b445fdd2d0e1",
			number: 999_999,
		},
		supply: "125179421999999999999999959",
	},
};

const serverFormSaveButtonTestingId = "ServerFormModal--save";
const addNewPeerButtonTestId = "CustomPeers--addnew";
const peerStatusOkTestId = "CustomPeersPeer--statusok";
const peerStatusLoadingTestId = "CustomPeersPeer--statusloading";
const peerStatusErrorTestId = "CustomPeersPeer--statuserror";
const peerDropdownMenuTestId = "-CustomPeers--dropdown";
const serverDeleteConfirmationTestId = "ServersSettings--delete-confirmation";
const customPeerListTestId = "CustomPeers--list";
const networkAccordionIconTestId = "mobile-table-element-header";
const CustomPeersNetworkItem = "CustomPeers-network-item";
const nodeStatusNodeItemTestId = "NodesStatus--node";
const nodeStatusLoadingTestId = "NodeStatus--statusloading";
const nodeStatusErrorTestId = "NodeStatus--statuserror";
const customPeersToggleTestId = "CustomPeers-toggle";
const modalAlertTestId = "ServerFormModal-alert";

const fillServerForm = async ({
	name = "Test",
	publicApiEndpoint = publicApiUrl,
	txApiEndpoint = txApiUrl,
	evmApiEndpoint = evmApiUrl,
}) => {
	const networkSelect = within(screen.getByTestId("ServerFormModal--network")).getByTestId("SelectDropdown__input");

	expect(networkSelect).toBeInTheDocument();

	await userEvent.click(networkSelect);

	const firstOption = screen.getByTestId("SelectDropdown__option--0");

	expect(firstOption).toBeVisible();

	await userEvent.click(firstOption);

	const nameField = screen.getByTestId("ServerFormModal--name");
	await userEvent.clear(nameField);
	await userEvent.type(nameField, name);

	expect(nameField).toHaveValue(name);

	const fillEndpoint = async (fieldId: string, url: string) => {
		const field = screen.getByTestId(fieldId);
		await userEvent.clear(field);
		await userEvent.type(field, url);

		expect(field).toHaveValue(url);

		fireEvent.focusOut(field);
	};

	await fillEndpoint("ServerFormModal--publicApiEndpoint", publicApiEndpoint);

	if (txApiEndpoint) {
		await fillEndpoint("ServerFormModal--transactionApiEndpoint", txApiEndpoint);
	}

	if (evmApiEndpoint) {
		await fillEndpoint("ServerFormModal--evmApiEndpoint", evmApiEndpoint);
	}
};

const waitUntilServerFormIsReady = async () => {
	await waitFor(() => expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeEnabled());
};

const mockPublicEndpoint = () => server.use(requestMock(publicApiUrl, peerResponse));

const mockHeight = () => server.use(requestMock(`${publicApiUrl}/blockchain`, peerResponseHeight));

const mockTxEndpoint = () =>
	server.use(
		requestMock(`${txApiUrl}/configuration`, {
			data: {
				blockNumber: 22010959,
				core: {
					version: "0.0.1-rc.2",
				},
			},
		}),
	);

const mockEvmEndpoint = () =>
	server.use(
		requestMock(
			evmApiUrl,
			{
				id: 1,
				jsonrpc: "2.0",
				result: "0x",
			},
			{
				method: "post",
			},
		),
	);

const mockRequests = () => {
	mockPublicEndpoint();
	mockHeight();
	mockTxEndpoint();
	mockEvmEndpoint();
};

describe("Servers Settings", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		network = profile.activeNetwork();
	});

	beforeEach(() => {
		mockTxEndpoint();
	});

	it("should render servers page", () => {
		const { container, asFragment } = render(<ServersSettings />, {
			route: `/profiles/${profile.id()}/settings/servers`,
		});

		expect(container).toBeInTheDocument();

		expect(screen.getAllByTestId("list-divided-item__wrapper")).toHaveLength(2);

		expect(screen.getByTestId(addNewPeerButtonTestId)).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should update profile fallback to default nodes setting", async () => {
		const settingsSetSpy = vi.spyOn(profile.settings(), "set");

		const { container } = render(<ServersSettings />, {
			route: `/profiles/${profile.id()}/settings/servers`,
		});

		expect(container).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Plugin-settings__servers--fallback-to-default-nodes"));

		await waitFor(() => expect(screen.getByTestId("Server-settings__submit-button")).not.toBeDisabled());

		await userEvent.click(screen.getByTestId("Server-settings__submit-button"));

		await waitFor(() => expect(settingsSetSpy).toHaveBeenCalledWith("FALLBACK_TO_DEFAULT_NODES", false));

		settingsSetSpy.mockRestore();
	});

	describe("Default peers", () => {
		it("should render node statuses", () => {
			const { container } = render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			expect(container).toBeInTheDocument();

			expect(screen.getByTestId("NodesStatus")).toBeInTheDocument();

			expect(screen.getAllByTestId(nodeStatusNodeItemTestId)).toHaveLength(1);
		});

		describe("Node statuses", () => {
			let availableNetworksSpy: vi.SpyInstance;

			beforeEach(() => {
				availableNetworksSpy = vi.spyOn(profile, "availableNetworks").mockReturnValue([network]);
			});

			afterEach(() => {
				availableNetworksSpy.mockRestore();
			});

			it("should load the node statuses", async () => {
				mockRequests();

				const { container } = render(<ServersSettings />, {
					route: `/profiles/${profile.id()}/settings/servers`,
				});

				expect(container).toBeInTheDocument();

				expect(screen.getByTestId("NodesStatus")).toBeInTheDocument();

				expect(screen.getAllByTestId(nodeStatusNodeItemTestId)).toHaveLength(1);

				// Loading initially
				expect(screen.getAllByTestId(nodeStatusLoadingTestId)).toHaveLength(1);

				await waitFor(() => expect(screen.getAllByTestId("NodeStatus--statusok")).toHaveLength(1));
			});

			it("should load the node statuses in an interval", async () => {
				mockRequests();

				const originalSetInterval = global.setInterval;
				let intervalPingFunction: () => void;

				const setIntervalSpy = vi
					.spyOn(global, "setInterval")
					.mockImplementationOnce((intervalFunction, time) => {
						intervalPingFunction = intervalFunction;
						return originalSetInterval(intervalFunction, time);
					});

				const { container } = render(<ServersSettings />, {
					route: `/profiles/${profile.id()}/settings/servers`,
				});

				expect(container).toBeInTheDocument();

				expect(screen.getByTestId("NodesStatus")).toBeInTheDocument();

				expect(screen.getAllByTestId(nodeStatusNodeItemTestId)).toHaveLength(1);

				// Loading initially
				expect(screen.getAllByTestId(nodeStatusLoadingTestId)).toHaveLength(1);

				await waitFor(() => expect(screen.getAllByTestId("NodeStatus--statusok")).toHaveLength(1));

				act(() => {
					intervalPingFunction();
				});

				// Loading again
				await waitFor(() => {
					expect(screen.getAllByTestId(nodeStatusLoadingTestId)).toHaveLength(1);
				});

				await waitFor(() => expect(screen.getAllByTestId("NodeStatus--statusok")).toHaveLength(1));

				setIntervalSpy.mockRestore();
			});

			it("should display error message when 1 host is failing", async () => {
				mockTxEndpoint();
				mockEvmEndpoint();
				server.use(requestMock(publicBaseUrl, undefined, { status: 404 }));

				const { container } = render(<ServersSettings />, {
					route: `/profiles/${profile.id()}/settings/servers`,
				});

				expect(container).toBeInTheDocument();

				expect(screen.getByTestId("NodesStatus")).toBeInTheDocument();

				expect(screen.getAllByTestId(nodeStatusNodeItemTestId)).toHaveLength(1);

				// Loading initially
				expect(screen.getAllByTestId(nodeStatusLoadingTestId)).toHaveLength(1);

				await waitFor(() => expect(screen.getAllByTestId(nodeStatusErrorTestId)).toHaveLength(1));

				await userEvent.hover(screen.getByTestId(nodeStatusErrorTestId));

				expect(
					screen.getByText(
						/The Public API is experiencing issues, please check on socials for more information/,
					),
				).toBeInTheDocument();
			});

			it("should display error message when 2 hosts are failing", async () => {
				mockTxEndpoint();
				server.use(requestMock(evmApiUrl, undefined, { status: 404 }));
				server.use(requestMock(publicBaseUrl, undefined, { status: 404 }));

				render(<ServersSettings />, {
					route: `/profiles/${profile.id()}/settings/servers`,
				});

				expect(screen.getByTestId("NodesStatus")).toBeInTheDocument();

				expect(screen.getAllByTestId(nodeStatusNodeItemTestId)).toHaveLength(1);

				// Loading initially
				expect(screen.getAllByTestId(nodeStatusLoadingTestId)).toHaveLength(1);

				await waitFor(() => expect(screen.getAllByTestId(nodeStatusErrorTestId)).toHaveLength(1));

				await userEvent.hover(screen.getByTestId(nodeStatusErrorTestId));

				expect(
					screen.getByText(
						/The Public API and EVM API are experiencing issues, please check on socials for more information/,
					),
				).toBeInTheDocument();
			});

			it("should display error message when all hosts are failing", async () => {
				server.use(requestMock(publicBaseUrl, undefined, { status: 404 }));
				server.use(requestMock(txApiUrl, undefined, { status: 404 }));
				server.use(requestMock(txApiUrlConfiguration, undefined, { status: 404 }));
				server.use(requestMock(evmApiUrl, undefined, { status: 404 }));

				render(<ServersSettings />, {
					route: `/profiles/${profile.id()}/settings/servers`,
				});

				const user = userEvent.setup();

				expect(screen.getByTestId("NodesStatus")).toBeInTheDocument();

				expect(screen.getAllByTestId(nodeStatusNodeItemTestId)).toHaveLength(1);

				// Loading initially
				expect(screen.getAllByTestId(nodeStatusLoadingTestId)).toHaveLength(1);

				await waitFor(() => expect(screen.getAllByTestId(nodeStatusErrorTestId)).toHaveLength(1));

				await user.hover(screen.getByTestId(nodeStatusErrorTestId));

				expect(
					screen.getByText(
						/Default nodes are experiencing issues, please check on socials for more information/,
					),
				).toBeInTheDocument();
			});

			it("should load the node statuses with error if the response is invalid json", async () => {
				server.use(requestMock(publicBaseUrl, "invalid json"));

				const { container } = render(<ServersSettings />, {
					route: `/profiles/${profile.id()}/settings/servers`,
				});

				expect(container).toBeInTheDocument();

				expect(screen.getByTestId("NodesStatus")).toBeInTheDocument();

				expect(screen.getAllByTestId(nodeStatusNodeItemTestId)).toHaveLength(1);

				// Loading initially
				expect(screen.getAllByTestId(nodeStatusLoadingTestId)).toHaveLength(1);

				await waitFor(() => expect(screen.getAllByTestId(nodeStatusErrorTestId)).toHaveLength(1));
			});
		});
	});

	describe("New server", () => {
		let profileHostsSpy;

		beforeEach(() => {
			profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue({});
		});

		afterEach(() => {
			profileHostsSpy.mockRestore();
		});

		it("shows the modal for adding new server", async () => {
			const { container } = render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			expect(container).toBeInTheDocument();

			await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

			expect(screen.getByTestId("ServerFormModal")).toBeInTheDocument();
		});

		it("should show an error if the server host already exists", async () => {
			const profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue(networksStub);

			render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			const table = screen.getByTestId(customPeerListTestId);

			expect(table).toBeInTheDocument();

			expect(screen.getByTestId(addNewPeerButtonTestId)).toBeInTheDocument();

			await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

			await fillServerForm({ evmApiEndpoint: null, txApiEndpoint: null });

			await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();
			expect(screen.getByTestId("Input__error")).toHaveAttribute("data-errortext", "Address already exists.");

			profileHostsSpy.mockRestore();
		});

		describe("With reachable endpoints", () => {
			it("can fill the form and store the new custom server", async () => {
				const hostsMock = vi.spyOn(profile.hosts(), "all").mockReturnValue({
					mainsail: [],
				});

				mockRequests();

				const serverPushSpy = vi.spyOn(profile.hosts(), "push");

				render(<ServersSettings />, {
					route: `/profiles/${profile.id()}/settings/servers`,
				});

				await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

				await fillServerForm({});

				await waitFor(() => expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeEnabled());

				await userEvent.click(screen.getByTestId(serverFormSaveButtonTestingId));

				await waitFor(() => expect(screen.getAllByTestId(CustomPeersNetworkItem)).toHaveLength(1));

				serverPushSpy.mockRestore();
				hostsMock.mockRestore();
			});

			it("can fill the form with an ip host", async () => {
				const hostsMock = vi.spyOn(profile.hosts(), "all").mockReturnValue({
					mainsail: [],
				});

				mockRequests();
				server.use(requestMock("https://127.0.0.1", peerResponse));

				render(<ServersSettings />, {
					route: `/profiles/${profile.id()}/settings/servers`,
				});

				await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

				await fillServerForm({
					publicApiEndpoint: "https://127.0.0.1/api",
				});

				await waitUntilServerFormIsReady();
				hostsMock.mockRestore();
			});

			it("should create a new server and save settings", async () => {
				mockRequests();

				const settingsSetSpy = vi.spyOn(profile.settings(), "set");
				const serverPushSpy = vi.spyOn(profile.hosts(), "push");
				const hostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue({ mainsail: [] });

				render(<ServersSettings />, {
					route: `/profiles/${profile.id()}/settings/servers`,
				});

				await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

				await fillServerForm({});

				await waitUntilServerFormIsReady();

				await userEvent.click(screen.getByTestId(serverFormSaveButtonTestingId));

				await waitFor(() => expect(screen.getAllByTestId(CustomPeersNetworkItem)).toHaveLength(1));
				await waitFor(() => expect(screen.getByTestId("Server-settings__submit-button")).not.toBeDisabled());

				await userEvent.click(screen.getByTestId("Server-settings__submit-button"));

				await waitFor(() =>
					expect(serverPushSpy).toHaveBeenCalledWith({
						host: {
							custom: true,
							enabled: false,
							height: 999_999,
							host: "https://dwallets-evm.mainsailhq.com/api",
							id: "Test",
							type: "full",
						},
						name: "Test",
						network: "mainsail.devnet",
					}),
				);

				serverPushSpy.mockRestore();
				settingsSetSpy.mockRestore();
				hostsSpy.mockRestore();
			});
		});

		describe("With invalid/unreachable endpoints", () => {
			it("shows an error if the server is reachable but invalid", async () => {
				const hostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue({
					mainsail: [],
				});

				server.use(requestMock(publicApiUrl, { foo: "bar" }));

				render(<ServersSettings />, {
					route: `/profiles/${profile.id()}/settings/servers`,
				});

				await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

				await fillServerForm({});

				await expect(screen.findByTestId(modalAlertTestId)).resolves.toBeVisible();

				expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeDisabled();

				hostsSpy.mockRestore();
			});

			it("shows an error if the server is valid but doesnt match the network", async () => {
				mockPublicEndpoint();

				const networkSpy = vi.spyOn(network, "evaluateUrl").mockReturnValue(false);

				render(<ServersSettings />, {
					route: `/profiles/${profile.id()}/settings/servers`,
				});

				await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

				await fillServerForm({});

				await expect(screen.findByTestId(modalAlertTestId)).resolves.toBeVisible();

				expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeDisabled();

				networkSpy.mockRestore();
			});

			it("shows an error if the server is reachable but invalid json response", async () => {
				server.use(requestMock(publicApiUrl, "invalid response"));

				render(<ServersSettings />, {
					route: `/profiles/${profile.id()}/settings/servers`,
				});

				await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

				await fillServerForm({});

				await expect(screen.findByTestId(modalAlertTestId)).resolves.toBeVisible();

				expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeDisabled();
			});

			it("shows an error if the server is unreachable", async () => {
				server.use(requestMock(publicApiUrl, undefined, { status: 500 }));

				render(<ServersSettings />, {
					route: `/profiles/${profile.id()}/settings/servers`,
				});

				await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

				await fillServerForm({});

				await expect(screen.findByTestId(modalAlertTestId)).resolves.toBeVisible();

				expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeDisabled();
			});

			it("should show an error if the EVM endpoint is unreachable", async () => {
				server.use(requestMock(evmApiUrl, undefined, { status: 500 }));

				render(<ServersSettings />, {
					route: `/profiles/${profile.id()}/settings/servers`,
				});

				await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

				await fillServerForm({});

				await expect(screen.findByTestId(modalAlertTestId)).resolves.toBeVisible();

				expect(screen.getByTestId("Input__error")).toHaveAttribute(
					"data-errortext",
					"Either failed to connect to the endpoint or it doesn't contain the expected information.",
				);

				expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeDisabled();
			});

			it.each([
				"2222-invalid-host", // Invalid URL
				"http://127.0.0.1", // Valid IP URL without /api path
				"http://127.0.0.1/api/", // Valid IP URL but ends with a slash
			])("should show an error when an invalid host passed", async (address) => {
				render(<ServersSettings />, {
					route: `/profiles/${profile.id()}/settings/servers`,
				});

				await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

				await fillServerForm({
					publicApiEndpoint: address,
				});

				await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();

				expect(screen.getByTestId("Input__error")).toHaveAttribute(
					"data-errortext",
					translations.VALIDATION.HOST_FORMAT,
				);
			});
		});
	});

	describe("Added reachable servers", () => {
		let profileHostsSpy;

		beforeEach(() => {
			profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue(networksStub);

			mockRequests();
		});

		afterEach(() => {
			profileHostsSpy.mockRestore();
		});

		it("should render custom servers", () => {
			const { asFragment } = render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			const table = screen.getByTestId(customPeerListTestId);

			expect(table).toBeInTheDocument();

			expect(screen.getByTestId(addNewPeerButtonTestId)).toBeInTheDocument();

			expect(within(table).getAllByTestId(CustomPeersNetworkItem)).toHaveLength(1);

			expect(asFragment()).toMatchSnapshot();
		});

		it("should fill the form and generate a name", async () => {
			profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue(networksStub);

			render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

			const networkSelect = within(screen.getByTestId("ServerFormModal--network")).getByTestId(
				"SelectDropdown__input",
			);

			expect(networkSelect).toBeInTheDocument();

			await userEvent.click(networkSelect);

			const firstOption = screen.getByTestId("SelectDropdown__option--0");

			expect(firstOption).toBeVisible();

			await userEvent.click(firstOption);

			const nameField = screen.getByTestId("ServerFormModal--name");

			await waitFor(() => {
				expect(nameField).toHaveValue('Mainsail Devnet "Peer" #2');
			});
		});

		it("should render customs servers in xs", () => {
			const { asFragment } = renderResponsiveWithRoute(<ServersSettings />, "xs", {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			const table = screen.getByTestId(customPeerListTestId);

			expect(table).toBeInTheDocument();

			expect(screen.getByTestId(addNewPeerButtonTestId)).toBeInTheDocument();

			expect(within(table).getAllByTestId("CustomPeers-network-item--mobile")).toHaveLength(1);

			expect(asFragment()).toMatchSnapshot();
		});

		it("can expand a custom servers accordion in xs", async () => {
			renderResponsiveWithRoute(<ServersSettings />, "xs", {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			const table = screen.getByTestId(customPeerListTestId);

			await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[0]);

			expect(screen.getAllByTestId("mobile-table-element-body")[0]).toBeInTheDocument();
		});

		it("can check servers accordion in mobile", async () => {
			renderResponsiveWithRoute(<ServersSettings />, "xs", {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			const table = screen.getByTestId(customPeerListTestId);

			await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[0]);

			await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);

			await waitFor(() =>
				expect(screen.getAllByTestId("CustomPeers-network-item--mobile--checked")).toHaveLength(1),
			);

			await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);

			expect(screen.getAllByTestId("CustomPeers-network-item--mobile")).toHaveLength(1);
		});

		it("can edit servers in mobile", async () => {
			renderResponsiveWithRoute(<ServersSettings />, "xs", {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			const table = screen.getByTestId(customPeerListTestId);

			await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[0]);

			await userEvent.click(screen.queryAllByTestId("CustomPeers-network-item--mobile--edit")[0]);

			expect(screen.getByTestId("ServerFormModal")).toBeInTheDocument();
		});

		it("can delete servers in mobile", async () => {
			renderResponsiveWithRoute(<ServersSettings />, "xs", {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			const table = screen.getByTestId(customPeerListTestId);

			await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[0]);

			await userEvent.click(screen.queryAllByTestId("CustomPeers-network-item--mobile--delete")[0]);

			await expect(screen.findByTestId(serverDeleteConfirmationTestId)).resolves.toBeVisible();
		});

		it("can refresh servers in mobile", async () => {
			const refreshPersistMock = vi.spyOn(env, "persist").mockImplementation(vi.fn());

			renderResponsiveWithRoute(<ServersSettings />, "xs", {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			const table = screen.getByTestId(customPeerListTestId);

			await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[0]);

			await waitFor(() => expect(screen.queryByTestId(peerStatusLoadingTestId)).not.toBeInTheDocument());

			await userEvent.click(screen.queryAllByTestId("CustomPeers-network-item--mobile--refresh")[0]);

			await waitFor(() => {
				expect(refreshPersistMock).toHaveBeenCalledOnce();
			});

			refreshPersistMock.mockRestore();
		});

		it("should show status ok after ping the servers", async () => {
			const { asFragment } = render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			// Is loading initially
			expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);

			// After ping, it should show ok
			await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));

			expect(asFragment()).toMatchSnapshot();
		});

		it("can check an online server", async () => {
			render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			// Is loading initially
			expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);

			// After ping it should show ok
			await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));

			await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);

			await waitFor(() => expect(screen.getAllByTestId("CustomPeers-network-item--checked")).toHaveLength(1));
		});

		it("should show status ok after ping the servers on mobile", async () => {
			const { asFragment } = renderResponsiveWithRoute(<ServersSettings />, "xs", {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			// Is loading initially
			expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);

			// After ping, it should show ok
			await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));

			expect(asFragment()).toMatchSnapshot();
		});

		it("should ping the servers in an interval", async () => {
			const originalSetInterval = global.setInterval;

			const intervalPingFunction: (() => void)[] = [];

			const setIntervalSpy = vi.spyOn(global, "setInterval").mockImplementation((intervalFunction, time) => {
				intervalPingFunction.push(intervalFunction);
				return originalSetInterval(intervalFunction, time);
			});

			const { asFragment } = render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			// Is loading initially
			expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);

			// After ping it should show ok
			await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));

			act(() => {
				for (const item of intervalPingFunction) {
					item();
				}
			});

			// After ping, it should show ok
			await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));

			expect(asFragment()).toMatchSnapshot();

			setIntervalSpy.mockRestore();
		});

		it("can delete a server", async () => {
			render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			const dropdown = screen.getAllByTestId("dropdown__toggle" + peerDropdownMenuTestId)[0];

			await userEvent.click(dropdown);

			const deleteButton = within(screen.getByTestId("dropdown__content" + peerDropdownMenuTestId)).getByTestId(
				"dropdown__option--1",
			);

			expect(deleteButton).toBeInTheDocument();

			await userEvent.click(deleteButton);

			await expect(screen.findByTestId(serverDeleteConfirmationTestId)).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("DeleteResource__submit-button"));
			await waitFor(() => expect(screen.queryByTestId("CustomPeers-network-item")).not.toBeInTheDocument());
		});

		it("can cancel a server deletion", async () => {
			render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			const dropdown = screen.getAllByTestId("dropdown__toggle" + peerDropdownMenuTestId)[0];

			await userEvent.click(dropdown);

			const deleteButton = within(screen.getByTestId("dropdown__content" + peerDropdownMenuTestId)).getByTestId(
				"dropdown__option--1",
			);

			expect(deleteButton).toBeInTheDocument();

			await userEvent.click(deleteButton);

			await expect(screen.findByTestId(serverDeleteConfirmationTestId)).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("DeleteResource__cancel-button"));

			expect(screen.queryByTestId(serverDeleteConfirmationTestId)).not.toBeInTheDocument();
		});

		it("can close a server deletion", async () => {
			render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			const dropdown = screen.getAllByTestId("dropdown__toggle" + peerDropdownMenuTestId)[0];

			await userEvent.click(dropdown);

			const deleteButton = within(screen.getByTestId("dropdown__content" + peerDropdownMenuTestId)).getByTestId(
				"dropdown__option--1",
			);

			expect(deleteButton).toBeInTheDocument();

			await userEvent.click(deleteButton);

			await expect(screen.findByTestId(serverDeleteConfirmationTestId)).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("Modal__close-button"));

			expect(screen.queryByTestId(serverDeleteConfirmationTestId)).not.toBeInTheDocument();
		});

		it("can update a server", async () => {
			render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			const dropdown = screen.getAllByTestId("dropdown__toggle" + peerDropdownMenuTestId)[0];

			await userEvent.click(dropdown);

			const editButton = within(screen.getByTestId("dropdown__content" + peerDropdownMenuTestId)).getByTestId(
				"dropdown__option--0",
			);

			expect(editButton).toBeInTheDocument();

			await userEvent.click(editButton);

			await waitFor(() => {
				expect(screen.getByTestId("ServerFormModal")).toBeInTheDocument();
			});

			const nameField = screen.getByTestId("ServerFormModal--name");
			await userEvent.clear(nameField);
			await userEvent.type(nameField, "New name");

			await waitFor(() => {
				expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeEnabled();
			});

			await userEvent.click(screen.getByTestId(serverFormSaveButtonTestingId));

			await waitFor(() => expect(screen.queryByTestId("ServerFormModal")).not.toBeInTheDocument(), {
				timeout: 4000,
			});
		});

		it("can refresh a server", async () => {
			render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));

			const dropdown = screen.getAllByTestId("dropdown__toggle" + peerDropdownMenuTestId)[0];

			await userEvent.click(dropdown);

			const refreshButton = within(screen.getByTestId("dropdown__content" + peerDropdownMenuTestId)).getByTestId(
				"dropdown__option--2",
			);

			expect(refreshButton).toBeInTheDocument();

			await userEvent.click(refreshButton);

			await waitFor(() => expect(screen.queryByTestId(peerStatusLoadingTestId)).not.toBeInTheDocument());

			expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3);
		});

		it("can check and uncheck a server", async () => {
			const serverPushSpy = vi.spyOn(profile.hosts(), "push");

			render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);

			await waitFor(() => expect(screen.getAllByTestId("CustomPeers-network-item--checked")).toHaveLength(1));

			await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);

			expect(screen.getAllByTestId("CustomPeers-network-item")).toHaveLength(1);

			serverPushSpy.mockReset();
		});
	});

	describe("Added unreachable servers", () => {
		let profileHostsSpy;

		beforeEach(() => {
			profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue(networksStub);

			mockHeight();
			mockTxEndpoint();
			mockEvmEndpoint();

			server.use(requestMock(publicBaseUrl, undefined, { status: 404 }));
		});

		afterEach(() => {
			profileHostsSpy.mockRestore();
		});

		it("should show status error if request fails", async () => {
			const { asFragment } = render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			// Is loading initially
			expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);

			// After ping it should show error
			await waitFor(() => expect(screen.getAllByTestId(peerStatusErrorTestId)).toHaveLength(1));

			expect(asFragment()).toMatchSnapshot();
		});

		it("can check an offline server", async () => {
			render(<ServersSettings />, {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			// Is loading initially
			expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);

			// After ping it should show ok
			await waitFor(() => expect(screen.getAllByTestId(peerStatusErrorTestId)).toHaveLength(1));

			await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);

			await waitFor(() => expect(screen.getAllByTestId("CustomPeers-network-item--checked")).toHaveLength(1));
		});

		it("should show status error if request fails on mobile", async () => {
			const { asFragment } = renderResponsiveWithRoute(<ServersSettings />, "xs", {
				route: `/profiles/${profile.id()}/settings/servers`,
			});

			// Is loading initially
			expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);

			// After ping it should show error
			await waitFor(() => expect(screen.getAllByTestId(peerStatusErrorTestId)).toHaveLength(1));

			expect(asFragment()).toMatchSnapshot();
		});
	});
});
