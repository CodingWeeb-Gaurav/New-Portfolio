"use client";

import React from "react";

interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  if (!content) return null;

  // Split content into blocks of code and normal text
  const blocks: { type: "code" | "text"; content: string; language?: string }[] = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      blocks.push({ type: "text", content: textBefore });
    }
    blocks.push({
      type: "code",
      content: match[2],
      language: match[1] || undefined,
    });
    lastIndex = codeBlockRegex.lastIndex;
  }

  const textAfter = content.substring(lastIndex);
  if (textAfter) {
    blocks.push({ type: "text", content: textAfter });
  }

  // Parse inline elements (bold, italic, inline code)
  const renderInline = (str: string): React.ReactNode[] => {
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const parts = str.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const elements: React.ReactNode[] = [];
  let elementKey = 0;

  blocks.forEach((block) => {
    if (block.type === "code") {
      elements.push(
        <pre key={elementKey++}>
          <code>{block.content.trim()}</code>
        </pre>
      );
    } else {
      const lines = block.content.split("\n");
      let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

      const flushList = () => {
        if (!currentList) return null;
        const listItems = currentList.items.map((item, idx) => (
          <li key={idx}>{renderInline(item)}</li>
        ));
        const listType = currentList.type;
        currentList = null;
        if (listType === "ul") {
          return <ul key={elementKey++}>{listItems}</ul>;
        } else {
          return <ol key={elementKey++}>{listItems}</ol>;
        }
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Identify unordered & ordered list items
        const ulMatch = line.match(/^(\s*)([*+-])\s+(.*)$/);
        const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);

        if (ulMatch) {
          if (!currentList || currentList.type !== "ul") {
            const list = flushList();
            if (list) elements.push(list);
            currentList = { type: "ul", items: [] };
          }
          currentList.items.push(ulMatch[3]);
        } else if (olMatch) {
          if (!currentList || currentList.type !== "ol") {
            const list = flushList();
            if (list) elements.push(list);
            currentList = { type: "ol", items: [] };
          }
          currentList.items.push(olMatch[3]);
        } else {
          // Normal text line - flush list if we were in one
          const list = flushList();
          if (list) elements.push(list);

          if (trimmedLine === "") {
            continue;
          }

          // Headers
          const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
          if (headerMatch) {
            const level = headerMatch[1].length;
            const headerText = headerMatch[2];
            const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
            elements.push(
              <Tag key={elementKey++}>
                {renderInline(headerText)}
              </Tag>
            );
          } else {
            // Normal paragraph line
            elements.push(
              <p key={elementKey++}>
                {renderInline(line)}
              </p>
            );
          }
        }
      }

      // Final flush
      const list = flushList();
      if (list) elements.push(list);
    }
  });

  return <div className="markdown-body">{elements}</div>;
}
