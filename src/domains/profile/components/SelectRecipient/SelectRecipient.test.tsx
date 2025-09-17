import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { SelectRecipient } from "./SelectRecipient";
import { env, getMainsailProfileId, render, screen, waitFor } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const selectRecipient = () => screen.getByTestId("SelectRecipient__select-recipient");

describe("SelectRecipient", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
	});

	it("should render empty", () => {
		const { container } = render(<SelectRecipient profile={profile} />);

		expect(container).toMatchSnapshot();
	});

	it("should render disabled", () => {
		const { container } = render(<SelectRecipient profile={profile} disabled />);

		expect(container).toMatchSnapshot();
	});

	it("should render invalid", () => {
		const { container } = render(<SelectRecipient profile={profile} isInvalid />);

		expect(container).toMatchSnapshot();
	});

	it("should render without a wallet avatar", () => {
		render(<SelectRecipient profile={profile} />);

		expect(screen.queryByTestId("Avatar")).not.toBeInTheDocument();
	});

	it("should update internal state when prop changes", () => {
		const { container, rerender } = render(<SelectRecipient profile={profile} />);

		rerender(<SelectRecipient profile={profile} address="0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" />);

		expect(container).toMatchSnapshot();
	});

	it("should open and close contacts modal", async () => {
		render(<SelectRecipient profile={profile} address="0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" />);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(selectRecipient());

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
	});

	it("should focus & blur-xs the address input when is expanded", async () => {
		const contactsSpy = vi.spyOn(profile.contacts(), "findByAddress").mockReturnValue([]);

		render(<SelectRecipient profile={profile} />);
		const recipientInputField = screen.getByTestId("SelectDropdown__input");

		const focusSpy = vi.spyOn(recipientInputField, "focus");
		const blurSpy = vi.spyOn(recipientInputField, "blur");

		// 1. Focus the select input which opens the drodpown
		await userEvent.click(recipientInputField);

		// 2. Click to open the modal
		await userEvent.click(selectRecipient());

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		expect(focusSpy).toHaveBeenCalledTimes(2);
		expect(blurSpy).toHaveBeenCalledTimes(2);

		contactsSpy.mockRestore();
		focusSpy.mockRestore();
		blurSpy.mockRestore();
	});

	it("should not focus & blur-xs the address input when is not expanded", async () => {
		const contactsSpy = vi.spyOn(profile.contacts(), "findByAddress").mockReturnValue([]);

		render(<SelectRecipient profile={profile} />);
		const recipientInputField = screen.getByTestId("SelectDropdown__input");

		const focusSpy = vi.spyOn(recipientInputField, "focus");
		const blurSpy = vi.spyOn(recipientInputField, "blur");

		await userEvent.click(selectRecipient());

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		expect(focusSpy).not.toHaveBeenCalled();
		expect(blurSpy).not.toHaveBeenCalled();

		contactsSpy.mockRestore();
		focusSpy.mockRestore();
		blurSpy.mockRestore();
	});

	it("should select address from contacts modal", async () => {
		render(<SelectRecipient profile={profile} address="0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" />);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(selectRecipient());

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		const firstContactAddress = screen.getByTestId("RecipientListItem__select-button-2");

		await userEvent.click(firstContactAddress);

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(
				profile.contacts().values()[0].addresses().values()[0].address(),
			),
		);
	});

	it("should not show select recipient button if showOptions is false", async () => {
		render(<SelectRecipient profile={profile} showOptions={false} />);

		expect(screen.queryByTestId("queryByTestId-recipient")).not.toBeInTheDocument();
	});

	it("should not open contacts modal if disabled", async () => {
		render(<SelectRecipient profile={profile} address="0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" disabled />);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(selectRecipient());

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());
	});

	it("should call onChange prop when entered address in input", async () => {
		const address = "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6";

		const contactsSpy = vi.spyOn(profile.contacts(), "findByAddress").mockReturnValue([]);
		const onChange = vi.fn();

		render(<SelectRecipient profile={profile} onChange={onChange} />);
		const recipientInputField = screen.getByTestId("SelectDropdown__input");

		await userEvent.type(recipientInputField, address);

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(address);

		expect(onChange).toHaveBeenCalledWith(address, {
			address,
			alias: undefined,
			isContact: false,
		});

		contactsSpy.mockRestore();
	});

	it("should call onChange prop if provided", async () => {
		const onChange = vi.fn();

		render(
			<SelectRecipient
				profile={profile}
				onChange={onChange}
				address="0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6"
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(selectRecipient());

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		const firstAddress = screen.getByTestId("RecipientListItem__select-button-2");

		await userEvent.click(firstAddress);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		const selectedAddressValue = profile.contacts().values()[0].addresses().values()[0].address();

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(selectedAddressValue);
		expect(onChange).toHaveBeenCalledWith(selectedAddressValue, expect.any(Object));
	});

	it("should call onChange prop only when values change", async () => {
		const onChange = vi.fn();

		render(
			<SelectRecipient
				profile={profile}
				onChange={onChange}
				address="0x28FA32ec11f64ae8Bc4223e77DeE4db24A5E46Da"
			/>,
		);

		const selectedAddressValue = profile.contacts().values()[0].addresses().values()[0].address();

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(selectedAddressValue);

		await userEvent.click(selectRecipient());

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		const lastAddress = screen.getByTestId("RecipientListItem__selected-button-2");

		await userEvent.click(lastAddress);

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(selectedAddressValue);
		expect(onChange).not.toHaveBeenCalled();
	});

	it("should filter recipients list by network if provided", async () => {
		const function_ = vi.fn();

		const wallet = profile.wallets().first();

		render(
			<SelectRecipient
				profile={profile}
				onChange={function_}
				address="0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6"
				network={wallet.network()}
			/>,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(selectRecipient());

		await waitFor(() => expect(screen.queryByTestId("RecipientListItem__select-button")).not.toBeInTheDocument());
	});
});
