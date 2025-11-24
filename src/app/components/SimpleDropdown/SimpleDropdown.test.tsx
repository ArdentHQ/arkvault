import { render, screen } from "@/utils/testing-library";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { DropdownRoot, DropdownToggle, DropdownContent, DropdownListItem } from "./";

describe("SimpleDropdown", () => {
	it("should open when toggle is clicked", async () => {
		render(
			<DropdownRoot>
				<DropdownToggle>Menu</DropdownToggle>
				<DropdownContent>
					<DropdownListItem>Item</DropdownListItem>
				</DropdownContent>
			</DropdownRoot>,
		);

		expect(screen.queryByTestId("DropdownContent")).not.toBeInTheDocument();
		await userEvent.click(screen.getByTestId("DropdownToggle"));
		expect(screen.getByTestId("DropdownContent")).toBeInTheDocument();
	});

	it("should close when clicked outside", async () => {
		render(
			<div>
				<p data-testid="outside">outside</p>
				<DropdownRoot>
					<DropdownToggle>Menu</DropdownToggle>
					<DropdownContent>
						<DropdownListItem>Inside</DropdownListItem>
					</DropdownContent>
				</DropdownRoot>
			</div>,
		);

		await userEvent.click(screen.getByTestId("DropdownToggle"));
		expect(screen.getByTestId("DropdownContent")).toBeInTheDocument();
		await userEvent.click(screen.getByTestId("outside"));
		expect(screen.queryByTestId("DropdownContent")).not.toBeInTheDocument();
	});

	it("should close when escape key is pressed", async () => {
		render(
			<DropdownRoot>
				<DropdownToggle>Menu</DropdownToggle>
				<DropdownContent>
					<DropdownListItem>Inside</DropdownListItem>
				</DropdownContent>
			</DropdownRoot>,
		);

		await userEvent.click(screen.getByTestId("DropdownToggle"));
		expect(screen.getByTestId("DropdownContent")).toBeInTheDocument();
		await userEvent.keyboard("{Escape}");
		expect(screen.queryByTestId("DropdownContent")).not.toBeInTheDocument();
	});
});
