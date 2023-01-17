import React from "react";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { DTO } from "@ardenthq/sdk-profiles";
import { MigrationSuccessStep } from "./MigrationSuccessStep";
import { renderResponsiveWithRoute, getDefaultProfileId, env } from "@/utils/testing-library";
import { useMigrationForm } from "@/domains/migration/hooks";
import { Form } from "@/app/components/Form";

const history = createHashHistory();
let migrationUrl: string;
let transactionFixture: DTO.ExtendedSignedTransactionData;

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

		transactionFixture = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: wallet.address(),
					},
					fee: 1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);
	});

	it.each(["xs", "sm"])("should render in %s", (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/migration/add">
				<WrapperForm>
					<MigrationSuccessStep transaction={transactionFixture} migrationTransaction={{ id: "0xabcdef" }} />
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
