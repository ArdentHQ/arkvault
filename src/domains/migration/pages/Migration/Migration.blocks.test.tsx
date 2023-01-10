import React from "react";
import userEvent from "@testing-library/user-event";
import { MigrationHeader, MigrationHeaderExtra, MigrationNewMigrationMobileButton } from "./Migration.blocks";
import { render, screen } from "@/utils/testing-library";

describe("MigrationHeader", () => {
	it("should render", () => {
		const onNewMigrationHandler = vi.fn();

		const { asFragment } = render(<MigrationHeader onNewMigration={onNewMigrationHandler} />);

		userEvent.click(screen.getByTestId("Migrations__add-migration-btn"));

		expect(onNewMigrationHandler).toHaveBeenCalled();

		expect(asFragment()).toMatchSnapshot();
	});
});

describe("MigrationHeaderExtra", () => {
	it("should render", () => {
		const onNewMigrationHandler = vi.fn();

		const { asFragment } = render(<MigrationHeaderExtra onNewMigration={onNewMigrationHandler} />);

		userEvent.click(screen.getByTestId("Migrations__add-migration-btn"));

		expect(onNewMigrationHandler).toHaveBeenCalled();

		expect(asFragment()).toMatchSnapshot();
	});
});

describe("MigrationNewMigrationMobileButton", () => {
	it("should render", () => {
		const onNewMigrationHandler = vi.fn();

		const { asFragment } = render(<MigrationNewMigrationMobileButton onNewMigration={onNewMigrationHandler} />);

		userEvent.click(screen.getByTestId("Migrations__add-migration-btn-mobile"));

		expect(onNewMigrationHandler).toHaveBeenCalled();

		expect(asFragment()).toMatchSnapshot();
	});
});
