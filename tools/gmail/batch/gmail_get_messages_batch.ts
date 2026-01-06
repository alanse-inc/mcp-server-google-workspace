import { google } from "googleapis";
import {
  GmailGetMessagesBatchInput,
  InternalToolResponse,
} from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  extractMessageBodies,
  formatBodyContent,
  getHeader,
  generateGmailWebUrl,
} from "../../../lib/gmail-helpers.js";

export const schema = {
  name: "gmail_get_messages_batch",
  description:
    "Retrieve multiple Gmail messages in a single batch request. More efficient than calling gmail_get_message multiple times. Returns message metadata and content for each message ID.",
  inputSchema: {
    type: "object",
    properties: {
      messageIds: {
        type: "array",
        items: { type: "string" },
        description:
          "Array of Gmail message IDs to retrieve (max recommended: 100)",
      },
      format: {
        type: "string",
        enum: ["full", "metadata"],
        description:
          "Response format: 'full' includes body content, 'metadata' only headers (default: metadata)",
        optional: true,
      },
    },
    required: ["messageIds"],
  },
} as const;

export async function getMessagesBatch(
  args: GmailGetMessagesBatchInput,
): Promise<InternalToolResponse> {
  try {
    const gmail = google.gmail("v1");
    const { messageIds, format = "metadata" } = args;

    if (messageIds.length === 0) {
      return ResponseFormatter.error(
        new Error("messageIds array cannot be empty"),
      );
    }

    if (messageIds.length > 100) {
      return ResponseFormatter.error(
        new Error(
          "Too many message IDs. Maximum recommended is 100 per batch request.",
        ),
      );
    }

    // Fetch all messages
    const messagePromises = messageIds.map((messageId) =>
      gmail.users.messages
        .get({
          userId: "me",
          id: messageId,
          format: format,
        })
        .catch((error) => ({
          error: true,
          messageId,
          errorMessage: error.message,
        })),
    );

    const results = await Promise.all(messagePromises);

    // Process results
    const messages: any[] = [];
    const errors: any[] = [];

    let output = `📬 Batch Message Retrieval Results\n`;
    output += `${"=".repeat(80)}\n\n`;
    output += `Requested: ${messageIds.length} messages\n`;

    results.forEach((result: any, index) => {
      if (result.error) {
        errors.push({
          messageId: result.messageId,
          error: result.errorMessage,
        });
      } else {
        const message = result.data;
        const headers = message.payload?.headers || [];

        const messageData: any = {
          messageId: message.id,
          threadId: message.threadId,
          subject: getHeader(headers, "Subject"),
          from: getHeader(headers, "From"),
          to: getHeader(headers, "To"),
          date: getHeader(headers, "Date"),
          snippet: message.snippet,
          labelIds: message.labelIds || [],
        };

        // Include body if format is 'full'
        if (format === "full") {
          const { textBody, htmlBody } = extractMessageBodies(
            message.payload || {},
          );
          messageData.bodyPreview = formatBodyContent(textBody, htmlBody).substring(
            0,
            500,
          );
        }

        messages.push(messageData);
      }
    });

    output += `Successful: ${messages.length}\n`;
    output += `Failed: ${errors.length}\n\n`;
    output += `${"=".repeat(80)}\n\n`;

    // Display successful messages
    if (messages.length > 0) {
      output += `✅ Successfully Retrieved Messages:\n\n`;
      messages.forEach((msg, index) => {
        output += `${index + 1}. ${msg.subject}\n`;
        output += `   From: ${msg.from}\n`;
        output += `   Date: ${msg.date}\n`;
        output += `   Message ID: ${msg.messageId}\n`;
        output += `   URL: ${generateGmailWebUrl(msg.messageId)}\n`;
        if (format === "full" && msg.bodyPreview) {
          output += `   Preview: ${msg.bodyPreview.substring(0, 100)}...\n`;
        }
        output += `\n`;
      });
    }

    // Display errors
    if (errors.length > 0) {
      output += `\n❌ Failed Messages:\n\n`;
      errors.forEach((err, index) => {
        output += `${index + 1}. Message ID: ${err.messageId}\n`;
        output += `   Error: ${err.error}\n\n`;
      });
    }

    return ResponseFormatter.success(
      {
        totalRequested: messageIds.length,
        successCount: messages.length,
        errorCount: errors.length,
        messages,
        errors,
        format,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
