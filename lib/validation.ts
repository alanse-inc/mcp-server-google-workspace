/**
 * Validation - Shared validation logic for tool inputs
 */

export interface RGBColor {
  red: number;
  green: number;
  blue: number;
}

export class Validator {
  /**
   * Validate that required fields exist in an object
   */
  static validateRequired(obj: any, fields: string[]): void {
    const missing = fields.filter((field) => obj[field] === undefined);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }
  }

  /**
   * Validate RGB color values (0-1 range)
   */
  static validateColor(color: RGBColor): boolean {
    const values = [color.red, color.green, color.blue];
    return values.every((v) => typeof v === "number" && v >= 0 && v <= 1);
  }

  /**
   * Validate dimension type
   */
  static validateDimension(dimension: "ROWS" | "COLUMNS"): boolean {
    return dimension === "ROWS" || dimension === "COLUMNS";
  }

  /**
   * Validate text style object
   */
  static validateTextStyle(style: any): boolean {
    // Check for at least one style property
    const validProperties = [
      "bold",
      "italic",
      "underline",
      "fontSize",
      "fontFamily",
      "foregroundColor",
      "backgroundColor",
    ];

    const hasValidProperty = validProperties.some((prop) => style[prop] !== undefined);

    if (!hasValidProperty) {
      return false;
    }

    // Validate color properties if they exist
    if (style.foregroundColor && !this.validateColor(style.foregroundColor)) {
      return false;
    }

    if (style.backgroundColor && !this.validateColor(style.backgroundColor)) {
      return false;
    }

    return true;
  }

  /**
   * Validate index is a positive integer
   */
  static validateIndex(index: number, allowZero = false): boolean {
    if (!Number.isInteger(index)) {
      return false;
    }
    return allowZero ? index >= 0 : index > 0;
  }

  /**
   * Validate range (startIndex < endIndex)
   */
  static validateRange(startIndex: number, endIndex: number): boolean {
    return (
      this.validateIndex(startIndex) &&
      this.validateIndex(endIndex) &&
      startIndex < endIndex
    );
  }

  /**
   * Validate alignment value
   */
  static validateAlignment(
    alignment: "START" | "CENTER" | "END" | "JUSTIFIED",
  ): boolean {
    return ["START", "CENTER", "END", "JUSTIFIED"].includes(alignment);
  }

  /**
   * Validate named style type
   */
  static validateNamedStyleType(
    styleType: string,
  ): boolean {
    const validTypes = [
      "NORMAL_TEXT",
      "HEADING_1",
      "HEADING_2",
      "HEADING_3",
      "HEADING_4",
      "HEADING_5",
      "HEADING_6",
      "TITLE",
      "SUBTITLE",
    ];
    return validTypes.includes(styleType);
  }

  /**
   * Validate URL format
   */
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false;
    }
  }

  /**
   * Validate positive number
   */
  static validatePositiveNumber(value: number): boolean {
    return typeof value === "number" && value > 0 && !isNaN(value);
  }
}
