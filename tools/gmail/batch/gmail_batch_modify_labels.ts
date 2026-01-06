import { google } from "googleapis";
import {
  GmailBatchModifyLabelsInput,
  InternalToolResponse,
} from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "gmail_batch_modify_labels",
  description:
    "Modify labels on multiple Gmail messages in a single batch operation. More efficient than calling gmail_modify_labels multiple times. Can add and/or remove labels from many messages at once.",
  inputSchema: {
    type: "object",
    properties: {
      messageIds: {
        type: "array",
        items: { type: "string" },
        description:
          "Array of Gmail message IDs to modify (max recommended: 1000)",
      },
      addLabelIds: {
        type: "array",
        items: { type: "string" },
        description:
          "Array of label IDs to add to all specified messages (e.g., ['INBOX', 'STARRED'])",
        optional: true,
      },
      removeLabelIds: {
        type: "array",
        items: { type: "string" },
        description:
          "Array of label IDs to remove from all specified messages (e.g., ['UNREAD', 'SPAM'])",
        optional: true,
      },
    },
    required: ["messageIds"],
  },
} as const;

export async function batchModifyLabels(
  args: GmailBatchModifyLabelsInput,
): Promise<InternalToolResponse> {
  try {
    const gmail = google.gmail("v1");
    const { messageIds, addLabelIds = [], removeLabelIds = [] } = args;

    if (messageIds.length === 0) {
      return ResponseFormatter.error(
        new Error("messageIds array cannot be empty"),
      );
    }

    if (messageIds.length > 1000) {
      return ResponseFormatter.error(
        new Error(
          "Too many message IDs. Maximum recommended is 1000 per batch request.",
        ),
      );
    }

    // Validate at least one operation
    if (addLabelIds.length === 0 && removeLabelIds.length === 0) {
      return ResponseFormatter.error(
        new Error(
          "At least one of addLabelIds or removeLabelIds must be provided",
        ),
      );
    }

    // Perform batch modify
    await gmail.users.messages.batchModify({
      userId: "me",
      requestBody: {
        ids: messageIds,
        addLabelIds: addLabelIds.length > 0 ? addLabelIds : undefined,
        removeLabelIds: removeLabelIds.length > 0 ? removeLabelIds : undefined,
      },
    });

    let output = `✅ Successfully modified labels on ${messageIds.length} message(s)\n\n`;
    output += `📊 Operation Summary:\n`;
    output += `  Messages affected: ${messageIds.length}\n`;

    if (addLabelIds.length > 0) {
      output += `  ➕ Added labels: ${addLabelIds.join(", ")}\n`;
    }

    if (removeLabelIds.length > 0) {
      output += `  ➖ Removed labels: ${removeLabelIds.join(", ")}\n`;
    }

    output += `\n📝 Note: Changes applied to all specified messages.\n`;
    output += `Use gmail_get_message to verify individual message labels.`;

    return ResponseFormatter.success(
      {
        messageCount: messageIds.length,
        messageIds,
        addedLabels: addLabelIds,
        removedLabels: removeLabelIds,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
