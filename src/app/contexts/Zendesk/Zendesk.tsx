import { useAccentColor, useTheme } from "@/app/hooks";
import React from "react";
import Zendesk, { ZendeskAPI } from "react-zendesk";
const ZENDESK_KEY = "0e4c4d37-9d38-4be4-925d-e659dd4d12bd";
import ZendeskStyles from "/src/styles/zendesk.css";

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

		setTimeout(() => {
			// @ts-ignore
			const widget = window.document.getElementById("webWidget").contentWindow.document;

			widget.body.classList.add("widget");
			widget.body.classList.add(isDarkMode ? "widget-dark" : "widget-light");
			widget.body.insertAdjacentHTML("afterend", `<style>${ZendeskStyles}</style>`);
		}, 300);
	};

	const hideSupportChat = () => {
		// @ts-ignore
		window.$zopim?.livechat?.window?.hide?.();
	};

	return { showSupportChat, hideSupportChat };
};
