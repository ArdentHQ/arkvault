/* eslint-disable @typescript-eslint/require-await */
import React, { useEffect } from "react";
import { createHashHistory } from "history";
import { useConfiguration, ConfigurationProvider } from "@/app/contexts";
import { useServerHealthStatus } from "@/app/hooks";
import { render, screen, getDefaultProfileId } from "@/utils/testing-library";
import { ServerStatus } from "@/utils/peers";
import { ServerHealthStatus } from "@/domains/setting/pages/Servers/Servers.contracts";

const history = createHashHistory();
const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;

describe("useServerHealthStatus", () => {
	beforeAll(() => {
		history.push(dashboardURL);
	});

	const Component = ({ serverStatus }: { serverStatus: ServerHealthStatus }) => {
		const { setConfiguration } = useConfiguration();
		const { status } = useServerHealthStatus();

		useEffect(() => {
			setConfiguration({ serverStatus });
		}, []);

		return <div data-testid={`ServerHealthStatus--${status.value}`} />;
	};

	const ServerHealthStatusWrapper = ({ status }: { status: ServerStatus }) => (
		<ConfigurationProvider>
			<Component serverStatus={status} />
		</ConfigurationProvider>
	);

	it("should render as healthy", async () => {
		render(<ServerHealthStatusWrapper status={{ "ark.devnet": { up: true } }} />);

		await expect(screen.findByTestId("ServerHealthStatus--0")).resolves.toBeVisible();
	});

	it("should render as downgraded", async () => {
		render(<ServerHealthStatusWrapper status={{ "ark.devnet": { up: true, down: false } }} />);

		await expect(screen.findByTestId("ServerHealthStatus--1")).resolves.toBeVisible();
	});

	it("should render as unavailable", async () => {
		render(<ServerHealthStatusWrapper status={{ "ark.devnet": { down: false } }} />);

		await expect(screen.findByTestId("ServerHealthStatus--2")).resolves.toBeVisible();
	});
});
