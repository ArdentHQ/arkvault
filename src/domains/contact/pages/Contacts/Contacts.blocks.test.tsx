import React from "react";

import { renderResponsive } from "@/utils/testing-library";

import { ContactsHeader, ContactsHeaderExtra } from "./Contacts.blocks";

describe("ContactsHeader", () => {
	it.each(["xs", "md"])("should render responsive", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<ContactsHeader showSearchBar onAddContact={vi.fn()} onSearch={vi.fn()} />,
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
