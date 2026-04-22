import React from "react";
import { render, screen } from "@/utils/testing-library";
import { VoteTransactionType, getVoteCategory } from "./VoteTransactionType";

describe("VoteTransactionType", () => {
	it("should render vote category", () => {
		const votes = [{ wallet: { alias: () => "validator1" } }];

		render(<VoteTransactionType votes={votes} unvotes={[]} />);

		expect(screen.getByText("validator1")).toBeInTheDocument();
	});

	it("should render unvote category", () => {
		const unvotes = [{ wallet: { alias: () => "validator1" } }];

		render(<VoteTransactionType votes={[]} unvotes={unvotes} />);

		expect(screen.getByText("validator1")).toBeInTheDocument();
	});

	it("should render swap category with both votes and unvotes", () => {
		const votes = [{ wallet: { alias: () => "validator1" } }];
		const unvotes = [{ wallet: { alias: () => "validator2" } }];

		render(<VoteTransactionType votes={votes} unvotes={unvotes} />);

		expect(screen.getByText("validator1")).toBeInTheDocument();
	});

	it("should render with showValidator option", () => {
		const votes = [{ wallet: { alias: () => "validator1" } }];

		render(<VoteTransactionType votes={votes} unvotes={[]} showValidator={true} />);

		expect(screen.getByText("validator1")).toBeInTheDocument();
	});
});

describe("getVoteCategory", () => {
	it("should return swap when both votes and unvotes are present", () => {
		expect(getVoteCategory([{}], [{}])).toBe("swap");
	});

	it("should return vote when only votes are present", () => {
		expect(getVoteCategory([{}], [])).toBe("vote");
	});

	it("should return unvote when only unvotes are present", () => {
		expect(getVoteCategory([], [{}])).toBe("unvote");
	});

	it("should return unvote when both are empty", () => {
		expect(getVoteCategory([], [])).toBe("unvote");
	});
});
