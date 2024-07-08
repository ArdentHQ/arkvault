/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { SignIn } from "./SignIn";
import { translations } from "@/domains/profile/i18n";
import {
	act,
	env,
	getDefaultPassword,
	getPasswordProtectedProfileId,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;

const submitID = "SignIn__submit-button";
const passwordInput = "SignIn__input--password";

describe("SignIn", () => {
	beforeEach(async () => {
		profile = env.profiles().findById(getPasswordProtectedProfileId());
		await env.profiles().restore(profile, getDefaultPassword());
	});

	beforeEach(() => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	it("should not render if not open", () => {
		const { asFragment } = render(<SignIn profile={profile} isOpen={false} onSuccess={vi.fn} />);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render a modal", async () => {
		const { asFragment } = render(<SignIn isOpen={true} profile={profile} onSuccess={vi.fn} />);

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SIGN_IN.TITLE);
		});

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_SIGN_IN.DESCRIPTION);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should cancel sign in", async () => {
		const onCancel = vi.fn();

		render(<SignIn isOpen={true} profile={profile} onCancel={onCancel} onSuccess={vi.fn} />);

		await userEvent.click(screen.getByTestId("SignIn__cancel-button"));

		await waitFor(() => {
			expect(onCancel).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
		});
	});

	it("should call onSuccess callback", async () => {
		const onSuccess = vi.fn();

		render(<SignIn isOpen={true} profile={profile} onSuccess={onSuccess} />);

		await userEvent.type(screen.getByTestId(passwordInput), getDefaultPassword());

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId(submitID));

		await waitFor(() => {
			expect(onSuccess).toHaveBeenCalledWith(getDefaultPassword());
		});
	});

	it("should set an error if the password is invalid", async () => {
		const onSuccess = vi.fn();

		render(<SignIn isOpen={true} profile={profile} onSuccess={onSuccess} />);

		await userEvent.type(screen.getByTestId(passwordInput), "wrong password");

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId(submitID));

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

		expect(screen.getByTestId("Input__error")).toBeVisible();
		expect(screen.getByTestId(submitID)).toBeDisabled();
	});

	it("should set an error if the password is invalid and count retries", async () => {
		const onSuccess = vi.fn();

		render(<SignIn isOpen={true} profile={profile} onSuccess={onSuccess} />);

		await userEvent.type(screen.getByTestId(passwordInput), "wrong password");

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId(submitID));
		vi.advanceTimersByTime(20_000);

		await userEvent.type(screen.getByTestId(passwordInput), "wrong password");

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId(submitID));
		vi.advanceTimersByTime(60_000);

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

		expect(screen.getByTestId("Input__error")).toBeVisible();
		expect(screen.getByTestId(submitID)).toBeDisabled();
	});

	it("should set an error and disable the input if the password is invalid multiple times", async () => {
		const onSuccess = vi.fn();

		render(<SignIn isOpen={true} profile={profile} onSuccess={onSuccess} />);

		for (const index of [1, 2, 3]) {
			await userEvent.type(screen.getByTestId(passwordInput), `wrong password ${index}`);

			// wait for form to be updated
			await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId(submitID));

			// wait for form to be updated
			await expect(screen.findByTestId(submitID)).resolves.toBeVisible();
		}

		expect(screen.getByTestId(submitID)).toBeDisabled();
		expect(screen.getByTestId(passwordInput)).toBeDisabled();

		act(() => {
			vi.clearAllTimers();
		});

		// wait for form to be updated
		await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

		await waitFor(() =>
			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				"data-errortext",
				expect.stringMatching(/Maximum sign in attempts/),
			),
		);
	});
});
