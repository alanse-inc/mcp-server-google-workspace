import { describe, it, expect } from "vitest";
import { schema as driveExportFileSchema } from "../drive/advanced/drive_export_file";
import { schema as driveListRevisionsSchema } from "../drive/advanced/drive_list_revisions";
import { schema as driveEmptyTrashSchema } from "../drive/advanced/drive_empty_trash";

describe("Drive Advanced Operations - Schema Validation", () => {
  describe("drive_export_file", () => {
    it("should have correct schema", () => {
      expect(driveExportFileSchema.name).toBe("drive_export_file");
      expect(driveExportFileSchema.description).toBeDefined();
      expect(driveExportFileSchema.inputSchema.required).toContain("fileId");
    });

    it("should have optional mimeType parameter", () => {
      const mimeTypeParam = (driveExportFileSchema.inputSchema.properties as any).mimeType;
      expect(mimeTypeParam).toBeDefined();
      expect(mimeTypeParam.optional).toBe(true);
    });

    it("should have optional format parameter", () => {
      const formatParam = (driveExportFileSchema.inputSchema.properties as any).format;
      expect(formatParam).toBeDefined();
      expect(formatParam.optional).toBe(true);
    });
  });

  describe("drive_list_revisions", () => {
    it("should have correct schema", () => {
      expect(driveListRevisionsSchema.name).toBe("drive_list_revisions");
      expect(driveListRevisionsSchema.description).toBeDefined();
      expect(driveListRevisionsSchema.inputSchema.required).toContain("fileId");
    });

    it("should have optional pageSize parameter", () => {
      const pageSizeParam = (driveListRevisionsSchema.inputSchema.properties as any).pageSize;
      expect(pageSizeParam).toBeDefined();
      expect(pageSizeParam.optional).toBe(true);
    });

    it("should have optional pageToken parameter", () => {
      const pageTokenParam = (driveListRevisionsSchema.inputSchema.properties as any).pageToken;
      expect(pageTokenParam).toBeDefined();
      expect(pageTokenParam.optional).toBe(true);
    });
  });

  describe("drive_empty_trash", () => {
    it("should have correct schema", () => {
      expect(driveEmptyTrashSchema.name).toBe("drive_empty_trash");
      expect(driveEmptyTrashSchema.description).toBeDefined();
      expect(driveEmptyTrashSchema.inputSchema.required).toBeDefined();
    });
  });
});
