import { env, getDefaultProfileId } from "@/utils/testing-library";
import { beforeEach, expect, vi } from "vitest";
import CustomPeers from "@/domains/setting/pages/Servers/blocks/CustomPeers";
import { render, screen, waitFor } from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";
import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";

let profile: Contracts.IProfile;
let serverStatusMock: {
	publicApiStatus?: boolean;
	txApiStatus?: boolean;
	evmApiStatus?: boolean;
	syncStatus: () => void;
};

const createServerStatusMock = (status: boolean | undefined) => ({
	evmApiStatus: status,
	publicApiStatus: status,
	syncStatus: vi.fn(),
	txApiStatus: status,
});

vi.mock("@/utils/network-utils", async (importOriginal) => {
	const mod = await importOriginal();
	return {
		// @ts-ignore
		...mod,
		networkDisplayName: () => "Devnet",
	};
});

vi.mock("@/domains/setting/pages/Servers/hooks/use-server-status", () => ({
	useServerStatus: () => serverStatusMock,
}));

vi.mock("@/app/contexts", () => ({
	useEnvironmentContext: () => ({ persist: vi.fn() }),
}));

describe("CustomPeers", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	beforeEach(() => {
		serverStatusMock = createServerStatusMock(true);
		vi.resetModules();
	});

	it("should stop propagation when clicking on status icon", async () => {
		const networksStub = [
			{
				enabled: true,
				evmApiEndpoint: "https://dwallets-evm.mainsailhq.com/evm/api",
				height: 174_400,
				name: "Test Peer Status Ok",
				network: { id: () => "mainsail.devnet" },
				publicApiEndpoint: "https://dwallets-evm.mainsailhq.com/api",
				transactionApiEndpoint: "https://dwallets-evm.mainsailhq.com/tx/api",
			} as unknown as NormalizedNetwork,
		];

		serverStatusMock = createServerStatusMock(true);

		const parentClickHandler = vi.fn();

		render(
			<CustomPeers
				addNewServerHandler={() => {}}
				networks={networksStub}
				onDelete={vi.fn()}
				onUpdate={vi.fn()}
				onToggle={vi.fn()}
				profile={profile}
			/>,
			{
				route: `/profiles/${profile.id()}/settings/servers`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("CustomPeers-network-item--checked")).toBeInTheDocument();
		});

		const statusIcons = screen.getAllByTestId("CustomPeersPeer--statusok");
		const statusIcon = statusIcons[0];
		const clickEvent = new MouseEvent("click", { bubbles: true });
		const stopPropagationSpy = vi.spyOn(clickEvent, "stopPropagation");

		statusIcon.parentElement?.addEventListener("click", parentClickHandler);
		statusIcon.dispatchEvent(clickEvent);

		expect(stopPropagationSpy).toHaveBeenCalled();
	});
});
