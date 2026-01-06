import { google } from "googleapis";
import { GmailSendMessageInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  prepareGmailMessage,
  generateGmailWebUrl,
} from "../../../lib/gmail-helpers.js";

export const schema = {
  name: "gmail_send_message",
  description:
    "Send an email message via Gmail. Supports plain text or HTML body, CC/BCC recipients, and threading (replies). The message will be sent immediately.",
  inputSchema: {
    type: "object",
    properties: {
      to: {
        type: "string",
        description:
          "Recipient email address(es). Multiple addresses can be comma-separated.",
      },
      subject: {
        type: "string",
        description: "Email subject line",
      },
      body: {
        type: "string",
        description: "Email body content (plain text or HTML)",
      },
      bodyFormat: {
        type: "string",
        enum: ["plain", "html"],
        description: "Body format type (default: plain)",
        optional: true,
      },
      cc: {
        type: "string",
        description:
          "CC recipient(s). Multiple addresses can be comma-separated.",
        optional: true,
      },
      bcc: {
        type: "string",
        description:
          "BCC recipient(s). Multiple addresses can be comma-separated.",
        optional: true,
      },
      threadId: {
        type: "string",
        description:
          "Thread ID to reply to (makes this a reply in an existing conversation)",
        optional: true,
      },
      inReplyTo: {
        type: "string",
        description:
          "Message-ID header of the message being replied to (for threading)",
        optional: true,
      },
      references: {
        type: "string",
        description:
          "References header for email threading (space-separated Message-IDs)",
        optional: true,
      },
    },
    required: ["to", "subject", "body"],
  },
} as const;

export async function sendMessage(
  args: GmailSendMessageInput,
): Promise<InternalToolResponse> {
  try {
    const gmail = google.gmail("v1");
    const {
      to,
      subject,
      body,
      bodyFormat = "plain",
      cc,
      bcc,
      threadId,
      inReplyTo,
      references,
    } = args;

    // Prepare base64url encoded MIME message
    const encodedMessage = prepareGmailMessage({
      to,
      subject,
      body,
      bodyFormat,
      cc,
      bcc,
      inReplyTo,
      references,
    });

    // Send the message
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
        threadId: threadId || undefined,
      },
    });

    const sentMessage = response.data;
    const messageId = sentMessage.id || "";
    const sentThreadId = sentMessage.threadId || "";

    let output = `✅ Message sent successfully!\n\n`;
    output += `Message ID: ${messageId}\n`;
    output += `Thread ID: ${sentThreadId}\n`;
    output += `Web URL: ${generateGmailWebUrl(messageId)}\n\n`;
    output += `📧 Details:\n`;
    output += `  To: ${to}\n`;
    if (cc) output += `  CC: ${cc}\n`;
    if (bcc) output += `  BCC: ${bcc}\n`;
    output += `  Subject: ${subject}\n`;
    output += `  Format: ${bodyFormat}\n`;
    if (threadId) output += `  Reply to thread: ${threadId}\n`;

    return ResponseFormatter.success(
      {
        messageId,
        threadId: sentThreadId,
        labelIds: sentMessage.labelIds || [],
        to,
        subject,
        bodyFormat,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
