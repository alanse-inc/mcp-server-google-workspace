/**
 * Google Slides Helper Functions
 * Provides formatting, validation, and utility functions for Slides operations
 * Pattern reference: lib/calendar-helpers.ts
 */
import { slides_v1 } from "googleapis";

/**
 * Format presentation metadata for display
 */
export function formatPresentation(
  presentation: slides_v1.Schema$Presentation,
): string {
  const lines: string[] = [];

  lines.push(`📊 Presentation Details:`);
  lines.push(`ID: ${presentation.presentationId}`);
  lines.push(`Title: ${presentation.title || "(Untitled)"}`);

  if (presentation.slides && presentation.slides.length > 0) {
    lines.push(`Slides: ${presentation.slides.length}`);
  }

  if (presentation.pageSize) {
    const width = presentation.pageSize.width?.magnitude || 0;
    const height = presentation.pageSize.height?.magnitude || 0;
    lines.push(
      `Page Size: ${width} x ${height} ${presentation.pageSize.width?.unit || "EMU"}`,
    );
  }

  return lines.join("\n");
}

/**
 * Format individual slide information
 */
export function formatSlide(
  slide: slides_v1.Schema$Page,
  index: number,
): string {
  const lines: string[] = [];

  lines.push(`\n📄 Slide ${index + 1}:`);
  lines.push(`  Object ID: ${slide.objectId}`);

  if (slide.pageElements && slide.pageElements.length > 0) {
    lines.push(`  Elements: ${slide.pageElements.length}`);
  }

  return lines.join("\n");
}

/**
 * Generate unique object ID for Slides elements using UUID v4
 * Pattern: prefix_uuid (without hyphens)
 * UUID v4 provides 128-bit uniqueness, virtually eliminating collision risk
 */
export function generateObjectId(prefix: string): string {
  // Generate UUID v4 and remove hyphens
  const uuid = crypto.randomUUID().replace(/-/g, '');
  return `${prefix}_${uuid}`;
}

/**
 * Validate dimensions for Slides elements
 * All dimensions should be positive numbers in EMU units
 */
export function validateDimensions(dimensions: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}): { valid: boolean; error?: string } {
  const { x = 0, y = 0, width = 0, height = 0 } = dimensions;

  if (width <= 0 || height <= 0) {
    return {
      valid: false,
      error: "Width and height must be positive numbers",
    };
  }

  if (x < 0 || y < 0) {
    return {
      valid: false,
      error: "Position coordinates (x, y) cannot be negative",
    };
  }

  return { valid: true };
}

/**
 * Convert inches to EMU (English Metric Units)
 * 1 inch = 914400 EMU
 */
export function inchesToEMU(inches: number): number {
  return Math.round(inches * 914400);
}

/**
 * Convert EMU to inches
 */
export function emuToInches(emu: number): number {
  return emu / 914400;
}

/**
 * Create default dimensions for text boxes (in EMU)
 * Default: 6 inches wide, 1 inch tall, positioned at (1, 1)
 */
export function getDefaultTextBoxDimensions(): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  return {
    x: inchesToEMU(1),
    y: inchesToEMU(1),
    width: inchesToEMU(6),
    height: inchesToEMU(1),
  };
}

/**
 * Create default dimensions for images (in EMU)
 * Default: 4 inches wide, 3 inches tall, positioned at (2, 2)
 */
export function getDefaultImageDimensions(): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  return {
    x: inchesToEMU(2),
    y: inchesToEMU(2),
    width: inchesToEMU(4),
    height: inchesToEMU(3),
  };
}
