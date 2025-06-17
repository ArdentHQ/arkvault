import userEvent from "@testing-library/user-event";
import React from "react";

import { SyncErrorMessage } from "./ProfileSyncStatusMessage";
import { render, screen, waitFor, within } from "@/utils/testing-library";

describe("SyncErrorMessage", () => {
	const failedNetworkNames = ["ARK Devnet", "ARK Mainnet", "Lisk Devnet"];

	it("should render one failed network", async () => {
		const { container } = render(<SyncErrorMessage failedNetworkNames={[failedNetworkNames[0]]} />, {
			route: "/",
		});

		await expect(screen.findByText(failedNetworkNames[0])).resolves.toBeVisible();

		expect(container).toMatchSnapshot();
	});

	it("should render two failed networks", async () => {
		const { container } = render(
			<SyncErrorMessage failedNetworkNames={[failedNetworkNames[0], failedNetworkNames[1]]} />,
			{
				route: "/",
			},
		);

		await expect(screen.findByText(failedNetworkNames[0])).resolves.toBeVisible();
		await expect(screen.findByText(failedNetworkNames[1])).resolves.toBeVisible();

		expect(container).toMatchSnapshot();
	});

	it("should render multiple failed networks", async () => {
		const { container } = render(<SyncErrorMessage failedNetworkNames={failedNetworkNames} />, {
			route: "/",
		});

		await expect(screen.findByText(failedNetworkNames[0])).resolves.toBeVisible();
		await expect(screen.findByText(failedNetworkNames[1])).resolves.toBeVisible();

		expect(container).toMatchSnapshot();
	});

	it("should handle retry", async () => {
		const onRetry = vi.fn();
		const { container } = render(<SyncErrorMessage failedNetworkNames={failedNetworkNames} onRetry={onRetry} />, {
			route: "/",
		});

		await expect(screen.findByText(failedNetworkNames[0])).resolves.toBeVisible();
		await expect(screen.findByText(failedNetworkNames[1])).resolves.toBeVisible();
		await expect(screen.findByText(failedNetworkNames[2])).resolves.toBeVisible();

		userEvent.click(within(screen.getByTestId("SyncErrorMessage__retry")).getByRole("link"));

		await waitFor(() => expect(onRetry).toHaveBeenCalledWith());

		expect(container).toMatchSnapshot();
	});
});
