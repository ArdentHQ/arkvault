import React from "react";
import { render, env, getDefaultProfileId } from "@/utils/testing-library";
import { MigrationReviewStep } from "./MigrationReviewStep";

describe("MigrationReviewStep", () => {
	it("should render", () => {
		const wallet = env.profiles().findById(getDefaultProfileId()).wallets().first();
		const { asFragment } = render(() => {
			return (
				<form>
					<MigrationReviewStep onContinue={() => null} onCancel={() => null} wallet={wallet} />
				</form>
			);
		});

		expect(asFragment()).toMatchSnapshot();
	});
});
