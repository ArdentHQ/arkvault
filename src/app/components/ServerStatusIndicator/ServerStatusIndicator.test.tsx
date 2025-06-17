/* eslint-disable @typescript-eslint/require-await */
import React, { useEffect } from "react";
import { useConfiguration, ConfigurationProvider } from "@/app/contexts";
import { ServerStatusIndicator } from "@/app/components/ServerStatusIndicator";
import { ServerStatus } from "@/utils/peers";
import { render, renderResponsiveWithRoute, getMainsailProfileId, env } from "@/utils/testing-library";

const dashboardURL = `/profiles/${getMainsailProfileId()}/dashboard`;

describe("Server Status Indicator", () => {
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
			<ServerHealthStatusWrapper status={{ "mainsail.devnet": { up: true } }} />,
			breakpoint,
			{
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as healthy", async () => {
		const { asFragment } = render(<ServerHealthStatusWrapper status={{ "mainsail.devnet": { up: true } }} />, {
			route: dashboardURL,
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as downgraded", async () => {
		const { asFragment } = render(
			<ServerHealthStatusWrapper status={{ "mainsail.devnet": { down: false, up: true } }} />,
			{
				route: dashboardURL,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render as unavailable", async () => {
		const { asFragment } = render(<ServerHealthStatusWrapper status={{ "mainsail.devnet": { down: false } }} />, {
			route: dashboardURL,
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render default", async () => {
		const { asFragment } = render(<ServerHealthStatusWrapper status={{}} />, {
			route: dashboardURL,
		});

		expect(asFragment()).toMatchSnapshot();
	});
});
