import React from "react";
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { ContactListMobile } from "./ContactListMobile";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

const options = [
	{ label: "Option 1", value: "option_1" },
	{ label: "Option 2", value: "option_2" },
];

describe("ContactListMobile", () => {
	let contacts: Contracts.IContact[];
	let profile: Contracts.IProfile;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		contacts = [profile.contacts().first()];
	});

	it("should render", () => {
		const { asFragment } = render(
			<ContactListMobile
				profile={profile}
				availableNetworks={[]}
				contacts={contacts}
				options={options}
				onAction={jest.fn()}
				onSend={jest.fn()}
			/>,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should execute onAction callback", () => {
		const onAction = jest.fn();

		render(
			<ContactListMobile
				profile={profile}
				availableNetworks={[]}
				contacts={contacts}
				onSend={jest.fn()}
				options={options}
				onAction={onAction}
			/>,
		);

		userEvent.click(screen.getByTestId("dropdown__toggle"));

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--0"));

		expect(onAction).toHaveBeenCalledWith(options[0], contacts[0]);
	});
});
