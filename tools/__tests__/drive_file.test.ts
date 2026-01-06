import { describe, it, expect } from "vitest";
import { schema as driveUploadFileSchema } from "../drive/file/drive_upload_file";
import { schema as driveCreateFileSchema } from "../drive/file/drive_create_file";
import { schema as driveDeleteFileSchema } from "../drive/file/drive_delete_file";
import { schema as driveCopyFileSchema } from "../drive/file/drive_copy_file";
import { schema as driveMoveFileSchema } from "../drive/file/drive_move_file";
import { schema as driveRenameFileSchema } from "../drive/file/drive_rename_file";
import { schema as driveUpdateFileSchema } from "../drive/file/drive_update_file";

describe("Drive File Operations - Schema Validation", () => {
  describe("drive_upload_file", () => {
    it("should have correct schema", () => {
      expect(driveUploadFileSchema.name).toBe("drive_upload_file");
      expect(driveUploadFileSchema.description).toBeDefined();
      expect(driveUploadFileSchema.inputSchema.required).toContain("name");
      expect(driveUploadFileSchema.inputSchema.required).toContain("mimeType");
      expect(driveUploadFileSchema.inputSchema.required).toContain("content");
    });

    it("should have optional parents parameter", () => {
      const parentsParam = (driveUploadFileSchema.inputSchema.properties as any).parents;
      expect(parentsParam).toBeDefined();
      expect(parentsParam.optional).toBe(true);
    });
  });

  describe("drive_create_file", () => {
    it("should have correct schema", () => {
      expect(driveCreateFileSchema.name).toBe("drive_create_file");
      expect(driveCreateFileSchema.description).toBeDefined();
      expect(driveCreateFileSchema.inputSchema.required).toContain("name");
      expect(driveCreateFileSchema.inputSchema.required).toContain("mimeType");
    });
  });

  describe("drive_delete_file", () => {
    it("should have correct schema", () => {
      expect(driveDeleteFileSchema.name).toBe("drive_delete_file");
      expect(driveDeleteFileSchema.description).toBeDefined();
      expect(driveDeleteFileSchema.inputSchema.required).toContain("fileId");
    });
  });

  describe("drive_copy_file", () => {
    it("should have correct schema", () => {
      expect(driveCopyFileSchema.name).toBe("drive_copy_file");
      expect(driveCopyFileSchema.description).toBeDefined();
      expect(driveCopyFileSchema.inputSchema.required).toContain("fileId");
    });

    it("should have optional name parameter", () => {
      const nameParam = (driveCopyFileSchema.inputSchema.properties as any).name;
      expect(nameParam).toBeDefined();
      expect(nameParam.optional).toBe(true);
    });

    it("should have optional parents parameter", () => {
      const parentsParam = (driveCopyFileSchema.inputSchema.properties as any).parents;
      expect(parentsParam).toBeDefined();
      expect(parentsParam.optional).toBe(true);
    });
  });

  describe("drive_move_file", () => {
    it("should have correct schema", () => {
      expect(driveMoveFileSchema.name).toBe("drive_move_file");
      expect(driveMoveFileSchema.description).toBeDefined();
      expect(driveMoveFileSchema.inputSchema.required).toContain("fileId");
      expect(driveMoveFileSchema.inputSchema.required).toContain("newParents");
    });

    it("should have optional removeParents parameter", () => {
      const removeParentsParam = (driveMoveFileSchema.inputSchema.properties as any).removeParents;
      expect(removeParentsParam).toBeDefined();
      expect(removeParentsParam.optional).toBe(true);
    });
  });

  describe("drive_rename_file", () => {
    it("should have correct schema", () => {
      expect(driveRenameFileSchema.name).toBe("drive_rename_file");
      expect(driveRenameFileSchema.description).toBeDefined();
      expect(driveRenameFileSchema.inputSchema.required).toContain("fileId");
      expect(driveRenameFileSchema.inputSchema.required).toContain("newName");
    });
  });

  describe("drive_update_file", () => {
    it("should have correct schema", () => {
      expect(driveUpdateFileSchema.name).toBe("drive_update_file");
      expect(driveUpdateFileSchema.description).toBeDefined();
      expect(driveUpdateFileSchema.inputSchema.required).toContain("fileId");
    });

    it("should have optional content parameter", () => {
      const contentParam = (driveUpdateFileSchema.inputSchema.properties as any).content;
      expect(contentParam).toBeDefined();
      expect(contentParam.optional).toBe(true);
    });
  });
});
