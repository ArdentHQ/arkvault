import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { IProfile, IContactAddressData } from "./contracts";
import { env } from "@/utils/testing-library";
import { ContactAddress } from "./contact-address";

let profile: IProfile;

describe("ContactAddress", () => {
	beforeEach(async () => {
		profile = await env.profiles().create("test profile");
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
	});

	it("should return id", () => {
		const data: IContactAddressData = {
			id: "test-id",
			address: "0x1234",
		};

		const contactAddress = new ContactAddress(data, profile);

		expect(contactAddress.id()).toBe("test-id");
	});

	it("should return address", () => {
		const data: IContactAddressData = {
			id: "test-id",
			address: "0x1234",
		};

		const contactAddress = new ContactAddress(data, profile);

		expect(contactAddress.address()).toBe("0x1234");
	});

	it("should return avatar", () => {
		const data: IContactAddressData = {
			id: "test-id",
			address: "0x1234",
		};

		const contactAddress = new ContactAddress(data, profile);

		expect(contactAddress.avatar()).toBeDefined();
		expect(typeof contactAddress.avatar()).toBe("string");
	});

	it("#toObject", () => {
		const data: IContactAddressData = {
			id: "test-id",
			address: "0x1234",
		};

		const contactAddress = new ContactAddress(data, profile);
		const result = contactAddress.toObject();

		expect(result).toEqual({
			id: "test-id",
			address: "0x1234",
		});
	});

	it("should set address and mark as dirty", () => {
		const data: IContactAddressData = {
			id: "test-id",
			address: "0x1234",
		};

		const contactAddress = new ContactAddress(data, profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		contactAddress.setAddress("0x5678");

		expect(contactAddress.address()).toBe("0x5678");
		expect(statusSpy).toHaveBeenCalled();
	});
});
