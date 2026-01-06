import { google } from "googleapis";
import {
  GmailGetThreadsBatchInput,
  InternalToolResponse,
} from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";
import { formatThreadContent } from "../../../lib/gmail-helpers.js";

export const schema = {
  name: "gmail_get_threads_batch",
  description:
    "Retrieve multiple Gmail threads (conversations) in a single batch request. More efficient than calling gmail_get_thread multiple times. Returns all messages in each thread.",
  inputSchema: {
    type: "object",
    properties: {
      threadIds: {
        type: "array",
        items: { type: "string" },
        description:
          "Array of Gmail thread IDs to retrieve (max recommended: 50)",
      },
    },
    required: ["threadIds"],
  },
} as const;

export async function getThreadsBatch(
  args: GmailGetThreadsBatchInput,
): Promise<InternalToolResponse> {
  try {
    const gmail = google.gmail("v1");
    const { threadIds } = args;

    if (threadIds.length === 0) {
      return ResponseFormatter.error(
        new Error("threadIds array cannot be empty"),
      );
    }

    if (threadIds.length > 50) {
      return ResponseFormatter.error(
        new Error(
          "Too many thread IDs. Maximum recommended is 50 per batch request.",
        ),
      );
    }

    // Fetch all threads
    const threadPromises = threadIds.map((threadId) =>
      gmail.users.threads
        .get({
          userId: "me",
          id: threadId,
          format: "full",
        })
        .catch((error) => ({
          error: true,
          threadId,
          errorMessage: error.message,
        })),
    );

    const results = await Promise.all(threadPromises);

    // Process results
    const threads: any[] = [];
    const errors: any[] = [];

    let output = `📬 Batch Thread Retrieval Results\n`;
    output += `${"=".repeat(80)}\n\n`;
    output += `Requested: ${threadIds.length} threads\n`;

    results.forEach((result: any) => {
      if (result.error) {
        errors.push({
          threadId: result.threadId,
          error: result.errorMessage,
        });
      } else {
        const thread = result.data;
        const messages = thread.messages || [];

        threads.push({
          threadId: thread.id,
          messageCount: messages.length,
          snippet: thread.snippet || "",
          messages: messages.map((m: any) => ({
            messageId: m.id,
            snippet: m.snippet,
            labelIds: m.labelIds || [],
          })),
        });
      }
    });

    output += `Successful: ${threads.length}\n`;
    output += `Failed: ${errors.length}\n\n`;
    output += `${"=".repeat(80)}\n\n`;

    // Display successful threads
    if (threads.length > 0) {
      output += `✅ Successfully Retrieved Threads:\n\n`;
      threads.forEach((thread, index) => {
        output += `${index + 1}. Thread ID: ${thread.threadId}\n`;
        output += `   Messages: ${thread.messageCount}\n`;
        output += `   Snippet: ${thread.snippet}\n`;
        output += `   Message IDs: ${thread.messages.map((m: any) => m.messageId).join(", ")}\n`;
        output += `\n`;
      });
    }

    // Display errors
    if (errors.length > 0) {
      output += `\n❌ Failed Threads:\n\n`;
      errors.forEach((err, index) => {
        output += `${index + 1}. Thread ID: ${err.threadId}\n`;
        output += `   Error: ${err.error}\n\n`;
      });
    }

    return ResponseFormatter.success(
      {
        totalRequested: threadIds.length,
        successCount: threads.length,
        errorCount: errors.length,
        threads,
        errors,
      },
      output,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
