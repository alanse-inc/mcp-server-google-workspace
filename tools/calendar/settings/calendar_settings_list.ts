import { google } from "googleapis";
import { CalendarSettingsListInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "calendar_settings_list",
  description:
    "List all user settings for the authenticated user's Google Calendar. Returns configuration settings such as timezone, date format, country, language, and other Calendar preferences. Useful for understanding user's Calendar configuration.",
  inputSchema: {
    type: "object",
    properties: {
      maxResults: {
        type: "number",
        description: "Maximum number of settings to return per page (default: 100, max: 250)",
      },
      pageToken: {
        type: "string",
        description: "Token for accessing subsequent result pages",
      },
    },
    required: [],
  },
} as const;

export async function listSettings(
  args: CalendarSettingsListInput = {},
): Promise<InternalToolResponse> {
  try {
    const calendar = google.calendar("v3");
    const {
      maxResults,
      pageToken,
    } = args;

    const response = await calendar.settings.list({
      maxResults,
      pageToken,
    });

    const settings = response.data.items || [];
    const totalSettings = settings.length;

    if (totalSettings === 0) {
      return ResponseFormatter.success(
        { settings: [], count: 0 },
        "No settings found.",
      );
    }

    let message = `⚙️ Calendar Settings (${totalSettings} setting${totalSettings > 1 ? "s" : ""})\n\n`;

    // Group settings by category for better readability
    const categorizedSettings: Record<string, any[]> = {
      "General": [],
      "Time & Date": [],
      "Locale": [],
      "Other": [],
    };

    settings.forEach((setting) => {
      const id = setting.id || "";

      if (id.includes("timezone") || id.includes("time") || id.includes("date") || id.includes("hour")) {
        categorizedSettings["Time & Date"].push(setting);
      } else if (id.includes("locale") || id.includes("language") || id.includes("country")) {
        categorizedSettings["Locale"].push(setting);
      } else if (id.includes("format") || id.includes("weekStart") || id.includes("show")) {
        categorizedSettings["General"].push(setting);
      } else {
        categorizedSettings["Other"].push(setting);
      }
    });

    // Display settings by category
    Object.entries(categorizedSettings).forEach(([category, items]) => {
      if (items.length > 0) {
        message += `\n${category}:\n`;
        items.forEach((setting) => {
          message += `  ${setting.id}: ${setting.value}\n`;
        });
      }
    });

    if (response.data.nextPageToken) {
      message += `\n\n📄 Next Page Token: ${response.data.nextPageToken}`;
    }

    return ResponseFormatter.success(
      {
        settings: settings.map((s) => ({
          id: s.id,
          value: s.value,
        })),
        count: totalSettings,
        nextPageToken: response.data.nextPageToken || null,
      },
      message,
    );
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
