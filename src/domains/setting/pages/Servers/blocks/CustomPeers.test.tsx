import { env, getDefaultProfileId, renderResponsiveWithRoute } from "@/utils/testing-library";
import { beforeEach, expect, vi } from "vitest";
import CustomPeers from "@/domains/setting/pages/Servers/blocks/CustomPeers";
import { render, screen, waitFor } from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";
import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import userEvent from "@testing-library/user-event";

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

		const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
		const stopPropagationSpy = vi.spyOn(clickEvent, "stopPropagation");

		statusIcon.dispatchEvent(clickEvent);

		expect(stopPropagationSpy).toHaveBeenCalled();
	});

	it("should handle mobile dropdown actions", async () => {
		const onDelete = vi.fn();
		const onUpdate = vi.fn();
		const onToggle = vi.fn();

		const networksStub = [
			{
				enabled: true,
				evmApiEndpoint: "https://dwallets-evm.mainsailhq.com/evm/api",
				height: 174_400,
				name: "Test Mobile Peer",
				network: { id: () => "mainsail.devnet" },
				publicApiEndpoint: "https://dwallets-evm.mainsailhq.com/api",
				transactionApiEndpoint: "https://dwallets-evm.mainsailhq.com/tx/api",
			} as unknown as NormalizedNetwork,
		];

		serverStatusMock = createServerStatusMock(true);

		renderResponsiveWithRoute(
			<CustomPeers
				addNewServerHandler={() => {}}
				networks={networksStub}
				onDelete={onDelete}
				onUpdate={onUpdate}
				onToggle={onToggle}
				profile={profile}
			/>,
			"xs",
			{
				route: `/profiles/${profile.id()}/settings/servers`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("CustomPeers-network-item--mobile--checked")).toBeInTheDocument();
		});

		const dropdownToggle = screen.getByTestId("dropdown__toggle");
		await userEvent.click(dropdownToggle);

		await waitFor(() => {
			expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();
		});

		const editOption = screen.getByTestId("dropdown__option--0");
		await userEvent.click(editOption);
		expect(onUpdate).toHaveBeenCalledWith(networksStub[0]);

		await userEvent.click(dropdownToggle);
		await waitFor(() => {
			expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();
		});
		const deleteOption = screen.getByTestId("dropdown__option--1");
		await userEvent.click(deleteOption);
		expect(onDelete).toHaveBeenCalledWith(networksStub[0]);

		await userEvent.click(dropdownToggle);
		await waitFor(() => {
			expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();
		});
		const refreshOption = screen.getByTestId("dropdown__option--2");
		await userEvent.click(refreshOption);
		await waitFor(() => {
			expect(screen.queryByTestId("dropdown__content")).not.toBeInTheDocument();
		});
	});
});
