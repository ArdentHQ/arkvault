import userEvent from "@testing-library/user-event";
import React, { useState } from "react";

import Tippy from "@tippyjs/react";
import { Select } from "./SelectDropdown";
import { fireEvent, render, screen, waitFor } from "@/utils/testing-library";

enum OptionType {
	base = "base",
	group = "group",
}

const options = [
	{
		label: "Option 1",
		value: "1",
	},
	{
		label: "Option 2",
		value: "2",
	},
	{
		label: "Option 3",
		value: "3",
	},
];

const optionGroup = [
	{
		options: [
			{
				label: "Option 1",
				value: "1",
			},
			{
				label: "Option 2",
				value: "2",
			},
		],
		title: "Group1",
	},
	{
		options: [
			{
				label: "Item 1",
				value: "3",
			},
			{
				label: "Item 2",
				value: "4",
			},
		],
		title: "Group2",
	},
];

const getOptions = (optType: OptionType) => {
	if (optType === OptionType.base) {
		return options;
	}

	return optionGroup;
};

const keyboardArrowDown = () => userEvent.keyboard("{arrowdown}");
const selectInput = () => screen.getByTestId("select-list__input");

const firstOptionID = "SelectDropdown__option--0";

describe("SelectDropdown", () => {
	beforeEach(() => {
		jest.spyOn(Tippy as any, "render").mockRestore();
	});

	it.each([OptionType.base, OptionType.group])("should render option %s", (optType) => {
		const { container } = render(<Select options={getOptions(optType)} />);

		expect(container).toMatchSnapshot();
	});

	it("should render with custom wrapper class name", () => {
		const { container } = render(
			<Select options={getOptions(OptionType.base)} wrapperClassName="relative w-full" />,
		);

		expect(container).toMatchSnapshot();
	});

	it.each([OptionType.base, OptionType.group])("should render option %s with custom label", (optType) => {
		const { container } = render(
			<Select options={getOptions(optType)} renderLabel={(option) => <span>{`Label ${option.label}`}</span>} />,
		);

		userEvent.paste(screen.getByTestId("SelectDropdown__input"), "Opt");

		expect(container).toMatchSnapshot();
		expect(screen.getByText("Label Option 1")).toBeInTheDocument();
	});

	it.each([OptionType.base, OptionType.group])(
		"should render option %s with custom label and allowed overflow",
		(optType) => {
			const { container } = render(
				<Select
					options={getOptions(optType)}
					renderLabel={(option) => <span>{`Label ${option.label}`}</span>}
					allowOverflow
				/>,
			);

			userEvent.paste(screen.getByTestId("SelectDropdown__input"), "Opt");

			expect(container).toMatchSnapshot();
			expect(screen.getByText("Label Option 1")).toBeInTheDocument();
		},
	);

	it.each([OptionType.base, OptionType.group])("should render invalid option %s", (optType) => {
		const { container } = render(<Select options={getOptions(optType)} isInvalid />);

		expect(container).toMatchSnapshot();
	});

	it.each([OptionType.base, OptionType.group])("should render disabled option %s", (optType) => {
		const { container } = render(<Select options={getOptions(optType)} disabled />);

		expect(container).toMatchSnapshot();
	});

	it.each([OptionType.base, OptionType.group])("should render option %s without caret", (optType) => {
		const { container } = render(<Select options={getOptions(optType)} showCaret={false} />);

		expect(container).toMatchSnapshot();
	});

	it.each([OptionType.base, OptionType.group])(
		"should trigger menu when clicking on caret in option %s",
		async (optType) => {
			render(<Select options={getOptions(optType)} showCaret />);

			userEvent.click(screen.getByTestId("SelectDropdown__caret"));

			await expect(screen.findByTestId(firstOptionID)).resolves.toBeVisible();

			userEvent.click(screen.getByTestId("SelectDropdown__caret"));

			await waitFor(() => expect(screen.queryByTestId(firstOptionID)).not.toBeInTheDocument());
		},
	);

	it.each([OptionType.base, OptionType.group])("should not trigger menu when disabled", async (optType) => {
		render(<Select options={getOptions(optType)} showCaret disabled />);

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByTestId(firstOptionID)).rejects.toThrow(/Unable to find/);
	});

	it.each([OptionType.base, OptionType.group])("should render option %s with initial default value", (optType) => {
		const { container } = render(<Select options={getOptions(optType)} defaultValue="3" />);

		expect(container).toMatchSnapshot();
	});

	it.each([OptionType.base, OptionType.group])("should render option %s with wrong default value", (optType) => {
		const { container } = render(<Select options={getOptions(optType)} defaultValue="5" />);

		expect(container).toMatchSnapshot();
	});

	it("should render with empty options", () => {
		const { container } = render(<Select options={[]} defaultValue="4" />);

		expect(container).toMatchSnapshot();
	});

	it("should render with options values as numbers", () => {
		const { container } = render(<Select options={[{ label: "Value 1", value: 1 }]} defaultValue="4" />);

		expect(container).toMatchSnapshot();
	});

	it("should render while allowing horizontal overflow", () => {
		const { container } = render(<Select options={getOptions(OptionType.base)} allowOverflow={true} />);

		expect(container).toMatchSnapshot();
	});

	it.each([OptionType.base, OptionType.group])("should toggle select list options %s", (optType) => {
		render(<Select options={getOptions(optType)} />);

		const selectDropdown = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectDropdown, "Opt");

		expect(screen.getByTestId(firstOptionID)).toBeInTheDocument();

		userEvent.click(screen.getByTestId(firstOptionID));
	});

	it.each([OptionType.base, OptionType.group])("should select option %s", (optType) => {
		render(<Select options={getOptions(optType)} />);

		const selectDropdown = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectDropdown, "Opt");

		expect(screen.getByTestId(firstOptionID)).toBeInTheDocument();

		userEvent.click(screen.getByTestId(firstOptionID));

		expect(selectInput()).toHaveValue("1");
	});

	it.each([OptionType.base, OptionType.group])("should highlight option %s", (optType) => {
		render(<Select options={getOptions(optType)} />);

		const selectDropdown = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectDropdown, "Opt");
		userEvent.tab();

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		expect(screen.getByTestId(firstOptionID)).toBeVisible();

		expect(screen.getByTestId(firstOptionID)).toHaveClass("is-selected");
	});

	it.each([OptionType.base, OptionType.group])("should select options %s with arrow keys", (optType) => {
		render(<Select options={getOptions(optType)} />);

		const selectDropdown = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectDropdown, "Opt");

		expect(screen.getByTestId(firstOptionID)).toBeVisible();

		keyboardArrowDown();

		expect(screen.getByTestId(firstOptionID)).toHaveClass("is-highlighted");

		userEvent.keyboard("{enter}");

		expect(selectInput()).toHaveValue("1");
	});

	it("should highlight first option after reach to the end of the match options", () => {
		const options = [
			{
				label: "Option 1",
				value: "1",
			},
			{
				label: "Option 2",
				value: "2",
			},
			{
				label: "Item 1",
				value: "3",
			},
			{
				label: "Item 2",
				value: "4",
			},
		];

		render(<Select options={options} />);

		const selectDropdown = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectDropdown, "Opt");

		expect(screen.getByTestId(firstOptionID)).toBeInTheDocument();

		keyboardArrowDown();

		expect(screen.getByTestId(firstOptionID)).toHaveClass("is-highlighted");

		keyboardArrowDown();

		const secondOption = screen.getByTestId("SelectDropdown__option--1");

		expect(secondOption).toHaveClass("is-highlighted");

		keyboardArrowDown();

		expect(screen.getByTestId(firstOptionID)).toHaveClass("is-highlighted");
	});

	it.each([OptionType.base, OptionType.group])(
		"should show suggestion when typing has found at least one match in option %s",
		(optType) => {
			render(<Select options={getOptions(optType)} />);
			const selectDropdown = screen.getByTestId("SelectDropdown__input");

			userEvent.paste(selectDropdown, "Opt");

			expect(screen.getByTestId("Input__suggestion")).toHaveTextContent("Option 1");
		},
	);

	it.each([OptionType.base, OptionType.group])(
		"should select first matching option with enter in option %s",
		(optType) => {
			render(<Select options={getOptions(optType)} />);
			const selectDropdown = screen.getByTestId("SelectDropdown__input");

			userEvent.paste(selectDropdown, "Opt");
			userEvent.keyboard("{enter}");

			expect(selectInput()).toHaveValue("1");
		},
	);

	it.each([OptionType.base, OptionType.group])(
		"should select first matching option with tab in option %s",
		(optType) => {
			render(<Select options={getOptions(optType)} />);
			const selectDropdown = screen.getByTestId("SelectDropdown__input");

			userEvent.paste(selectDropdown, "Opt");
			userEvent.tab();

			expect(selectInput()).toHaveValue("1");
		},
	);

	it.each([OptionType.base, OptionType.group])("should select new option with enter in option %s", (optType) => {
		render(<Select options={getOptions(optType)} />);
		const selectDropdown = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectDropdown, "Opt");
		userEvent.keyboard("{enter}");

		expect(selectDropdown).toHaveValue("Option 1");

		keyboardArrowDown();
		userEvent.keyboard("{enter}");

		expect(selectDropdown).toHaveValue("Option 2");
	});

	it.each([OptionType.base, OptionType.group])(
		"should not select non-matching option after key input and tab in option %s",
		(optType) => {
			render(<Select options={getOptions(optType)} />);
			const selectDropdown = screen.getByTestId("SelectDropdown__input");

			userEvent.paste(selectDropdown, "Optt");
			userEvent.tab();

			expect(selectInput()).not.toHaveValue();
		},
	);

	it.each([OptionType.base, OptionType.group])(
		"should not select first matched option after random key enter in option %s",
		(optType) => {
			render(<Select options={getOptions(optType)} />);
			const selectDropdown = screen.getByTestId("SelectDropdown__input");

			userEvent.paste(selectDropdown, "Opt");
			userEvent.keyboard("A");

			expect(selectInput()).not.toHaveValue();
		},
	);

	it.each([OptionType.base, OptionType.group])(
		"should clear selection when changing input in option %s",
		(optType) => {
			render(<Select options={getOptions(optType)} />);
			const selectDropdown = screen.getByTestId("SelectDropdown__input");

			userEvent.paste(selectDropdown, "Opt");
			userEvent.keyboard("{enter}");

			expect(selectInput()).toHaveValue("1");

			userEvent.paste(selectDropdown, "test");
			userEvent.keyboard("A");
			userEvent.keyboard("B");

			expect(selectInput()).not.toHaveValue();
		},
	);

	it.each([OptionType.base, OptionType.group])(
		"should select match on blur if available in option %s",
		async (optType) => {
			render(<Select options={getOptions(optType)} />);
			const selectDropdown = screen.getByTestId("SelectDropdown__input");

			userEvent.paste(selectDropdown, "Opt");
			fireEvent.blur(selectDropdown);

			await waitFor(() => expect(selectDropdown).toHaveValue("Option 1"));
		},
	);

	it.each([OptionType.base, OptionType.group])(
		"should clear input on blur if there is no match in option %s",
		async (optType) => {
			render(<Select options={getOptions(optType)} />);
			const selectDropdown = screen.getByTestId("SelectDropdown__input");

			userEvent.paste(selectDropdown, "Foobar");
			fireEvent.blur(selectDropdown);

			await waitFor(() => expect(selectDropdown).not.toHaveValue());
		},
	);

	it.each([OptionType.base, OptionType.group])(
		"should not clear input on blur if selected in option %s",
		(optType) => {
			render(<Select options={getOptions(optType)} />);
			const selectDropdown = screen.getByTestId("SelectDropdown__input");

			userEvent.paste(selectDropdown, "Opt");
			userEvent.keyboard("{enter}");

			expect(selectDropdown).toHaveValue("Option 1");

			fireEvent.blur(selectDropdown);

			expect(selectDropdown).toHaveValue("Option 1");
		},
	);

	it.each([OptionType.base, OptionType.group])(
		"should select an option by clicking on it in option %s",
		async (optType) => {
			render(<Select options={getOptions(optType)} />);

			userEvent.click(screen.getByTestId("SelectDropdown__caret"));

			await expect(screen.findByTestId(firstOptionID)).resolves.toBeVisible();

			userEvent.click(screen.getByTestId(firstOptionID));

			expect(selectInput()).toHaveValue("1");
		},
	);

	it("should not open the dropdown on reset", () => {
		const initialValue = options[0].value;

		const Component = () => {
			const [selected, setSelected] = useState<any>(initialValue);
			const onChange = (x: any) => setSelected(x?.value);

			return (
				<>
					<Select onChange={onChange} defaultValue={selected} options={options} />
					<button type="button" data-testid="btn-reset" onClick={() => setSelected(undefined)}>
						Reset
					</button>
				</>
			);
		};

		render(<Component />);

		// check dropdown not open
		expect(selectInput()).toHaveValue(initialValue);
		expect(screen.queryByText("Option 2")).not.toBeInTheDocument();

		// set null value
		userEvent.click(screen.getByTestId("btn-reset"));

		// check value reset and dropdown not open
		expect(selectInput()).not.toHaveValue();
		expect(screen.queryByText("Option 2")).not.toBeInTheDocument();
	});

	it.each([OptionType.base, OptionType.group])("should allow entering free text in option %s", (optType) => {
		render(<Select options={getOptions(optType)} allowFreeInput />);
		const selectDropdown = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectDropdown, "Test");

		expect(selectInput()).toHaveValue("Test");
	});

	it.each([OptionType.base, OptionType.group])(
		"should allow entering free text and handle blur event in option %s",
		(optType) => {
			render(<Select options={getOptions(optType)} allowFreeInput={true} />);
			const selectDropdown = screen.getByTestId("SelectDropdown__input");

			userEvent.paste(selectDropdown, "Test");
			fireEvent.blur(selectDropdown);

			expect(selectInput()).toHaveValue("Test");
		},
	);

	it.each([OptionType.base, OptionType.group])(
		"should render option %s with default value when free text is allowed",
		(optType) => {
			const { container } = render(<Select options={getOptions(optType)} defaultValue="3" allowFreeInput />);

			expect(selectInput()).toHaveValue("3");
			expect(container).toMatchSnapshot();
		},
	);

	it.each([OptionType.base, OptionType.group])(
		"should hide dropdown in option %s when no matches found in free text mode",
		(optType) => {
			render(<Select options={getOptions(optType)} defaultValue="3" allowFreeInput />);
			const selectDropdown = screen.getByTestId("SelectDropdown__input");

			userEvent.clear(selectDropdown);
			userEvent.paste(selectDropdown, options[0].label);

			expect(selectInput()).toHaveValue(options[0].label);

			userEvent.paste(selectDropdown, "Unmatched");

			expect(screen.queryByTestId(firstOptionID)).not.toBeInTheDocument();
		},
	);

	it.each([OptionType.base, OptionType.group])("should show all options %s when empty input", (optType) => {
		render(<Select options={getOptions(optType)} defaultValue="3" allowFreeInput />);
		const selectDropdown = screen.getByTestId("SelectDropdown__input");

		userEvent.clear(selectDropdown);
		userEvent.paste(selectDropdown, options[0].label);

		expect(selectInput()).toHaveValue(options[0].label);

		userEvent.clear(selectDropdown);

		expect(selectInput()).not.toHaveValue();
		expect(screen.getByTestId(firstOptionID)).toBeInTheDocument();
		expect(screen.getByTestId("SelectDropdown__option--1")).toBeInTheDocument();
		expect(screen.getByTestId("SelectDropdown__option--2")).toBeInTheDocument();
	});
});
