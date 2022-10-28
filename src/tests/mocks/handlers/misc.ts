import fs from "fs";
import { rest } from "msw";

export const miscHandlers = [
	rest.get("https://api.pwnedpasswords.com/range/:range", (request, response, context) => {
		if (request.params.range === "f3f69") {
			return response(
				context.status(200),
				context.json(fs.readFileSync("src/tests/fixtures/haveibeenpwned/range-f3f69.txt", "utf8")),
			);
		}

		return response(context.status(200), context.json(""));
	}),
];
