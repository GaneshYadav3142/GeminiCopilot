import * as vscode from "vscode";
import { fetchGeminiCompletion } from "./utils/fetchGemini";

export function activate(context: vscode.ExtensionContext) {
  console.log("✅ GeminiCopilot is now active!");

  const provider = vscode.languages.registerCompletionItemProvider(
    { scheme: "file", language: "*" },
    {
      async provideCompletionItems(document, position) {
        const linePrefix = document
          .lineAt(position)
          .text.slice(0, position.character);
        if (!linePrefix.trim()) {
          return undefined;
        }

        try {
          const suggestion = await fetchGeminiCompletion(linePrefix);
          const firstLine = suggestion.split("\n")[0];

          const item = new vscode.CompletionItem(
            firstLine,
            vscode.CompletionItemKind.Snippet
          );
          item.detail = "💡 Gemini Suggestion";
          item.insertText = firstLine;
          item.command = {
            command: "geminiCopilot.triggerNext",
            title: "Trigger next suggestion",
          };

          return [item];
        } catch (err) {
          console.error("Gemini Error:", err);
          return [];
        }
      },
    },
    " " // space key trigger (or try: ".", "(", etc.)
  );

  const triggerNext = vscode.commands.registerCommand(
    "geminiCopilot.triggerNext",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const line = editor.document.lineAt(editor.selection.active.line).text;

      try {
        const suggestion = await fetchGeminiCompletion(line);
        const nextLine = suggestion.split("\n")[0];
        editor.insertSnippet(
          new vscode.SnippetString("\n" + nextLine),
          editor.selection.active
        );
      } catch (err) {
        vscode.window.showErrorMessage("❌ Gemini Error: " + err);
      }
    }
  );

  context.subscriptions.push(provider, triggerNext);
}

export function deactivate() {}
