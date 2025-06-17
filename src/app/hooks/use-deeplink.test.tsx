import React, { useState } from "react";
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import { useDeeplink } from "./use-deeplink";
import {
	env,
	getMainsailProfileId,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";

const url =
	"/?method=transfer&network=mainsail.devnet&recipient=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6&amount=1.2&memo=ARK";

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
		const route =
			"/?network=mainsail.devnet&recipient=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6&amount=1.2&memo=ARK";

		render(<TestComponent />, {
			route,
		});

		expect(screen.getByTestId("NoDeeplink")).toBeInTheDocument();
	});

	it("should validate url with errors", async () => {
		const route = "/?method=teeeest&network=mainsail.devnet";

		render(<TestComponent />, {
			route,
		});

		expect(screen.getByTestId("DeeplinkValidate")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("DeeplinkValidate"));

		await expect(screen.findByTestId("DeeplinkFailed")).resolves.toBeVisible();

		expect(screen.getByTestId("DeeplinkFailed")).toHaveTextContent("i");
	});

	it("should validate url without errors", async () => {
		render(<TestComponent />, {
			route: "/?method=transfer&network=mainsail.devnet",
		});

		expect(screen.getByTestId("DeeplinkValidate")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("DeeplinkValidate"));

		await waitFor(() => expect(screen.queryByTestId("DeeplinkFailed")).not.toBeInTheDocument());
	});

	it("should handle url", async () => {
		const { router } = render(<TestComponent />, {
			route: url,
		});

		expect(screen.getByTestId("DeeplinkHandle")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("DeeplinkHandle"));

		expect(router.state.location.pathname + router.state.location.search).toBe(
			"/profiles/877b7695-8a55-4e16-a7ff-412113131856/send-transfer?method=transfer&network=mainsail.devnet&recipient=0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6&amount=1.2&memo=ARK",
		);
	});
});
