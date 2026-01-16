# MCP Server - Google Workspace

**The most comprehensive MCP server for Google Workspace** - Complete programmatic control over Sheets, Docs, Drive, Gmail, Calendar, Slides, and future Forms integration.

🚀 **Current Status**: 141 tools (Drive: 21, Sheets: 57, Docs: 23, Gmail: 11, Calendar: 18, Slides: 11)
📅 **Roadmap**: Forms

Extended implementation by Alanse inc.

---

## 🚀 Features

### 📊 Extended Google Workspace API Implementation

**141 Total Tools** = **21 Google Drive** + **57 Google Sheets** + **23 Google Docs** + **11 Gmail** + **18 Calendar** + **11 Slides** operations

#### Tool Categories

**Google Drive Operations (21 tools)**

#### Basic Operations (4 tools)

- Search Files (Advanced Query Support)
- Read File Contents
- List Files (Filter, Pagination, Sorting)
- Get File Metadata

#### File Operations (7 tools)

- Upload File
- Create File
- Delete File (Move to Trash)
- Copy File
- Move File
- Rename File
- Update File Content

#### Folder Management (3 tools)

- Create Folder
- List Folder Contents
- Move File to Folder

#### Permissions Management (4 tools)

- Share File (User/Group/Domain/Anyone)
- List File Permissions
- Update Permission Role
- Remove Permission

#### Advanced Operations (3 tools)

- Export File (Google Workspace Docs to PDF/DOCX/etc)
- List File Revisions
- Empty Trash

**Gmail Operations (11 tools)**

#### Basic Operations (4 tools)

- List Labels, Search Messages, Get Message, Get Thread

#### Label Management (2 tools)

- Modify Labels (Add/Remove), Manage Labels (Create/Update/Delete)

#### Send Operations (2 tools)

- Send Message (Plain/HTML with CC/BCC), Draft Message

#### Batch Operations (3 tools)

- Get Messages Batch, Get Threads Batch, Batch Modify Labels

**Google Calendar Operations (18 tools)**

#### Basic Event Operations (5 tools)

- List Events (Time range, search, pagination)
- Get Event (Full event details)
- Create Event (Title, time, location, attendees, Google Meet)
- Update Event (Modify any event properties)
- Delete Event (Remove with notifications)

#### Advanced Event Operations (3 tools)

- Quick Add Event (Natural language: "Meeting tomorrow at 2pm")
- List Event Instances (Recurring event occurrences)
- Move Event (Transfer between calendars)

#### Calendar List Operations (2 tools)

- List Calendars (User's calendar list with access roles)
- Get Calendar from List (Detailed calendar information)

#### Calendar Management (3 tools)

- Create Calendar (New secondary calendar)
- Get Calendar Metadata (Calendar details and settings)
- Update Calendar (Modify title, description, timezone)

#### Access Control (2 tools)

- List ACL Rules (View sharing settings)
- Add ACL Rule (Share calendar with users/groups/domains)

#### Utility Operations (3 tools)

- Get Color Palette (Available calendar/event colors)
- Query Free/Busy (Check availability across calendars)
- List Settings (User's Calendar preferences)

**Google Slides Operations (11 tools)**

#### Basic Operations (4 tools)

- Create Presentation (New blank presentation)
- Get Presentation (Full presentation details and metadata)
- Get Page (Get detailed information about a specific slide)
- Add Slide (Insert new slide with optional layout)

#### Content Operations (2 tools)

- Insert Text (Add text boxes to slides with positioning)
- Insert Image (Add images from URL with positioning)

#### Editing Operations (4 tools)

- Duplicate Slide (Copy existing slide with optional positioning)
- Update Slides Position (Reorder slides in presentation)
- Replace All Text (Bulk text replacement throughout presentation)
- Delete Object (Remove shapes, images, text boxes from slides)

#### Batch Operations (1 tool)

- Batch Update (Execute multiple operations in one request)

**Google Docs Operations (23 tools)**

**Basic Operations (4 tools)**
- Create, Read, Get Metadata, List Documents

**Content & Formatting (10 tools)**
- Insert/Update/Delete/Replace/Append Text
- Format Text (Bold, Italic, Font, Color)
- Create Headings (H1-H6)
- Create Lists (Bulleted/Numbered)
- Set Paragraph Alignment & Apply Styles

**Elements & Advanced (9 tools)**
- Insert Images, Tables, Page Breaks, Links
- Insert Table of Contents
- Batch Update Operations
- Merge Documents, Export to PDF/DOCX/HTML
- Suggestion Mode

**Sheet Management (13 tools)**
- Create, Read, List, Add, Delete, Rename Sheets
- Insert/Delete Rows & Columns
- Copy, Duplicate, Copy Between Spreadsheets

**Data Operations (9 tools)**
- Cell Update, Batch Update, Append Data
- Clear Data, Batch Clear
- Sort, Find & Replace
- Data Validation, Filter Creation

**Formatting (8 tools)**
- Cell Formatting (Font, Color, Alignment)
- Merge/Unmerge Cells
- Borders, Auto-resize
- Number Formats, Freeze Rows/Columns

**Charts (10 tools)**
- Basic Charts (Column, Bar, Line, Area, Pie, Scatter)
- Advanced Charts (Histogram, Waterfall, Candlestick, Combo, Bubble, Treemap, Org Chart)
- Chart Update & Delete

**Protection & Named Ranges (7 tools)**
- Protected Ranges (Add/Update/Delete)
- Named Ranges (Add/Update/Delete)
- Conditional Formatting

**Advanced Features (8 tools)**
- Filter Views & Pivot Tables
- Dimension Groups (Row/Column Grouping)
- Developer Metadata (Custom Metadata Storage)

For complete tool documentation, see [docs/api-comparison.md](./docs/api-comparison.md)

### Resources

The server provides access to Google Drive files:

- **Files** (`gworkspace:///<file_id>`)
  - Supports all file types
  - Google Workspace files are automatically exported:
    - Docs → Markdown
    - Sheets → CSV
    - Presentations → Plain text
    - Drawings → PNG
  - Other files are provided in their native format

## Getting started

1. [Create a new Google Cloud project](https://console.cloud.google.com/projectcreate)
2. [Enable the Google Drive API](https://console.cloud.google.com/workspace-api/products)
3. [Configure an OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent) ("internal" is fine for testing)
4. Add OAuth scopes:
   - `https://www.googleapis.com/auth/drive` (for Drive file operations - read & write)
   - `https://www.googleapis.com/auth/spreadsheets` (for Sheets operations)
   - `https://www.googleapis.com/auth/gmail.modify` (for Gmail operations)
   - `https://www.googleapis.com/auth/presentations` (for Slides operations)
5. In order to allow interaction with sheets, docs, and slides you will also need to enable the [Google Sheets API](https://console.cloud.google.com/apis/api/sheets.googleapis.com/), [Google Docs API](https://console.cloud.google.com/marketplace/product/google/docs.googleapis.com), [Google Slides API](https://console.cloud.google.com/apis/api/slides.googleapis.com/), and [Gmail API](https://console.cloud.google.com/apis/api/gmail.googleapis.com) in your workspaces Enabled API and Services section.
6. [Create an OAuth Client ID](https://console.cloud.google.com/apis/credentials/oauthclient) for application type "Desktop App"
7. Download the JSON file of your client's OAuth keys
8. Rename the key file to `gcp-oauth.keys.json` and place into the path you specify with `GWORKSPACE_CREDS_DIR` (i.e. `/Users/username/.config/mcp-google-workspace`)
9. Note your OAuth Client ID and Client Secret. They must be provided as environment variables along with your configuration directory.
10. You will also need to setup a .env file within the project with the following fields. You can find the Client ID and Client Secret in the Credentials section of the Google Cloud Console.

```bash
GWORKSPACE_CREDS_DIR=/path/to/config/directory
CLIENT_ID=<CLIENT_ID>
CLIENT_SECRET=<CLIENT_SECRET>
```

Make sure to build the server with either `npm run build` or `npm run watch`.

### Authentication

Next you will need to run `node ./dist/index.js` to trigger the authentication step

You will be prompted to authenticate with your browser. You must authenticate with an account in the same organization as your Google Cloud project.

Your OAuth token is saved in the directory specified by the `GWORKSPACE_CREDS_DIR` environment variable.

### Usage with Desktop App

To integrate this server with the desktop app, add the following to your app's server configuration:

```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "npx",
      "args": ["-y", "@alanse/mcp-server-google-workspace"],
      "env": {
        "CLIENT_ID": "<CLIENT_ID>",
        "CLIENT_SECRET": "<CLIENT_SECRET>",
        "GWORKSPACE_CREDS_DIR": "/path/to/config/directory"
      }
    }
  }
}
```

### Usage with Claude Code CLI

To add this server to Claude Code CLI, use the following command:

```bash
claude mcp add google-workspace \
  -e CLIENT_ID=<YOUR_CLIENT_ID> \
  -e CLIENT_SECRET=<YOUR_CLIENT_SECRET> \
  -e GWORKSPACE_CREDS_DIR=/path/to/config/directory \
  -- npx -y @alanse/mcp-server-google-workspace \
  -s user
```

Replace `<YOUR_CLIENT_ID>`, `<YOUR_CLIENT_SECRET>`, and `/path/to/config/directory` with your actual values.

## 📈 Project Status

✅ **Complete** (2026-01-14)

- **141 Tools Implemented** (21 Drive + 57 Sheets + 23 Docs + 11 Gmail + 18 Calendar + 11 Slides)
- **Production Ready**

## 🗺️ Roadmap

### Completed ✅

- ✅ **Google Drive**: 21 tools (File operations, folder management, permissions, advanced features)
- ✅ **Google Sheets**: 57 tools (Complete API coverage)
- ✅ **Google Docs**: 23 tools (Document creation, editing, formatting, elements)
- ✅ **Gmail**: 11 tools (Labels, search, send, batch operations)
- ✅ **Google Calendar**: 18 tools (Event management, scheduling, calendars, ACL)
- ✅ **Google Slides**: 11 tools (Presentation creation, slide management, content insertion, editing operations)

### Coming Soon

- 📋 **Google Forms**: Form creation, response management (~10-15 tools)

**Goal**: 150+ tools covering the entire Google Workspace ecosystem

## 🛠️ Development

### Prerequisites

- Node.js 20 or higher
- npm or pnpm
- Google Cloud Platform account with OAuth credentials

### Local Development

```bash
# Clone the repository
git clone https://github.com/alanse-inc/mcp-server-google-workspace.git
cd mcp-server-google-workspace

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Watch mode for development
npm run watch
```

### Testing

The project uses [Vitest](https://vitest.dev/) for unit testing:

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# Coverage report
npm run test:coverage
```

### Interactive Testing with MCP Inspector

[MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) is the official debugging tool for MCP servers. It provides an interactive interface to test all 130 tools in real-time.

**Launch Inspector:**

```bash
npm run inspect
```

This opens a browser interface where you can:

- 🔍 **Browse all 130 tools** - View complete tool schemas and descriptions
- ⚡ **Test tools interactively** - Execute any tool with custom parameters
- 📊 **Monitor responses** - See real-time responses and error messages
- 🐛 **Debug issues** - View server logs and notifications
- 🧪 **Test edge cases** - Try invalid inputs and concurrent operations

**Example workflow:**

1. Start the inspector: `npm run inspect`
2. Navigate to the **Tools** tab
3. Select a tool (e.g., `calendar_create_event`)
4. Fill in the parameters (summary, startTime, endTime)
5. Click **Execute** to test the tool
6. View the response and verify the behavior

**Recommended for:**

- Testing new Calendar API tools
- Verifying OAuth authentication flow
- Debugging API errors and edge cases
- Exploring available tools before integration

### Release Process

This project uses [release-please](https://github.com/googleapis/release-please) for automated releases.

**How it works:**

1. Follow [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages
2. When commits are merged to `main`, release-please creates/updates a release PR
3. Merging the release PR triggers:
   - CHANGELOG.md update
   - Version bump in package.json
   - GitHub Release creation
   - npm package publication

**Commit message format:**

```text
feat: add new feature
fix: fix a bug
docs: update documentation
chore: update dependencies
refactor: code refactoring
test: add tests
```

**Example workflow:**

```bash
# Make changes
git checkout -b feature/new-tool
# ... make changes ...
git commit -m "feat: add gdocs_insert_table tool"
git push origin feature/new-tool

# Create PR and merge to main
# → release-please creates a release PR automatically
# → Merge the release PR to publish
```

## 📄 License

This project is licensed under the **Elastic License 2.0**.

Copyright © 2026 Alanse inc.

See the [LICENSE](./LICENSE) file for details.

**Key restrictions**:
- You may not provide the software to third parties as a hosted or managed service where the service provides users with access to any substantial set of the features or functionality of the software.
- You may not alter, remove, or obscure any licensing, copyright, or other notices of the licensor in the software.
