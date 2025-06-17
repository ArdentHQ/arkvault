import React, { useEffect } from "react";
import { useConfiguration, ConfigurationProvider } from "@/app/contexts";
import { useServerHealthStatus } from "@/app/hooks";
import { render, screen, getMainsailProfileId } from "@/utils/testing-library";
import { ServerStatus } from "@/utils/peers";
import { ServerHealthStatus } from "@/domains/setting/pages/Servers/Servers.contracts";

describe("useServerHealthStatus", () => {
	const Component = ({ serverStatus }: { serverStatus: ServerHealthStatus }) => {
		const { setConfiguration } = useConfiguration();
		const { status } = useServerHealthStatus();

		useEffect(() => {
			setConfiguration(getMainsailProfileId(), { serverStatus });
		}, []);

		return <div data-testid={`ServerHealthStatus--${status.value}`} />;
	};

	const ServerHealthStatusWrapper = ({ status }: { status: ServerStatus }) => (
		<ConfigurationProvider>
			<Component serverStatus={status} />
		</ConfigurationProvider>
	);

	it("should render as healthy", async () => {
		render(<ServerHealthStatusWrapper status={{ "ark.devnet": { up: true } }} />, {
			route: `/profiles/${getMainsailProfileId()}/votes`,
		});

		await expect(screen.findByTestId("ServerHealthStatus--0")).resolves.toBeVisible();
	});

	it("should render as downgraded", async () => {
		render(<ServerHealthStatusWrapper status={{ "ark.devnet": { down: false, up: true } }} />, {
			route: `/profiles/${getMainsailProfileId()}/votes`,
		});

		await expect(screen.findByTestId("ServerHealthStatus--1")).resolves.toBeVisible();
	});

	it("should render as unavailable", async () => {
		render(<ServerHealthStatusWrapper status={{ "ark.devnet": { down: false } }} />, {
			route: `/profiles/${getMainsailProfileId()}/votes`,
		});

		await expect(screen.findByTestId("ServerHealthStatus--2")).resolves.toBeVisible();
	});
});
