import React from "react";

import { Icon } from "@/app/components/Icon";
import { Spinner } from "@/app/components/Spinner";
import { ReadableFile } from "@/app/hooks/use-files";

type FilePreviewVariant = "success" | "loading" | "danger";

interface FilePreviewProperties {
	file?: ReadableFile;
	variant?: FilePreviewVariant;
	useBorders?: boolean;
}

export const FilePreviewPlain = ({ file, variant }: { file: ReadableFile; variant?: FilePreviewVariant }) => {
	const fileTypeIcon: Record<string, string> = {
		csv: "ExtensionCsv",
		json: "ExtensionJson",
		wwe: "ExtensionWwe",
	};

	return (
		<div className="flex items-center justify-between space-x-4">
			<div className="flex flex-grow items-center space-x-4">
				<Icon name={fileTypeIcon[file.extension] || "File"} size="xl" />
				<div className="w-0 flex-1 truncate font-semibold">{file.name}</div>
			</div>

			{variant === "loading" && <Spinner size="md" />}

			{variant === "danger" && (
				<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-theme-danger-200 text-theme-danger-500">
					<Icon name="CrossSmall" size="sm" />
				</div>
			)}

			{variant === "success" && (
				<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-theme-success-200 text-theme-success-500">
					<Icon name="CheckmarkSmall" size="sm" />
				</div>
			)}
		</div>
	);
};

export const FilePreview = ({ file, useBorders = true, variant }: FilePreviewProperties) => {
	if (!file) {
		return <></>;
	}

	if (!useBorders) {
		return <FilePreviewPlain variant={variant} file={file} />;
	}

	return (
		<div className="rounded-lg border-2 border-theme-secondary-200 p-4 dark:border-theme-secondary-800">
			<FilePreviewPlain variant={variant} file={file} />
		</div>
	);
};
