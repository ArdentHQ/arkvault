import { describe, it, expect } from "vitest";
import { Paginator } from "./paginator";
import { MetaPagination } from "./client.contract";

describe("Paginator", () => {
	const newPaginator = (data: T[], pagination: MetaPagination) => new (class extends Paginator { })(data, pagination)

	it("should return correct items", () => {
		const data = [1, 2, 3];
		const pagination = { last: 3, next: 2, prev: undefined, self: 1 };
		const paginator = newPaginator(data, pagination);
		expect(paginator.items()).toEqual([1, 2, 3]);
	});

	it("should return the first item", () => {
		const data = [10, 20, 30];
		const pagination = { last: 3, next: 2, prev: undefined, self: 1 };
		const paginator = newPaginator(data, pagination);
		expect(paginator.first()).toBe(10);
	});

	it("should return the last item", () => {
		const data = [100, 200, 300];
		const pagination = { last: 3, next: 2, prev: undefined, self: 1 };
		const paginator = newPaginator(data, pagination);
		expect(paginator.last()).toBe(300);
	});

	it("should return the previous page cursor", () => {
		const data = ["a", "b"];
		const pagination = { last: 3, next: 2, prev: 0, self: 1 };
		const paginator = newPaginator(data, pagination);
		expect(paginator.previousPage()).toBe(0);
	});

	it("should return the current page cursor", () => {
		const data = ["x", "y"];
		const pagination = { last: 4, next: 3, prev: 1, self: 2 };
		const paginator = newPaginator(data, pagination);
		expect(paginator.currentPage()).toBe(2);
	});

	it("should return the next page cursor", () => {
		const data = ["foo", "bar"];
		const pagination = { last: 4, next: 3, prev: 1, self: 2 };
		const paginator = newPaginator(data, pagination);
		expect(paginator.nextPage()).toBe(3);
	});

	it("should return the last page cursor", () => {
		const data = ["alpha", "beta"];
		const pagination = { last: 5, next: undefined, prev: 2, self: 3 };
		const paginator = newPaginator(data, pagination);
		expect(paginator.lastPage()).toBe(5);
	});

	it("should correctly identify if there are more pages", () => {
		const dataWithNext = [1];
		const paginationWithNext = { last: 5, next: 3, prev: 1, self: 2 };
		const paginatorWithNext = newPaginator(dataWithNext, paginationWithNext);
		expect(paginatorWithNext.hasMorePages()).toBe(true);

		const dataWithoutNext = [1];
		const paginationWithoutNext = { last: 5, next: undefined, prev: 4, self: 5 };
		const paginatorWithoutNext = newPaginator(dataWithoutNext, paginationWithoutNext);
		expect(paginatorWithoutNext.hasMorePages()).toBe(false);
	});

	it("should correctly identify if the paginator is empty", () => {
		const emptyData: string[] = [];
		const emptyPagination = { last: undefined, next: undefined, prev: undefined, self: undefined };
		const emptyPaginator = newPaginator(emptyData, emptyPagination);
		expect(emptyPaginator.isEmpty()).toBe(true);

		const populatedData = ["test"];
		const populatedPagination = { last: 2, next: 2, prev: undefined, self: 1 };
		const populatedPaginator = newPaginator(populatedData, populatedPagination);
		expect(populatedPaginator.isEmpty()).toBe(false);
	});

	it("should correctly identify if the paginator is not empty", () => {
		const emptyData: number[] = [];
		const emptyPagination = { last: undefined, next: undefined, prev: undefined, self: undefined };
		const emptyPaginator = newPaginator(emptyData, emptyPagination);
		expect(emptyPaginator.isNotEmpty()).toBe(false);

		const populatedData = ["hello", "world"];
		const populatedPagination = { last: 2, next: 2, prev: undefined, self: 1 };
		const populatedPaginator = newPaginator(populatedData, populatedPagination);
		expect(populatedPaginator.isNotEmpty()).toBe(true);
	});

	it("should transform data using the callback function", () => {
		const data = [1, 2, 3];
		const pagination = { last: 3, next: 2, prev: undefined, self: 1 };
		const paginator = newPaginator(data, pagination);
		paginator.transform((item: number) => item * 2);
		expect(paginator.items()).toEqual([2, 4, 6]);
	});

	it("should return the full pagination object", () => {
		const data = [1];
		const pagination = { last: 5, next: 3, prev: 1, self: 2 };
		const paginator = newPaginator(data, pagination);
		expect(paginator.getPagination()).toEqual(pagination);
	});
});
