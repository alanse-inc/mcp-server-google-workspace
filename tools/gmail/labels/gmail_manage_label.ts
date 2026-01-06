import { google } from "googleapis";
import { GmailManageLabelInput, InternalToolResponse } from "../../types.js";
import { ResponseFormatter } from "../../../lib/response-formatter.js";

export const schema = {
  name: "gmail_manage_label",
  description:
    "Create, update, or delete Gmail labels. Supports creating new labels with visibility settings, updating existing label properties, or deleting labels.",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["create", "update", "delete"],
        description: "The action to perform on the label",
      },
      name: {
        type: "string",
        description:
          "Label name (required for create, optional for update). The display name of the label.",
        optional: true,
      },
      labelId: {
        type: "string",
        description:
          "Label ID (required for update and delete operations). Get this from gmail_list_labels.",
        optional: true,
      },
      labelListVisibility: {
        type: "string",
        enum: ["labelShow", "labelHide"],
        description:
          "Whether to show the label in the label list (optional for create/update)",
        optional: true,
      },
      messageListVisibility: {
        type: "string",
        enum: ["show", "hide"],
        description:
          "Whether to show the label in the message list (optional for create/update)",
        optional: true,
      },
    },
    required: ["action"],
  },
} as const;

export async function manageLabel(
  args: GmailManageLabelInput,
): Promise<InternalToolResponse> {
  try {
    const gmail = google.gmail("v1");
    const {
      action,
      name,
      labelId,
      labelListVisibility,
      messageListVisibility,
    } = args;

    let output = "";
    let resultData: any = {};

    switch (action) {
      case "create": {
        if (!name) {
          return ResponseFormatter.error(
            new Error("Label name is required for create action"),
          );
        }

        const createResponse = await gmail.users.labels.create({
          userId: "me",
          requestBody: {
            name,
            labelListVisibility: labelListVisibility || "labelShow",
            messageListVisibility: messageListVisibility || "show",
          },
        });

        const createdLabel = createResponse.data;
        output = `✅ Successfully created label\n\n`;
        output += `Label ID: ${createdLabel.id}\n`;
        output += `Name: ${createdLabel.name}\n`;
        output += `Label List Visibility: ${createdLabel.labelListVisibility}\n`;
        output += `Message List Visibility: ${createdLabel.messageListVisibility}`;

        resultData = {
          action: "create",
          labelId: createdLabel.id,
          name: createdLabel.name,
          labelListVisibility: createdLabel.labelListVisibility,
          messageListVisibility: createdLabel.messageListVisibility,
        };
        break;
      }

      case "update": {
        if (!labelId) {
          return ResponseFormatter.error(
            new Error("Label ID is required for update action"),
          );
        }

        const updateBody: any = {};
        if (name) updateBody.name = name;
        if (labelListVisibility)
          updateBody.labelListVisibility = labelListVisibility;
        if (messageListVisibility)
          updateBody.messageListVisibility = messageListVisibility;

        if (Object.keys(updateBody).length === 0) {
          return ResponseFormatter.error(
            new Error(
              "At least one property (name, labelListVisibility, or messageListVisibility) must be provided for update",
            ),
          );
        }

        const updateResponse = await gmail.users.labels.update({
          userId: "me",
          id: labelId,
          requestBody: updateBody,
        });

        const updatedLabel = updateResponse.data;
        output = `✅ Successfully updated label\n\n`;
        output += `Label ID: ${updatedLabel.id}\n`;
        output += `Name: ${updatedLabel.name}\n`;
        output += `Label List Visibility: ${updatedLabel.labelListVisibility}\n`;
        output += `Message List Visibility: ${updatedLabel.messageListVisibility}`;

        resultData = {
          action: "update",
          labelId: updatedLabel.id,
          name: updatedLabel.name,
          labelListVisibility: updatedLabel.labelListVisibility,
          messageListVisibility: updatedLabel.messageListVisibility,
        };
        break;
      }

      case "delete": {
        if (!labelId) {
          return ResponseFormatter.error(
            new Error("Label ID is required for delete action"),
          );
        }

        await gmail.users.labels.delete({
          userId: "me",
          id: labelId,
        });

        output = `✅ Successfully deleted label: ${labelId}`;

        resultData = {
          action: "delete",
          labelId,
        };
        break;
      }

      default:
        return ResponseFormatter.error(
          new Error(`Invalid action: ${action}. Must be create, update, or delete.`),
        );
    }

    return ResponseFormatter.success(resultData, output);
  } catch (error: any) {
    return ResponseFormatter.error(error);
  }
}
