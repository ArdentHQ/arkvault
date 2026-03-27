import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { IProfile, IContactAddressData, IContactAddressInput } from "./contracts";
import { env } from "@/utils/testing-library";
import { ContactAddressRepository } from "./contact-address.repository";
import { ContactAddress } from "./contact-address";

let profile: IProfile;
let repository: ContactAddressRepository;

describe("ContactAddressRepository", () => {
	beforeEach(async () => {
		profile = await env.profiles().create("test profile");
		repository = new ContactAddressRepository(profile);
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
	});

	it("should return all contact addresses", () => {
		expect(repository.all()).toEqual({});
	});

	it("should return undefined when calling first on empty repository", () => {
		expect(repository.first()).toBeUndefined();
	});

	it("should return undefined when calling last on empty repository", () => {
		expect(repository.last()).toBeUndefined();
	});

	it("should return all keys", () => {
		expect(repository.keys()).toEqual([]);
	});

	it("should return all values", () => {
		expect(repository.values()).toEqual([]);
	});

	it("should create a new contact address", () => {
		const input: IContactAddressInput = {
			address: "0x1234",
		};

		const result = repository.create(input);

		expect(result).toBeInstanceOf(ContactAddress);
		expect(result.id()).toBeDefined();
		expect(result.address()).toBe("0x1234");
	});

	it("should fill contact addresses from data", () => {
		const addresses: IContactAddressData[] = [
			{
				address: "0x1111",
				id: "1",
			},
			{
				address: "0x2222",
				id: "2",
			},
		];

		repository.fill(addresses);

		expect(repository.count()).toBe(2);
		expect(repository.findById("1").address()).toBe("0x1111");
		expect(repository.findById("2").address()).toBe("0x2222");
	});

	it("should find contact address by id", () => {
		const input: IContactAddressInput = {
			address: "0x1234",
		};

		const created = repository.create(input);

		expect(repository.findById(created.id()).id()).toBe(created.id());
	});

	it("should throw if it fails to find", () => {
		expect(() => repository.findById("invalid")).toThrow("Failed to find an address for [invalid].");
	});

	it("should search by address", () => {
		const input: IContactAddressInput = {
			address: "0x1234",
		};

		repository.create(input);

		const result = repository.findByAddress("0x1234");

		expect(result).toHaveLength(1);
		expect(result[0].address()).toBe("0x1234");
	});

	it("should return empty array when not found", () => {
		expect(repository.findByAddress("0x9999")).toEqual([]);
	});

	it("should return empty array when not found by coin", () => {
		expect(repository.findByCoin("unknown")).toEqual([]);
	});

	it("should check if contact address exists", () => {
		const input: IContactAddressInput = {
			address: "0x1234",
		};

		repository.create(input);

		expect(repository.exists({ address: "0x1234" })).toBe(true);
		expect(repository.exists({ address: "0x9999" })).toBe(false);
	});

	it("should update contact address", () => {
		const input: IContactAddressInput = {
			address: "0x1234",
		};

		const created = repository.create(input);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		repository.update(created.id(), { address: "0x5678" });

		expect(repository.findById(created.id()).address()).toBe("0x5678");
		expect(statusSpy).toHaveBeenCalled();
	});

	it("should not mark as dirty when update has no address", () => {
		const input: IContactAddressInput = {
			address: "0x1234",
		};

		const created = repository.create(input);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		repository.update(created.id(), { name: "test" });

		expect(statusSpy).not.toHaveBeenCalled();
	});

	it("should forget contact address", () => {
		const input: IContactAddressInput = {
			address: "0x1234",
		};

		const created = repository.create(input);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		repository.forget(created.id());

		expect(() => repository.findById(created.id())).toThrow();
		expect(statusSpy).toHaveBeenCalled();
	});

	it("should throw when forgetting non-existent id", () => {
		expect(() => repository.forget("invalid")).toThrow("Failed to find an address for [invalid].");
	});

	it("should flush all contact addresses", () => {
		const input: IContactAddressInput = {
			address: "0x1234",
		};

		repository.create(input);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		repository.flush();

		expect(repository.count()).toBe(0);
		expect(statusSpy).toHaveBeenCalled();
	});

	it("should return count of contact addresses", () => {
		expect(repository.count()).toBe(0);

		repository.create({ address: "0x1" });
		repository.create({ address: "0x2" });

		expect(repository.count()).toBe(2);
	});

	it("should return contact addresses as array", () => {
		const input: IContactAddressInput = {
			address: "0x1234",
		};

		const created = repository.create(input);

		const result = repository.toArray();

		expect(result).toHaveLength(1);
		expect(result[0].id).toBe(created.id());
		expect(result[0].address).toBe("0x1234");
	});

	it("should find by column with no matches", () => {
		repository.create({ address: "0x1234" });

		const result = repository.findByAddress("0x9999");

		expect(result).toHaveLength(0);
	});
});
