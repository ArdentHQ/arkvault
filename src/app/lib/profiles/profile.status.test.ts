import { describe, expect, it, beforeEach } from "vitest";
import { ProfileStatus } from "./profile.status";

describe("ProfileStatus", () => {
	let subject: ProfileStatus;

	beforeEach(() => {
		subject = new ProfileStatus();
	});

	it("should be pristine on construction", () => {
		expect(subject.isDirty()).toBe(false);
		expect(subject.isRestored()).toBe(false);
	});

	it("should mark as dirty", () => {
		subject.markAsDirty();
		expect(subject.isDirty()).toBe(true);
	});

	it("should mark as restored", () => {
		subject.markAsRestored();
		expect(subject.isRestored()).toBe(true);
	});

	it("should reset the status", () => {
		subject.markAsDirty();
		subject.markAsRestored();

		expect(subject.isDirty()).toBe(true);
		expect(subject.isRestored()).toBe(true);

		subject.reset();

		expect(subject.isDirty()).toBe(false);
		expect(subject.isRestored()).toBe(false);
	});

	it("should mark as clean", () => {
		subject.markAsDirty();
		expect(subject.isDirty()).toBe(true);

		subject.markAsClean();
		expect(subject.isDirty()).toBe(false);
	});
});
