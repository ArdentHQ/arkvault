import fs from "fs";
import { http, HttpResponse } from "msw";

export const miscHandlers = [
	http.get("https://api.pwnedpasswords.com/range/:range", ({ request }) => {
		const url = new URL(request.url)
		if (url.searchParams.get("range") === "f3f69") {
			return HttpResponse.json(fs.readFileSync("src/tests/fixtures/haveibeenpwned/range-f3f69.txt", "utf8"))
		}

		return HttpResponse.json("")
	}),
];
