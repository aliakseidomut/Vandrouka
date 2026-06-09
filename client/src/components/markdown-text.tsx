import React, { useMemo } from "react";
import { StyleSheet, Text, View, type TextStyle } from "react-native";

type Props = {
  text: string;
  baseColor?: string;
  baseFontSize?: number;
};

type Block =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "paragraph"; text: string }
  | { kind: "spacer" };

function stripEmphasisChars(line: string): string {
  return line.replace(/^[\s>]+/, "").trim();
}

function parseBlocks(input: string): Block[] {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ kind: "paragraph", text: paragraph.join(" ").trim() });
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    blocks.push({ kind: "list", ordered: list.ordered, items: list.items });
    list = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/\t/g, "  ");
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length as 1 | 2 | 3;
      blocks.push({ kind: "heading", level, text: heading[2] });
      continue;
    }

    const bullet = trimmed.match(/^(?:[-*•]|·)\s+(.+)$/);
    const ordered = trimmed.match(/^(\d+)[.)]\s+(.+)$/);

    if (bullet) {
      flushParagraph();
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }
    if (ordered) {
      flushParagraph();
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(ordered[2]);
      continue;
    }

    if (list) flushList();
    paragraph.push(stripEmphasisChars(trimmed));
  }

  flushParagraph();
  flushList();

  return blocks;
}

type InlinePart = { text: string; bold?: boolean; italic?: boolean };

function parseInline(text: string): InlinePart[] {
  let s = text;
  s = s.replace(/`([^`]+)`/g, "$1");
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, "");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");

  const parts: InlinePart[] = [];
  const re = /(\*\*\*|___)([\s\S]+?)\1|(\*\*|__)([\s\S]+?)\3|(\*|_)([\s\S]+?)\5/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) parts.push({ text: s.slice(last, m.index) });
    if (m[1]) parts.push({ text: m[2], bold: true, italic: true });
    else if (m[3]) parts.push({ text: m[4], bold: true });
    else if (m[5]) parts.push({ text: m[6], italic: true });
    last = re.lastIndex;
  }
  if (last < s.length) parts.push({ text: s.slice(last) });

  if (parts.length === 0) return [{ text: s }];
  return parts;
}

function Inline({
  text,
  baseStyle,
}: {
  text: string;
  baseStyle: TextStyle;
}) {
  const parts = useMemo(() => parseInline(text), [text]);
  return (
    <Text style={baseStyle}>
      {parts.map((p, i) => {
        const style: TextStyle = {};
        if (p.bold) style.fontWeight = "700";
        if (p.italic) style.fontStyle = "italic";
        return (
          <Text key={i} style={style}>
            {p.text}
          </Text>
        );
      })}
    </Text>
  );
}

export function MarkdownText({
  text,
  baseColor = "#1F2937",
  baseFontSize = 14,
}: Props) {
  const blocks = useMemo(() => parseBlocks(text || ""), [text]);
  const base: TextStyle = {
    color: baseColor,
    fontSize: baseFontSize,
    lineHeight: Math.round(baseFontSize * 1.55),
  };

  return (
    <View>
      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          const sizes = { 1: baseFontSize + 6, 2: baseFontSize + 4, 3: baseFontSize + 2 };
          const headingStyle: TextStyle = {
            ...base,
            fontSize: sizes[block.level],
            lineHeight: Math.round(sizes[block.level] * 1.4),
            fontWeight: "700",
            marginTop: i === 0 ? 0 : 12,
            marginBottom: 6,
          };
          return <Inline key={i} text={block.text} baseStyle={headingStyle} />;
        }
        if (block.kind === "list") {
          return (
            <View key={i} style={styles.list}>
              {block.items.map((item, j) => (
                <View key={j} style={styles.listRow}>
                  <Text style={[base, styles.bullet]}>
                    {block.ordered ? `${j + 1}.` : "•"}
                  </Text>
                  <Inline text={item} baseStyle={{ ...base, flex: 1 }} />
                </View>
              ))}
            </View>
          );
        }
        if (block.kind === "spacer") {
          return <View key={i} style={{ height: 8 }} />;
        }
        return (
          <Inline
            key={i}
            text={block.text}
            baseStyle={{ ...base, marginTop: i === 0 ? 0 : 10 }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 6, gap: 4 },
  listRow: { flexDirection: "row", gap: 8 },
  bullet: { minWidth: 18, fontWeight: "600" },
});
