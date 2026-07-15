import React from "react";
import { AddressMobileItem, AddressTableLoaderOverlay, AmountWrapper } from "./LedgerScanStep.blocks";
import { render, screen } from "@/utils/testing-library";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

const sampleAddress = "ASuusXSW9kfWnicScSgUTjttP6T9GQ3kqT";
const sampleBalance = 1000;
const sampleCoin = "ARK";

describe("LedgerMobileItem", () => {
	it("should render", () => {
		render(
			<AddressMobileItem
				isLoading={false}
				address={sampleAddress}
				balance={sampleBalance}
				coin={sampleCoin}
				isSelected={false}
				handleClick={() => {}}
			/>,
		);

		expect(screen.getByTestId("LedgerMobileItem__wrapper")).toBeInTheDocument();
	});

	it("should render skeleton", () => {
		render(
			<AddressMobileItem
				isLoading={true}
				address={sampleAddress}
				balance={sampleBalance}
				coin={sampleCoin}
				isSelected={false}
				handleClick={() => {}}
			/>,
		);

		expect(screen.getByTestId("AddressMobileItem__skeleton")).toBeInTheDocument();
	});

	it("should render selected", () => {
		render(
			<AddressMobileItem
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

	it("should render disabled", () => {
		render(
			<AddressMobileItem
				isDisabled={true}
				isLoading={false}
				address={sampleAddress}
				balance={sampleBalance}
				coin={sampleCoin}
				isSelected={true}
				handleClick={() => {}}
			/>,
		);

		expect(screen.getByTestId("LedgerMobileItem__checkbox")).toBeDisabled();
	});

	it("should render additional loader overlay for index greater than zero", () => {
		render(
			<AddressMobileItem
				isLoading={true}
				address={sampleAddress}
				balance={sampleBalance}
				coin={sampleCoin}
				isSelected={false}
				handleClick={() => {}}
				index={1}
			/>,
		);

		expect(screen.getByTestId("AddressMobileItem__skeleton")).toBeInTheDocument();
	});

	it("should call handleClick", async () => {
		const handleClick = vi.fn();

		render(
			<AddressMobileItem
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

describe("AddressTableLoaderOverlay", () => {
	it("should render overlay without children", () => {
		render(<AddressTableLoaderOverlay />);

		expect(screen.queryAllByTestId("AddressMobileItem__skeleton")).toHaveLength(0);
	});

	it("should render overlay with children", () => {
		render(
			<AddressTableLoaderOverlay>
				<span>Loading...</span>
			</AddressTableLoaderOverlay>,
		);

		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});
});

describe("AmountWrapper", () => {
	it("should render children when not loading", () => {
		render(
			<AmountWrapper isLoading={false}>
				<span>100.00 ARK</span>
			</AmountWrapper>,
		);

		expect(screen.getByText("100.00 ARK")).toBeInTheDocument();
	});

	it("should render skeleton when loading", () => {
		render(
			<AmountWrapper isLoading={true}>
				<span>100.00 ARK</span>
			</AmountWrapper>,
		);

		expect(screen.getByTestId("LedgerScanStep__amount-skeleton")).toBeInTheDocument();
	});
});
