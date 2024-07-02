/* eslint-disable @typescript-eslint/require-await */
import { createHashHistory } from "history";
import React, { useEffect } from "react";
import { Route } from "react-router-dom";

import { ServerStatusIndicator } from "@/app/components/ServerStatusIndicator";
import { ConfigurationProvider, useConfiguration } from "@/app/contexts";
import { ServerStatus } from "@/utils/peers";
import { env, getDefaultProfileId, render, renderResponsiveWithRoute } from "@/utils/testing-library";

const history = createHashHistory();
const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;

describe("Server Status Indicator", () => {
	beforeAll(() => {
		history.push(dashboardURL);
	});

	const Component = ({ serverStatus }: { serverStatus: ServerStatus }) => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const { setConfiguration } = useConfiguration();

		useEffect(() => {
			setConfiguration({ serverStatus });
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
				<ServerHealthStatusWrapper status={{ "ark.devnet": { up: true } }} />
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
				<ServerHealthStatusWrapper status={{ "ark.devnet": { up: true } }} />
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
				<ServerHealthStatusWrapper status={{ "ark.devnet": { down: false, up: true } }} />
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
				<ServerHealthStatusWrapper status={{ "ark.devnet": { down: false } }} />
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
