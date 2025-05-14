import { Networks } from "@/app/lib/sdk";
import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";
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
	mockProfileWithPublicAndTestNetworks,
	mockProfileWithOnlyPublicNetworks,
} from "@/utils/testing-library";
import { translations } from "@/app/i18n/common/i18n";
import { server, requestMock } from "@/tests/mocks/server";
import { act } from "@testing-library/react";

let profile: Contracts.IProfile;
let network: Networks.Network;

const peerHostLive = "https://dwallets-evm.mainsailhq.com";
const peerHostTest = "https://dwallets-evm.mainsailhq.com";

const publicHost = "https://dwallets-evm.mainsailhq.com/api";
const txHost = "https://dwallets-evm.mainsailhq.com/tx/api";
const evmHost = "https://dwallets-evm.mainsailhq.com/evm/api";

const networksStub: any = {
	mainsail: {
		devnet: [
			{
				host: {
					custom: true,
					host: "",
					type: "musig",
				},
				name: "ARK Devnet Musig #1",
			},
		],
		mainnet: [
			{
				host: {
					custom: true,
					host: "",
					type: "musig",
				},
				name: "ARK Musig #1",
			},
			{
				host: {
					custom: true,
					height: 99_999,
					host: `${peerHostLive}/api`,
					type: "full",
				},
				name: "ARK #1",
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
			number: 999_999
		},
		supply: "125179421999999999999999959"
	}
};

const mainsailDevnet = "ark.devnet";
const serverFormSaveButtonTestingId = "ServerFormModal--save";
const addNewPeerButtonTestId = "CustomPeers--addnew";
const peerStatusOkTestId = "CustomPeersPeer--statusok";
const peerStatusLoadingTestId = "CustomPeersPeer--statusloading";
const peerStatusErrorTestId = "CustomPeersPeer--statuserror";
const peerDropdownMenuTestId = "-CustomPeers--dropdown";
const serverDeleteConfirmationTestId = "ServersSettings--delete-confirmation";
const customPeerListTestId = "CustomPeers--list";
const networkAccordionIconTestId = "Accordion__toggle";
const CustomPeersNetworkItem = "CustomPeers-network-item";
const nodeStatusNodeItemTestId = "NodesStatus--node";
const nodeStatusLoadingTestId = "NodeStatus--statusloading";
const customPeersToggleTestId = "CustomPeers-toggle";
const modalAlertTestId = "ServerFormModal-alert";

const fillServerForm = async ({
								  name = "Test",
								  publicApiEndpoint = publicHost,
								  txApiEndpoint = txHost,
								  evmApiEndpoint = evmHost
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

	const publicApiField = screen.getByTestId("ServerFormModal--publicApiEndpoint");
	await userEvent.clear(publicApiField);
	await userEvent.type(publicApiField, publicApiEndpoint);

	expect(publicApiField).toHaveValue(publicApiEndpoint);

	fireEvent.focusOut(publicApiField);

	const txApiField = screen.getByTestId("ServerFormModal--transactionApiEndpoint");
	await userEvent.clear(txApiField);
	await userEvent.type(txApiField, txApiEndpoint);

	expect(txApiField).toHaveValue(txApiEndpoint);

	fireEvent.focusOut(txApiField);

	const evmApiField = screen.getByTestId("ServerFormModal--evmApiEndpoint");
	await userEvent.clear(evmApiField);
	await userEvent.type(evmApiField, evmApiEndpoint);

	expect(evmApiField).toHaveValue(evmApiEndpoint);

	fireEvent.focusOut(evmApiField);
};

const waitUntilServerFormIsReady = async () => {
	await waitFor(() => expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeEnabled());
};

const mockPublicEndpoint = () => server.use(requestMock(publicHost, peerResponse));
const mockTxEndpoint= () => server.use(requestMock(`${txHost}/configuration`, {
	"data": {
		"core": {
			"version": "0.0.1-evm.18"
		},
		"height": 165_077,
	}
}));

const mockEvmEndpoint= () => server.use(
	requestMock(
		evmHost,
		{
			"id":1,
			"jsonrpc":"2.0",
			"result":"0x"
		},
		{
			method: "post",
		}
	)
);

const mockRequests = () => {
	mockPublicEndpoint();
	mockPeerHeight();
	mockTxEndpoint();
	mockEvmEndpoint();
}

const mockPeerHeight = () => server.use(requestMock(`${peerHostLive}/api/blockchain`, peerResponseHeight));

describe("Servers Settings", () => {
	let resetProfileNetworksMock: () => void;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		network = profile.activeNetwork();
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should render servers settings", () => {
		const { container, asFragment } = render(
			<Route path="/profiles/:profileId/settings/servers">
				<ServersSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings/servers`,
			},
		);

		expect(container).toBeInTheDocument();

		expect(screen.getAllByTestId("list-divided-item__wrapper")).toHaveLength(2);

		expect(screen.getByTestId(addNewPeerButtonTestId)).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should update profile fallback to default nodes setting", async () => {
		const settingsSetSpy = vi.spyOn(profile.settings(), "set");

		const { container } = render(
			<Route path="/profiles/:profileId/settings/servers">
				<ServersSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings/servers`,
			},
		);

		expect(container).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Plugin-settings__servers--fallback-to-default-nodes"));

		await waitFor(() => expect(screen.getByTestId("Server-settings__submit-button")).not.toBeDisabled());

		await userEvent.click(screen.getByTestId("Server-settings__submit-button"));

		await waitFor(() => expect(settingsSetSpy).toHaveBeenCalledWith("FALLBACK_TO_DEFAULT_NODES", false));

		settingsSetSpy.mockRestore();
	});

	it("shows the modal for adding new server", async () => {
		const { container } = render(
			<Route path="/profiles/:profileId/settings/servers">
				<ServersSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings/servers`,
			},
		);

		expect(container).toBeInTheDocument();

		await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

		expect(screen.getByTestId("ServerFormModal")).toBeInTheDocument();
	});

	describe("default peers", () => {
		it("should render node statuses", () => {
			const { container } = render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

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
				server.use(requestMock(peerHostTest, peerResponse));

				const { container } = render(
					<Route path="/profiles/:profileId/settings/servers">
						<ServersSettings />
					</Route>,
					{
						route: `/profiles/${profile.id()}/settings/servers`,
					},
				);

				expect(container).toBeInTheDocument();

				expect(screen.getByTestId("NodesStatus")).toBeInTheDocument();

				expect(screen.getAllByTestId(nodeStatusNodeItemTestId)).toHaveLength(1);

				// Loading initially
				expect(screen.getAllByTestId(nodeStatusLoadingTestId)).toHaveLength(1);

				await waitFor(() => expect(screen.getAllByTestId("NodeStatus--statusok")).toHaveLength(1));
			});

			it("should load the node statuses in an interval", async () => {
				server.use(requestMock(peerHostTest, peerResponse));

				const originalSetInterval = global.setInterval;
				let intervalPingFunction: () => void;

				const setIntervalSpy = vi
					.spyOn(global, "setInterval")
					.mockImplementationOnce((intervalFunction, time) => {
						intervalPingFunction = intervalFunction;
						return originalSetInterval(intervalFunction, time);
					});

				const { container } = render(
					<Route path="/profiles/:profileId/settings/servers">
						<ServersSettings />
					</Route>,
					{
						route: `/profiles/${profile.id()}/settings/servers`,
					},
				);

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

			it("should load the node status with error", async () => {
				server.use(requestMock(peerHostTest, undefined, { status: 404 }));

				const { container } = render(
					<Route path="/profiles/:profileId/settings/servers">
						<ServersSettings />
					</Route>,
					{
						route: `/profiles/${profile.id()}/settings/servers`,
					},
				);

				expect(container).toBeInTheDocument();

				expect(screen.getByTestId("NodesStatus")).toBeInTheDocument();

				expect(screen.getAllByTestId(nodeStatusNodeItemTestId)).toHaveLength(1);

				// Loading initially
				expect(screen.getAllByTestId(nodeStatusLoadingTestId)).toHaveLength(1);

				await waitFor(() => expect(screen.getAllByTestId("NodeStatus--statuserror")).toHaveLength(1));
			});

			it("should load the node statuses with error if the response is invalid json", async () => {
				server.use(requestMock(peerHostTest, "invalid json"));

				const { container } = render(
					<Route path="/profiles/:profileId/settings/servers">
						<ServersSettings />
					</Route>,
					{
						route: `/profiles/${profile.id()}/settings/servers`,
					},
				);

				expect(container).toBeInTheDocument();

				expect(screen.getByTestId("NodesStatus")).toBeInTheDocument();

				expect(screen.getAllByTestId(nodeStatusNodeItemTestId)).toHaveLength(1);

				// Loading initially
				expect(screen.getAllByTestId(nodeStatusLoadingTestId)).toHaveLength(1);

				await waitFor(() => expect(screen.getAllByTestId("NodeStatus--statuserror")).toHaveLength(1));
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

		describe("with reachable server", () => {
			it("can fill the form and store the new server for peer server", async () => {
				const hostsMock = vi.spyOn(profile.hosts(), "all").mockReturnValue({
					mainsail: []
				});

				mockRequests();

				const serverPushSpy = vi.spyOn(profile.hosts(), "push");

				render(
					<Route path="/profiles/:profileId/settings/servers">
						<ServersSettings />
					</Route>,
					{
						route: `/profiles/${profile.id()}/settings/servers`,
					},
				);

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
					mainsail: []
				});

				mockRequests();
				server.use(requestMock("https://127.0.0.1", peerResponse));

				render(
					<Route path="/profiles/:profileId/settings/servers">
						<ServersSettings />
					</Route>,
					{
						route: `/profiles/${profile.id()}/settings/servers`,
					},
				);

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

				render(
					<Route path="/profiles/:profileId/settings/servers">
						<ServersSettings />
					</Route>,
					{
						route: `/profiles/${profile.id()}/settings/servers`,
					},
				);

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
							type: "full"
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

		describe("with invalid server", () => {
			it("shows an error if the server is reachable but invalid", async () => {
				const hostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue({
					mainsail: []
				});

				server.use(requestMock(publicHost, { foo: "bar" }));

				render(
					<Route path="/profiles/:profileId/settings/servers">
						<ServersSettings />
					</Route>,
					{
						route: `/profiles/${profile.id()}/settings/servers`,
					},
				);

				await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

				await fillServerForm({});

				await expect(screen.findByTestId(modalAlertTestId)).resolves.toBeVisible();

				expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeDisabled();

				hostsSpy.mockRestore();
			});

			it("shows an error if the server is valid but doesnt match the network", async () => {
				mockPublicEndpoint();

				const networkSpy = vi.spyOn(network.prober(), "evaluate").mockReturnValue(false);

				render(
					<Route path="/profiles/:profileId/settings/servers">
						<ServersSettings />
					</Route>,
					{
						route: `/profiles/${profile.id()}/settings/servers`,
					},
				);

				await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

				await fillServerForm({});

				await expect(screen.findByTestId(modalAlertTestId)).resolves.toBeVisible();

				expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeDisabled();

				networkSpy.mockRestore();
			});
	//
	// 		it("shows an error if the server is reachable but invalid json response", async () => {
	// 			server.use(requestMock(musigHostTest, "invalid response"));
	//
	// 			render(
	// 				<Route path="/profiles/:profileId/settings/servers">
	// 					<ServersSettings />
	// 				</Route>,
	// 				{
	// 					route: `/profiles/${profile.id()}/settings/servers`,
	// 				},
	// 			);
	//
	// 			await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));
	//
	// 			await fillServerForm({
	// 				address: musigHostTest,
	// 			});
	//
	// 			await waitUntilServerIsValidated();
	//
	// 			await expect(screen.findByTestId(modalAlertTestId)).resolves.toBeVisible();
	//
	// 			expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeDisabled();
	// 		});
	//
	// 		it("shows an error if the server is unreachable", async () => {
	// 			server.use(requestMock(musigHostTest, undefined, { status: 500 }));
	//
	// 			render(
	// 				<Route path="/profiles/:profileId/settings/servers">
	// 					<ServersSettings />
	// 				</Route>,
	// 				{
	// 					route: `/profiles/${profile.id()}/settings/servers`,
	// 				},
	// 			);
	//
	// 			await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));
	//
	// 			await fillServerForm({
	// 				address: musigHostTest,
	// 			});
	//
	// 			await waitUntilServerIsValidated();
	//
	// 			await expect(screen.findByTestId(modalAlertTestId)).resolves.toBeVisible();
	//
	// 			expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeDisabled();
	// 		});
	//
	// 		it.each([
	// 			"2222-invalid-host", // Invalid URL
	// 			"http://127.0.0.1", // Valid IP URL witouth /api path
	// 			"http://127.0.0.1/api/", // Valid IP URL but ends with a slash
	// 		])("invalidates the address field if invalid host passed", async (address) => {
	// 			render(
	// 				<Route path="/profiles/:profileId/settings/servers">
	// 					<ServersSettings />
	// 				</Route>,
	// 				{
	// 					route: `/profiles/${profile.id()}/settings/servers`,
	// 				},
	// 			);
	//
	// 			await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));
	//
	// 			await fillServerForm({
	// 				address,
	// 			});
	//
	// 			await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();
	//
	// 			expect(screen.getByTestId("Input__error")).toHaveAttribute(
	// 				"data-errortext",
	// 				translations.VALIDATION.HOST_FORMAT,
	// 			);
	// 		});
	// 	});
	});
	//
	// describe("with servers", () => {
	// 	let profileHostsSpy;
	//
	// 	beforeEach(() => {
	// 		profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue(networksStub);
	//
	// 		server.use(requestMock(musigHostTest, musigResponse), requestMock(musigHostLive, musigResponse));
	//
	// 		mockPeerNetwork();
	// 	});
	//
	// 	afterEach(() => {
	// 		profileHostsSpy.mockRestore();
	// 	});
	//
	// 	it("should render custom servers", () => {
	// 		const { asFragment } = render(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		const table = screen.getByTestId(customPeerListTestId);
	//
	// 		expect(table).toBeInTheDocument();
	//
	// 		expect(screen.getByTestId(addNewPeerButtonTestId)).toBeInTheDocument();
	//
	// 		expect(within(table).getAllByTestId(CustomPeersNetworkItem)).toHaveLength(3);
	//
	// 		expect(asFragment()).toMatchSnapshot();
	// 	});
	//
	// 	it("shows an error if the server host already exists", async () => {
	// 		render(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		const table = screen.getByTestId(customPeerListTestId);
	//
	// 		expect(table).toBeInTheDocument();
	//
	// 		expect(screen.getByTestId(addNewPeerButtonTestId)).toBeInTheDocument();
	//
	// 		await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));
	//
	// 		await fillServerForm({
	// 			address: musigHostTest,
	// 		});
	//
	// 		await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();
	// 	});
	//
	// 	it("can fill the form and generate a name", async () => {
	// 		const musigHost = "https://ark-test-musig2.arkvault.io";
	//
	// 		server.use(requestMock(musigHost, musigResponse));
	//
	// 		profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue(networksStub);
	//
	// 		render(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));
	//
	// 		const networkSelect = within(screen.getByTestId("ServerFormModal--network")).getByTestId(
	// 			"SelectDropdown__input",
	// 		);
	//
	// 		expect(networkSelect).toBeInTheDocument();
	//
	// 		await userEvent.click(networkSelect);
	//
	// 		const firstOption = screen.getByTestId("SelectDropdown__option--0");
	//
	// 		expect(firstOption).toBeVisible();
	//
	// 		await userEvent.click(firstOption);
	//
	// 		const addressField = screen.getByTestId("ServerFormModal--address");
	// 		await userEvent.clear(addressField);
	// 		await userEvent.type(addressField, musigHost);
	//
	// 		expect(addressField).toHaveValue(musigHost);
	//
	// 		fireEvent.focusOut(addressField);
	//
	// 		await waitUntilServerIsValidated();
	//
	// 		const nameField = screen.getByTestId("ServerFormModal--name");
	//
	// 		await waitFor(() => {
	// 			expect(nameField).toHaveValue("ARK Musig #2");
	// 		});
	// 	});
	//
	// 	it("should fill the form and generate a name for peer", async () => {
	// 		const peerHost = "https://ark-live2.arkvault.io";
	//
	// 		server.use(requestMock(peerHost, peerResponse));
	//
	// 		const networks: any = {
	// 			ark: {
	// 				mainnet: [
	// 					{
	// 						host: {
	// 							custom: true,
	// 							host: peerHostLive,
	// 							type: "peer",
	// 						},
	// 						name: "ARK Peer #2",
	// 					},
	// 				],
	// 			},
	// 		};
	//
	// 		profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue(networks);
	//
	// 		render(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));
	//
	// 		const networkSelect = within(screen.getByTestId("ServerFormModal--network")).getByTestId(
	// 			"SelectDropdown__input",
	// 		);
	//
	// 		expect(networkSelect).toBeInTheDocument();
	//
	// 		await userEvent.click(networkSelect);
	//
	// 		const firstOption = screen.getByTestId("SelectDropdown__option--0");
	//
	// 		expect(firstOption).toBeVisible();
	//
	// 		await userEvent.click(firstOption);
	//
	// 		const addressField = screen.getByTestId("ServerFormModal--address");
	// 		await userEvent.clear(addressField);
	// 		await userEvent.type(addressField, peerHost);
	//
	// 		expect(addressField).toHaveValue(peerHost);
	//
	// 		fireEvent.focusOut(addressField);
	//
	// 		await waitUntilServerIsValidated();
	//
	// 		const nameField = screen.getByTestId("ServerFormModal--name");
	//
	// 		expect(nameField).toHaveValue("ARK Peer #1");
	// 	});
	//
	// 	it("should render customs servers in xs", () => {
	// 		const { asFragment } = renderResponsiveWithRoute(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			"xs",
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		const table = screen.getByTestId(customPeerListTestId);
	//
	// 		expect(table).toBeInTheDocument();
	//
	// 		expect(screen.getByTestId(addNewPeerButtonTestId)).toBeInTheDocument();
	//
	// 		expect(within(table).getAllByTestId("CustomPeers-network-item--mobile")).toHaveLength(3);
	//
	// 		expect(asFragment()).toMatchSnapshot();
	// 	});
	//
	// 	it("can expand a custom servers accordion in xs", async () => {
	// 		renderResponsiveWithRoute(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			"xs",
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		const table = screen.getByTestId(customPeerListTestId);
	//
	// 		await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[0]);
	//
	// 		expect(screen.getAllByTestId("CustomPeers-network-item--mobile--expanded")[0]).toBeInTheDocument();
	// 	});
	//
	// 	it("can expand a custom servers accordion in xs for peer", async () => {
	// 		renderResponsiveWithRoute(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			"xs",
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		const table = screen.getByTestId(customPeerListTestId);
	//
	// 		// index 2 is a peer network
	// 		await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[2]);
	//
	// 		expect(screen.getAllByTestId("CustomPeers-network-item--mobile--expanded")[0]).toBeInTheDocument();
	// 	});
	//
	// 	it("can check servers accordion in mobile", async () => {
	// 		renderResponsiveWithRoute(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			"xs",
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		const table = screen.getByTestId(customPeerListTestId);
	//
	// 		await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[0]);
	//
	// 		await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);
	//
	// 		await waitFor(() =>
	// 			expect(screen.getAllByTestId("CustomPeers-network-item--mobile--checked")).toHaveLength(1),
	// 		);
	//
	// 		await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);
	//
	// 		expect(screen.getAllByTestId("CustomPeers-network-item--mobile")).toHaveLength(3);
	// 	});
	//
	// 	it("can edit servers in mobile", async () => {
	// 		renderResponsiveWithRoute(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			"xs",
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		const table = screen.getByTestId(customPeerListTestId);
	//
	// 		await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[0]);
	//
	// 		await userEvent.click(screen.queryAllByTestId("CustomPeers-network-item--mobile--edit")[0]);
	//
	// 		expect(screen.getByTestId("ServerFormModal")).toBeInTheDocument();
	// 	});
	//
	// 	it("can delete servers in mobile", async () => {
	// 		renderResponsiveWithRoute(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			"xs",
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		const table = screen.getByTestId(customPeerListTestId);
	//
	// 		await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[0]);
	//
	// 		await userEvent.click(screen.queryAllByTestId("CustomPeers-network-item--mobile--delete")[0]);
	//
	// 		await expect(screen.findByTestId(serverDeleteConfirmationTestId)).resolves.toBeVisible();
	// 	});
	//
	// 	it("can refresh servers in mobile", async () => {
	// 		const refreshPersistMock = vi.spyOn(env, "persist").mockImplementation(vi.fn());
	//
	// 		renderResponsiveWithRoute(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			"xs",
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		const table = screen.getByTestId(customPeerListTestId);
	//
	// 		await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[0]);
	//
	// 		await waitFor(() => expect(screen.queryByTestId(peerStatusLoadingTestId)).not.toBeInTheDocument());
	//
	// 		await userEvent.click(screen.queryAllByTestId("CustomPeers-network-item--mobile--refresh")[0]);
	//
	// 		await waitFor(() => {
	// 			expect(refreshPersistMock).toHaveBeenCalledOnce();
	// 		});
	//
	// 		refreshPersistMock.mockRestore();
	// 	});
	//
	// 	it("should not expand peer when clicking on status", async () => {
	// 		renderResponsiveWithRoute(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			"xs",
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		// Is loading initially
	// 		expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(6);
	//
	// 		// After ping it should show ok
	// 		await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(6));
	//
	// 		await userEvent.click(screen.getAllByTestId(peerStatusOkTestId)[0]);
	//
	// 		await waitFor(() =>
	// 			expect(screen.getAllByTestId("CustomPeers-network-item--mobile--expanded")[0]).toBeInTheDocument(),
	// 		);
	// 	});
	//
	// 	it("should show status ok after ping the servers", async () => {
	// 		const { asFragment } = render(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		// Is loading initially
	// 		expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);
	//
	// 		// After ping it should show ok
	// 		await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));
	//
	// 		expect(asFragment()).toMatchSnapshot();
	// 	});
	//
	// 	it("can check an online server", async () => {
	// 		render(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		// Is loading initially
	// 		expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);
	//
	// 		// After ping it should show ok
	// 		await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));
	//
	// 		await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);
	//
	// 		await waitFor(() => expect(screen.getAllByTestId("CustomPeers-network-item--checked")).toHaveLength(1));
	// 	});
	//
	// 	it("should show status ok after ping the servers on mobile", async () => {
	// 		const { asFragment } = renderResponsiveWithRoute(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			"xs",
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		// Is loading initially
	// 		expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(6);
	//
	// 		// After ping it should show ok
	// 		await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(6));
	//
	// 		expect(asFragment()).toMatchSnapshot();
	// 	});
	//
	// 	it("should show status ok after ping the servers on mobile when expanded", async () => {
	// 		const { asFragment } = renderResponsiveWithRoute(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			"xs",
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		await userEvent.click(
	// 			within(screen.getByTestId(customPeerListTestId)).getAllByTestId(networkAccordionIconTestId)[0],
	// 		);
	//
	// 		// After ping it should show ok
	// 		await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(5));
	//
	// 		expect(asFragment()).toMatchSnapshot();
	// 	});
	//
	// 	it("should ping the servers in an interval", async () => {
	// 		const originalSetInterval = global.setInterval;
	//
	// 		const intervalPingFunction: (() => void)[] = [];
	//
	// 		const setIntervalSpy = vi.spyOn(global, "setInterval").mockImplementation((intervalFunction, time) => {
	// 			intervalPingFunction.push(intervalFunction);
	// 			return originalSetInterval(intervalFunction, time);
	// 		});
	//
	// 		const { asFragment } = render(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		// Is loading initially
	// 		expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);
	//
	// 		// After ping it should show ok
	// 		await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));
	//
	// 		for (const item of intervalPingFunction) {
	// 			item();
	// 		}
	//
	// 		// After ping it should show ok
	// 		await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));
	//
	// 		expect(asFragment()).toMatchSnapshot();
	//
	// 		setIntervalSpy.mockRestore();
	// 	});
	//
	// 	it("can delete a server", async () => {
	// 		render(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		const dropdown = screen.getAllByTestId("dropdown__toggle" + peerDropdownMenuTestId)[0];
	//
	// 		await userEvent.click(dropdown);
	//
	// 		const deleteButton = within(screen.getByTestId("dropdown__content" + peerDropdownMenuTestId)).getByTestId(
	// 			"dropdown__option--1",
	// 		);
	//
	// 		expect(deleteButton).toBeInTheDocument();
	//
	// 		await userEvent.click(deleteButton);
	//
	// 		await expect(screen.findByTestId(serverDeleteConfirmationTestId)).resolves.toBeVisible();
	//
	// 		await userEvent.click(screen.getByTestId("DeleteResource__submit-button"));
	// 		await waitFor(() => expect(screen.getAllByTestId("CustomPeers-network-item")).toHaveLength(2));
	// 	});
	//
	// 	it("can cancel a server deletion", async () => {
	// 		render(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		const dropdown = screen.getAllByTestId("dropdown__toggle" + peerDropdownMenuTestId)[0];
	//
	// 		await userEvent.click(dropdown);
	//
	// 		const deleteButton = within(screen.getByTestId("dropdown__content" + peerDropdownMenuTestId)).getByTestId(
	// 			"dropdown__option--1",
	// 		);
	//
	// 		expect(deleteButton).toBeInTheDocument();
	//
	// 		await userEvent.click(deleteButton);
	//
	// 		await expect(screen.findByTestId(serverDeleteConfirmationTestId)).resolves.toBeVisible();
	//
	// 		await userEvent.click(screen.getByTestId("DeleteResource__cancel-button"));
	//
	// 		expect(screen.queryByTestId(serverDeleteConfirmationTestId)).not.toBeInTheDocument();
	// 	});
	//
	// 	it("can close a server deletion", async () => {
	// 		render(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		const dropdown = screen.getAllByTestId("dropdown__toggle" + peerDropdownMenuTestId)[0];
	//
	// 		await userEvent.click(dropdown);
	//
	// 		const deleteButton = within(screen.getByTestId("dropdown__content" + peerDropdownMenuTestId)).getByTestId(
	// 			"dropdown__option--1",
	// 		);
	//
	// 		expect(deleteButton).toBeInTheDocument();
	//
	// 		await userEvent.click(deleteButton);
	//
	// 		await expect(screen.findByTestId(serverDeleteConfirmationTestId)).resolves.toBeVisible();
	//
	// 		await userEvent.click(screen.getByTestId("Modal__close-button"));
	//
	// 		expect(screen.queryByTestId(serverDeleteConfirmationTestId)).not.toBeInTheDocument();
	// 	});
	//
	// 	it("can update a server", async () => {
	// 		mockPublicEndpoint();
	//
	// 		render(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		const dropdown = screen.getAllByTestId("dropdown__toggle" + peerDropdownMenuTestId)[0];
	//
	// 		await userEvent.click(dropdown);
	//
	// 		const editButton = within(screen.getByTestId("dropdown__content" + peerDropdownMenuTestId)).getByTestId(
	// 			"dropdown__option--0",
	// 		);
	//
	// 		expect(editButton).toBeInTheDocument();
	//
	// 		await userEvent.click(editButton);
	//
	// 		await waitFor(() => {
	// 			expect(screen.getByTestId("ServerFormModal")).toBeInTheDocument();
	// 		});
	//
	// 		const nameField = screen.getByTestId("ServerFormModal--name");
	// 		await userEvent.clear(nameField);
	// 		await userEvent.type(nameField, "New name");
	//
	// 		await ();
	//
	// 		await waitFor(() => {
	// 			expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeEnabled();
	// 		});
	//
	// 		await userEvent.click(screen.getByTestId(serverFormSaveButtonTestingId));
	//
	// 		await waitFor(() => expect(screen.queryByTestId("ServerFormModal")).not.toBeInTheDocument(), {
	// 			timeout: 4000,
	// 		});
	// 	});
	//
	// 	it("can refresh a server", async () => {
	// 		render(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));
	//
	// 		const dropdown = screen.getAllByTestId("dropdown__toggle" + peerDropdownMenuTestId)[0];
	//
	// 		await userEvent.click(dropdown);
	//
	// 		const refreshButton = within(screen.getByTestId("dropdown__content" + peerDropdownMenuTestId)).getByTestId(
	// 			"dropdown__option--2",
	// 		);
	//
	// 		expect(refreshButton).toBeInTheDocument();
	//
	// 		await userEvent.click(refreshButton);
	//
	// 		await waitFor(() => expect(screen.queryByTestId(peerStatusLoadingTestId)).not.toBeInTheDocument());
	//
	// 		expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3);
	// 	});
	//
	// 	it("can check and uncheck a server", async () => {
	// 		const serverPushSpy = vi.spyOn(profile.hosts(), "push");
	//
	// 		render(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);
	//
	// 		await waitFor(() => expect(screen.getAllByTestId("CustomPeers-network-item--checked")).toHaveLength(1));
	//
	// 		await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);
	//
	// 		expect(screen.getAllByTestId("CustomPeers-network-item")).toHaveLength(3);
	//
	// 		serverPushSpy.mockReset();
	// 	});
	// });
	//
	// describe("with unreachable servers", () => {
	// 	let profileHostsSpy;
	//
	// 	beforeEach(() => {
	// 		profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue(networksStub);
	//
	// 		server.use(
	// 			requestMock(musigHostTest, undefined, { status: 403 }),
	// 			requestMock(musigHostLive, undefined, { status: 500 }),
	// 			requestMock(peerHostLive, undefined, { status: 404 }),
	// 		);
	// 	});
	//
	// 	afterEach(() => {
	// 		profileHostsSpy.mockRestore();
	// 	});
	//
	// 	it("should show status error if request fails", async () => {
	// 		const { asFragment } = render(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		// Is loading initially
	// 		expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);
	//
	// 		// After ping it should show error
	// 		await waitFor(() => expect(screen.getAllByTestId(peerStatusErrorTestId)).toHaveLength(3));
	//
	// 		expect(asFragment()).toMatchSnapshot();
	// 	});
	//
	// 	it("can check an offline server", async () => {
	// 		render(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		// Is loading initially
	// 		expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);
	//
	// 		// After ping it should show ok
	// 		await waitFor(() => expect(screen.getAllByTestId(peerStatusErrorTestId)).toHaveLength(3));
	//
	// 		await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);
	//
	// 		await waitFor(() => expect(screen.getAllByTestId("CustomPeers-network-item--checked")).toHaveLength(1));
	// 	});
	//
	// 	it("should show status error if request fails on mobile", async () => {
	// 		const { asFragment } = renderResponsiveWithRoute(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			"xs",
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		// Is loading initially
	// 		expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);
	//
	// 		// After ping it should show error
	// 		await waitFor(() => expect(screen.getAllByTestId(peerStatusErrorTestId)).toHaveLength(3));
	//
	// 		expect(asFragment()).toMatchSnapshot();
	// 	});
	//
	// 	it("should show status error if request fails on mobile when expanded", async () => {
	// 		const { asFragment } = renderResponsiveWithRoute(
	// 			<Route path="/profiles/:profileId/settings/servers">
	// 				<ServersSettings />
	// 			</Route>,
	// 			"xs",
	// 			{
	// 				route: `/profiles/${profile.id()}/settings/servers`,
	// 			},
	// 		);
	//
	// 		await userEvent.click(
	// 			within(screen.getByTestId(customPeerListTestId)).getAllByTestId(networkAccordionIconTestId)[0],
	// 		);
	//
	// 		// After ping it should show error
	// 		await waitFor(() => expect(screen.getAllByTestId(peerStatusErrorTestId)).toHaveLength(4));
	//
	// 		expect(asFragment()).toMatchSnapshot();
	// 	});
	});
});
