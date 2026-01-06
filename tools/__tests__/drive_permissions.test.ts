import { describe, it, expect } from "vitest";
import { schema as shareFileSchema } from "../drive/permissions/drive_share_file";
import { schema as listPermissionsSchema } from "../drive/permissions/drive_list_permissions";
import { schema as updatePermissionSchema } from "../drive/permissions/drive_update_permission";
import { schema as removePermissionSchema } from "../drive/permissions/drive_remove_permission";

describe("Drive Permission Tools - Schema Validation", () => {
  describe("drive_share_file", () => {
    it("should have correct schema", () => {
      expect(shareFileSchema.name).toBe("drive_share_file");
      expect(shareFileSchema.description).toBeDefined();
      expect(shareFileSchema.inputSchema.required).toContain("fileId");
      expect(shareFileSchema.inputSchema.required).toContain("role");
      expect(shareFileSchema.inputSchema.required).toContain("type");
    });

    it("should have valid role enum values", () => {
      const roleEnum = (shareFileSchema.inputSchema.properties as any).role.enum;
      expect(roleEnum).toEqual([
        "owner",
        "organizer",
        "fileOrganizer",
        "writer",
        "commenter",
        "reader",
      ]);
    });

    it("should have valid type enum values", () => {
      const typeEnum = (shareFileSchema.inputSchema.properties as any).type.enum;
      expect(typeEnum).toEqual(["user", "group", "domain", "anyone"]);
    });
  });

  describe("drive_list_permissions", () => {
    it("should have correct schema", () => {
      expect(listPermissionsSchema.name).toBe("drive_list_permissions");
      expect(listPermissionsSchema.description).toBeDefined();
      expect(listPermissionsSchema.inputSchema.required).toContain("fileId");
    });
  });

  describe("drive_update_permission", () => {
    it("should have correct schema", () => {
      expect(updatePermissionSchema.name).toBe("drive_update_permission");
      expect(updatePermissionSchema.description).toBeDefined();
      expect(updatePermissionSchema.inputSchema.required).toContain("fileId");
      expect(updatePermissionSchema.inputSchema.required).toContain("permissionId");
      expect(updatePermissionSchema.inputSchema.required).toContain("role");
    });

    it("should have valid role enum values", () => {
      const roleEnum = (updatePermissionSchema.inputSchema.properties as any).role.enum;
      expect(roleEnum).toEqual([
        "owner",
        "organizer",
        "fileOrganizer",
        "writer",
        "commenter",
        "reader",
      ]);
    });
  });

  describe("drive_remove_permission", () => {
    it("should have correct schema", () => {
      expect(removePermissionSchema.name).toBe("drive_remove_permission");
      expect(removePermissionSchema.description).toBeDefined();
      expect(removePermissionSchema.inputSchema.required).toContain("fileId");
      expect(removePermissionSchema.inputSchema.required).toContain("permissionId");
    });
  });
});
