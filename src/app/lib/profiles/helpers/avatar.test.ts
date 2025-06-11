import { describe, it, expect } from "vitest";
import { Avatar } from "./avatar.js";

describe("Avatar", () => {
	it("should generate a random avatar", () => {
		const avatar = Avatar.make("test-seed");
		expect(avatar).toContain("<svg");
		expect(avatar).toContain('fill="#');
	});

	it("should generate the same avatar for the same seed", () => {
		const avatar1 = Avatar.make("test-seed");
		const avatar2 = Avatar.make("test-seed");
		expect(avatar1).toBe(avatar2);
	});

	it("should generate different avatars for different seeds", () => {
		const avatar1 = Avatar.make("test-seed-1");
		const avatar2 = Avatar.make("test-seed-2");
		expect(avatar1).not.toBe(avatar2);
	});
});
