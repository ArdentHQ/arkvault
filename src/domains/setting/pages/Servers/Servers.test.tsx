import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
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

let profile: Contracts.IProfile;
let network: Networks.Network;

const musigHostLive = "https://ark-live-musig.arkvault.io";
const musigHostTest = "https://ark-test-musig.arkvault.io";

const peerHostLive = "https://ark-live.arkvault.io";
const peerHostTest = "https://ark-test.arkvault.io";

const networksStub: any = {
	ark: {
		devnet: [
			{
				host: {
					custom: true,
					host: musigHostTest,
					type: "musig",
				},
				name: "ARK Devnet Musig #1",
			},
		],
		mainnet: [
			{
				host: {
					custom: true,
					host: musigHostLive,
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

const musigResponse = {
	name: "@ardenthq/ark-musig-server",
	version: "1.5.0",
};

const peerResponse = {
	data: "Hello World!",
};

const peerResponseHeight = {
	data: {
		block: {
			height: 999_999,
		},
	},
};

const arkDevnet = "ark.devnet";
const serverFormSaveButtonTestingId = "ServerFormModal--save";
const addNewPeerButtonTestId = "CustomPeers--addnew";
const peerStatusOkTestId = "CustomPeersPeer--statusok";
const peerStatusLoadingTestId = "CustomPeersPeer--statusloading";
const peerStatusErrorTestId = "CustomPeersPeer--statuserror";
const peerDropdownMenuTestId = "CustomPeers--dropdown";
const serverDeleteConfirmationTestId = "ServersSettings--delete-confirmation";
const customPeerListTestId = "CustomPeers--list";
const networkAccordionIconTestId = "Accordion__toggle";
const CustomPeersNetworkItem = "CustomPeers-network-item";
const nodeStatusNodeItemTestId = "NodesStatus--node";
const nodeStatusLoadingTestId = "NodeStatus--statusloading";
const customPeersToggleTestId = "CustomPeers-toggle";
const modalAlertTestId = "ServerFormModal-alert";

const fillServerForm = async ({ name = "Test", address = musigHostTest }) => {
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

	const addressField = screen.getByTestId("ServerFormModal--address");
	await userEvent.clear(addressField);
	await userEvent.type(addressField, address);

	expect(addressField).toHaveValue(address);

	fireEvent.focusOut(addressField);
};

const waitUntilServerIsValidated = async () => {
	await expect(screen.findByTestId("Servertype-fetching")).resolves.toBeVisible();

	await waitFor(() => expect(screen.queryByTestId("Servertype-fetching")).not.toBeInTheDocument(), {
		timeout: 4000,
	});
};

const mockPeerNetwork = () => server.use(requestMock(peerHostLive, peerResponse));

const mockPeerHeight = () => server.use(requestMock(`${peerHostLive}/api/blockchain`, peerResponseHeight));

describe("Servers Settings", () => {
	let profileCoinSpy;
	let coinSpy;
	let coin;
	let resetProfileNetworksMock: () => void;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		network = profile
			.wallets()
			.findByAddressWithNetwork("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", arkDevnet)!
			.network();
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
		coin = (profile.coins().all().ARK as any).ark.devnet;
		coinSpy = vi.spyOn(coin.prober(), "evaluate").mockReturnValue(true);
		profileCoinSpy = vi.spyOn(profile.coins(), "makeInstance").mockReturnValue(coin);
	});

	afterEach(() => {
		coinSpy.mockRestore();
		profileCoinSpy.mockRestore();
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

		expect(screen.getAllByTestId("list-divided-item__wrapper")).toHaveLength(3);

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

			expect(screen.getAllByTestId(nodeStatusNodeItemTestId)).toHaveLength(2);
		});

		it("should render only live nodes if doesnt use test networks", () => {
			const resetProfileNetworksMock = mockProfileWithOnlyPublicNetworks(profile);

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

			resetProfileNetworksMock();
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
				server.use(requestMock(peerHostTest, peerResponse), requestMock(musigHostTest, musigResponse));

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

				expect(screen.getAllByTestId(nodeStatusNodeItemTestId)).toHaveLength(2);

				// Loading initially
				expect(screen.getAllByTestId(nodeStatusLoadingTestId)).toHaveLength(2);

				await waitFor(() => expect(screen.getAllByTestId("NodeStatus--statusok")).toHaveLength(2));
			});

			it("should load the node statuses in an interval", async () => {
				server.use(requestMock(peerHostTest, peerResponse), requestMock(musigHostTest, musigResponse));

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

				expect(screen.getAllByTestId(nodeStatusNodeItemTestId)).toHaveLength(2);

				// Loading initially
				expect(screen.getAllByTestId(nodeStatusLoadingTestId)).toHaveLength(2);

				await waitFor(() => expect(screen.getAllByTestId("NodeStatus--statusok")).toHaveLength(2));

				intervalPingFunction();

				// Loading again
				await waitFor(() => {
					expect(screen.getAllByTestId(nodeStatusLoadingTestId)).toHaveLength(1);
				});

				await waitFor(() => expect(screen.getAllByTestId("NodeStatus--statusok")).toHaveLength(2));

				setIntervalSpy.mockRestore();
			});

			it("should load the node statuses with error", async () => {
				server.use(
					requestMock(peerHostTest, peerResponse),
					requestMock(musigHostTest, undefined, { status: 404 }),
				);

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

				expect(screen.getAllByTestId(nodeStatusNodeItemTestId)).toHaveLength(2);

				// Loading initially
				expect(screen.getAllByTestId(nodeStatusLoadingTestId)).toHaveLength(2);

				await waitFor(() => expect(screen.getAllByTestId("NodeStatus--statuserror")).toHaveLength(1));
			});

			it("should load the node statuses with error if the response is invalid json", async () => {
				server.use(requestMock(peerHostTest, peerResponse), requestMock(musigHostTest, "invalid json"));

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

				expect(screen.getAllByTestId(nodeStatusNodeItemTestId)).toHaveLength(2);

				// Loading initially
				expect(screen.getAllByTestId(nodeStatusLoadingTestId)).toHaveLength(2);

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
			it("can fill the form and store the new server", async () => {
				server.use(requestMock(musigHostTest, musigResponse));

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

				await waitUntilServerIsValidated();

				await waitFor(() => expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeEnabled());

				await userEvent.click(screen.getByTestId(serverFormSaveButtonTestingId));

				await waitFor(() => expect(screen.getAllByTestId(CustomPeersNetworkItem)).toHaveLength(1));
			});

			it("can fill the form and store the new server for peer server", async () => {
				const hostsMock = vi.spyOn(profile.hosts(), "all").mockReturnValue({ ark: [] });

				mockPeerNetwork();
				mockPeerHeight();

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

				await fillServerForm({
					address: peerHostLive,
				});

				await waitUntilServerIsValidated();

				await waitFor(() => expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeEnabled());

				expect(screen.getByTestId("Servertype-type")).toBeInTheDocument();

				await userEvent.click(screen.getByTestId(serverFormSaveButtonTestingId));

				await waitFor(() => expect(screen.getAllByTestId(CustomPeersNetworkItem)).toHaveLength(1));

				serverPushSpy.mockRestore();
				hostsMock.mockRestore();
			});

			it("can fill the form with an ip host", async () => {
				const hostsMock = vi.spyOn(profile.hosts(), "all").mockReturnValue({ ark: [] });

				server.use(requestMock("https://127.0.0.1", musigResponse));

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
					address: "https://127.0.0.1/api",
				});

				await waitUntilServerIsValidated();
				hostsMock.mockRestore();
			});

			it("should create a new server and save settings", async () => {
				mockPeerNetwork();
				mockPeerHeight();

				const settingsSetSpy = vi.spyOn(profile.settings(), "set");
				const serverPushSpy = vi.spyOn(profile.hosts(), "push");
				const hostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue({ ark: [] });

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
					address: peerHostLive,
				});

				await waitUntilServerIsValidated();

				await waitFor(() => expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeEnabled());

				expect(screen.getByTestId("Servertype-type")).toBeInTheDocument();

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
							host: "https://ark-live.arkvault.io",
							type: "full",
						},
						name: "Test",
						network: "ark.mainnet",
					}),
				);

				serverPushSpy.mockRestore();
				settingsSetSpy.mockRestore();
				hostsSpy.mockRestore();
			});
		});

		describe("with invalid server", () => {
			it("shows an error if the server is reachable but invalid", async () => {
				const hostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue({ ark: [] });

				server.use(requestMock(musigHostTest, { foo: "bar" }));

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
					address: musigHostTest,
				});

				await waitUntilServerIsValidated();

				await expect(screen.findByTestId(modalAlertTestId)).resolves.toBeVisible();

				expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeDisabled();

				hostsSpy.mockRestore();
			});

			it("shows an error if the server is valid but doesnt match the network", async () => {
				mockPeerNetwork();

				coinSpy = vi.spyOn(coin.prober(), "evaluate").mockReturnValue(false);

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
					address: peerHostLive,
				});

				await waitUntilServerIsValidated();

				await expect(screen.findByTestId(modalAlertTestId)).resolves.toBeVisible();

				expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeDisabled();
			});

			it("shows an error if the server is reachable but invalid json response", async () => {
				server.use(requestMock(musigHostTest, "invalid response"));

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
					address: musigHostTest,
				});

				await waitUntilServerIsValidated();

				await expect(screen.findByTestId(modalAlertTestId)).resolves.toBeVisible();

				expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeDisabled();
			});

			it("shows an error if the server is unreachable", async () => {
				server.use(requestMock(musigHostTest, undefined, { status: 500 }));

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
					address: musigHostTest,
				});

				await waitUntilServerIsValidated();

				await expect(screen.findByTestId(modalAlertTestId)).resolves.toBeVisible();

				expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeDisabled();
			});

			it.each([
				"2222-invalid-host", // Invalid URL
				"http://127.0.0.1", // Valid IP URL witouth /api path
				"http://127.0.0.1/api/", // Valid IP URL but ends with a slash
			])("invalidates the address field if invalid host passed", async (address) => {
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
					address,
				});

				await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();

				expect(screen.getByTestId("Input__error")).toHaveAttribute(
					"data-errortext",
					translations.VALIDATION.HOST_FORMAT,
				);
			});
		});
	});

	describe("with servers", () => {
		let profileHostsSpy;

		beforeEach(() => {
			profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue(networksStub);

			server.use(requestMock(musigHostTest, musigResponse), requestMock(musigHostLive, musigResponse));

			mockPeerNetwork();
		});

		afterEach(() => {
			profileHostsSpy.mockRestore();
		});

		it("should render custom servers", () => {
			const { asFragment } = render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			const table = screen.getByTestId(customPeerListTestId);

			expect(table).toBeInTheDocument();

			expect(screen.getByTestId(addNewPeerButtonTestId)).toBeInTheDocument();

			expect(within(table).getAllByTestId(CustomPeersNetworkItem)).toHaveLength(3);

			expect(asFragment()).toMatchSnapshot();
		});

		it("shows an error if the server host already exists", async () => {
			render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			const table = screen.getByTestId(customPeerListTestId);

			expect(table).toBeInTheDocument();

			expect(screen.getByTestId(addNewPeerButtonTestId)).toBeInTheDocument();

			await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

			await fillServerForm({
				address: musigHostTest,
			});

			await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();
		});

		it("can fill the form and generate a name", async () => {
			const musigHost = "https://ark-test-musig2.arkvault.io";

			server.use(requestMock(musigHost, musigResponse));

			profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue(networksStub);

			render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

			const networkSelect = within(screen.getByTestId("ServerFormModal--network")).getByTestId(
				"SelectDropdown__input",
			);

			expect(networkSelect).toBeInTheDocument();

			await userEvent.click(networkSelect);

			const firstOption = screen.getByTestId("SelectDropdown__option--0");

			expect(firstOption).toBeVisible();

			await userEvent.click(firstOption);

			const addressField = screen.getByTestId("ServerFormModal--address");
			await userEvent.clear(addressField);
			await userEvent.type(addressField, musigHost);

			expect(addressField).toHaveValue(musigHost);

			fireEvent.focusOut(addressField);

			await waitUntilServerIsValidated();

			const nameField = screen.getByTestId("ServerFormModal--name");

			await waitFor(() => {
				expect(nameField).toHaveValue("ARK Musig #2");
			});
		});

		it("should fill the form and generate a name for peer", async () => {
			const peerHost = "https://ark-live2.arkvault.io";

			server.use(requestMock(peerHost, peerResponse));

			const networks: any = {
				ark: {
					mainnet: [
						{
							host: {
								custom: true,
								host: peerHostLive,
								type: "peer",
							},
							name: "ARK Peer #2",
						},
					],
				},
			};

			profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue(networks);

			render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			await userEvent.click(screen.getByTestId(addNewPeerButtonTestId));

			const networkSelect = within(screen.getByTestId("ServerFormModal--network")).getByTestId(
				"SelectDropdown__input",
			);

			expect(networkSelect).toBeInTheDocument();

			await userEvent.click(networkSelect);

			const firstOption = screen.getByTestId("SelectDropdown__option--0");

			expect(firstOption).toBeVisible();

			await userEvent.click(firstOption);

			const addressField = screen.getByTestId("ServerFormModal--address");
			await userEvent.clear(addressField);
			await userEvent.type(addressField, peerHost);

			expect(addressField).toHaveValue(peerHost);

			fireEvent.focusOut(addressField);

			await waitUntilServerIsValidated();

			const nameField = screen.getByTestId("ServerFormModal--name");

			expect(nameField).toHaveValue("ARK Peer #1");
		});

		it("should render customs servers in xs", () => {
			const { asFragment } = renderResponsiveWithRoute(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				"xs",
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			const table = screen.getByTestId(customPeerListTestId);

			expect(table).toBeInTheDocument();

			expect(screen.getByTestId(addNewPeerButtonTestId)).toBeInTheDocument();

			expect(within(table).getAllByTestId("CustomPeers-network-item--mobile")).toHaveLength(3);

			expect(asFragment()).toMatchSnapshot();
		});

		it("can expand a custom servers accordion in xs", async () => {
			renderResponsiveWithRoute(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				"xs",
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			const table = screen.getByTestId(customPeerListTestId);

			await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[0]);

			expect(screen.getByTestId("CustomPeers-network-item--mobile--expanded")).toBeInTheDocument();
		});

		it("can expand a custom servers accordion in xs for peer", async () => {
			renderResponsiveWithRoute(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				"xs",
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			const table = screen.getByTestId(customPeerListTestId);

			// index 2 is a peer network
			await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[2]);

			expect(screen.getByTestId("CustomPeers-network-item--mobile--expanded")).toBeInTheDocument();
		});

		it("can check servers accordion in mobile", async () => {
			renderResponsiveWithRoute(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				"xs",
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			const table = screen.getByTestId(customPeerListTestId);

			await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[0]);

			await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);

			await waitFor(() =>
				expect(screen.getAllByTestId("CustomPeers-network-item--mobile--checked")).toHaveLength(1),
			);

			await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);

			expect(screen.getAllByTestId("CustomPeers-network-item--mobile")).toHaveLength(3);
		});

		it("can edit servers in mobile", async () => {
			renderResponsiveWithRoute(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				"xs",
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			const table = screen.getByTestId(customPeerListTestId);

			await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[0]);

			await userEvent.click(screen.getByTestId("CustomPeers-network-item--mobile--edit"));

			expect(screen.getByTestId("ServerFormModal")).toBeInTheDocument();
		});

		it("can delete servers in mobile", async () => {
			renderResponsiveWithRoute(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				"xs",
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			const table = screen.getByTestId(customPeerListTestId);

			await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[0]);

			await userEvent.click(screen.getByTestId("CustomPeers-network-item--mobile--delete"));

			await expect(screen.findByTestId(serverDeleteConfirmationTestId)).resolves.toBeVisible();
		});

		it("can refresh servers in mobile", async () => {
			const refreshPersistMock = vi.spyOn(env, "persist").mockImplementation(vi.fn());

			renderResponsiveWithRoute(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				"xs",
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			const table = screen.getByTestId(customPeerListTestId);

			await userEvent.click(within(table).getAllByTestId(networkAccordionIconTestId)[0]);

			await waitFor(() => expect(screen.queryByTestId(peerStatusLoadingTestId)).not.toBeInTheDocument());

			await userEvent.click(screen.getByTestId("CustomPeers-network-item--mobile--refresh"));

			await waitFor(() => {
				expect(refreshPersistMock).toHaveBeenCalledOnce();
			});

			refreshPersistMock.mockRestore();
		});

		it("should not expand peer when clicking on status", async () => {
			renderResponsiveWithRoute(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				"xs",
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			// Is loading initially
			expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);

			// After ping it should show ok
			await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));

			await userEvent.click(screen.getAllByTestId(peerStatusOkTestId)[0]);

			await waitFor(() =>
				expect(screen.queryByTestId("CustomPeers-network-item--mobile--expanded")).not.toBeInTheDocument(),
			);
		});

		it("should show status ok after ping the servers", async () => {
			const { asFragment } = render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			// Is loading initially
			expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);

			// After ping it should show ok
			await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));

			expect(asFragment()).toMatchSnapshot();
		});

		it("can check an online server", async () => {
			render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			// Is loading initially
			expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);

			// After ping it should show ok
			await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));

			await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);

			await waitFor(() => expect(screen.getAllByTestId("CustomPeers-network-item--checked")).toHaveLength(1));
		});

		it("should show status ok after ping the servers on mobile", async () => {
			const { asFragment } = renderResponsiveWithRoute(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				"xs",
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			// Is loading initially
			expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);

			// After ping it should show ok
			await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));

			expect(asFragment()).toMatchSnapshot();
		});

		it("should show status ok after ping the servers on mobile when expanded", async () => {
			const { asFragment } = renderResponsiveWithRoute(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				"xs",
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			await userEvent.click(
				within(screen.getByTestId(customPeerListTestId)).getAllByTestId(networkAccordionIconTestId)[0],
			);

			// After ping it should show ok
			await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(4));

			expect(asFragment()).toMatchSnapshot();
		});

		it("should ping the servers in an interval", async () => {
			const originalSetInterval = global.setInterval;

			const intervalPingFunction: (() => void)[] = [];

			const setIntervalSpy = vi.spyOn(global, "setInterval").mockImplementation((intervalFunction, time) => {
				intervalPingFunction.push(intervalFunction);
				return originalSetInterval(intervalFunction, time);
			});

			const { asFragment } = render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			// Is loading initially
			expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);

			// After ping it should show ok
			await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));

			for (const item of intervalPingFunction) {
				item();
			}

			// After ping it should show ok
			await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));

			expect(asFragment()).toMatchSnapshot();

			setIntervalSpy.mockRestore();
		});

		it("can delete a server", async () => {
			render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			const dropdown = within(screen.getAllByTestId(peerDropdownMenuTestId)[0]).getByTestId("dropdown__toggle");

			expect(dropdown).toBeInTheDocument();

			await userEvent.click(dropdown);

			const deleteButton = within(screen.getAllByTestId(peerDropdownMenuTestId)[0]).getByTestId(
				"dropdown__option--1",
			);

			expect(deleteButton).toBeInTheDocument();

			await userEvent.click(deleteButton);

			await expect(screen.findByTestId(serverDeleteConfirmationTestId)).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("DeleteResource__submit-button"));
			await waitFor(() => expect(screen.getAllByTestId("CustomPeers-network-item")).toHaveLength(2));
		});

		it("can cancel a server deletion", async () => {
			render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			const dropdown = within(screen.getAllByTestId(peerDropdownMenuTestId)[0]).getByTestId("dropdown__toggle");

			expect(dropdown).toBeInTheDocument();

			await userEvent.click(dropdown);

			const deleteButton = within(screen.getAllByTestId(peerDropdownMenuTestId)[0]).getByTestId(
				"dropdown__option--1",
			);

			expect(deleteButton).toBeInTheDocument();

			await userEvent.click(deleteButton);

			await expect(screen.findByTestId(serverDeleteConfirmationTestId)).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("DeleteResource__cancel-button"));

			expect(screen.queryByTestId(serverDeleteConfirmationTestId)).not.toBeInTheDocument();
		});

		it("can close a server deletion", async () => {
			render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			const dropdown = within(screen.getAllByTestId(peerDropdownMenuTestId)[0]).getByTestId("dropdown__toggle");

			expect(dropdown).toBeInTheDocument();

			await userEvent.click(dropdown);

			const deleteButton = within(screen.getAllByTestId(peerDropdownMenuTestId)[0]).getByTestId(
				"dropdown__option--1",
			);

			expect(deleteButton).toBeInTheDocument();

			await userEvent.click(deleteButton);

			await expect(screen.findByTestId(serverDeleteConfirmationTestId)).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("Modal__close-button"));

			expect(screen.queryByTestId(serverDeleteConfirmationTestId)).not.toBeInTheDocument();
		});

		it("can update a server", async () => {
			mockPeerNetwork();

			render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			const dropdown = within(screen.getAllByTestId(peerDropdownMenuTestId)[0]).getByTestId("dropdown__toggle");

			expect(dropdown).toBeInTheDocument();

			await userEvent.click(dropdown);

			const editButton = within(screen.getAllByTestId(peerDropdownMenuTestId)[0]).getByTestId(
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

			await waitUntilServerIsValidated();

			await waitFor(() => {
				expect(screen.getByTestId(serverFormSaveButtonTestingId)).toBeEnabled();
			});

			await userEvent.click(screen.getByTestId(serverFormSaveButtonTestingId));

			await waitFor(() => expect(screen.queryByTestId("ServerFormModal")).not.toBeInTheDocument(), {
				timeout: 4000,
			});
		});

		it("can refresh a server", async () => {
			render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			await waitFor(() => expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3));

			const dropdown = within(screen.getAllByTestId(peerDropdownMenuTestId)[0]).getByTestId("dropdown__toggle");

			expect(dropdown).toBeInTheDocument();

			await userEvent.click(dropdown);

			const refreshButton = within(screen.getAllByTestId(peerDropdownMenuTestId)[0]).getByTestId(
				"dropdown__option--2",
			);

			expect(refreshButton).toBeInTheDocument();

			await userEvent.click(refreshButton);

			await waitFor(() => expect(screen.queryByTestId(peerStatusLoadingTestId)).not.toBeInTheDocument());

			expect(screen.getAllByTestId(peerStatusOkTestId)).toHaveLength(3);
		});

		it("can check and uncheck a server", async () => {
			const serverPushSpy = vi.spyOn(profile.hosts(), "push");

			render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);

			await waitFor(() => expect(screen.getAllByTestId("CustomPeers-network-item--checked")).toHaveLength(1));

			await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);

			expect(screen.getAllByTestId("CustomPeers-network-item")).toHaveLength(3);

			serverPushSpy.mockReset();
		});
	});

	describe("with unreachable servers", () => {
		let profileHostsSpy;

		beforeEach(() => {
			profileHostsSpy = vi.spyOn(profile.hosts(), "all").mockReturnValue(networksStub);

			server.use(
				requestMock(musigHostTest, undefined, { status: 403 }),
				requestMock(musigHostLive, undefined, { status: 500 }),
				requestMock(peerHostLive, undefined, { status: 404 }),
			);
		});

		afterEach(() => {
			profileHostsSpy.mockRestore();
		});

		it("should show status error if request fails", async () => {
			const { asFragment } = render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			// Is loading initially
			expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);

			// After ping it should show error
			await waitFor(() => expect(screen.getAllByTestId(peerStatusErrorTestId)).toHaveLength(3));

			expect(asFragment()).toMatchSnapshot();
		});

		it("can check an offline server", async () => {
			render(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			// Is loading initially
			expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);

			// After ping it should show ok
			await waitFor(() => expect(screen.getAllByTestId(peerStatusErrorTestId)).toHaveLength(3));

			await userEvent.click(screen.getAllByTestId(customPeersToggleTestId)[0]);

			await waitFor(() => expect(screen.getAllByTestId("CustomPeers-network-item--checked")).toHaveLength(1));
		});

		it("should show status error if request fails on mobile", async () => {
			const { asFragment } = renderResponsiveWithRoute(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				"xs",
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			// Is loading initially
			expect(screen.getAllByTestId(peerStatusLoadingTestId)).toHaveLength(3);

			// After ping it should show error
			await waitFor(() => expect(screen.getAllByTestId(peerStatusErrorTestId)).toHaveLength(3));

			expect(asFragment()).toMatchSnapshot();
		});

		it("should show status error if request fails on mobile when expanded", async () => {
			const { asFragment } = renderResponsiveWithRoute(
				<Route path="/profiles/:profileId/settings/servers">
					<ServersSettings />
				</Route>,
				"xs",
				{
					route: `/profiles/${profile.id()}/settings/servers`,
				},
			);

			await userEvent.click(
				within(screen.getByTestId(customPeerListTestId)).getAllByTestId(networkAccordionIconTestId)[0],
			);

			// After ping it should show error
			await waitFor(() => expect(screen.getAllByTestId(peerStatusErrorTestId)).toHaveLength(4));

			expect(asFragment()).toMatchSnapshot();
		});
	});
});
