import React from "react";
import { ContactsHeader, ContactsHeaderExtra } from "./Contacts.blocks";
import { renderResponsive } from "@/utils/testing-library";

describe("ContactsHeader", () => {
	it.each(["xs", "md"])("should render responsive", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<ContactsHeader showSearchBar onAddContact={jest.fn()} onSearch={jest.fn()} />,
			breakpoint,
		);

		expect(asFragment()).toMatchSnapshot();
	});
});

describe("ContactsHeaderExtra", () => {
	it.each(["xs", "md"])("should render responsive", (breakpoint) => {
		const { asFragment } = renderResponsive(<ContactsHeaderExtra showSearchBar />, breakpoint);

		expect(asFragment()).toMatchSnapshot();
	});
});
