import { google } from "googleapis";
import { GmailDraftMessageInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import {
  prepareGmailMessage,
  generateGmailWebUrl,
} from "../../../lib/gmail-helpers.js";

export const schema = {
  name: "gmail_draft_message",
  description:
    "Create a draft email message in Gmail. The draft is saved but not sent, allowing for later editing or sending. Supports plain text or HTML body, CC/BCC recipients, and threading.",
  inputSchema: {
    type: "object",
    properties: {
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
      to: {
        type: "string",
        description:
          "Recipient email address(es). Multiple addresses can be comma-separated.",
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
          "Thread ID to reply to (makes this a reply draft in an existing conversation)",
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
    required: ["subject", "body"],
  },
} as const;

export async function draftMessage(
  args: GmailDraftMessageInput,
): Promise<InternalToolResponse> {
  try {
    const gmail = google.gmail("v1");
    const {
      subject,
      body,
      bodyFormat = "plain",
      to,
      cc,
      bcc,
      threadId,
      inReplyTo,
      references,
    } = args;

    // Prepare base64url encoded MIME message
    const encodedMessage = prepareGmailMessage({
      to: to || "",
      subject,
      body,
      bodyFormat,
      cc,
      bcc,
      inReplyTo,
      references,
    });

    // Create the draft
    const response = await gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw: encodedMessage,
          threadId: threadId || undefined,
        },
      },
    });

    const draft = response.data;
    const draftId = draft.id || "";
    const messageId = draft.message?.id || "";
    const draftThreadId = draft.message?.threadId || "";

    let output = `✅ Draft created successfully!\n\n`;
    output += `Draft ID: ${draftId}\n`;
    output += `Message ID: ${messageId}\n`;
    if (draftThreadId) output += `Thread ID: ${draftThreadId}\n`;
    output += `Web URL: ${generateGmailWebUrl(messageId)}\n\n`;
    output += `📧 Details:\n`;
    if (to) output += `  To: ${to}\n`;
    if (cc) output += `  CC: ${cc}\n`;
    if (bcc) output += `  BCC: ${bcc}\n`;
    output += `  Subject: ${subject}\n`;
    output += `  Format: ${bodyFormat}\n`;
    if (threadId) output += `  Reply to thread: ${threadId}\n`;
    output += `\n💡 The draft is saved in your Gmail Drafts folder and can be edited or sent later.`;

    return ResponseFormatter.success(
      {
        draftId,
        messageId,
        threadId: draftThreadId,
        subject,
        bodyFormat,
        to: to || null,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
