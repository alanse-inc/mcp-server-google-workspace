import { google } from "googleapis";
import { GmailGetThreadInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatThreadContent } from "../../../lib/gmail-helpers.js";

export const schema = {
  name: "gmail_get_thread",
  description:
    "Retrieve a complete Gmail thread (conversation) with all messages. Returns all messages in chronological order with full content, metadata, and attachments.",
  inputSchema: {
    type: "object",
    properties: {
      threadId: {
        type: "string",
        description: "The Gmail thread ID to retrieve",
      },
    },
    required: ["threadId"],
  },
} as const;

export async function getThread(
  args: GmailGetThreadInput,
): Promise<InternalToolResponse> {
  try {
    const gmail = google.gmail("v1");
    const { threadId } = args;

    // Fetch thread with full format
    const response = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
      format: "full",
    });

    const thread = response.data;
    const messages = thread.messages || [];

    // Format thread content using helper
    const formattedContent = formatThreadContent(thread);

    // Build metadata for structured response
    const messageCount = messages.length;
    const messageIds = messages.map((m) => m.id);
    const snippets = messages.map((m) => m.snippet || "");

    return ResponseFormatter.success(
      {
        threadId,
        messageCount,
        messageIds,
        snippets,
      },
      formattedContent,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
