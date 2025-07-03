import * as vscode from "vscode";
import * as https from "https";
import dotenv from "dotenv";
dotenv.config();

export async function fetchGeminiCompletion(prompt: string): Promise<string> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    vscode.workspace.getConfiguration().get("devgenie.apiKey");

  if (!apiKey) {
    throw new Error(
      "Gemini API key is missing. Set it in the environment or VS Code settings."
    );
  }

  const requestData = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
  });

  const options = {
    hostname: "generativelanguage.googleapis.com",
    path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const result =
            parsed.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No suggestion.";

          console.log("💡 Gemini response received:", result); // ✅ Add this line
          resolve(result);
        } catch (e) {
          reject("Failed to parse Gemini response.");
        }
      });
    });

    req.on("error", (error) => reject(error));
    req.write(requestData);
    req.end();
  });
}
