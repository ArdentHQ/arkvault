import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ConfirmSendTransaction } from "./ConfirmSendTransaction";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("ConfirmSendTransaction", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	it("should not render if not open", () => {
		const { asFragment } = render(
			<ConfirmSendTransaction isOpen={false} profile={profile} unconfirmedTransactions={[]} />,
		);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render modal", () => {
		const { asFragment } = render(
			<ConfirmSendTransaction isOpen={true} profile={profile} unconfirmedTransactions={[]} />,
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should confirm", async () => {
		const onConfirm = vi.fn();
		render(
			<ConfirmSendTransaction
				isOpen={true}
				profile={profile}
				unconfirmedTransactions={[]}
				onConfirm={onConfirm}
			/>,
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("ConfirmSendTransaction__confirm"));

		expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should cancel", async () => {
		const onCancel = vi.fn();
		render(
			<ConfirmSendTransaction isOpen={true} profile={profile} unconfirmedTransactions={[]} onClose={onCancel} />,
		);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("ConfirmSendTransaction__cancel"));

		expect(onCancel).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});
});
