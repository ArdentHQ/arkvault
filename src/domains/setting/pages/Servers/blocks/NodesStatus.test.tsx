import React from "react";
import { Networks } from "@/app/lib/mainsail";
import { expect, vi } from "vitest";
import NodesStatus from "@/domains/setting/pages/Servers/blocks/NodesStatus";
import { render, screen, waitFor } from "@/utils/testing-library";

vi.mock("@/app/contexts", () => ({
	useConfiguration: () => ({
		getProfileConfiguration: () => ({
			serverStatus: {},
		}),
		setConfiguration: vi.fn(),
	}),
}));

vi.mock("@/utils/peers", () => ({
	pingServerAddress: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/domains/setting/hooks/use-handle-servers", () => ({
	pingEvmApi: vi.fn().mockResolvedValue(true),
	pingTransactionApi: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/utils/network-utils", async () => {
	const mod = await vi.importActual("@/utils/network-utils");
	return {
		...mod,
		networkDisplayName: () => "Devnet",
	};
});

vi.mock("@/app/hooks", () => ({
	useActiveProfile: () => ({ id: () => "profile-id" }),
}));

vi.mock("@/app/components/NetworkIcon", () => ({
	NetworkIcon: () => <div data-testid="NetworkIcon" />,
}));

describe("NodesStatus", () => {
	it("should render nodes when all hosts are present", async () => {
		const mockNetwork = {
			id: () => "devnet",
			toObject: () => ({
				hosts: [
					{ host: "https://full.host", name: "Full Host", type: "full" },
					{ host: "https://tx.host", name: "TX Host", type: "tx" },
					{ host: "https://evm.host", name: "EVM Host", type: "evm" },
				],
			}),
		} as unknown as Networks.Network;

		render(<NodesStatus networks={[mockNetwork]} />);

		await waitFor(() => {
			expect(screen.getByTestId("NodesStatus")).toBeInTheDocument();
		});
	});

	it("should skip nodes when any host is missing", async () => {
		const networkWithMissingHost = {
			id: () => "devnet",
			toObject: () => ({
				hosts: [
					{ host: "https://full.host", name: "Full Host", type: "full" },
					{ host: "https://tx.host", name: "TX Host", type: "tx" },
				],
			}),
		} as unknown as Networks.Network;

		const completeNetwork = {
			id: () => "mainnet",
			toObject: () => ({
				hosts: [
					{ host: "https://full.host", name: "Full Host", type: "full" },
					{ host: "https://tx.host", name: "TX Host", type: "tx" },
					{ host: "https://evm.host", name: "EVM Host", type: "evm" },
				],
			}),
		} as unknown as Networks.Network;

		await waitFor(() => {
			render(<NodesStatus networks={[networkWithMissingHost, completeNetwork]} />);
		});

		expect(screen.getByTestId("NodesStatus")).toBeInTheDocument();
		const nodes = screen.getAllByTestId("NodesStatus--node");
		expect(nodes).toHaveLength(1);
	});

	it("should skip nodes when evm host is missing", async () => {
		const network = {
			id: () => "devnet",
			toObject: () => ({
				hosts: [
					{ host: "https://full.host", name: "Full Host", type: "full" },
					{ host: "https://tx.host", name: "TX Host", type: "tx" },
					{ host: "https://other.host", name: "Other Host", type: "other" },
				],
			}),
		} as unknown as Networks.Network;

		render(<NodesStatus networks={[network]} />);
		await waitFor(() => {
			expect(screen.getByTestId("NodesStatus")).toBeInTheDocument();
		});
		const nodes = screen.queryAllByTestId("NodesStatus--node");
		expect(nodes).toHaveLength(0);
	});
});
