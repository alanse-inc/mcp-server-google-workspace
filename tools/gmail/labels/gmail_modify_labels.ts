import { google } from "googleapis";
import { GmailModifyLabelsInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "gmail_modify_labels",
  description:
    "Add or remove labels from a Gmail message. Can add and remove multiple labels in a single operation. Use gmail_list_labels to get available label IDs.",
  inputSchema: {
    type: "object",
    properties: {
      messageId: {
        type: "string",
        description: "The Gmail message ID to modify",
      },
      addLabelIds: {
        type: "array",
        items: { type: "string" },
        description:
          "Array of label IDs to add (e.g., ['INBOX', 'STARRED', 'Label_123'])",
        optional: true,
      },
      removeLabelIds: {
        type: "array",
        items: { type: "string" },
        description:
          "Array of label IDs to remove (e.g., ['UNREAD', 'SPAM'])",
        optional: true,
      },
    },
    required: ["messageId"],
  },
} as const;

export async function modifyLabels(
  args: GmailModifyLabelsInput,
): Promise<InternalToolResponse> {
  try {
    const gmail = google.gmail("v1");
    const { messageId, addLabelIds = [], removeLabelIds = [] } = args;

    // Validate at least one operation
    if (addLabelIds.length === 0 && removeLabelIds.length === 0) {
      return ResponseFormatter.error(
        new Error(
          "At least one of addLabelIds or removeLabelIds must be provided",
        ),
      );
    }

    // Modify labels
    const response = await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        addLabelIds: addLabelIds.length > 0 ? addLabelIds : undefined,
        removeLabelIds: removeLabelIds.length > 0 ? removeLabelIds : undefined,
      },
    });

    const updatedLabels = response.data.labelIds || [];

    let output = `✅ Successfully modified labels for message: ${messageId}\n\n`;

    if (addLabelIds.length > 0) {
      output += `➕ Added labels: ${addLabelIds.join(", ")}\n`;
    }

    if (removeLabelIds.length > 0) {
      output += `➖ Removed labels: ${removeLabelIds.join(", ")}\n`;
    }

    output += `\n📋 Current labels: ${updatedLabels.join(", ") || "(none)"}`;

    return ResponseFormatter.success(
      {
        messageId,
        addedLabels: addLabelIds,
        removedLabels: removeLabelIds,
        currentLabels: updatedLabels,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
