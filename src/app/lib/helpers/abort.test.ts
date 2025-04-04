import { describe, it, expect } from 'vitest';
import { abort_if, abort_unless } from './abort';

describe("Abort", () => {
	it("should abort if the condition is met", () => {
		expect(() => abort_if(false, "Hello")).not.toThrow();
		expect(() => abort_if(true, "Hello")).toThrow();
	});

	it("should not abort unless the condition is met", () => {
		expect(() => abort_unless(true, "Hello")).not.toThrow();
		expect(() => abort_unless(false, "Hello")).toThrow();
	});
});
