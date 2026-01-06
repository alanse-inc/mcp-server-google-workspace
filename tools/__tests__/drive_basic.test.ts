import { describe, it, expect } from "vitest";
import { schema as driveSearchSchema } from "../drive/basic/drive_search";
import { schema as driveReadFileSchema } from "../drive/basic/drive_read_file";
import { schema as driveListFilesSchema } from "../drive/basic/drive_list_files";
import { schema as driveGetMetadataSchema } from "../drive/basic/drive_get_metadata";

describe("Drive Basic Tools - Schema Validation", () => {
  describe("drive_search", () => {
    it("should have correct schema", () => {
      expect(driveSearchSchema.name).toBe("drive_search");
      expect(driveSearchSchema.description).toBeDefined();
      expect(driveSearchSchema.inputSchema.required).toContain("query");
    });
  });

  describe("drive_read_file", () => {
    it("should have correct schema", () => {
      expect(driveReadFileSchema.name).toBe("drive_read_file");
      expect(driveReadFileSchema.description).toBeDefined();
      expect(driveReadFileSchema.inputSchema.required).toContain("fileId");
    });
  });

  describe("drive_list_files", () => {
    it("should have correct schema", () => {
      expect(driveListFilesSchema.name).toBe("drive_list_files");
      expect(driveListFilesSchema.description).toBeDefined();
      expect(driveListFilesSchema.inputSchema.required).toBeDefined();
    });

    it("should have optional query parameter", () => {
      const queryParam = (driveListFilesSchema.inputSchema.properties as any).query;
      expect(queryParam).toBeDefined();
      expect(queryParam.optional).toBe(true);
    });

    it("should have optional folderId parameter", () => {
      const folderIdParam = (driveListFilesSchema.inputSchema.properties as any).folderId;
      expect(folderIdParam).toBeDefined();
      expect(folderIdParam.optional).toBe(true);
    });
  });

  describe("drive_get_metadata", () => {
    it("should have correct schema", () => {
      expect(driveGetMetadataSchema.name).toBe("drive_get_metadata");
      expect(driveGetMetadataSchema.description).toBeDefined();
      expect(driveGetMetadataSchema.inputSchema.required).toContain("fileId");
    });

    it("should have optional fields parameter", () => {
      const fieldsParam = (driveGetMetadataSchema.inputSchema.properties as any).fields;
      expect(fieldsParam).toBeDefined();
      expect(fieldsParam.optional).toBe(true);
    });
  });
});
