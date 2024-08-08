import userEvent from "@testing-library/user-event";
import React from "react";

import { FeeWarning, FeeWarningVariant } from "./FeeWarning";
import { translations } from "@/domains/transaction/i18n";
import { renderWithForm, screen } from "@/utils/testing-library";

describe("FeeWarning", () => {
	it("should not render if not open", () => {
		const { asFragment } = renderWithForm(<FeeWarning isOpen={false} onCancel={vi.fn()} onConfirm={vi.fn()} />);

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each([FeeWarningVariant.Low, FeeWarningVariant.High])(
		"should render a warning for a fee that is too %s",
		(variant) => {
			const { asFragment } = renderWithForm(
				<FeeWarning isOpen={true} variant={variant} onCancel={vi.fn()} onConfirm={vi.fn()} />,
			);

			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_FEE_WARNING.TITLE);
			expect(screen.getByTestId("Modal__inner")).toHaveTextContent(
				translations.MODAL_FEE_WARNING.DESCRIPTION[`TOO_${variant}`],
			);

			expect(asFragment()).toMatchSnapshot();
		},
	);

	it("should call onCancel callback when closing the modal", async () => {
		const onCancel = vi.fn();

		renderWithForm(<FeeWarning isOpen={true} onCancel={onCancel} onConfirm={vi.fn()} />);

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		expect(onCancel).toHaveBeenCalledWith(true);
	});

	it("should call onCancel callback when clicking on cancel button", async () => {
		const onCancel = vi.fn();

		renderWithForm(<FeeWarning isOpen={true} onCancel={onCancel} onConfirm={vi.fn()} />);

		await userEvent.click(screen.getByTestId("FeeWarning__cancel-button"));

		expect(onCancel).toHaveBeenCalledWith(false);
	});

	it.each([true, false])(
		"should pass %s to onConfirm callback when clicking on continue button",
		async (suppressWarning) => {
			const onConfirm = vi.fn();

			renderWithForm(<FeeWarning isOpen={true} onCancel={vi.fn()} onConfirm={onConfirm} />, {
				registerCallback: ({ register }) => {
					register("suppressWarning");
				},
			});

			if (suppressWarning) {
				await userEvent.click(screen.getByTestId("FeeWarning__suppressWarning-toggle"));
			}

			await userEvent.click(screen.getByTestId("FeeWarning__continue-button"));

			expect(onConfirm).toHaveBeenCalledWith(suppressWarning);
		},
	);
});
