import React from "react";
import { LedgerMobileItem } from "./LedgerScanStep.blocks";
import { render, screen } from "@/utils/testing-library";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

const sampleAddress = "ASuusXSW9kfWnicScSgUTjttP6T9GQ3kqT";
const sampleBalance = 1000;
const sampleCoin = "ARK";

describe("LedgerMobileItem", () => {
	it("should render", () => {
		const { container } = render(
			<LedgerMobileItem
				isLoading={false}
				address={sampleAddress}
				balance={sampleBalance}
				coin={sampleCoin}
				isSelected={false}
				handleClick={() => {}}
			/>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render skeleton", () => {
		render(
			<LedgerMobileItem
				isLoading={true}
				address={sampleAddress}
				balance={sampleBalance}
				coin={sampleCoin}
				isSelected={false}
				handleClick={() => {}}
			/>,
		);

		expect(screen.getByTestId("LedgerMobileItem__skeleton")).toBeInTheDocument();
	});

	it("should render selected", () => {
		render(
			<LedgerMobileItem
				isLoading={false}
				address={sampleAddress}
				balance={sampleBalance}
				coin={sampleCoin}
				isSelected={true}
				handleClick={() => {}}
			/>,
		);

		expect(screen.getByTestId("LedgerMobileItem__checkbox")).toHaveAttribute("checked");
	});

	it("should call handleClick", async () => {
		const handleClick = vi.fn();

		render(
			<LedgerMobileItem
				isLoading={false}
				address={sampleAddress}
				balance={sampleBalance}
				coin={sampleCoin}
				isSelected={false}
				handleClick={handleClick}
			/>,
		);

		expect(screen.getByTestId("LedgerMobileItem__checkbox")).not.toHaveAttribute("checked");

		await userEvent.click(screen.getByTestId("LedgerMobileItem__checkbox"));
		expect(handleClick).toHaveBeenCalled();
	});
});
