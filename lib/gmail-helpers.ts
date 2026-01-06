/**
 * Gmail Helper Functions
 *
 * Utilities for Gmail API operations including:
 * - Message body extraction and formatting
 * - HTML to text conversion
 * - MIME message preparation
 * - Attachment handling
 * - URL generation
 */

import { gmail_v1 } from "googleapis";
import nodemailer from "nodemailer";
import { convert } from "html-to-text";

/**
 * Extract text and HTML bodies from Gmail message payload
 */
export function extractMessageBodies(payload: gmail_v1.Schema$MessagePart): {
  textBody: string;
  htmlBody: string;
} {
  let textBody = "";
  let htmlBody = "";

  function extractParts(part: gmail_v1.Schema$MessagePart) {
    if (part.mimeType === "text/plain" && part.body?.data) {
      textBody = Buffer.from(part.body.data, "base64").toString("utf-8");
    } else if (part.mimeType === "text/html" && part.body?.data) {
      htmlBody = Buffer.from(part.body.data, "base64").toString("utf-8");
    }

    // Recursively process multipart messages
    if (part.parts) {
      for (const subPart of part.parts) {
        extractParts(subPart);
      }
    }
  }

  extractParts(payload);
  return { textBody, htmlBody };
}

/**
 * Format body content, preferring plain text but converting HTML if needed
 */
export function formatBodyContent(textBody: string, htmlBody: string): string {
  if (textBody) {
    return textBody;
  }

  if (htmlBody) {
    // Convert HTML to readable plain text
    return convert(htmlBody, {
      wordwrap: 80,
      selectors: [
        { selector: "a", options: { ignoreHref: false } },
        { selector: "img", format: "skip" },
      ],
    });
  }

  return "[No text content found]";
}

/**
 * Extract attachment information from message payload
 */
export interface AttachmentInfo {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
}

export function extractAttachments(
  payload: gmail_v1.Schema$MessagePart,
): AttachmentInfo[] {
  const attachments: AttachmentInfo[] = [];

  function extractParts(part: gmail_v1.Schema$MessagePart) {
    if (part.filename && part.body?.attachmentId) {
      attachments.push({
        filename: part.filename,
        mimeType: part.mimeType || "application/octet-stream",
        size: part.body.size || 0,
        attachmentId: part.body.attachmentId,
      });
    }

    if (part.parts) {
      for (const subPart of part.parts) {
        extractParts(subPart);
      }
    }
  }

  extractParts(payload);
  return attachments;
}

/**
 * Prepare a MIME message for Gmail API
 */
export interface PrepareMessageOptions {
  to: string;
  subject: string;
  body: string;
  bodyFormat: "plain" | "html";
  from?: string;
  cc?: string;
  bcc?: string;
  inReplyTo?: string;
  references?: string;
}

export function prepareGmailMessage(options: PrepareMessageOptions): string {
  const {
    to,
    subject,
    body,
    bodyFormat,
    from,
    cc,
    bcc,
    inReplyTo,
    references,
  } = options;

  // Build message using nodemailer's createTransport (for MIME creation only)
  const message: any = {
    from: from || "me",
    to,
    subject,
    [bodyFormat === "html" ? "html" : "text"]: body,
  };

  if (cc) message.cc = cc;
  if (bcc) message.bcc = bcc;
  if (inReplyTo) message.inReplyTo = inReplyTo;
  if (references) message.references = references;

  // Create MIME message
  const transport = nodemailer.createTransport({ jsonTransport: true });

  // We'll use a synchronous approach here
  let mimeMessage = "";
  mimeMessage += `From: ${message.from}\r\n`;
  mimeMessage += `To: ${message.to}\r\n`;
  if (message.cc) mimeMessage += `Cc: ${message.cc}\r\n`;
  if (message.bcc) mimeMessage += `Bcc: ${message.bcc}\r\n`;
  mimeMessage += `Subject: ${message.subject}\r\n`;
  if (message.inReplyTo) mimeMessage += `In-Reply-To: ${message.inReplyTo}\r\n`;
  if (message.references) mimeMessage += `References: ${message.references}\r\n`;
  mimeMessage += `Content-Type: text/${bodyFormat}; charset=utf-8\r\n`;
  mimeMessage += `\r\n`;
  mimeMessage += body;

  // Base64url encode
  return Buffer.from(mimeMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Generate Gmail web URL for a message or thread
 */
export function generateGmailWebUrl(
  messageId?: string,
  threadId?: string,
): string {
  if (messageId) {
    return `https://mail.google.com/mail/u/0/#all/${messageId}`;
  }
  if (threadId) {
    return `https://mail.google.com/mail/u/0/#all/${threadId}`;
  }
  return "https://mail.google.com/mail/u/0/";
}

/**
 * Extract header value from message headers
 */
export function getHeader(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string,
): string {
  if (!headers) return "";
  const header = headers.find(
    (h) => h.name?.toLowerCase() === name.toLowerCase(),
  );
  return header?.value || "";
}

/**
 * Format thread content for display
 */
export function formatThreadContent(
  thread: gmail_v1.Schema$Thread,
): string {
  const messages = thread.messages || [];
  const threadId = thread.id || "";

  if (messages.length === 0) {
    return "No messages in thread";
  }

  // Extract thread subject from first message
  const firstMessage = messages[0];
  const subject = getHeader(firstMessage.payload?.headers, "Subject");

  let output = `Thread ID: ${threadId}\n`;
  output += `Subject: ${subject}\n`;
  output += `Messages: ${messages.length}\n`;
  output += `Web URL: ${generateGmailWebUrl(undefined, threadId)}\n\n`;
  output += "=" .repeat(80) + "\n\n";

  // Format each message
  messages.forEach((message, index) => {
    const headers = message.payload?.headers || [];
    const from = getHeader(headers, "From");
    const date = getHeader(headers, "Date");
    const msgSubject = getHeader(headers, "Subject");

    output += `Message ${index + 1}/${messages.length}\n`;
    output += `-`.repeat(40) + "\n";
    output += `From: ${from}\n`;
    output += `Date: ${date}\n`;

    // Only show subject if different from thread subject
    if (msgSubject && msgSubject !== subject) {
      output += `Subject: ${msgSubject}\n`;
    }

    output += `\n`;

    // Extract and format body
    if (message.payload) {
      const { textBody, htmlBody } = extractMessageBodies(message.payload);
      const bodyContent = formatBodyContent(textBody, htmlBody);

      // Truncate very long messages
      const maxLength = 2000;
      if (bodyContent.length > maxLength) {
        output += bodyContent.substring(0, maxLength);
        output += `\n\n[... truncated ${bodyContent.length - maxLength} characters ...]`;
      } else {
        output += bodyContent;
      }
    }

    output += "\n\n";
  });

  return output;
}

/**
 * Format message list for search results
 */
export function formatMessageList(
  messages: gmail_v1.Schema$Message[],
  nextPageToken?: string | null,
): string {
  let output = `Found ${messages.length} message(s)\n\n`;

  messages.forEach((msg, index) => {
    const messageId = msg.id || "";
    const threadId = msg.threadId || "";

    output += `${index + 1}. Message ID: ${messageId}\n`;
    output += `   Thread ID: ${threadId}\n`;
    output += `   Web URL: ${generateGmailWebUrl(messageId)}\n\n`;
  });

  if (nextPageToken) {
    output += `\nMore results available. Use pageToken: ${nextPageToken}`;
  }

  return output;
}
