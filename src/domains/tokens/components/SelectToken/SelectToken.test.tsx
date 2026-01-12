import { describe, beforeAll, it } from "vitest"
import { env, getMainsailProfileId, render } from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";
import { SelectToken } from "./SelectToken";

let profile: Contracts.IProfile;

describe("SelectToken", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
	});

	it("should render", async () => {
		const { asFragment } = render(<SelectToken tokens={[{ name: "test" }]} />);
		expect(asFragment()).toMatchSnapshot()

	});
});
