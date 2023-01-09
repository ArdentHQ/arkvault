import React from "react";
import { Icon } from "@/app/components/Icon";
import { Image } from "@/app/components/Image";

export const MigrationPolygonIcon = () => (
	<>
		<div className="absolute inset-0">
			<Image name="Hexagon" width={44} height={44} useAccentColor={false} />
		</div>

		<Icon className="relative text-theme-hint-600" name="Received" size="lg" />
	</>
);
