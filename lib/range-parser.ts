/**
 * RangeParser - Parse and convert range notations
 */

export interface RangeInfo {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  sheetName?: string;
}

export interface ParagraphRange {
  startIndex: number;
  endIndex: number;
}

export class RangeParser {
  /**
   * Parse A1 notation to row/column indices
   * Example: "A1:B10" -> { startRow: 0, endRow: 9, startCol: 0, endCol: 1 }
   */
  static parseA1(range: string): RangeInfo {
    const match = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
    if (!match) {
      throw new Error(`Invalid A1 notation: ${range}`);
    }

    const [, startCol, startRow, endCol, endRow] = match;

    return {
      startRow: parseInt(startRow, 10) - 1, // Convert to 0-indexed
      endRow: parseInt(endRow, 10) - 1,
      startCol: this.columnToIndex(startCol),
      endCol: this.columnToIndex(endCol),
    };
  }

  /**
   * Convert column letter to 0-indexed number
   * Example: "A" -> 0, "Z" -> 25, "AA" -> 26
   */
  static columnToIndex(column: string): number {
    let index = 0;
    for (let i = 0; i < column.length; i++) {
      index = index * 26 + (column.charCodeAt(i) - 64);
    }
    return index - 1; // Convert to 0-indexed
  }

  /**
   * Convert 0-indexed row/column to A1 notation
   * Example: (0, 0) -> "A1"
   */
  static toA1(row: number, col: number): string {
    const columnLetter = this.indexToColumn(col);
    const rowNumber = row + 1; // Convert to 1-indexed
    return `${columnLetter}${rowNumber}`;
  }

  /**
   * Convert 0-indexed column number to letter
   * Example: 0 -> "A", 25 -> "Z", 26 -> "AA"
   */
  static indexToColumn(index: number): string {
    let column = "";
    let num = index + 1; // Convert to 1-indexed

    while (num > 0) {
      const remainder = (num - 1) % 26;
      column = String.fromCharCode(65 + remainder) + column;
      num = Math.floor((num - 1) / 26);
    }

    return column;
  }

  /**
   * Validate A1 notation range
   */
  static validateRange(range: string): boolean {
    return /^[A-Z]+\d+:[A-Z]+\d+$/.test(range);
  }

  /**
   * Parse paragraph range for Google Docs
   * In Docs, indices are 1-based character positions
   */
  static parseParagraphRange(
    start: number,
    end: number,
  ): ParagraphRange {
    if (start < 1) {
      throw new Error("Start index must be >= 1 for Google Docs");
    }
    if (end <= start) {
      throw new Error("End index must be greater than start index");
    }

    return {
      startIndex: start,
      endIndex: end,
    };
  }

  /**
   * Create a range string from sheet name and cell range
   */
  static createRangeString(
    sheetName: string,
    startCell: string,
    endCell: string,
  ): string {
    return `'${sheetName}'!${startCell}:${endCell}`;
  }
}
