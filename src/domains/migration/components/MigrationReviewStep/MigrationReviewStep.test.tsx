import React, { useEffect } from "react";
import { MigrationReviewStep } from "./MigrationReviewStep";
import { render, env, getDefaultProfileId } from "@/utils/testing-library";
import { Form } from "@/app/components/Form";
import { useMigrationForm } from "@/domains/migration/hooks";

const WrapperForm = ({ children }: { children: React.ReactElement }) => {
	const form = useMigrationForm();

	return (
		<Form className="mx-auto max-w-xl" context={form}>
			{children}
		</Form>
	);
};
describe("MigrationReviewStep", () => {
	it("should render", () => {
		const wallet = env.profiles().findById(getDefaultProfileId()).wallets().first();

		const { asFragment } = render(
			<WrapperForm>
				<MigrationReviewStep onContinue={() => null} wallet={wallet} />
			</WrapperForm>,
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
