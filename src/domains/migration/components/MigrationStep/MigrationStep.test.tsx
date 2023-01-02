import React from "react";
import userEvent from "@testing-library/user-event";
import { MigrationStep } from "./MigrationStep";
import { render, screen } from "@/utils/testing-library";

describe("MigrationStep", () => {
	it("should render ", () => {
		const title = "A title";
		const description = "A description";
		const isValid = true;
		const children = <div data-testid="MigrationStep__children" />;
		const onCancel = () => {};
		const onContinue = () => {};

		render(
			<MigrationStep
				title={title}
				description={description}
				isValid={isValid}
				onCancel={onCancel}
				onContinue={onContinue}
			>
				{children}
			</MigrationStep>,
		);

		expect(screen.getByTestId("header__title")).toHaveTextContent(title);
		expect(screen.getByTestId("header__subtitle")).toHaveTextContent(description);
		expect(screen.getByTestId("MigrationStep__children")).toBeInTheDocument();
	});

	it("should handle cancel button", () => {
		const title = "A title";
		const description = "A description";
		const isValid = true;
		const children = <div />;
		const onCancel = vi.fn();
		const onContinue = () => {};

		render(
			<MigrationStep
				title={title}
				description={description}
				isValid={isValid}
				onCancel={onCancel}
				onContinue={onContinue}
			>
				{children}
			</MigrationStep>,
		);

		userEvent.click(screen.getByTestId("MigrationAdd__cancel-btn"));

		expect(onCancel).toHaveBeenCalled();
	});

	it("should handle continue button", () => {
		const title = "A title";
		const description = "A description";
		const isValid = true;
		const children = <div />;
		const onCancel = () => {};
		const onContinue = vi.fn();

		render(
			<MigrationStep
				title={title}
				description={description}
				isValid={isValid}
				onCancel={onCancel}
				onContinue={onContinue}
			>
				{children}
			</MigrationStep>,
		);

		userEvent.click(screen.getByTestId("MigrationAdd__cancel__continue-btn"));

		expect(onContinue).toHaveBeenCalled();
	});
	it("disables the continue button if not valid", () => {
		const title = "A title";
		const description = "A description";
		const isValid = false;
		const children = <div />;
		const onCancel = () => {};
		const onContinue = vi.fn();

		render(
			<MigrationStep
				title={title}
				description={description}
				isValid={isValid}
				onCancel={onCancel}
				onContinue={onContinue}
			>
				{children}
			</MigrationStep>,
		);

		expect(screen.getByTestId("MigrationAdd__cancel__continue-btn")).toBeDisabled();

		userEvent.click(screen.getByTestId("MigrationAdd__cancel__continue-btn"));

		expect(onContinue).not.toHaveBeenCalled();
	});
});
