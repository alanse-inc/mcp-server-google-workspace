/**
 * ResponseFormatter - Consistent response formatting across all tools
 */

export interface InternalToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError: boolean;
}

export class ResponseFormatter {
  /**
   * Create a success response
   */
  static success(data: any, message?: string): InternalToolResponse {
    let text: string;

    if (message) {
      // If message is provided, combine it with data
      if (typeof data === "object" && data !== null) {
        text = `${message}\n\n${JSON.stringify(data, null, 2)}`;
      } else {
        text = message;
      }
    } else {
      // Format data only
      text = typeof data === "object" && data !== null
        ? JSON.stringify(data, null, 2)
        : String(data);
    }

    return {
      content: [{ type: "text", text }],
      isError: false,
    };
  }

  /**
   * Create an error response
   */
  static error(error: Error | string): InternalToolResponse {
    const message = error instanceof Error ? error.message : error;

    return {
      content: [
        {
          type: "text",
          text: `Error: ${message}`,
        },
      ],
      isError: true,
    };
  }

  /**
   * Format Google Docs document data
   */
  static formatDocumentData(doc: any): string {
    const formatted = {
      documentId: doc.documentId,
      title: doc.title,
      revisionId: doc.revisionId,
      suggestionsViewMode: doc.suggestionsViewMode,
    };

    return JSON.stringify(formatted, null, 2);
  }

  /**
   * Format metadata
   */
  static formatMetadata(metadata: any): string {
    return JSON.stringify(metadata, null, 2);
  }

  /**
   * Format a simple success message
   */
  static simpleSuccess(message: string): InternalToolResponse {
    return {
      content: [{ type: "text", text: message }],
      isError: false,
    };
  }

  /**
   * Format operation result with details
   */
  static operationResult(
    operation: string,
    details: Record<string, any>,
  ): InternalToolResponse {
    const text = `${operation} completed successfully\n\n${JSON.stringify(details, null, 2)}`;

    return {
      content: [{ type: "text", text }],
      isError: false,
    };
  }
}
