import React from "react";
import { Networks } from "@/app/lib/mainsail";
import { expect, vi } from "vitest";
import ServerFormModal from "@/domains/setting/pages/Servers/blocks/ServerFormModal";
import { render, screen, waitFor } from "@/utils/testing-library";
import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import userEvent from "@testing-library/user-event";

const setValueMock = vi.fn();

vi.mock("react-hook-form", () => ({
	useForm: () => ({
		handleSubmit: vi.fn(),
		formState: { isValid: true, errors: {}, dirtyFields: {} },
		setValue: setValueMock,
		register: () => ({}),
		watch: () => ({}),
		trigger: vi.fn(),
		setError: vi.fn(),
		clearErrors: vi.fn(),
	}),
}));

vi.mock("@/app/hooks", () => ({
	useActiveProfile: () => ({ id: () => "profile-id" }),
	useDebounce: vi.fn((value) => [value]),
	useNetworkOptions: () => ({
		networkById: vi.fn((id) => ({
			id: () => id,
			name: "Mock Network",
		})),
	}),
	useValidation: () => ({
		server: {
			network: () => ({ required: true }),
			name: () => ({ required: true }),
			address: () => ({ required: true }),
		},
	}),
}));

vi.mock("@/domains/setting/hooks/use-handle-servers", () => ({
	useHandleServers: () => ({
		fetchingDetails: false,
		serverHeight: 100,
	}),
}));

vi.mock("@/utils/network-utils", () => ({
	networkDisplayName: () => "Devnet",
	profileAllEnabledNetworkIds: () => ["devnet"],
}));

vi.mock("@/app/components/SelectNetworkDropdown/SelectNetworkDropdown", () => ({
	SelectNetworkDropdown: ({ onChange }: { onChange?: (network: { id: () => string } | null) => void }) => (
		<div data-testid="SelectNetworkDropdown">
			<button data-testid="select-network" onClick={() => onChange?.({ id: () => "devnet" })}>
				Select
			</button>
			<button data-testid="deselect-network" onClick={() => onChange?.(null)}>
				Deselect
			</button>
		</div>
	),
}));

describe("ServerFormModal", () => {
	const mockNetworks = [
		{ id: () => "devnet", name: "Devnet" },
		{ id: () => "mainnet", name: "Mainnet" },
	] as unknown as Networks.Network[];

	const mockCustomNetworks: NormalizedNetwork[] = [];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render add new server modal", async () => {
		render(
			<ServerFormModal
				onClose={vi.fn()}
				onCreate={vi.fn()}
				onUpdate={vi.fn()}
				networks={mockNetworks}
				customNetworks={mockCustomNetworks}
				networkToUpdate={undefined}
			/>,
		);

		await waitFor(() => expect(screen.getByTestId("ServerFormModal")).toBeInTheDocument());
		expect(screen.getByTestId("ServerFormModal--network")).toBeInTheDocument();
	});

	it("should render edit server modal when networkToUpdate is provided", async () => {
		const networkToUpdate: NormalizedNetwork = {
			name: "Test Server",
			network: { id: () => "devnet", name: "Devnet" } as unknown as Networks.Network,
			publicApiEndpoint: "https://api.example.com",
			transactionApiEndpoint: "https://tx.example.com",
			evmApiEndpoint: "https://evm.example.com",
			height: 100,
			enabled: true,
		};

		render(
			<ServerFormModal
				onClose={vi.fn()}
				onCreate={vi.fn()}
				onUpdate={vi.fn()}
				networks={mockNetworks}
				customNetworks={mockCustomNetworks}
				networkToUpdate={networkToUpdate}
			/>,
		);

		await waitFor(() => expect(screen.getByTestId("ServerFormModal")).toBeInTheDocument());
		expect(screen.getByTestId("ServerFormModal--name")).toBeInTheDocument();
	});

	it("should call setValue when network is selected", async () => {
		render(
			<ServerFormModal
				onClose={vi.fn()}
				onCreate={vi.fn()}
				onUpdate={vi.fn()}
				networks={mockNetworks}
				customNetworks={mockCustomNetworks}
				networkToUpdate={undefined}
			/>,
		);

		await waitFor(() => expect(screen.getByTestId("ServerFormModal")).toBeInTheDocument());

		const selectButton = screen.getByTestId("select-network");
		await userEvent.click(selectButton);

		expect(setValueMock).toHaveBeenCalledWith("network", "devnet", { shouldDirty: true });
	});

	it("should not call setValue when network is deselected", async () => {
		render(
			<ServerFormModal
				onClose={vi.fn()}
				onCreate={vi.fn()}
				onUpdate={vi.fn()}
				networks={mockNetworks}
				customNetworks={mockCustomNetworks}
				networkToUpdate={undefined}
			/>,
		);

		await waitFor(() => expect(screen.getByTestId("ServerFormModal")).toBeInTheDocument());

		const deselectButton = screen.getByTestId("deselect-network");
		await userEvent.click(deselectButton);

		expect(setValueMock).not.toHaveBeenCalled();
	});
});
