import * as vscode from "vscode";
import { fetchGeminiCompletion } from "../utils/fetchGemini";

export async function completeCode() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage("No editor is active.");
    return;
  }

  const document = editor.document;
  const position = editor.selection.active;
  const textBeforeCursor = document.getText(
    new vscode.Range(new vscode.Position(0, 0), position)
  );

  vscode.window.setStatusBarMessage("💡 Gemini is generating...", 2000);

  try {
    const suggestion = await fetchGeminiCompletion(
      `Continue this code:\n${textBeforeCursor}`
    );
    const firstLine = suggestion.split("\n")[0];

    editor.edit((editBuilder) => {
      editBuilder.insert(position, firstLine);
    });

    vscode.window.setStatusBarMessage("✅ Gemini suggestion inserted.");
  } catch (error) {
    vscode.window.showErrorMessage("❌ Error fetching from Gemini: " + error);
  }
}
