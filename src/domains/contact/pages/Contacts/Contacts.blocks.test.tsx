import React from "react";
import { ContactsHeader } from "./Contacts.blocks";
import { renderResponsive } from "@/utils/testing-library";

describe("ContactsHeader", () => {
	it.each(["xs", "md"])("should render responsive", (breakpoint) => {
		const { asFragment } = renderResponsive(
			<ContactsHeader showSearchBar onAddContact={vi.fn()} onSearch={vi.fn()} />,
			breakpoint,
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
