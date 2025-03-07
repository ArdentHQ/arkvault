import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { Contacts } from "./Contacts";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { translations } from "@/domains/contact/i18n";
import {
	breakpoints,
	env,
	getDefaultProfileId,
	render,
	renderResponsiveWithRoute,
	screen,
	waitFor,
	within,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;

const history = createHashHistory();

const renderComponent = (profileId = profile.id()) => {
	const contactsURL = `/profiles/${profileId}/contacts`;
	history.push(contactsURL);

	return render(
		<Route path="/profiles/:profileId/contacts">
			<Contacts />
		</Route>,
		{
			history,
			route: contactsURL,
		},
	);
};

const renderResponsiveComponent = (breakpoint: keyof typeof breakpoints, profileId = profile.id()) => {
	const contactsURL = `/profiles/${profileId}/contacts`;
	history.push(contactsURL);

	return renderResponsiveWithRoute(
		<Route path="/profiles/:profileId/contacts">
			<Contacts />
		</Route>,
		breakpoint,
		{
			history,
			route: contactsURL,
		},
	);
};

const addAddress = () => screen.getByTestId("contact-form__add-address-btn");
const saveButton = () => screen.getByTestId("contact-form__save-btn");
const sendButton = (index = 0) => screen.getAllByTestId("ContactListItem__send-button")[index];
const contactFormAddressListItemTestId = "contact-form__address-list-item";
const contactFormNameInputId = "contact-form__name-input";
const createContact = (targetProfile: Contracts.IProfile, name: string, address: string) =>
	targetProfile.contacts().create(name, [
		{
			address,
			coin: "ARK",
		},
	]);

describe("Contacts", () => {
	let resetProfileNetworksMock: () => void;
	let mockContact: Contracts.IContact;

	beforeAll(() => {
		process.env.MOCK_AVAILABLE_NETWORKS = "false";
		profile = env.profiles().findById(getDefaultProfileId());

		mockContact = createContact(profile, "Mock Contact", "0x0000000000000000000000000000000000000000");
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should render with contacts", async () => {
		const { asFragment } = renderComponent();

		expect(screen.getByTestId("header__title")).toHaveTextContent(translations.CONTACTS_PAGE.TITLE);
		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.CONTACTS_PAGE.SUBTITLE);
		await expect(screen.findByTestId("ContactList")).resolves.toBeInTheDocument();

		expect(screen.queryByTestId("EmptyResults")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render compact on md screen", async () => {
		const { asFragment } = renderResponsiveComponent("md");

		expect(screen.getByTestId("header__title")).toHaveTextContent(translations.CONTACTS_PAGE.TITLE);
		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.CONTACTS_PAGE.SUBTITLE);
		await expect(screen.findByTestId("ContactList")).resolves.toBeInTheDocument();

		expect(screen.queryByTestId("EmptyResults")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render responsive with contacts", async () => {
		const { asFragment } = renderResponsiveComponent("xs");

		expect(screen.getAllByTestId("ContactListItemMobile")).toHaveLength(profile.contacts().count());

		expect(screen.queryByTestId("EmptyResults")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		const firstContactOptionsDropdown = within(screen.getAllByTestId("ContactListItemMobile")[0]).getAllByTestId(
			"dropdown__toggle",
		)[0];

		await userEvent.click(firstContactOptionsDropdown);

		await waitFor(() => {
			expect(screen.getByTestId("dropdown__options")).toBeInTheDocument();
		});

		const updateOption = within(screen.getByTestId("dropdown__options")).getByText(commonTranslations.EDIT);

		await userEvent.click(updateOption);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});
	});

	it("should render without contacts", () => {
		const contactsSpy = vi.spyOn(profile.contacts(), "values").mockReturnValue([]);

		const { asFragment } = renderComponent();

		expect(screen.getByTestId("header__title")).toHaveTextContent(translations.CONTACTS_PAGE.TITLE);
		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.CONTACTS_PAGE.SUBTITLE);

		expect(screen.getByTestId("EmptyResults")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		contactsSpy.mockRestore();
	});

	it.each([
		["close", "Modal__close-button"],
		["cancel", "contact-form__cancel-btn"],
	])("should open & %s add contact modal", async (_, buttonId) => {
		renderComponent();

		await userEvent.click(screen.getByTestId("contacts__add-contact-btn"));

		await waitFor(() => expect(screen.getByTestId(buttonId)).not.toBeDisabled());

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_CREATE_CONTACT.TITLE);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_CREATE_CONTACT.DESCRIPTION);

		await userEvent.click(screen.getByTestId(buttonId));

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});
	});

	it("should successfully add contact", async () => {
		const validateMock = vi.spyOn(profile.coins(), "set").mockReturnValue({
			__construct: vi.fn(),
			address: () => ({
				validate: vi.fn().mockResolvedValue(true),
			}),
		});

		renderComponent();

		await waitFor(() => {
			expect(screen.getByTestId("contacts__add-contact-btn")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("contacts__add-contact-btn"));

		await waitFor(() => {
			expect(saveButton()).toBeDisabled();
		});
		expect(addAddress()).toBeDisabled();

		expect(screen.queryByTestId(contactFormAddressListItemTestId)).not.toBeInTheDocument();

		await userEvent.type(screen.getByTestId(contactFormNameInputId), "Test Contact");

		await waitFor(() => {
			expect(screen.getByTestId(contactFormNameInputId)).toHaveValue("Test Contact");
		});

		await userEvent.type(screen.getByTestId("contact-form__address-input"), "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__address-input")).toHaveValue("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");
		});

		await waitFor(() => {
			expect(addAddress()).not.toBeDisabled();
		});

		await userEvent.click(addAddress());

		await waitFor(() => expect(screen.getAllByTestId(contactFormAddressListItemTestId)).toHaveLength(1));

		await waitFor(() => expect(saveButton()).not.toBeDisabled());

		await userEvent.click(saveButton());

		await waitFor(() => {
			expect(profile.contacts().findByAddress("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD")).toHaveLength(1);
		});
		validateMock.mockRestore();
	});

	it("should successfully add contact on mobile", async () => {
		const validateMock = vi.spyOn(profile.coins(), "set").mockReturnValue({
			__construct: vi.fn(),
			address: () => ({
				validate: vi.fn().mockResolvedValue(true),
			}),
		});

		renderResponsiveComponent();

		await waitFor(() => {
			expect(screen.getByTestId("contacts__add-contact-btn-mobile")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("contacts__add-contact-btn-mobile"));

		await waitFor(() => {
			expect(saveButton()).toBeDisabled();
		});
		expect(addAddress()).toBeDisabled();

		expect(screen.queryByTestId(contactFormAddressListItemTestId)).not.toBeInTheDocument();

		await userEvent.type(screen.getByTestId(contactFormNameInputId), "Test Contact 2");

		await waitFor(() => {
			expect(screen.getByTestId(contactFormNameInputId)).toHaveValue("Test Contact 2");
		});

		await userEvent.type(
			screen.getByTestId("contact-form__address-input"),
			"0x0000000000000000000000000000000000000001",
		);

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__address-input")).toHaveValue(
				"0x0000000000000000000000000000000000000001",
			);
		});

		await waitFor(() => {
			expect(addAddress()).not.toBeDisabled();
		});

		await userEvent.click(addAddress());

		await waitFor(() => expect(screen.getAllByTestId(contactFormAddressListItemTestId)).toHaveLength(1));

		await waitFor(() => expect(saveButton()).not.toBeDisabled());

		await userEvent.click(saveButton());

		await waitFor(() => {
			expect(profile.contacts().findByAddress("0x0000000000000000000000000000000000000001")).toHaveLength(1);
		});
		validateMock.mockRestore();
	});

	it("should successfully delete contact", async () => {
		const newContact = createContact(profile, "New Contact", "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");

		const contactsSpy = vi
			.spyOn(profile.contacts(), "values")
			.mockReturnValue([profile.contacts().findById(newContact.id())]);

		renderComponent();

		await waitFor(() => {
			expect(screen.getAllByTestId("ContactListItem")).toHaveLength(1);
		});

		const firstContactOptionsDropdown = within(screen.getAllByTestId("ContactListItem")[0]).getAllByTestId(
			"dropdown__toggle",
		)[0];
		await userEvent.click(firstContactOptionsDropdown);

		await waitFor(() => {
			expect(screen.getByTestId("dropdown__options")).toBeInTheDocument();
		});

		const deleteOption = within(screen.getByTestId("dropdown__options")).getByText(commonTranslations.DELETE);
		await userEvent.click(deleteOption);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => {
			expect(() => profile.contacts().findById(newContact.id())).toThrow("Failed to find");
		});

		contactsSpy.mockRestore();
	});

	it.each([
		["close", "Modal__close-button"],
		["cancel", "DeleteResource__cancel-button"],
	])("should %s delete contact modal", async (_, buttonId) => {
		const contactsSpy = vi
			.spyOn(profile.contacts(), "values")
			.mockReturnValue([profile.contacts().findById(mockContact.id())]);

		renderComponent();

		await waitFor(() => {
			expect(screen.getAllByTestId("ContactListItem")).toHaveLength(1);
		});

		const firstContactOptionsDropdown = within(screen.getAllByTestId("ContactListItem")[0]).getAllByTestId(
			"dropdown__toggle",
		)[0];
		await userEvent.click(firstContactOptionsDropdown);

		await waitFor(() => {
			expect(screen.getByTestId("dropdown__options")).toBeInTheDocument();
		});

		const deleteOption = within(screen.getByTestId("dropdown__options")).getByText(commonTranslations.DELETE);
		await userEvent.click(deleteOption);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId(buttonId));

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});

		contactsSpy.mockRestore();
	});

	it("should update contact from update modal", async () => {
		const newName = "Updated name";

		const contactsSpy = vi
			.spyOn(profile.contacts(), "values")
			.mockReturnValue([profile.contacts().findById(mockContact.id())]);

		renderComponent();

		await waitFor(() => {
			expect(screen.getAllByTestId("ContactListItem")).toHaveLength(1);
		});

		const firstContactOptionsDropdown = within(screen.getAllByTestId("ContactListItem")[0]).getAllByTestId(
			"dropdown__toggle",
		)[0];
		await userEvent.click(firstContactOptionsDropdown);

		await waitFor(() => {
			expect(screen.getByTestId("dropdown__options")).toBeInTheDocument();
		});

		await userEvent.click(within(screen.getByTestId("dropdown__options")).getByText(commonTranslations.EDIT));

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		const nameInput = screen.getByTestId(contactFormNameInputId);

		expect(nameInput).toHaveValue("Mock Contact");

		(nameInput as HTMLInputElement).select();
		await userEvent.clear(nameInput);
		await userEvent.type(nameInput, newName);

		expect(nameInput).toHaveValue(newName);

		expect(screen.getAllByTestId(contactFormAddressListItemTestId)).toHaveLength(1);

		await userEvent.click(screen.getAllByTestId("contact-form__remove-address-btn")[1]);

		await waitFor(() => {
			expect(saveButton()).not.toBeDisabled();
		});

		await userEvent.click(saveButton());

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});

		expect(screen.getByText(newName)).toBeVisible();
		expect(screen.queryByText("Mock Contact")).not.toBeInTheDocument();

		contactsSpy.mockRestore();
	});

	it("should successfully delete contact from update modal", async () => {
		const newContact = createContact(profile, "New Contact", "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");

		const contactsSpy = vi
			.spyOn(profile.contacts(), "values")
			.mockReturnValue([profile.contacts().findById(newContact.id())]);

		renderComponent();

		await waitFor(() => {
			expect(screen.getAllByTestId("ContactListItem")).toHaveLength(1);
		});

		const firstContactOptionsDropdown = within(screen.getByTestId("ContactList")).getAllByTestId(
			"dropdown__toggle",
		)[0];
		await userEvent.click(firstContactOptionsDropdown);

		await waitFor(() => {
			expect(screen.getByTestId("dropdown__options")).toBeInTheDocument();
		});

		const editOption = within(screen.getByTestId("dropdown__options")).getByText(commonTranslations.EDIT);
		await userEvent.click(editOption);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId("contact-form__delete-btn"));

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_DELETE_CONTACT.TITLE);

		await userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => {
			expect(() => profile.contacts().findById(newContact.id())).toThrow("Failed to find");
		});

		contactsSpy.mockRestore();
	});

	it("should redirect contact address to send transfer page if there are wallets", async () => {
		expect(profile.wallets().count()).toBeGreaterThan(0);

		const contactsSpy = vi
			.spyOn(profile.contacts(), "values")
			.mockReturnValue([profile.contacts().findById(mockContact.id())]);

		renderComponent();

		await waitFor(() => {
			expect(screen.getAllByTestId("ContactListItem")).toHaveLength(1);
		});

		await userEvent.click(sendButton());

		expect(history.location.pathname).toBe("/profiles/b999d134-7a24-481e-a95d-bc47c543bfc9/send-transfer");
		expect(history.location.search).toBe("?coin=ARK&recipient=0x0000000000000000000000000000000000000000");

		contactsSpy.mockRestore();
	});

	it("should search for contact by name", async () => {
		const [contact1, contact2] = profile.contacts().values();

		renderComponent();

		await waitFor(() => {
			expect(screen.getAllByTestId("ContactListItem__name")).toHaveLength(profile.contacts().count());
		});
		expect(screen.getByText(contact1.name())).toBeInTheDocument();
		expect(screen.getByText(contact2.name())).toBeInTheDocument();

		const searchInput = within(screen.getByTestId("SearchableTableWrapper__search-input")).getByTestId("Input");

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, contact1.name());

		await expect(screen.findByTestId("ContactListItem__name")).resolves.toBeInTheDocument();

		await waitFor(() => expect(screen.getAllByTestId("ContactListItem__name")).toHaveLength(1));

		expect(screen.queryByText(contact2.name())).not.toBeInTheDocument();

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, "Unknown Name");

		await expect(screen.findByTestId("EmptyResults")).resolves.toBeVisible();
	});

	it("should search for contact by address", async () => {
		const blankProfile = await env.profiles().create("empty");

		const resetBlankProfileNetworksMock = mockProfileWithPublicAndTestNetworks(blankProfile);
		const contact1 = createContact(blankProfile, "contact1", "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");
		const contact2 = createContact(blankProfile, "contact2", "D5YZY7CKdeHtUQhWdmBaqqXvNshq3Tkj4a");

		const contact1Address = contact1.addresses().first().address();

		renderComponent(blankProfile.id());

		await waitFor(() => {
			expect(screen.getAllByTestId("ContactListItem__address")).toHaveLength(2);
		});

		await expect(screen.findByTestId("SearchableTableWrapper__search-input")).resolves.toBeVisible();

		const searchInput = within(screen.getByTestId("SearchableTableWrapper__search-input")).getByTestId("Input");

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, contact1Address);

		await waitFor(() => expect(screen.getAllByTestId("ContactListItem__address")).toHaveLength(1));

		expect(screen.queryByText(contact2.name())).not.toBeInTheDocument();

		await userEvent.clear(searchInput);
		await userEvent.type(searchInput, "Unknown Address");

		await expect(screen.findByTestId("EmptyResults")).resolves.toBeVisible();

		env.profiles().forget(blankProfile.id());

		resetBlankProfileNetworksMock();
	});
});
