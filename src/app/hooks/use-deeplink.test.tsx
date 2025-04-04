import React, { useState } from "react";
import { Route } from "react-router-dom";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import { useDeeplink } from "./use-deeplink";
import {
	env,
	getMainsailProfileId,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";

const history = createHashHistory();

const url =
	"/?method=transfer&coin=mainsail&network=mainsail.devnet&recipient=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6&amount=1.2&memo=ARK";

process.env.RESTORE_MAINSAIL_PROFILE = "true";
process.env.USE_MAINSAIL_NETWORK = "true";

describe("useDeeplink hook", () => {
	let profile: Contracts.IProfile;

	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());

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
		history.push(
			"/?coin=mainsail&network=mainsail.devnet&recipient=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6&amount=1.2&memo=ARK",
		);

		render(
			<Route>
				<TestComponent />
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("NoDeeplink")).toBeInTheDocument();
	});

	it("should validate url with errors", async () => {
		history.push("/?method=transfer&coin=doge&network=mainsail.devnet");

		render(
			<Route>
				<TestComponent />
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("DeeplinkValidate")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("DeeplinkValidate"));

		await expect(screen.findByTestId("DeeplinkFailed")).resolves.toBeVisible();

		expect(screen.getByTestId("DeeplinkFailed")).toHaveTextContent("Invalid URI: coin DOGE is not supported.");
	});

	it("should validate url without errors", async () => {
		history.push("/?method=transfer&coin=mainsail&network=mainsail.devnet");

		render(
			<Route>
				<TestComponent />
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("DeeplinkValidate")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("DeeplinkValidate"));

		await waitFor(() => expect(screen.queryByTestId("DeeplinkFailed")).not.toBeInTheDocument());
	});

	it("should handle url", async () => {
		history.push(url);

		const historySpy = vi.spyOn(history, "push");

		render(
			<Route>
				<TestComponent />
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("DeeplinkHandle")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("DeeplinkHandle"));

		expect(historySpy).toHaveBeenCalledWith(
			"/profiles/877b7695-8a55-4e16-a7ff-412113131856/send-transfer?method=transfer&coin=mainsail&network=mainsail.devnet&recipient=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6&amount=1.2&memo=ARK",
		);

		historySpy.mockRestore();
	});
});
