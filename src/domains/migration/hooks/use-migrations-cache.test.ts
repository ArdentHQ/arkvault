import { renderHook } from "@testing-library/react-hooks";
import { vi } from "vitest";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useMigrationsCache } from "./use-migrations-cache";
import * as contextMock from "@/app/contexts";
import { env, getDefaultProfileId, waitFor } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let persistMock;
let setMock;
let getMock;

describe("useMigrationsCache hook", () => {
	let environmentMock;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	beforeEach(() => {
		persistMock = vi.fn();
		setMock = vi.fn();
		getMock = vi.fn().mockImplementation(() => ({}));

		environmentMock = vi.spyOn(contextMock, "useEnvironmentContext").mockReturnValue({
			env: {
				data: () => ({
					get: getMock,
					set: setMock,
				}),
			},
			persist: persistMock,
		});
	});

	afterEach(() => {
		environmentMock.mockRestore();
	});

	it("should not be ready if no profile", async () => {
		const { result } = renderHook(() => useMigrationsCache({ profile: undefined }));

		await waitFor(() => {
			expect(result.current.cacheIsReady).toBe(false);
		});
	});

	it("should be ready if profile", async () => {
		const { result } = renderHook(() => useMigrationsCache({ profile }));

		await waitFor(() => {
			expect(result.current.cacheIsReady).toBe(true);
		});
	});

	it("should store the migrations", async () => {
		const { result } = renderHook(() => useMigrationsCache({ profile }));

		await waitFor(() => {
			expect(result.current.cacheIsReady).toBe(true);
		});

		result.current.storeMigrations([{ id: 1 }]);

		expect(setMock).toBeCalledWith(expect.any(String), expect.any(Object));
	});

	it("should get the migrations", async () => {
		const { result } = renderHook(() => useMigrationsCache({ profile }));

		await waitFor(() => {
			expect(result.current.cacheIsReady).toBe(true);
		});

		result.current.getMigrations();

		expect(getMock).toHaveBeenCalled();
	});
});
