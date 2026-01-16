import { google } from "googleapis";
import {
  SlidesReplaceAllTextInput,
  InternalToolResponse,
} from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "slides_replace_all_text",
  description:
    "Replace all instances of a specified text string with another text string throughout an entire presentation. Useful for updating template variables or making bulk text changes.",
  inputSchema: {
    type: "object",
    properties: {
      presentationId: {
        type: "string",
        description: "The ID of the presentation",
      },
      findText: {
        type: "string",
        description: "The text to search for",
      },
      replaceText: {
        type: "string",
        description: "The text to replace with",
      },
      matchCase: {
        type: "boolean",
        description:
          "Whether the search should be case-sensitive (default: false)",
      },
    },
    required: ["presentationId", "findText", "replaceText"],
  },
} as const;

export async function replaceAllText(
  args: SlidesReplaceAllTextInput,
): Promise<InternalToolResponse> {
  try {
    const slides = google.slides("v1");
    const { presentationId, findText, replaceText, matchCase = false } = args;

    // Validate inputs
    if (!findText || findText.length === 0) {
      return ResponseFormatter.error(
        new Error("findText must not be empty"),
      );
    }

    const requests: any[] = [
      {
        replaceAllText: {
          containsText: {
            text: findText,
            matchCase,
          },
          replaceText,
        },
      },
    ];

    const response = await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests,
      },
    });

    if (!response.data || !response.data.replies || response.data.replies.length === 0) {
      return ResponseFormatter.error(
        new Error("Failed to replace text"),
      );
    }

    const reply = response.data.replies[0];
    const occurrencesChanged = reply.replaceAllText?.occurrencesChanged || 0;

    let output = `Text replacement completed:\n\n`;
    output += `Find: "${findText}"\n`;
    output += `Replace: "${replaceText}"\n`;
    output += `Match case: ${matchCase ? "Yes" : "No"}\n`;
    output += `Occurrences changed: ${occurrencesChanged}`;

    return ResponseFormatter.success(
      {
        presentationId,
        findText,
        replaceText,
        matchCase,
        occurrencesChanged,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
