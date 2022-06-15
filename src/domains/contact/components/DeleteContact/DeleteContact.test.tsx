import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { DeleteContact } from "./DeleteContact";
import { translations } from "@/domains/contact/i18n";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

let contact: Contracts.IContact;
let profile: Contracts.IProfile;

const onDelete = jest.fn();

describe("DeleteContact", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		contact = profile.contacts().values()[0];
	});

	afterEach(() => {
		onDelete.mockRestore();
	});

	it("should render a modal", () => {
		const { asFragment } = render(
			<DeleteContact
				onClose={jest.fn()}
				onCancel={jest.fn()}
				contact={contact}
				onDelete={onDelete}
				profile={profile}
			/>,
		);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_DELETE_CONTACT.TITLE);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_DELETE_CONTACT.DESCRIPTION);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should delete contact", async () => {
		render(
			<DeleteContact
				onClose={jest.fn()}
				onCancel={jest.fn()}
				onDelete={onDelete}
				profile={profile}
				contact={contact}
			/>,
		);
		const deleteButton = screen.getByTestId("DeleteResource__submit-button");

		userEvent.click(deleteButton);

		await waitFor(() => expect(onDelete).toHaveBeenCalledWith(contact.id()));

		expect(() => profile.contacts().findById(contact.id())).toThrow("Failed to find");
	});
});
