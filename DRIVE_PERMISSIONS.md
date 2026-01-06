# Google Drive Permission Management Tools

This document describes the four new Google Drive permission management tools that have been implemented.

## Overview

These tools enable comprehensive permission management for Google Drive files:

1. **drive_share_file** - Add permissions to a file
2. **drive_list_permissions** - List all permissions on a file
3. **drive_update_permission** - Modify an existing permission
4. **drive_remove_permission** - Delete a permission

## Tool Specifications

### 1. drive_share_file

Share a file by adding permissions to it.

**Parameters:**
- `fileId` (required): ID of the file to share
- `role` (required): Permission role
  - `owner`: Full ownership control
  - `organizer`: Can organize items and create content
  - `fileOrganizer`: Can organize items
  - `writer`: Can edit
  - `commenter`: Can comment only
  - `reader`: Can view only
- `type` (required): Type of recipient
  - `user`: Single user (requires emailAddress)
  - `group`: Google Group (requires emailAddress)
  - `domain`: Entire organization domain (requires domain)
  - `anyone`: Anyone with the link
- `emailAddress` (optional): Email address for user or group
- `domain` (optional): Domain name for domain sharing (e.g., "example.com")
- `sendNotificationEmail` (optional): Send notification to recipient(s). Default: true
- `emailMessage` (optional): Custom message in notification email

**Response:**
Returns the created permission details including:
- Permission ID
- Role and type
- Recipient information
- Notification status

**Example:**
```json
{
  "fileId": "file-123",
  "role": "reader",
  "type": "user",
  "emailAddress": "user@example.com",
  "sendNotificationEmail": true
}
```

### 2. drive_list_permissions

Retrieve all permissions on a file, organized by type.

**Parameters:**
- `fileId` (required): ID of the file

**Response:**
Returns all permissions grouped by type:
- Users
- Groups
- Domains
- Anyone with link

Each permission includes:
- Permission ID
- Type and role
- Recipient email/domain
- Display name

**Example:**
```json
{
  "fileId": "file-123",
  "fileName": "My Document",
  "totalPermissions": 4,
  "summary": {
    "users": 2,
    "groups": 1,
    "domains": 0,
    "anyone": 1
  },
  "permissions": [...]
}
```

### 3. drive_update_permission

Change the role (access level) for an existing permission.

**Parameters:**
- `fileId` (required): ID of the file
- `permissionId` (required): ID of the permission to update (from list_permissions)
- `role` (required): New role to assign

**Response:**
Returns the updated permission details including:
- Previous and new roles
- Recipient information
- Permission ID

**Example:**
```json
{
  "fileId": "file-123",
  "permissionId": "perm-456",
  "previousRole": "reader",
  "newRole": "writer"
}
```

### 4. drive_remove_permission

Revoke access by deleting a permission.

**Parameters:**
- `fileId` (required): ID of the file
- `permissionId` (required): ID of the permission to remove (from list_permissions)

**Response:**
Returns information about the removed permission:
- Permission ID
- Recipient type and information
- Previous role

**Example:**
```json
{
  "fileId": "file-123",
  "permissionId": "perm-456",
  "removedPermissionType": "user",
  "recipient": "user@example.com"
}
```

## Usage Workflow

### Basic Sharing Workflow

1. **Share a file:**
   ```
   drive_share_file(fileId="abc123", role="reader", type="user", emailAddress="user@example.com")
   ```

2. **List permissions to verify:**
   ```
   drive_list_permissions(fileId="abc123")
   ```

3. **Update if needed:**
   ```
   drive_update_permission(fileId="abc123", permissionId="perm-123", role="writer")
   ```

4. **Remove if needed:**
   ```
   drive_remove_permission(fileId="abc123", permissionId="perm-123")
   ```

### Domain Sharing

Share with entire organization domain:
```
drive_share_file(
  fileId="abc123",
  role="reader",
  type="domain",
  domain="example.com"
)
```

### Link Sharing

Create public link (anyone with link can view):
```
drive_share_file(
  fileId="abc123",
  role="reader",
  type="anyone"
)
```

## Permission Role Hierarchy

- **owner**: Full control, can change ownership
- **organizer**: Can organize, manage drive members (Shared Drive only)
- **fileOrganizer**: Can manage files and organize
- **writer**: Can edit and upload new files
- **commenter**: Can view and add comments
- **reader**: View-only access

## Integration with Helper Functions

The tools use these helper functions from `lib/drive-helpers.ts`:
- `formatPermission()`: Format single permission for display
- `formatPermissionList()`: Format multiple permissions
- `getRoleLabel()`: Get human-readable role names
- `getTypeLabel()`: Get human-readable type names

## Error Handling

All tools include error handling for:
- Missing required parameters (emailAddress for user/group, domain for domain type)
- Google Drive API errors
- File not found errors
- Permission not found errors

Errors are returned with descriptive messages to help users identify the issue.

## Implementation Details

**File Locations:**
- `/tools/drive/permissions/drive_share_file.ts`
- `/tools/drive/permissions/drive_list_permissions.ts`
- `/tools/drive/permissions/drive_update_permission.ts`
- `/tools/drive/permissions/drive_remove_permission.ts`

**API Endpoints Used:**
- `drive.permissions.create()` - Add permission
- `drive.permissions.list()` - List permissions
- `drive.permissions.update()` - Update permission
- `drive.permissions.delete()` - Remove permission
- `drive.files.get()` - Get file metadata

**Tests:**
- `/tools/__tests__/drive_permissions.test.ts` - Schema validation tests

All tools follow the project's standard patterns:
- Use `ResponseFormatter` for consistent responses
- Implement input validation
- Include helpful formatting and grouping
- Provide detailed success messages
- Use TypeScript for type safety
