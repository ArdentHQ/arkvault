import { describe, it } from "vitest";
import { render, screen, waitFor } from "@/utils/testing-library";
import { SelectToken } from "./SelectToken";
import userEvent from "@testing-library/user-event";

describe("SelectToken", () => {
	it("should render", () => {
		const { asFragment } = render(<SelectToken tokens={[{ label: "test", value: "test" }]} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render multiple ", () => {
		const { asFragment } = render(<SelectToken tokens={[{ label: "token1", value: "token1" }, { label: "token2", value: "token2" }]} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should change selection ", async () => {
		const onChangeMock = vi.fn()
		render(<SelectToken tokens={[{ label: "token1", value: "token1" }, { label: "token2", value: "token2" }]} onChange={onChangeMock} />);


		await userEvent.clear(screen.getByTestId("SelectDropdown__input"));
		await userEvent.type(screen.getByTestId("SelectDropdown__input"), "toke");


		await userEvent.click(screen.getByTestId("select-list__input"))
		expect(onChangeMock).toHaveBeenCalled()
	});
});
