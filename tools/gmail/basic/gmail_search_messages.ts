import { google } from "googleapis";
import { GmailSearchMessagesInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatMessageList } from "../../../lib/gmail-helpers.js";

export const schema = {
  name: "gmail_search_messages",
  description:
    "Search for messages in Gmail using Gmail query syntax. Supports operators like 'from:', 'to:', 'subject:', 'is:unread', 'has:attachment', date ranges, etc. Returns message IDs, thread IDs, and web URLs for each result.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "Gmail search query using standard Gmail operators (e.g., 'from:user@example.com subject:invoice is:unread')",
      },
      pageSize: {
        type: "number",
        description: "Maximum number of results to return (default: 10, max: 100)",
      },
      pageToken: {
        type: "string",
        description: "Token for pagination to get the next page of results",
      },
    },
    required: ["query"],
  },
} as const;

export async function searchMessages(
  args: GmailSearchMessagesInput,
): Promise<InternalToolResponse> {
  try {
    const gmail = google.gmail("v1");
    const { query, pageSize = 10, pageToken } = args;

    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: Math.min(pageSize, 100),
      pageToken: pageToken,
    });

    const messages = response.data.messages || [];
    const nextPageToken = response.data.nextPageToken;

    if (messages.length === 0) {
      return ResponseFormatter.success(
        {
          count: 0,
          messages: [],
          query,
        },
        `No messages found matching query: "${query}"`,
      );
    }

    const formattedOutput = formatMessageList(messages, nextPageToken);

    return ResponseFormatter.success(
      {
        count: messages.length,
        query,
        messages: messages.map((m) => ({
          id: m.id,
          threadId: m.threadId,
        })),
        nextPageToken,
      },
      `Search results for: "${query}"\n\n${formattedOutput}`,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
