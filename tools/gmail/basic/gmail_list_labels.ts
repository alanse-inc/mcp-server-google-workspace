import { google } from "googleapis";
import { GmailListLabelsInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "gmail_list_labels",
  description:
    "List all labels in the user's Gmail account. Returns both system labels (INBOX, SENT, TRASH, etc.) and user-created labels with their IDs and names.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
} as const;

export async function listLabels(
  args: GmailListLabelsInput,
): Promise<InternalToolResponse> {
  try {
    const gmail = google.gmail("v1");

    const response = await gmail.users.labels.list({
      userId: "me",
    });

    const labels = response.data.labels || [];

    if (labels.length === 0) {
      return ResponseFormatter.success(
        { count: 0, labels: [] },
        "No labels found in Gmail account",
      );
    }

    // Separate system and user labels
    const systemLabels = labels.filter((l) => l.type === "system");
    const userLabels = labels.filter((l) => l.type === "user");

    let output = `Total labels: ${labels.length}\n\n`;

    if (systemLabels.length > 0) {
      output += `📌 System Labels (${systemLabels.length}):\n`;
      systemLabels.forEach((label) => {
        output += `  - ${label.name} (ID: ${label.id})\n`;
      });
      output += `\n`;
    }

    if (userLabels.length > 0) {
      output += `🏷️  User Labels (${userLabels.length}):\n`;
      userLabels.forEach((label) => {
        output += `  - ${label.name} (ID: ${label.id})\n`;
      });
    }

    return ResponseFormatter.success(
      {
        count: labels.length,
        systemLabels: systemLabels.map((l) => ({
          id: l.id,
          name: l.name,
        })),
        userLabels: userLabels.map((l) => ({
          id: l.id,
          name: l.name,
        })),
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
