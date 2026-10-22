import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

export async function savePost(
  filePath: string,
  content: string,
): Promise<"created" | "updated" | "unchanged"> {
  await mkdir(path.dirname(filePath), { recursive: true });

  let existing: string | undefined;

  try {
    existing = await readFile(filePath, "utf8");
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      error.code !== "ENOENT"
    ) {
      throw error;
    }
  }

  if (existing !== undefined && hash(existing) === hash(content)) {
    return "unchanged";
  }

  const temporaryPath = `${filePath}.tmp`;

  await writeFile(temporaryPath, content, "utf8");
  await rename(temporaryPath, filePath);

  return existing === undefined ? "created" : "updated";
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
