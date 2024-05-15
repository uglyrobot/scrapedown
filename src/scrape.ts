import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import TurndownService from "./turndown";

export const scrape = async ({
  url,
  markdown,
  extract,
}: {
  url: string;
  markdown: boolean;
  extract: boolean;
}) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)",
    },
  });
  const html = await response.text();
  //console.log("html", html);
  const article = extractContent(html);

  if (extract) {

    if (article == null) {
      return null;
    }

    if (markdown) {
      const doc = parseHTML(article.content);
      const textContent = convertToMarkdown(doc.window.document);
      return { ...article, textContent };
    } else {
      const content = cleanString(article.content);
      const textContent = cleanString(article.textContent);

      return { ...article, content, textContent };
    }
  } else {

    if (markdown) {
      const doc = parseHTML(html);
      const textContent = convertToMarkdown(doc.window.document.body);
      return { ...article, textContent };
    } else {
      const content = cleanString(html);
      const textContent = cleanString(article.textContent);

      return { ...article, content, textContent };
    }
  }
};

const extractContent = (html: string) => {
  var doc = parseHTML(html);
  let reader = new Readability(doc.window.document, {
    charThreshold: 10,
  });
  return reader.parse();
};

const convertToMarkdown = (doc: string) => {
  const turndown = new TurndownService();
  return turndown.turndown(doc);
};

//
const cleanString = (str: string) =>
  str
    // Replace various whitespace and zero-width characters with a single space
    .replace(/[\s\t\u200B-\u200D\uFEFF]+/g, " ")
    // Remove leading whitespace from each line in the string
    .replace(/^\s+/gm, "")
    // Collapse multiple newline characters into a single newline
    .replace(/\n+/g, "\n");
