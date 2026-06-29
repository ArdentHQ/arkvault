import { ARK } from "@ardenthq/sdk-ark";
import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { Route } from "react-router-dom";
import { expect, vi } from "vitest";
import ServersSettings from "@/domains/setting/pages/Servers";
import { ConfigurationProvider } from "@/app/contexts";
import { NodeStatusNode } from "@/domains/setting/pages/Servers/blocks/NodesStatus";
import {
	env,
	getDefaultProfileId,
	mockProfileWithOnlyPublicNetworks,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

let profile: Contracts.IProfile;
let network: Networks.Network;

const peerHostTest = "https://ark-test.arkvault.io";

const peerResponse = {
	data: "Hello World!",
};

const nodeStatusNodeItemTestId = "NodesStatus--node";
const nodeStatusLoadingTestId = "NodeStatus--statusloading";

describe("Servers Settings > Node statuses", () => {
	let resetProfileNetworksMock: () => void;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		network = profile
			.wallets()
			.findByAddressWithNetwork("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", "ark.devnet")!
			.network();
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should initialize server status for unknown networks", async () => {
		const arkNetwork = new Networks.Network(ARK.manifest, ARK.manifest.networks["ark.devnet"]);

		render(
			<ConfigurationProvider defaultConfiguration={{ serverStatus: {} }}>
				<NodeStatusNode network={arkNetwork} host={arkNetwork.toObject().hosts[0]} lastRow />
			</ConfigurationProvider>,
		);

		expect(screen.getByTestId("NodeStatus--statusloading")).toBeInTheDocument();
	});

	it("should append multisig label when host type is musig", async () => {
		const arkNetwork = new Networks.Network(ARK.manifest, ARK.manifest.networks["ark.devnet"]);

		// Create a mock musig host (type 'musig' instead of 'full')
		const musigHost = { host: "https://musig.example.com", type: "musig" as const };

		render(
			<ConfigurationProvider defaultConfiguration={{ serverStatus: {} }}>
				<NodeStatusNode network={arkNetwork} host={musigHost} lastRow />
			</ConfigurationProvider>,
		);

		// Should show "ARK Devnet MultiSig" in the display name
		expect(screen.getByText(/ARK Devnet.*Multisig/i)).toBeInTheDocument();
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

				intervalPingFunction();

				// After interval ping, should still be ok (loading disappears)
				await waitFor(() => {
					expect(screen.queryByTestId(nodeStatusLoadingTestId)).not.toBeInTheDocument();
				});

				setIntervalSpy.mockRestore();
			});

			it("should load the node statuses with error", async () => {
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
});
