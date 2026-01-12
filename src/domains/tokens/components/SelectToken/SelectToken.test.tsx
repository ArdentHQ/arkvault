import { describe, it } from "vitest"
import { render } from "@/utils/testing-library";
import { SelectToken } from "./SelectToken";

describe("SelectToken", () => {
	it("should render", async () => {
		const { asFragment } = render(<SelectToken tokens={[{ name: "test" }]} />);
		expect(asFragment()).toMatchSnapshot()

	});

	it("should render multiple ", async () => {
		const { asFragment } = render(<SelectToken tokens={[{ name: "token1", }, { name: "token1", }]} />);
		expect(asFragment()).toMatchSnapshot()

	});
});
