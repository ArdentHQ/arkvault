import userEvent from "@testing-library/user-event";
import React from "react";

import { Dropdown, DropdownOptionGroup } from "@/app/components/Dropdown";
import { clickOutsideHandler } from "@/app/hooks/click-outside";
import { fireEvent, render, screen } from "@/utils/testing-library";

const options = [
	{ label: "Option 1", value: "1" },
	{ label: "Option 2", value: "2" },
	{ disabled: true, label: "Option 3", value: "3" },
];

describe("Dropdown", () => {
	it("should render", () => {
		const { container } = render(<Dropdown />);

		expect(container).toMatchSnapshot();
	});

	it("should render a small one", () => {
		const { container } = render(<Dropdown toggleSize="sm" />);

		expect(container).toMatchSnapshot();
	});

	it("should render a large one", () => {
		const { container } = render(<Dropdown toggleSize="lg" />);

		expect(container).toMatchSnapshot();
	});

	it("should render toggle icon", () => {
		const { container } = render(<Dropdown />);

		expect(container).toMatchSnapshot();
		expect(screen.getByTestId("dropdown__toggle")).toBeInTheDocument();
	});

	it("should render with options", () => {
		const { container } = render(<Dropdown options={options} />);

		expect(container).toMatchSnapshot();
	});

	it("should render with custom icon classname", async () => {
		const optionsWithIcon = [{ icon: "trash", iconClassName: "custom-class-name", label: "Option 1", value: "1" }];

		const { container } = render(<Dropdown options={optionsWithIcon} />);

		const dropdown = screen.getByTestId("dropdown__toggle");

		await userEvent.click(dropdown);

		expect(container).toContainHTML("custom-class-name");
	});

	it("should render with custom icon classname from a function", async () => {
		const optionsWithIcon = [
			{ icon: "trash", iconClassName: (option) => option.label + "--class", label: "option-1", value: "1" },
		];

		const { container } = render(<Dropdown options={optionsWithIcon} />);

		const dropdown = screen.getByTestId("dropdown__toggle");

		await userEvent.click(dropdown);

		expect(container).toContainHTML("option-1--class");
	});

	it("should render with secondary label", async () => {
		const optionsWithIcon = [
			{
				icon: "trash",
				iconClassName: (option) => option.label + "--class",
				label: "option-1",
				secondaryLabel: () => "1",
				value: "1",
			},
		];

		const { container } = render(<Dropdown options={optionsWithIcon} />);

		const dropdown = screen.getByTestId("dropdown__toggle");

		await userEvent.click(dropdown);

		expect(container).toContainHTML("option-1--class");
	});

	it("should open dropdown options on icon click", async () => {
		render(<Dropdown options={options} />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();
	});

	it("shouldn't open dropdown by disableToggle param on icon click", async () => {
		render(<Dropdown options={options} disableToggle={true} />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(screen.queryByTestId("dropdown__content")).not.toBeInTheDocument();
	});

	it("should select option by click", async () => {
		const onSelect = vi.fn();
		render(<Dropdown options={options} onSelect={onSelect} />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		const firstOption = screen.getByTestId("dropdown__option--0");

		expect(firstOption).toBeInTheDocument();

		await userEvent.click(firstOption);

		expect(onSelect).toHaveBeenCalledWith({ label: "Option 1", value: "1" });
	});

	it("should do nothing by click on disable option", async () => {
		const onSelect = vi.fn();
		render(<Dropdown options={options} onSelect={onSelect} />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		const thirdOption = screen.getByTestId("dropdown__option--2");

		expect(thirdOption).toBeInTheDocument();

		await userEvent.click(thirdOption);

		expect(onSelect).not.toHaveBeenCalledWith();
	});

	it("should select option with enter key", async () => {
		const onSelect = vi.fn();
		render(<Dropdown options={options} onSelect={onSelect} />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		await userEvent.tab();
		await userEvent.keyboard("{enter}");

		expect(onSelect).toHaveBeenCalledWith({ label: "Option 1", value: "1" });
	});

	it("should select option with space key", async () => {
		const onSelect = vi.fn();
		render(<Dropdown options={options} onSelect={onSelect} />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		await userEvent.tab();
		await userEvent.keyboard("{Spacebar}");

		expect(onSelect).toHaveBeenCalledWith({ label: "Option 1", value: "1" });
	});

	it("should ignore triggering onSelect callback if not exists", async () => {
		render(<Dropdown options={options} />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		const firstOption = screen.getByTestId("dropdown__option--0");

		expect(firstOption).toBeInTheDocument();

		await userEvent.click(firstOption);

		expect(screen.queryAllByRole("listbox")).toHaveLength(0);
	});

	it("should close dropdown content when click outside", async () => {
		render(
			<div>
				<div data-testid="dropdown__outside" className="mt-16">
					outside elememt to be clicked
				</div>
				<div className="m-16">
					<Dropdown options={options} />
				</div>
			</div>,
		);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		const firstOption = screen.getByTestId("dropdown__option--0");

		expect(firstOption).toBeInTheDocument();

		const outsideElement = screen.getByTestId("dropdown__outside");

		expect(outsideElement).toBeInTheDocument();

		await userEvent.click(outsideElement);

		expect(screen.queryAllByRole("listbox")).toHaveLength(0);
	});

	it("should close dropdown with escape key", async () => {
		render(<Dropdown options={options} />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		await userEvent.keyboard("{esc}");

		expect(screen.queryAllByRole("listbox")).toHaveLength(0);
	});

	it("should render with custom toggle content as react element", () => {
		const { container } = render(<Dropdown toggleContent={<div>custom toggle</div>} />);

		expect(container).toMatchSnapshot();
	});

	it("should render with custom toggle content as function", () => {
		const { container } = render(
			<Dropdown toggleContent={(isOpen: boolean) => <div>Dropdown is open: {isOpen}</div>} />,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render a bottom position", async () => {
		const { container } = render(<Dropdown options={options} position="bottom" />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(container).toMatchSnapshot();
	});

	it("should render a bottom-left position", async () => {
		const { container } = render(<Dropdown options={options} position="bottom-left" />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(container).toMatchSnapshot();
	});

	it("should render a left position", async () => {
		const { container } = render(<Dropdown options={options} position="left" />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(container).toMatchSnapshot();
	});

	it("should render a top-left position", async () => {
		const { container } = render(<Dropdown options={options} position="top-left" />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(container).toMatchSnapshot();
	});

	it("should render a top", async () => {
		const { container } = render(<Dropdown options={options} position="top" />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(container).toMatchSnapshot();
	});

	it("should render a top-right", async () => {
		const { container } = render(<Dropdown options={options} position="top-right" />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(container).toMatchSnapshot();
	});

	it("should render dropdown group options with divider, icon and secondary label", async () => {
		const primaryOptions: DropdownOptionGroup = {
			hasDivider: false,
			key: "primary",
			options: [
				{
					label: "Primary Options 1.1",
					value: "value 1.1",
				},
				{
					label: "Primary Options 1.2",
					value: "value 1.2",
				},
			],
			title: "Primary Options 1",
		};

		const secondaryOptions: DropdownOptionGroup = {
			hasDivider: true,
			key: "secondary",
			options: [
				{
					icon: "icon-1",
					iconPosition: "end",
					label: "Secondary Options 1.1",
					value: "value 1.1",
				},
				{
					icon: "icon-2",
					iconPosition: "start",
					label: "Secondary Options 1.2",
					secondaryLabel: "secondary label",
					value: "value 1.2",
				},
			],
		};
		const { container } = render(<Dropdown options={[primaryOptions, secondaryOptions]} position="top-right" />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(container).toMatchSnapshot();
	});

	it("should render without options one", async () => {
		const primaryOptions: DropdownOptionGroup = {
			key: "primary",
			options: [],
			title: "Primary Options 1",
		};

		const secondaryOptions: DropdownOptionGroup = {
			hasDivider: true,
			key: "secondary",
			options: [],
			title: "Secondary Options 1",
		};
		const { container } = render(<Dropdown options={[primaryOptions, secondaryOptions]} position="top-right" />);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(container).toMatchSnapshot();
	});
});

describe("Dropdown ClickOutside Hook", () => {
	it("should not call callback if clicked on target element", async () => {
		const element = document;
		const reference = { current: element };
		const callback = vi.fn();
		clickOutsideHandler(reference, callback);

		await userEvent.click(element.body);

		expect(callback).not.toHaveBeenCalled();
	});

	it("should call callback if clicked outside target element", async () => {
		const div = document.createElement("div");
		const reference = { current: div };

		const callback = vi.fn();
		clickOutsideHandler(reference, callback);

		await userEvent.click(document.body);

		expect(callback).toHaveBeenCalledWith();
	});
});

describe("Dropdown positioning", () => {
	it("should render content below toggle", async () => {
		const documentClientHeightSpy = vi.spyOn(document.body, "clientHeight", "get").mockReturnValue(50);
		const getComputedStyleSpy = vi.spyOn(window, "getComputedStyle").mockReturnValueOnce({ marginTop: "10px" });

		render(
			<Dropdown>
				<span>hello</span>
			</Dropdown>,
		);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(screen.getByTestId("dropdown__content")).toHaveAttribute("style", "opacity: 1;");

		documentClientHeightSpy.mockRestore();
		getComputedStyleSpy.mockRestore();
	});

	it("should render content below toggle and reduce its height", async () => {
		const getBoundingClientRectSpy = vi
			.spyOn(Element.prototype, "getBoundingClientRect")
			.mockReturnValue({ height: 90, top: 0 });

		const toggleHeightSpy = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValueOnce(10);
		const dropdownHeightSpy = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(100);
		const documentClientHeightSpy = vi.spyOn(document.body, "clientHeight", "get").mockReturnValue(190);
		const elementClientHeightSpy = vi.spyOn(Element.prototype, "clientHeight", "get").mockReturnValue(100);

		render(
			<Dropdown>
				<span>hello</span>
			</Dropdown>,
		);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(screen.getByTestId("dropdown__content")).toHaveAttribute(
			"style",
			"opacity: 1; height: 60px; overflow-y: scroll;",
		);

		getBoundingClientRectSpy.mockRestore();
		toggleHeightSpy.mockRestore();
		dropdownHeightSpy.mockRestore();
		documentClientHeightSpy.mockRestore();
		elementClientHeightSpy.mockRestore();
	});

	it("should render content above toggle and apply a negative margin", async () => {
		const getBoundingClientRectSpy = vi
			.spyOn(Element.prototype, "getBoundingClientRect")
			.mockReturnValue({ height: 50, top: 100 });

		const offsetHeightSpy = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(50);
		const documentClientHeightSpy = vi.spyOn(document.body, "clientHeight", "get").mockReturnValue(200);

		render(
			<Dropdown>
				<span>hello</span>
			</Dropdown>,
		);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		fireEvent.resize(window);

		expect(screen.getByTestId("dropdown__content")).toHaveAttribute("style", "opacity: 1; margin-top: -100px;");

		getBoundingClientRectSpy.mockRestore();
		offsetHeightSpy.mockRestore();
		documentClientHeightSpy.mockRestore();
	});

	it("shouldn't do resize if no ref found", async () => {
		const reference = { current: undefined };
		Object.defineProperty(reference, "current", {
			get: vi.fn(() => {}),
			set: vi.fn(() => {}),
		});
		const useReferenceSpy = vi.spyOn(React, "useRef").mockReturnValue(reference);
		const getBoundingClientRectSpy = vi.spyOn(Element.prototype, "getBoundingClientRect");
		const documentClientHeightSpy = vi.spyOn(document.body, "clientHeight", "get").mockReturnValue(100);

		render(
			<Dropdown>
				<span>hello</span>
			</Dropdown>,
		);
		const toggle = screen.getByTestId("dropdown__toggle");

		await userEvent.click(toggle);

		expect(getBoundingClientRectSpy).not.toHaveBeenCalled();

		getBoundingClientRectSpy.mockRestore();
		documentClientHeightSpy.mockRestore();
		useReferenceSpy.mockRestore();
	});
});
