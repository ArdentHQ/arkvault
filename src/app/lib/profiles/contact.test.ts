import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { IProfile, IContactData, IContactAddressInput } from "./contracts";
import { env } from "@/utils/testing-library";
import { Contact } from "./contact";

let profile: IProfile;

const baseData: IContactData = {
	addresses: [],
	id: "test-id",
	name: "Test Contact",
	starred: false,
};

describe("Contact", () => {
	beforeEach(async () => {
		profile = await env.profiles().create("test profile");
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
	});

	it("should return id", () => {
		const contact = new Contact({ ...baseData }, profile);

		expect(contact.id()).toBe("test-id");
	});

	it("should return name", () => {
		const contact = new Contact({ ...baseData }, profile);

		expect(contact.name()).toBe("Test Contact");
	});

	it("should return addresses", () => {
		const contact = new Contact({ ...baseData }, profile);

		expect(contact.addresses()).toBeDefined();
	});

	it("should return isStarred", () => {
		const contact = new Contact({ ...baseData }, profile);

		expect(contact.isStarred()).toBe(false);
	});

	it("should toggle starred and mark as dirty", () => {
		const contact = new Contact({ ...baseData }, profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		contact.toggleStarred();

		expect(contact.isStarred()).toBe(true);
		expect(statusSpy).toHaveBeenCalled();
	});

	it("should set avatar and mark as dirty", () => {
		const contact = new Contact({ ...baseData }, profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		contact.setAvatar("new-avatar");

		expect(contact.avatar()).toBe("new-avatar");
		expect(statusSpy).toHaveBeenCalled();
	});

	it("should set name and update avatar", () => {
		const contact = new Contact({ ...baseData }, profile);

		contact.setName("New Name");

		expect(contact.name()).toBe("New Name");
		expect(contact.avatar()).toBeDefined();
	});

	it("should set addresses", () => {
		const contact = new Contact({ ...baseData }, profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		const addresses: IContactAddressInput[] = [{ address: "0x1234" }];

		contact.setAddresses(addresses);

		expect(contact.addresses().count()).toBe(1);
		expect(statusSpy).toHaveBeenCalled();
	});

	it("should throw when setting addresses with empty array", () => {
		const contact = new Contact({ ...baseData }, profile);

		expect(() => contact.setAddresses([])).toThrow();
	});

	it("should throw when setting addresses with invalid data", () => {
		const contact = new Contact({ ...baseData }, profile);

		expect(() => contact.setAddresses([{}] as any)).toThrow();
	});

	it("should return avatar", () => {
		const contact = new Contact({ ...baseData }, profile);

		expect(contact.avatar()).toBeDefined();
		expect(typeof contact.avatar()).toBe("string");
	});

	it("should return toObject", () => {
		const contact = new Contact({ ...baseData }, profile);
		contact.setAddresses([{ address: "0x1234" }]);

		const result = contact.toObject();

		expect(result.id).toBe("test-id");
		expect(result.name).toBe("Test Contact");
		expect(result.starred).toBe(false);
		expect(result.addresses).toHaveLength(1);
	});
});
