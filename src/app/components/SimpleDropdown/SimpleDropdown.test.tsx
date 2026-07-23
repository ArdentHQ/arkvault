import { render, screen } from "@/utils/testing-library";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
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

	describe("DropdownToggle with function children", () => {
		it("should receive isOpen prop", async () => {
			const handler = vi.fn();
			render(
				<DropdownRoot>
					<DropdownToggle>{({ isOpen }) => { handler({ isOpen }); return "Toggle"; }}</DropdownToggle>
					<DropdownContent>Content</DropdownContent>
				</DropdownRoot>,
			);

			expect(handler).toHaveBeenCalledWith({ isOpen: false });

			await userEvent.click(screen.getByTestId("DropdownToggle"));
			expect(handler).toHaveBeenLastCalledWith({ isOpen: true });
		});
	});

	describe("DropdownListItem with close={false}", () => {
		it("should not close when close is false", async () => {
			render(
				<DropdownRoot>
					<DropdownToggle>Menu</DropdownToggle>
					<DropdownContent>
						<DropdownListItem close={false}>Persistent Item</DropdownListItem>
					</DropdownContent>
				</DropdownRoot>,
			);

			await userEvent.click(screen.getByTestId("DropdownToggle"));
			expect(screen.getByTestId("DropdownContent")).toBeInTheDocument();
			await userEvent.click(screen.getByText("Persistent Item"));
			expect(screen.getByTestId("DropdownContent")).toBeInTheDocument();
		});

		it("should close by default", async () => {
			render(
				<DropdownRoot>
					<DropdownToggle>Menu</DropdownToggle>
					<DropdownContent>
						<DropdownListItem>Default Item</DropdownListItem>
					</DropdownContent>
				</DropdownRoot>,
			);

			await userEvent.click(screen.getByTestId("DropdownToggle"));
			expect(screen.getByTestId("DropdownContent")).toBeInTheDocument();
			await userEvent.click(screen.getByText("Default Item"));
			expect(screen.queryByTestId("DropdownContent")).not.toBeInTheDocument();
		});
	});
});
