import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { MigrationReviewStep } from "./MigrationReviewStep";
import { render, env, getDefaultProfileId } from "@/utils/testing-library";
import { Form } from "@/app/components/Form";
import { useMigrationForm } from "@/domains/migration/hooks";

describe("MigrationReviewStep", () => {
	it("should render", () => {
		const { result: form } = renderHook(() => useMigrationForm());

		const wallet = env.profiles().findById(getDefaultProfileId()).wallets().first();
		form.current.setValue("wallet", wallet, { shouldDirty: true, shouldValidate: true });

		const { asFragment } = render(
			<Form className="mx-auto max-w-xl" context={form.current}>
				<MigrationReviewStep />
			</Form>,
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
