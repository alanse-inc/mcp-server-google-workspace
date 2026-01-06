import { google } from "googleapis";
import { GmailGetMessageInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  extractMessageBodies,
  formatBodyContent,
  extractAttachments,
  getHeader,
  generateGmailWebUrl,
} from "../../../lib/gmail-helpers.js";

export const schema = {
  name: "gmail_get_message",
  description:
    "Retrieve full content of a specific Gmail message including subject, sender, recipients, body (text/HTML), and attachments. Returns formatted message with metadata.",
  inputSchema: {
    type: "object",
    properties: {
      messageId: {
        type: "string",
        description: "The Gmail message ID to retrieve",
      },
    },
    required: ["messageId"],
  },
} as const;

export async function getMessage(
  args: GmailGetMessageInput,
): Promise<InternalToolResponse> {
  try {
    const gmail = google.gmail("v1");
    const { messageId } = args;

    // Fetch message with full format
    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const message = response.data;
    const headers = message.payload?.headers || [];

    // Extract metadata
    const subject = getHeader(headers, "Subject");
    const from = getHeader(headers, "From");
    const to = getHeader(headers, "To");
    const cc = getHeader(headers, "Cc");
    const date = getHeader(headers, "Date");
    const messageIdHeader = getHeader(headers, "Message-ID");

    // Extract body
    const { textBody, htmlBody } = extractMessageBodies(
      message.payload || {},
    );
    const bodyContent = formatBodyContent(textBody, htmlBody);

    // Extract attachments
    const attachments = extractAttachments(message.payload || {});

    // Build output
    let output = `Message ID: ${messageId}\n`;
    output += `Thread ID: ${message.threadId}\n`;
    output += `Web URL: ${generateGmailWebUrl(messageId)}\n\n`;
    output += `Subject: ${subject}\n`;
    output += `From: ${from}\n`;
    output += `To: ${to}\n`;
    if (cc) output += `Cc: ${cc}\n`;
    output += `Date: ${date}\n`;
    if (messageIdHeader) output += `Message-ID: ${messageIdHeader}\n`;
    output += `\n${"=".repeat(80)}\n\n`;

    // Truncate very long bodies
    const maxBodyLength = 20000;
    if (bodyContent.length > maxBodyLength) {
      output += bodyContent.substring(0, maxBodyLength);
      output += `\n\n[... truncated ${bodyContent.length - maxBodyLength} characters ...]`;
    } else {
      output += bodyContent;
    }

    // Add attachments info
    if (attachments.length > 0) {
      output += `\n\n${"=".repeat(80)}\n\n`;
      output += `📎 Attachments (${attachments.length}):\n`;
      attachments.forEach((att, index) => {
        output += `  ${index + 1}. ${att.filename} (${att.mimeType}, ${Math.round(att.size / 1024)}KB)\n`;
        output += `     Attachment ID: ${att.attachmentId}\n`;
      });
      output += `\nUse 'gmail_get_attachment' tool to download attachments.\n`;
    }

    return ResponseFormatter.success(
      {
        messageId,
        threadId: message.threadId,
        subject,
        from,
        to,
        cc,
        date,
        labels: message.labelIds,
        attachments: attachments.map((a) => ({
          filename: a.filename,
          mimeType: a.mimeType,
          size: a.size,
          attachmentId: a.attachmentId,
        })),
        snippet: message.snippet,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
