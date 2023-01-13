import React from "react";
import { MigrationErrorStep } from "./MigrationErrorStep";
import { render, env, getDefaultProfileId } from "@/utils/testing-library";
import { Form } from "@/app/components/Form";
import { useMigrationForm } from "@/domains/migration/hooks";

const WrapperForm = ({ children }: { children: React.ReactElement }) => {
	const form = useMigrationForm();
	const wallet = env.profiles().findById(getDefaultProfileId()).wallets().first();
	form.setValue("wallet", wallet);

	return (
		<Form className="mx-auto max-w-xl" context={form}>
			{children}
		</Form>
	);
};

describe("MigrationErrorStep", () => {
	it("should render", () => {
		const { asFragment } = render(
			<WrapperForm>
				<MigrationErrorStep />
			</WrapperForm>,
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
