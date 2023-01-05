import { Icon } from "@/app/components/Icon";

export const MigrationPolygonIcon = () => {
	return (
		<>
			<div className="absolute top-0 right-8 bottom-0 flex w-8 items-center justify-center bg-white text-white text-theme-secondary-300 dark:bg-theme-secondary-900 dark:text-theme-secondary-800">
				<Icon name="Polygon" size="xl" />
			</div>

			<div className="text-purple-50 absolute top-0 right-8 bottom-0 flex w-8 items-center justify-center">
				<Icon name="DoubleArrowDown" size="lg" />
			</div>
		</>
	);
};
