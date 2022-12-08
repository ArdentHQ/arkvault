/* eslint-disable @typescript-eslint/require-await */
import React, { useEffect } from "react";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { useConfiguration, ConfigurationProvider } from "@/app/contexts";
import { ServerStatusIndicator } from "@/app/components/ServerStatusIndicator";
import { render, renderResponsiveWithRoute, getDefaultProfileId, env } from "@/utils/testing-library";
import { ServerHealthStatus } from "@/domains/setting/pages/Servers/Servers.contracts";

const history = createHashHistory();
const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;

describe("Server Status Indicator", () => {
	beforeAll(() => {
		history.push(dashboardURL);
	});

	const Component = ({ serverStatus }: { serverStatus: ServerHealthStatus }) => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const { setConfiguration } = useConfiguration();

		useEffect(() => {
			setConfiguration({ serverStatus });
		}, []);

		return <ServerStatusIndicator profile={profile} />;
	};

	const ServerHealthStatusWrapper = ({ status }: { status: ServerHealthStatus }) => (
		<ConfigurationProvider>
			<Component serverStatus={status} />
		</ConfigurationProvider>
	);

	it.each(["sm", "md", "lg", "xl"])("should render in %s", (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<ServerHealthStatusWrapper status={ServerHealthStatus.Healthy} />
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
				<ServerHealthStatusWrapper status={ServerHealthStatus.Healthy} />
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
				<ServerHealthStatusWrapper status={ServerHealthStatus.Downgraded} />
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
				<ServerHealthStatusWrapper status={ServerHealthStatus.Unavailable} />
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
				<ServerHealthStatusWrapper status="test" />
			</Route>,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
