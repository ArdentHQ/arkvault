import React, { useState } from "react";
import { Route } from "react-router-dom";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import { useDeeplink } from "./use-deeplink";
import {
	env, generateHistoryCalledWith,
	getDefaultProfileId,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";

const history = createHashHistory();

const url =
	"/?method=transfer&coin=ark&network=ark.devnet&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o&amount=1.2&memo=ARK";

describe("useDeeplink hook", () => {
	let profile: Contracts.IProfile;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		mockProfileWithPublicAndTestNetworks(profile);
	});

	const TestComponent: React.FC = () => {
		const { handleDeepLink, isDeeplink, validateDeeplink } = useDeeplink();

		const [deeplinkValidationErrors, setDeepinkValidationErrors] = useState<string | undefined>(undefined);

		const validate = async () => {
			const errors = await validateDeeplink(profile);

			setDeepinkValidationErrors(errors);
		};

		const handle = () => {
			handleDeepLink(profile);
		};

		if (deeplinkValidationErrors) {
			return <div data-testid="DeeplinkFailed">{deeplinkValidationErrors}</div>;
		}

		if (!isDeeplink()) {
			return <div data-testid="NoDeeplink" />;
		}

		return (
			<h1>
				Deeplink Test
				<button data-testid="DeeplinkValidate" onClick={validate}>
					Validate
				</button>
				<button data-testid="DeeplinkHandle" onClick={handle}>
					Handle
				</button>
			</h1>
		);
	};

	it("should use the method parameter to detect deeplink", () => {
		history.push("/?coin=ark&network=ark.devnet&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o&amount=1.2&memo=ARK");

		render(
			<Route path="/" element={<TestComponent/>}/>,
			{
				history,
			},
		);

		expect(screen.getByTestId("NoDeeplink")).toBeInTheDocument();
	});

	it("should validate url with errors", async () => {
		history.push("/?method=transfer&coin=doge&network=ark.devnet");

		render(
			<Route path="/" element={<TestComponent/>}/>,
			{
				history,
			},
		);

		expect(screen.getByTestId("DeeplinkValidate")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("DeeplinkValidate"));

		await expect(screen.findByTestId("DeeplinkFailed")).resolves.toBeVisible();

		expect(screen.getByTestId("DeeplinkFailed")).toHaveTextContent("Invalid URI: coin DOGE is not supported.");
	});

	it("should validate url without errors", async () => {
		history.push("/?method=transfer&coin=ark&network=ark.devnet");

		render(
			<Route path="/" element={<TestComponent/>}/>,
			{
				history,
			},
		);

		expect(screen.getByTestId("DeeplinkValidate")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("DeeplinkValidate"));

		await waitFor(() => expect(screen.queryByTestId("DeeplinkFailed")).not.toBeInTheDocument());
	});

	it("should handle url", () => {
		history.push(url);

		const historySpy = vi.spyOn(history, "push");

		render(
			<Route path="/" element={<TestComponent/>}/>,
			{
				history,
			},
		);

		expect(screen.getByTestId("DeeplinkHandle")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("DeeplinkHandle"));

		expect(historySpy).toHaveBeenCalledWith(...generateHistoryCalledWith({pathname: "/profiles/b999d134-7a24-481e-a95d-bc47c543bfc9/send-transfer", search: "?method=transfer&coin=ark&network=ark.devnet&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o&amount=1.2&memo=ARK"}));

		historySpy.mockRestore();
	});
});
