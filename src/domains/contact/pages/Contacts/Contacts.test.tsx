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
import { cleanup } from "@testing-library/react";

let profile: Contracts.IProfile;

const history = createHashHistory();

const renderComponent = (profileId = profile.id()) => {
	const contactsURL = `/profiles/${profileId}/contacts`;
	history.push(contactsURL);

	return render(<Route path="/profiles/:profileId/contacts" element={<Contacts />} />, {
		history,
		route: contactsURL,
	});
};

const renderResponsiveComponent = (breakpoint: keyof typeof breakpoints, profileId = profile.id()) => {
	const contactsURL = `/profiles/${profileId}/contacts`;
	history.push(contactsURL);

	return renderResponsiveWithRoute(
		<Route path="/profiles/:profileId/contacts" element={<Contacts />} />,
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
const searchInput = () => within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");

const devnet = "ark.devnet";
const mainnet = "ark.mainnet";

const createContact = (targetProfile: Contracts.IProfile, name: string, address: string, useMainnet = false) =>
	targetProfile.contacts().create(name, [
		{
			address,
			coin: "ARK",
			network: useMainnet ? mainnet : devnet,
		},
	]);

describe("Contacts", () => {
	let resetProfileNetworksMock: () => void;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
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

		expect(screen.queryByTestId("EmptyBlock")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render compact on md screen", async () => {
		const { asFragment } = renderResponsiveComponent("md");

		expect(screen.getByTestId("header__title")).toHaveTextContent(translations.CONTACTS_PAGE.TITLE);
		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.CONTACTS_PAGE.SUBTITLE);
		await expect(screen.findByTestId("ContactList")).resolves.toBeInTheDocument();

		expect(screen.queryByTestId("EmptyBlock")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render compact on md screen if uses expanded tables", async () => {
		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, true);

		const { asFragment } = renderResponsiveComponent("md");

		expect(screen.getByTestId("header__title")).toHaveTextContent(translations.CONTACTS_PAGE.TITLE);
		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.CONTACTS_PAGE.SUBTITLE);
		await expect(screen.findByTestId("ContactList")).resolves.toBeInTheDocument();

		expect(screen.queryByTestId("EmptyBlock")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, false);
	});

	it("should render responsive with contacts", async () => {
		const { asFragment } = renderResponsiveComponent("xs");

		expect(screen.getByTestId("ContactListMobile")).toBeInTheDocument();

		expect(screen.queryByTestId("EmptyBlock")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		const firstContactOptionsDropdown = within(screen.getByTestId("ContactListMobile")).getAllByTestId(
			"dropdown__toggle",
		)[0];

		userEvent.click(firstContactOptionsDropdown);

		await waitFor(() => {
			expect(screen.getByTestId("dropdown__options")).toBeInTheDocument();
		});

		const updateOption = within(screen.getByTestId("dropdown__options")).getByText(commonTranslations.EDIT);

		userEvent.click(updateOption);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});
	});

	it("should render without contacts", () => {
		const contactsSpy = vi.spyOn(profile.contacts(), "values").mockReturnValue([]);

		const { asFragment } = renderComponent();

		expect(screen.getByTestId("header__title")).toHaveTextContent(translations.CONTACTS_PAGE.TITLE);
		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(translations.CONTACTS_PAGE.SUBTITLE);

		expect(screen.queryByTestId("ContactList")).not.toBeInTheDocument();
		expect(screen.getByTestId("EmptyBlock")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		contactsSpy.mockRestore();
	});

	it.each([
		["close", "Modal__close-button"],
		["cancel", "contact-form__cancel-btn"],
	])("should open & %s add contact modal", async (_, buttonId) => {
		renderComponent();

		userEvent.click(screen.getByTestId("contacts__add-contact-btn"));

		await waitFor(() => expect(screen.getByTestId(buttonId)).not.toBeDisabled());

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_CREATE_CONTACT.TITLE);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_CREATE_CONTACT.DESCRIPTION);

		userEvent.click(screen.getByTestId(buttonId));

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});
	});

	it("should successfully add contact", async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByTestId("contacts__add-contact-btn")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("contacts__add-contact-btn"));

		await waitFor(() => {
			expect(saveButton()).toBeDisabled();
		});
		expect(addAddress()).toBeDisabled();

		expect(screen.queryByTestId("contact-form__address-list-item")).not.toBeInTheDocument();

		userEvent.type(screen.getByTestId("contact-form__name-input"), "Test Contact");

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__name-input")).toHaveValue("Test Contact");
		});

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		userEvent.type(selectNetworkInput, "ARK D");
		userEvent.tab();

		await waitFor(() => expect(selectNetworkInput).toHaveValue("ARK Devnet"));

		userEvent.type(screen.getByTestId("contact-form__address-input"), "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");

		await waitFor(() => {
			expect(screen.getByTestId("contact-form__address-input")).toHaveValue("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");
		});

		await waitFor(() => {
			expect(addAddress()).not.toBeDisabled();
		});

		userEvent.click(addAddress());

		await waitFor(() => expect(screen.getAllByTestId("contact-form__address-list-item")).toHaveLength(1));

		await waitFor(() => expect(saveButton()).not.toBeDisabled());

		userEvent.click(saveButton());

		await waitFor(() => {
			expect(profile.contacts().findByAddress("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD")).toHaveLength(1);
		});
	});

	it("should successfully delete contact", async () => {
		const newContact = createContact(profile, "New Contact", "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");

		const contactsSpy = vi
			.spyOn(profile.contacts(), "values")
			.mockReturnValue([profile.contacts().findById(newContact.id())]);

		renderComponent();

		await waitFor(() => {
			expect(screen.getByTestId("ContactList")).toBeInTheDocument();
		});

		const firstContactOptionsDropdown = within(screen.getByTestId("ContactList")).getAllByTestId(
			"dropdown__toggle",
		)[0];
		userEvent.click(firstContactOptionsDropdown);

		await waitFor(() => {
			expect(screen.getByTestId("dropdown__options")).toBeInTheDocument();
		});

		const deleteOption = within(screen.getByTestId("dropdown__options")).getByText(commonTranslations.DELETE);
		userEvent.click(deleteOption);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => {
			expect(() => profile.contacts().findById(newContact.id())).toThrow("Failed to find");
		});

		contactsSpy.mockRestore();
	});

	it.each([
		["close", "Modal__close-button"],
		["cancel", "DeleteResource__cancel-button"],
	])("should %s delete contact modal", async (_, buttonId) => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByTestId("ContactList")).toBeInTheDocument();
		});

		const firstContactOptionsDropdown = within(screen.getByTestId("ContactList")).getAllByTestId(
			"dropdown__toggle",
		)[0];
		userEvent.click(firstContactOptionsDropdown);

		await waitFor(() => {
			expect(screen.getByTestId("dropdown__options")).toBeInTheDocument();
		});

		const deleteOption = within(screen.getByTestId("dropdown__options")).getByText(commonTranslations.DELETE);
		userEvent.click(deleteOption);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId(buttonId));

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});
	});

	it("should update contact from update modal", async () => {
		const newName = "Updated name";

		const contact = profile.contacts().first();
		const address = contact.addresses().create({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: mainnet,
		});

		renderComponent();

		await waitFor(() => {
			expect(screen.getByTestId("ContactList")).toBeInTheDocument();
		});

		const firstContactOptionsDropdown = within(screen.getByTestId("ContactList")).getAllByTestId(
			"dropdown__toggle",
		)[0];
		userEvent.click(firstContactOptionsDropdown);

		await waitFor(() => {
			expect(screen.getByTestId("dropdown__options")).toBeInTheDocument();
		});

		userEvent.click(within(screen.getByTestId("dropdown__options")).getByText(commonTranslations.EDIT));

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		const nameInput = screen.getByTestId("contact-form__name-input");

		expect(nameInput).toHaveValue(profile.contacts().first().name());

		(nameInput as HTMLInputElement).select();
		userEvent.paste(nameInput, newName);

		expect(nameInput).toHaveValue(newName);

		expect(screen.getAllByTestId("contact-form__address-list-item")).toHaveLength(2);

		userEvent.click(screen.getAllByTestId("contact-form__remove-address-btn")[1]);

		await waitFor(() => {
			expect(saveButton()).not.toBeDisabled();
		});

		userEvent.click(saveButton());

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});

		expect(screen.getByText(newName)).toBeVisible();
		expect(screen.queryByText(address.address())).not.toBeInTheDocument();
	});

	it("should successfully delete contact from update modal", async () => {
		const newContact = createContact(profile, "New Contact", "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");

		const contactsSpy = vi
			.spyOn(profile.contacts(), "values")
			.mockReturnValue([profile.contacts().findById(newContact.id())]);

		renderComponent();

		await waitFor(() => {
			expect(screen.getByTestId("ContactList")).toBeInTheDocument();
		});

		const firstContactOptionsDropdown = within(screen.getByTestId("ContactList")).getAllByTestId(
			"dropdown__toggle",
		)[0];
		userEvent.click(firstContactOptionsDropdown);

		await waitFor(() => {
			expect(screen.getByTestId("dropdown__options")).toBeInTheDocument();
		});

		const editOption = within(screen.getByTestId("dropdown__options")).getByText(commonTranslations.EDIT);
		userEvent.click(editOption);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("contact-form__delete-btn"));

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_DELETE_CONTACT.TITLE);

		userEvent.click(screen.getByTestId("DeleteResource__submit-button"));

		await waitFor(() => {
			expect(() => profile.contacts().findById(newContact.id())).toThrow("Failed to find");
		});

		contactsSpy.mockRestore();
	});

	it("should redirect contact address to send transfer page if there are wallets", async () => {
		expect(profile.wallets().count()).toBeGreaterThan(0);

		const newContact = createContact(profile, "New Contact", "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");

		const contactsSpy = vi
			.spyOn(profile.contacts(), "values")
			.mockReturnValue([profile.contacts().findById(newContact.id())]);

		renderComponent();

		await waitFor(() => {
			expect(screen.getByTestId("ContactList")).toBeInTheDocument();
		});

		userEvent.click(sendButton());

		expect(history.location.pathname).toBe("/profiles/b999d134-7a24-481e-a95d-bc47c543bfc9/send-transfer");
		expect(history.location.search).toBe(
			"?coin=ARK&network=ark.devnet&recipient=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		);

		contactsSpy.mockRestore();
	});

	it("should disable send button when there are no wallets with the same network of the address or their balance is zero", async () => {
		const blankProfile = await env.profiles().create("empty");

		const resetBlankProfileNetworksMock = mockProfileWithPublicAndTestNetworks(blankProfile);

		expect(blankProfile.wallets().count()).toBe(0);

		const contactMainnet = createContact(
			blankProfile,
			"contact mainnet",
			"AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			true,
		);
		const contactDevnet = createContact(
			blankProfile,
			"contact devnet",
			"D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
			false,
		);

		const contactsSpy = vi
			.spyOn(blankProfile.contacts(), "values")
			.mockReturnValue([contactMainnet, contactDevnet]);

		renderComponent(blankProfile.id());

		await waitFor(() => {
			expect(screen.getByTestId("ContactList")).toBeInTheDocument();
		});

		// Assert that every "send" button is disabled due to lack of wallets of the same network.

		expect(sendButton(0)).toBeDisabled();
		expect(sendButton(1)).toBeDisabled();

		userEvent.hover(screen.getAllByTestId("ContactListItem__send-button-wrapper")[0]);

		expect(screen.getByText(translations.VALIDATION.NO_WALLETS)).toBeInTheDocument();

		const walletMainnet = await blankProfile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: mainnet,
		});

		const balanceSpy = vi.spyOn(walletMainnet, "balance");

		balanceSpy.mockReturnValue(0);

		blankProfile.wallets().push(walletMainnet);

		cleanup();

		renderComponent(blankProfile.id());

		await waitFor(() => {
			expect(screen.getByTestId("ContactList")).toBeInTheDocument();
		});

		// Assert that every "send" button is disabled due to unavailable balance.

		expect(sendButton(0)).toBeDisabled();
		expect(sendButton(1)).toBeDisabled();

		userEvent.hover(screen.getAllByTestId("ContactListItem__send-button-wrapper")[0]);

		expect(screen.getByText(translations.VALIDATION.NO_BALANCE)).toBeInTheDocument();

		// Add balance, then assert that "send" button is now enabled.

		balanceSpy.mockReturnValue(100);

		cleanup();

		renderComponent(blankProfile.id());

		await waitFor(() => {
			expect(screen.getByTestId("ContactList")).toBeInTheDocument();
		});

		expect(sendButton(0)).toBeEnabled();
		expect(sendButton(1)).toBeDisabled();

		contactsSpy.mockRestore();
		balanceSpy.mockRestore();
		env.profiles().forget(blankProfile.id());

		resetBlankProfileNetworksMock();
	});

	it("should search for contact by name", async () => {
		const [contact1, contact2] = profile.contacts().values();

		renderComponent();

		await waitFor(() => {
			expect(screen.getAllByTestId("ContactListItem__name")).toHaveLength(profile.contacts().count());
		});
		expect(screen.getByText(contact1.name())).toBeInTheDocument();
		expect(screen.getByText(contact2.name())).toBeInTheDocument();

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		await waitFor(() => expect(searchInput()).toBeInTheDocument());

		searchInput().select();
		userEvent.paste(searchInput(), contact1.name());

		await expect(screen.findByTestId("ContactListItem__name")).resolves.toBeInTheDocument();

		await waitFor(() => expect(screen.getAllByTestId("ContactListItem__name")).toHaveLength(1));

		expect(screen.queryByText(contact2.name())).not.toBeInTheDocument();

		searchInput().select();
		userEvent.paste(searchInput(), "Unknown Name");

		await expect(screen.findByTestId("Contacts--empty-results")).resolves.toBeVisible();
	});

	it("should search for contact by address", async () => {
		const blankProfile = await env.profiles().create("empty1");

		const resetBlankProfileNetworksMock = mockProfileWithPublicAndTestNetworks(blankProfile);

		const contact1 = createContact(blankProfile, "contact1", "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");
		const contact2 = createContact(blankProfile, "contact2", "D5YZY7CKdeHtUQhWdmBaqqXvNshq3Tkj4a");

		const contact1Address = contact1.addresses().first().address();

		renderComponent(blankProfile.id());

		await waitFor(() => {
			expect(screen.getAllByTestId("ContactListItem__address")).toHaveLength(2);
		});

		userEvent.click(within(screen.getAllByTestId("HeaderSearchBar")[0]).getByRole("button"));

		await waitFor(() => expect(searchInput()).toBeInTheDocument());

		searchInput().select();
		userEvent.paste(searchInput(), contact1Address);

		await waitFor(() => expect(screen.getAllByTestId("ContactListItem__address")).toHaveLength(1));

		expect(screen.queryByText(contact2.name())).not.toBeInTheDocument();

		searchInput().select();
		userEvent.paste(searchInput(), "Unknown Address");

		await expect(screen.findByTestId("Contacts--empty-results")).resolves.toBeVisible();

		env.profiles().forget(blankProfile.id());

		resetBlankProfileNetworksMock();
	});
});
