import React, { useState } from "react";
import { Route } from "react-router-dom";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import { useDeeplink } from "./use-deeplink";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

const history = createHashHistory();

const mainnetDeepLink =
	"/?method=transfer&coin=ark&network=ark.mainnet&recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&amount=1.2&memo=ARK";

describe("useDeeplink hook", () => {
	let profile: Contracts.IProfile;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	const TestComponent: React.FC = () => {
		const { deeplinkFailed, handleDeepLink, isDeeplink, validateDeeplink } = useDeeplink();

		const [deeplinkValidationResult, setDeeplinkValidationResult] = useState<string | undefined>(undefined);

		const validate = async () => {
			const result = await validateDeeplink(profile);

			setDeeplinkValidationResult(result);
		};

		const handle = async () => {
			handleDeepLink(profile);
		};

		if (deeplinkValidationResult && deeplinkFailed) {
			return <div data-testid="DeeplinkFailed">{deeplinkValidationResult}</div>;
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

	it("should use the method parameter to detect deeplink", async () => {
		history.push("/?coin=ark&network=ark.mainnet&recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&amount=1.2&memo=ARK");

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

	it("should validate url", async () => {
		history.push("/?method=transfer&coin=doge&network=ark.mainnet");

		render(
			<Route>
				<TestComponent />
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("DeeplinkValidate")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("DeeplinkValidate"));

		await expect(screen.findByTestId("DeeplinkFailed")).resolves.toBeVisible();

		expect(screen.getByTestId("DeeplinkFailed")).toHaveTextContent('Invalid URI: coin "DOGE" is not supported.');
	});

	it("should handle url", async () => {
		history.push(mainnetDeepLink);

		const historySpy = jest.spyOn(history, "push");

		render(
			<Route>
				<TestComponent />
			</Route>,
			{
				history,
			},
		);

		expect(screen.getByTestId("DeeplinkHandle")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("DeeplinkHandle"));

		expect(historySpy).toHaveBeenCalledWith(
			"/profiles/b999d134-7a24-481e-a95d-bc47c543bfc9/send-transfer?method=transfer&coin=ark&network=ark.mainnet&recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&amount=1.2&memo=ARK",
		);

		historySpy.mockRestore();
	});
});
