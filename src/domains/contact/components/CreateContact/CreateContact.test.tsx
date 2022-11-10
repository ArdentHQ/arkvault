/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
// import userEvent from "@testing-library/user-event";
import React from "react";

import { CreateContact } from "./CreateContact";
import { translations } from "@/domains/contact/i18n";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

const onSave = vi.fn();
const onCancel = vi.fn();
const onClose = vi.fn();

let profile: Contracts.IProfile;
// let contact: Contracts.IContact;

describe("CreateContact", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		// contact = profile.contacts().values()[0];
	});

	it("should render", async () => {
		const { asFragment } = render(
			<CreateContact profile={profile} onCancel={onCancel} onClose={onClose} onSave={onSave} />,
		);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_CREATE_CONTACT.TITLE);
		});

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_CREATE_CONTACT.DESCRIPTION);
		expect(asFragment()).toMatchSnapshot();
	});

	// it("should not create new contact if contact name exists", async () => {
	// 	render(<CreateContact profile={profile} onCancel={onCancel} onClose={onClose} onSave={onSave} />);
	//
	// 	userEvent.paste(screen.getByTestId("contact-form__name-input"), contact.name());
	//
	// 	await waitFor(() => {
	// 		expect(screen.getByTestId("contact-form__name-input")).toHaveValue(contact.name());
	// 	});
	//
	// 	expect(screen.getByTestId("Input__error")).toBeVisible();
	//
	// 	const selectNetworkInput = screen.getByTestId("SelectDropdown__input");
	//
	// 	userEvent.paste(selectNetworkInput, "ARK D");
	// 	userEvent.keyboard("{enter}");
	//
	// 	await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK Devnet"));
	//
	// 	userEvent.type(screen.getByTestId("contact-form__address-input"), "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib");
	//
	// 	await waitFor(() => {
	// 		expect(screen.getByTestId("contact-form__add-address-btn")).not.toBeDisabled();
	// 	});
	//
	// 	userEvent.click(screen.getByTestId("contact-form__add-address-btn"));
	//
	// 	await waitFor(() => {
	// 		expect(screen.getByTestId("contact-form__save-btn")).toBeDisabled();
	// 	});
	//
	// 	userEvent.click(screen.getByTestId("contact-form__save-btn"));
	//
	// 	expect(onSave).not.toHaveBeenCalled();
	// });
});
