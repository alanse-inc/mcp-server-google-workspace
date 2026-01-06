import { describe, it, expect } from "vitest";
import { schema as driveCreateFolderSchema } from "../drive/folder/drive_create_folder";
import { schema as driveListFolderContentsSchema } from "../drive/folder/drive_list_folder_contents";
import { schema as driveMoveToFolderSchema } from "../drive/folder/drive_move_to_folder";

describe("Drive Folder Operations - Schema Validation", () => {
  describe("drive_create_folder", () => {
    it("should have correct schema", () => {
      expect(driveCreateFolderSchema.name).toBe("drive_create_folder");
      expect(driveCreateFolderSchema.description).toBeDefined();
      expect(driveCreateFolderSchema.inputSchema.required).toContain("name");
    });

    it("should have optional parents parameter", () => {
      const parentsParam = (driveCreateFolderSchema.inputSchema.properties as any).parents;
      expect(parentsParam).toBeDefined();
      expect(parentsParam.optional).toBe(true);
    });

    it("should have optional description parameter", () => {
      const descriptionParam = (driveCreateFolderSchema.inputSchema.properties as any).description;
      expect(descriptionParam).toBeDefined();
      expect(descriptionParam.optional).toBe(true);
    });
  });

  describe("drive_list_folder_contents", () => {
    it("should have correct schema", () => {
      expect(driveListFolderContentsSchema.name).toBe("drive_list_folder_contents");
      expect(driveListFolderContentsSchema.description).toBeDefined();
      expect(driveListFolderContentsSchema.inputSchema.required).toContain("folderId");
    });

    it("should have optional pageSize parameter", () => {
      const pageSizeParam = (driveListFolderContentsSchema.inputSchema.properties as any).pageSize;
      expect(pageSizeParam).toBeDefined();
      expect(pageSizeParam.optional).toBe(true);
    });

    it("should have optional orderBy parameter", () => {
      const orderByParam = (driveListFolderContentsSchema.inputSchema.properties as any).orderBy;
      expect(orderByParam).toBeDefined();
      expect(orderByParam.optional).toBe(true);
    });
  });

  describe("drive_move_to_folder", () => {
    it("should have correct schema", () => {
      expect(driveMoveToFolderSchema.name).toBe("drive_move_to_folder");
      expect(driveMoveToFolderSchema.description).toBeDefined();
      expect(driveMoveToFolderSchema.inputSchema.required).toContain("fileId");
      expect(driveMoveToFolderSchema.inputSchema.required).toContain("folderId");
    });
  });
});
