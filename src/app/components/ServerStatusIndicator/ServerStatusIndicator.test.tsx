/* eslint-disable @typescript-eslint/require-await */
import React, { useEffect } from "react";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { useConfiguration, ConfigurationProvider } from "@/app/contexts";
import { ServerStatusIndicator } from "@/app/components/ServerStatusIndicator";
import { ServerStatus } from "@/utils/peers";
import { render, renderResponsiveWithRoute, getMainsailProfileId, env } from "@/utils/testing-library";

const history = createHashHistory();
const dashboardURL = `/profiles/${getMainsailProfileId()}/dashboard`;

describe("Server Status Indicator", () => {
	beforeAll(() => {
		navigate(dashboardURL);
	});

	const Component = ({ serverStatus }: { serverStatus: ServerStatus }) => {
		const profile = env.profiles().findById(getMainsailProfileId());
		const { setConfiguration } = useConfiguration();

		useEffect(() => {
			setConfiguration(profile.id(), { serverStatus });
		}, []);

		return <ServerStatusIndicator profile={profile} />;
	};

	const ServerHealthStatusWrapper = ({ status }: { status: ServerStatus }) => (
		<ConfigurationProvider>
			<Component serverStatus={status} />
		</ConfigurationProvider>
	);

	it.each(["sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<ServerHealthStatusWrapper status={{ "mainsail.devnet": { up: true } }} />
			</Route>,
			breakpoint,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as healthy", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<ServerHealthStatusWrapper status={{ "mainsail.devnet": { up: true } }} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as downgraded", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<ServerHealthStatusWrapper status={{ "mainsail.devnet": { down: false, up: true } }} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as unavailable", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<ServerHealthStatusWrapper status={{ "mainsail.devnet": { down: false } }} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render default", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/dashboard">
				<ServerHealthStatusWrapper status={{}} />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
