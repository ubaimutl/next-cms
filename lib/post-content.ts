import { slugifyPostTitle } from "@/lib/post-slug";

export function getPlainTextFromHtml(content: string | null | undefined) {
  if (!content) {
    return "";
  }

  return content
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6|blockquote)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function getExcerptFromHtml(
  content: string | null | undefined,
  maxLength = 140,
) {
  const plainText = getPlainTextFromHtml(content);

  if (!plainText) {
    return "No content has been added to this post yet.";
  }

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength).trim()}...`;
}

export type PostHeading = {
  id: string;
  level: 2 | 3;
  text: string;
};

function decodeHtmlEntities(content: string) {
  return content
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function stripInlineHtml(content: string) {
  return decodeHtmlEntities(content).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function getWordCountFromHtml(content: string | null | undefined) {
  const plainText = getPlainTextFromHtml(content);

  if (!plainText) {
    return 0;
  }

  return plainText.split(/\s+/).filter(Boolean).length;
}

export function getReadingTimeMinutes(content: string | null | undefined) {
  const wordCount = getWordCountFromHtml(content);

  if (wordCount === 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(wordCount / 220));
}

export function extractHeadingsFromHtml(content: string | null | undefined) {
  if (!content) {
    return [] satisfies PostHeading[];
  }

  const usedIds = new Map<string, number>();
  const headings: PostHeading[] = [];
  const headingPattern = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi;

  for (const match of content.matchAll(headingPattern)) {
    const level = Number(match[1]) as 2 | 3;
    const text = stripInlineHtml(match[3]);

    if (!text) {
      continue;
    }

    const baseId = slugifyPostTitle(text);
    const duplicateIndex = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, duplicateIndex + 1);

    headings.push({
      id: duplicateIndex === 0 ? baseId : `${baseId}-${duplicateIndex + 1}`,
      level,
      text,
    });
  }

  return headings;
}

export function addHeadingIdsToHtml(content: string | null | undefined) {
  if (!content) {
    return "";
  }

  const headings = extractHeadingsFromHtml(content);

  if (headings.length === 0) {
    return content;
  }

  let headingIndex = 0;

  return content.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (fullMatch, level, attributes, innerHtml) => {
      const nextHeading = headings[headingIndex];
      headingIndex += 1;

      if (!nextHeading || Number(level) !== nextHeading.level) {
        return fullMatch;
      }

      const attributeString = String(attributes ?? "");

      if (/\sid\s*=/.test(attributeString)) {
        return fullMatch;
      }

      return `<h${level}${attributeString} id="${nextHeading.id}">${innerHtml}</h${level}>`;
    },
  );
}
