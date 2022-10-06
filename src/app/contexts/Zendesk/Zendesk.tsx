import { useAccentColor, useTheme } from "@/app/hooks";
import React from "react";
import Zendesk, { ZendeskAPI } from "react-zendesk";
const ZENDESK_KEY = "0e4c4d37-9d38-4be4-925d-e659dd4d12bd";

interface Properties {
	children: React.ReactNode;
}

const ZendeskContext = React.createContext<any>(undefined);

export const ZendeskProvider = ({ children }: Properties) => {
	return (
		<ZendeskContext.Provider value={null}>
			{children}

			<Zendesk zendeskKey={ZENDESK_KEY} />
		</ZendeskContext.Provider>
	);
};

export const useZendesk = () => {
	const { getCurrentAccentColor } = useAccentColor();
	const { isDarkMode } = useTheme();

	const accentColors = {
		green: "#289548",
		navy: "#235b95",
	};

	const showSupportChat = () => {
		ZendeskAPI("webWidget", "updateSettings", {
			webWidget: {
				color: {
					theme: accentColors[getCurrentAccentColor()],
					button: accentColors[getCurrentAccentColor()],
				},
			},
		});

		// @ts-ignore
		window.$zopim?.livechat?.window?.show?.();

		// TODO: Cleanup.
		setTimeout(() => {
			// @ts-ignore
			const widget = window.document.getElementById("webWidget").contentWindow.document;

			widget.getElementsByTagName("H1")[0].style.color = "#eef3f5";
			widget.getElementsByTagName("FOOTER")[0].style.setProperty("border", "none", "important");
			widget.getElementsByTagName("a")[0].style.visibility = "hidden";
			widget.getElementsByTagName("BUTTON")[2].style.setProperty("color", "#eef3f5", "important");
		}, 400);

		if (!isDarkMode) {
			return;
		}

		// TODO: Cleanup
		setTimeout(() => {
			// @ts-ignore
			const widget = window.document.getElementById("webWidget").contentWindow.document;

			widget.getElementsByTagName("H1")[0].style.color = "#eef3f5";
			widget.getElementsByTagName("BUTTON")[0].style.color = "#eef3f5";

			widget.getElementsByTagName("FORM")[0].style.backgroundColor = "#212225";

			widget.getElementsByTagName("INPUT")[0].style.backgroundColor = "#212225";
			widget.getElementsByTagName("INPUT")[0].style.borderColor = "#637282";

			widget.getElementsByTagName("INPUT")[1].style.backgroundColor = "#212225";
			widget.getElementsByTagName("INPUT")[1].style.borderColor = "#637282";

			widget.getElementsByTagName("INPUT")[2].style.backgroundColor = "#212225";
			widget.getElementsByTagName("INPUT")[2].style.borderColor = "#637282";

			widget.getElementsByTagName("TEXTAREA")[0].style.backgroundColor = "#212225";
			widget.getElementsByTagName("TEXTAREA")[0].style.borderColor = "#637282";

			widget.getElementsByTagName("LABEL")[0].style.color = "#a5adb9";
			widget.getElementsByTagName("LABEL")[1].style.color = "#a5adb9";
			widget.getElementsByTagName("LABEL")[2].style.color = "#a5adb9";
			widget.getElementsByTagName("LABEL")[3].style.color = "#a5adb9";

			widget.getElementsByTagName("BUTTON")[1].style.background = "#3c4249";
			widget.getElementsByTagName("BUTTON")[1].style.border = "none";
		}, 200);
	};

	const hideSupportChat = () => {
		// @ts-ignore
		window.$zopim?.livechat?.window?.hide?.();
	};

	return { showSupportChat, hideSupportChat };
};
