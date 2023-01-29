import React from "react";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { MigrationSuccessStep } from "./MigrationSuccessStep";
import { renderResponsiveWithRoute, getDefaultProfileId, env } from "@/utils/testing-library";
import { useMigrationForm } from "@/domains/migration/hooks";
import { Form } from "@/app/components/Form";

const history = createHashHistory();
let migrationUrl: string;

const WrapperForm = ({ children }: { children: React.ReactElement }) => {
	const form = useMigrationForm();

	return (
		<Form className="mx-auto max-w-xl" context={form}>
			{children}
		</Form>
	);
};

describe("MigrationSuccessStep", () => {
	beforeAll(async () => {
		migrationUrl = `/profiles/${getDefaultProfileId()}/migration/add`;
		history.push(migrationUrl);
		const profile = env.profiles().findById(getDefaultProfileId());
		const wallet = profile.wallets().first();
	});

	it.each(["xs", "sm"])("should render in %s", (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/migration/add">
				<WrapperForm>
					<MigrationSuccessStep migrationTransaction={{ migrationId: "0xabcdef" }} />
				</WrapperForm>
			</Route>,
			breakpoint,
			{
				history,
				route: migrationUrl,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
