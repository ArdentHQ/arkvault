import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { IProfile, IContactData, IContactAddressInput } from "./contracts";
import { env } from "@/utils/testing-library";
import { ContactRepository } from "./contact.repository";

let profile: IProfile;
let repository: ContactRepository;

describe("ContactRepository", () => {
	const contactName = "test contact";
	beforeEach(async () => {
		profile = await env.profiles().create("test profile");
		repository = new ContactRepository(profile);
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
	});

	it("should return all contacts", () => {
		expect(repository.all()).toEqual({});
	});

	it("should return undefined when calling first and the repository is empty", () => {
		expect(repository.first()).toBeUndefined();
	});

	it("should return undefined when calling last and the respository is empty", () => {
		expect(repository.last()).toBeUndefined();
	});

	it("should return all keys", () => {
		expect(repository.keys()).toEqual([]);
	});

	it("should return all values", () => {
		expect(repository.values()).toEqual([]);
	});

	it("should create a new contact", () => {
		const addresses: IContactAddressInput[] = [{ address: "0x1234" }];

		const result = repository.create(contactName, addresses);

		expect(result).toBeDefined();
		expect(result.name()).toBe(contactName);
		expect(result.addresses().count()).toBe(1);
	});

	it("should throw when creating contact with duplicate name", () => {
		const addresses: IContactAddressInput[] = [{ address: "0x1234" }];

		repository.create("test", addresses);

		expect(() => repository.create("test", addresses)).toThrow("The contact [test] already exists.");
	});

	it("should find contact by id", () => {
		const addresses: IContactAddressInput[] = [{ address: "0x1234" }];

		const created = repository.create(contactName, addresses);

		expect(repository.findById(created.id()).id()).toBe(created.id());
	});

	it("should throw when finding non existent id", () => {
		expect(() => repository.findById("invalid")).toThrow("Failed to find a contact for [invalid].");
	});

	it("should update contact name", () => {
		const addresses: IContactAddressInput[] = [{ address: "0x1234" }];

		const created = repository.create(contactName, addresses);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		repository.update(created.id(), { name: "updated name" });

		expect(repository.findById(created.id()).name()).toBe("updated name");
		expect(statusSpy).toHaveBeenCalled();
	});

	it("should update contact address", () => {
		const addresses: IContactAddressInput[] = [{ address: "0x1234" }];

		const created = repository.create(contactName, addresses);

		repository.update(created.id(), { addresses: [{ address: "0x5678" }] });

		expect(repository.findById(created.id()).addresses().count()).toBe(1);
		expect(repository.findById(created.id()).addresses().first().address()).toBe("0x5678");
	});

	it("should throw when updating with duplicate name", () => {
		const addresses: IContactAddressInput[] = [{ address: "0x1234" }];

		const created1 = repository.create("contact 1", addresses);
		repository.create("contact 2", addresses);

		expect(() => repository.update(created1.id(), { name: "contact 2" })).toThrow(
			"The contact [contact 2] already exists.",
		);
	});

	it("should throw when updating with duplicate name case insensitive", () => {
		const addresses: IContactAddressInput[] = [{ address: "0x1234" }];

		const created1 = repository.create("contact 1", addresses);
		repository.create("Contact 2", addresses);

		expect(() => repository.update(created1.id(), { name: "CONTACT 2" })).toThrow(
			"The contact [CONTACT 2] already exists.",
		);
	});

	it("should not throw when updating with a unique name among multiple contacts", () => {
		const addresses: IContactAddressInput[] = [{ address: "0x1234" }];

		const created1 = repository.create("contact 1", addresses);
		repository.create("contact 2", addresses);

		expect(() => repository.update(created1.id(), { name: "unique name" })).not.toThrow();
		expect(repository.findById(created1.id()).name()).toBe("unique name");
	});

	it("should forget contact", () => {
		const addresses: IContactAddressInput[] = [{ address: "0x1234" }];

		const created = repository.create(contactName, addresses);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		repository.forget(created.id());

		expect(() => repository.findById(created.id())).toThrow();
		expect(statusSpy).toHaveBeenCalled();
	});

	it("should throw when forgetting non existent id", () => {
		expect(() => repository.forget("invalid")).toThrow("Failed to find a contact for [invalid].");
	});

	it("should flush all contacts", () => {
		const addresses: IContactAddressInput[] = [{ address: "0x1234" }];

		repository.create(contactName, addresses);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		repository.flush();

		expect(repository.count()).toBe(0);
		expect(statusSpy).toHaveBeenCalled();
	});

	it("should return count of contacts", () => {
		expect(repository.count()).toBe(0);

		repository.create("contact 1", [{ address: "0x1" }]);
		repository.create("contact 2", [{ address: "0x2" }]);

		expect(repository.count()).toBe(2);
	});

	it("should find contacts by address", () => {
		repository.create("contact 1", [{ address: "0x1234" }]);

		const result = repository.findByAddress("0x1234");

		expect(result).toHaveLength(1);
		expect(result[0].name()).toBe("contact 1");
	});

	it("should return empty array when finding by non existent address", () => {
		expect(repository.findByAddress("0x9999")).toEqual([]);
	});

	it("should return empty array when finding by non existent coin", () => {
		expect(repository.findByCoin("unknown")).toEqual([]);
	});

	it("#toObject", () => {
		const addresses: IContactAddressInput[] = [{ address: "0x1234" }];

		const created = repository.create(contactName, addresses);

		const result = repository.toObject();

		expect(result).toHaveProperty(created.id());
		expect(result[created.id()].name).toBe(contactName);
	});

	it("should fill contacts from data", () => {
		const contactData: Record<string, IContactData> = {
			"1": {
				addresses: [{ address: "0x1111", id: "0x2" }],
				id: "1",
				name: "contact 1",
				starred: false,
			},
		};

		repository.fill(contactData);

		expect(repository.count()).toBe(1);
		expect(repository.findById("1").name()).toBe("contact 1");
	});
});
