import React from "react";
import { MigrationReviewStep } from "./MigrationReviewStep";
import { render, env, getDefaultProfileId } from "@/utils/testing-library";

describe("MigrationReviewStep", () => {
	it("should render", () => {
		const wallet = env.profiles().findById(getDefaultProfileId()).wallets().first();
		const { asFragment } = render(() => (
			<form>
				<MigrationReviewStep onContinue={() => null} onCancel={() => null} wallet={wallet} />
			</form>
		));

		expect(asFragment()).toMatchSnapshot();
	});
});
