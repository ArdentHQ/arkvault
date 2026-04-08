import { vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCustomNetworks } from "./use-custom-networks";
import { Contracts } from "@/app/lib/profiles";

vi.mock("@/utils/peers", () => ({
	isSameNetwork: vi.fn((a, b) => a.name === b.name),
}));

vi.mock("@/utils/server-utils", () => ({
	customNetworks: vi.fn(() => []),
	sortByName: vi.fn((networks) => {
		return [...networks].sort((a, b) => a.name.localeCompare(b.name));
	}),
}));

describe("useCustomNetworks", () => {
	let profile: Contracts.IProfile;

	beforeEach(() => {
		profile = {
			availableNetworks: () => [],
			hosts: () => ({
				all: vi.fn().mockReturnValue({}),
			}),
		} as unknown as Contracts.IProfile;
	});

	it("should return allCustomNetworks as empty array when no hosts", () => {
		const { result } = renderHook(() => useCustomNetworks(profile));

		expect(result.current.allCustomNetworks).toEqual([]);
	});

	it("should update network when addNetwork is called", async () => {
		const { result } = renderHook(() => useCustomNetworks(profile));

		const newNetwork = { name: "Test Network" };

		act(() => {
			result.current.addNetwork(newNetwork);
		});

		await waitFor(() => {
			expect(result.current.allCustomNetworks).toContainEqual(newNetwork);
		});
	});

	it("should remove network when removeNetwork is called", async () => {
		const { result } = renderHook(() => useCustomNetworks(profile));

		const networkToRemove = { name: "Test Network" };

		act(() => {
			result.current.addNetwork(networkToRemove);
		});

		await waitFor(() => {
			expect(result.current.allCustomNetworks).toContainEqual(networkToRemove);
		});

		act(() => {
			result.current.removeNetwork(networkToRemove);
		});

		await waitFor(() => {
			expect(result.current.allCustomNetworks).not.toContainEqual(networkToRemove);
		});
	});

	it("should update existing network when updateNetwork is called", async () => {
		const { result } = renderHook(() => useCustomNetworks(profile));

		const existingNetwork = { name: "Test Network" };

		act(() => {
			result.current.addNetwork(existingNetwork);
		});

		await waitFor(() => {
			expect(result.current.allCustomNetworks).toContainEqual(existingNetwork);
		});

		const updatedNetwork = { height: 100, name: "Test Network" };

		act(() => {
			result.current.updateNetwork(updatedNetwork);
		});

		await waitFor(() => {
			expect(result.current.allCustomNetworks).toContainEqual(updatedNetwork);
		});
	});
});
