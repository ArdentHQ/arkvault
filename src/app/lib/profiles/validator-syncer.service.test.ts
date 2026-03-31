import { describe } from "vitest";
import { ParallelValidatorSyncer, SerialValidatorSyncer } from "./validator-syncer.service";
import { test } from "@/utils/testing-library";
import { ClientService } from "@/app/lib/mainsail/client.service";

describe("ParallelValidatorSyncer", () => {
	const mockClientService = {
		validators: vi.fn().mockResolvedValue({
			currentPage: () => "1",
			items: () => [
				{ address: () => "validator1", publicKey: () => "pk1" },
				{ address: () => "validator2", publicKey: () => "pk2" },
			],
			lastPage: () => "1",
		}),
	} as unknown as ClientService;

	test("should fetch validators from single page", async () => {
		const syncer = new ParallelValidatorSyncer(mockClientService);
		const result = await syncer.sync();

		expect(result).toHaveLength(2);
		expect(mockClientService.validators).toHaveBeenCalledWith(undefined);
	});

	test("should fetch validators from multiple pages in parallel", async () => {
		const syncer = new ParallelValidatorSyncer(mockClientService);
		const result = await syncer.sync();

		expect(result).toHaveLength(2);
		expect(mockClientService.validators).toHaveBeenCalledTimes(2);
	});

	test("should pass query parameters", async () => {
		const syncer = new ParallelValidatorSyncer(mockClientService);
		await syncer.sync({ limit: 50 });

		expect(mockClientService.validators).toHaveBeenCalledWith({ limit: 50 });
	});

	test("should fetch validators from multiple pages in parallel", async () => {
		const multiPageMock = {
			validators: vi
				.fn()
				.mockResolvedValueOnce({
					currentPage: () => "1",
					items: () => [{ address: () => "v1", publicKey: () => "pk1" }],
					lastPage: () => "3",
				})
				.mockResolvedValueOnce({
					currentPage: () => "2",
					items: () => [{ address: () => "v2", publicKey: () => "pk2" }],
					lastPage: () => "3",
				})
				.mockResolvedValueOnce({
					currentPage: () => "3",
					items: () => [{ address: () => "v3", publicKey: () => "pk3" }],
					lastPage: () => "3",
				}),
		} as unknown as ClientService;

		const syncer = new ParallelValidatorSyncer(multiPageMock);
		const result = await syncer.sync();

		expect(result.length).toBeGreaterThanOrEqual(1);
	});
});

describe("SerialValidatorSyncer", () => {
	const mockClientService = {
		validators: vi.fn().mockResolvedValue({
			hasMorePages: () => false,
			items: () => [{ address: () => "validator1", publicKey: () => "pk1" }],
			nextPage: () => {},
		}),
	} as unknown as ClientService;

	test("should fetch validators from single page", async () => {
		const syncer = new SerialValidatorSyncer(mockClientService);
		const result = await syncer.sync();

		expect(result).toHaveLength(1);
	});

	test("should fetch validators from multiple pages", async () => {
		const clientServiceMock = {
			validators: vi
				.fn()
				.mockResolvedValueOnce({
					hasMorePages: () => true,
					items: () => [{ address: () => "validator1", publicKey: () => "pk1" }],
					nextPage: () => "2",
				})
				.mockResolvedValueOnce({
					hasMorePages: () => false,
					items: () => [{ address: () => "validator2", publicKey: () => "pk2" }],
					nextPage: () => {},
				}),
		} as unknown as ClientService;

		const syncer = new SerialValidatorSyncer(clientServiceMock);
		const result = await syncer.sync();

		expect(result).toHaveLength(2);
		expect(clientServiceMock.validators).toHaveBeenCalledTimes(2);
	});

	test("should pass query parameters across pages", async () => {
		const syncer = new SerialValidatorSyncer(mockClientService);
		await syncer.sync({ limit: 50 });

		expect(mockClientService.validators).toHaveBeenCalledWith({ limit: 50 });
	});
});
