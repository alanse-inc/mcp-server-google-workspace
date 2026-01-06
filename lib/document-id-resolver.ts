/**
 * DocumentIdResolver - Resolves various document ID formats across Google Workspace
 *
 * Supports:
 * - Direct document IDs
 * - Full Google Workspace URLs (Docs, Sheets, Slides, Drive)
 * - Service type detection
 */

export interface DocumentReference {
  id: string;
  type: "docs" | "sheets" | "slides" | "drive" | "unknown";
  url?: string;
}

export class DocumentIdResolver {
  private static readonly URL_PATTERNS = {
    docs: /docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/,
    sheets: /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    slides: /docs\.google\.com\/presentation\/d\/([a-zA-Z0-9-_]+)/,
    drive: /drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/,
  };

  private static readonly ID_PATTERN = /^[a-zA-Z0-9-_]{25,}$/;

  /**
   * Resolve a document reference from ID or URL
   */
  static resolve(input: string): DocumentReference {
    // Try URL extraction first
    const fromUrl = this.extractFromUrl(input);
    if (fromUrl) {
      return { id: fromUrl.id, type: fromUrl.type, url: input };
    }

    // Validate as direct ID
    if (this.validate(input)) {
      return { id: input, type: "unknown" };
    }

    throw new Error(
      `Invalid document reference: ${input}. Expected a Google Workspace URL or document ID.`,
    );
  }

  /**
   * Extract document ID from Google Workspace URL
   */
  static extractFromUrl(
    url: string,
  ): { id: string; type: DocumentReference["type"] } | null {
    for (const [type, pattern] of Object.entries(this.URL_PATTERNS)) {
      const match = url.match(pattern);
      if (match) {
        return {
          id: match[1],
          type: type as DocumentReference["type"],
        };
      }
    }
    return null;
  }

  /**
   * Validate document ID format
   */
  static validate(id: string, type?: string): boolean {
    if (!this.ID_PATTERN.test(id)) {
      return false;
    }

    // Additional type-specific validation could go here
    return true;
  }

  /**
   * Get service type from URL or ID
   */
  static getServiceType(input: string): DocumentReference["type"] {
    const ref = this.resolve(input);
    return ref.type;
  }

  /**
   * Create a Google Workspace URL from document ID and type
   */
  static createUrl(
    documentId: string,
    type: "docs" | "sheets" | "slides" | "drive",
  ): string {
    const urlTemplates = {
      docs: `https://docs.google.com/document/d/${documentId}/edit`,
      sheets: `https://docs.google.com/spreadsheets/d/${documentId}/edit`,
      slides: `https://docs.google.com/presentation/d/${documentId}/edit`,
      drive: `https://drive.google.com/file/d/${documentId}/view`,
    };
    return urlTemplates[type];
  }
}
