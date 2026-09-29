// Editor commands have no dependency on the CRM or its persistence layer.
export const blockCommands = [
  {id:"table",label:"Table",hint:"A simple table",glyph:"▦",run:(c)=>c.insertTable({rows:3,cols:3,withHeaderRow:true})},
  {
    id: "paragraph",
    label: "Text",
    hint: "Plain paragraph",
    glyph: "T",
    run: (c) => c.setParagraph(),
  },
  {
    id: "heading1",
    label: "Heading 1",
    hint: "Large section heading",
    glyph: "H1",
    run: (c) => c.toggleHeading({ level: 1 }),
  },
  {
    id: "heading2",
    label: "Heading 2",
    hint: "Medium section heading",
    glyph: "H2",
    run: (c) => c.toggleHeading({ level: 2 }),
  },
  {
    id: "heading3",
    label: "Heading 3",
    hint: "Small section heading",
    glyph: "H3",
    run: (c) => c.toggleHeading({ level: 3 }),
  },
  {
    id: "bulletList",
    label: "Bullet list",
    hint: "A simple list",
    glyph: "•",
    run: (c) => c.toggleBulletList(),
  },
  {
    id: "orderedList",
    label: "Numbered list",
    hint: "A list with an order",
    glyph: "1.",
    run: (c) => c.toggleOrderedList(),
  },
  {
    id: "taskList",
    label: "To-do list",
    hint: "Track a set of tasks",
    glyph: "☑",
    run: (c) => c.toggleTaskList(),
  },
  {
    id: "blockquote",
    label: "Quote",
    hint: "Capture something worth noting",
    glyph: "❝",
    run: (c) => c.toggleBlockquote(),
  },
  {
    id: "codeBlock",
    label: "Code block",
    hint: "A block of plain code",
    glyph: "<>",
    run: (c) => c.toggleCodeBlock(),
  },
  {
    id: "horizontalRule",
    label: "Divider",
    hint: "Separate sections",
    glyph: "—",
    run: (c) => c.setHorizontalRule(),
  },
];
export function currentBlock(editor) {
  for (const level of [1, 2, 3])
    if (editor?.isActive("heading", { level })) return "Heading " + level;
  return (
    blockCommands.find((c) => c.id !== "paragraph" && editor?.isActive(c.id))
      ?.label || "Text"
  );
}
export const marks = [
  { id: "bold", label: "Bold", glyph: "B", run: (c) => c.toggleBold() },
  { id: "italic", label: "Italic", glyph: "I", run: (c) => c.toggleItalic() },
  {
    id: "underline",
    label: "Underline",
    glyph: "U",
    run: (c) => c.toggleUnderline(),
  },
  {
    id: "strike",
    label: "Strikethrough",
    glyph: "S",
    run: (c) => c.toggleStrike(),
  },
  { id: "code", label: "Inline code", glyph: "<>", run: (c) => c.toggleCode() },
  {
    id: "highlight",
    label: "Highlight",
    glyph: "▰",
    run: (c) => c.toggleHighlight(),
  },
];
export function plainDocument(value = "") {
  return {
    type: "doc",
    content: String(value)
      .split("\n")
      .map((text) => ({
        type: "paragraph",
        ...(text ? { content: [{ type: "text", text }] } : {}),
      })),
  };
}

// Operate on complete top-level blocks so lists and their children move together.
export function transformBlock(editor, action) {
  const { state } = editor,
    { $from } = state.selection;
  if ($from.depth < 1) return false;
  const index = $from.index(0),
    blocks = [];
  state.doc.forEach((node) => blocks.push(node));
  if (
    (action === "up" && index === 0) ||
    (action === "down" && index === blocks.length - 1)
  )
    return false;
  if (action === "up")
    [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
  if (action === "down")
    [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
  if (action === "duplicate") blocks.splice(index + 1, 0, blocks[index]);
  if (action === "delete") blocks.splice(index, 1);
  if (!blocks.length) blocks.push(state.schema.nodes.paragraph.create());
  const selectedIndex =
    action === "up"
      ? index - 1
      : action === "down" || action === "duplicate"
        ? index + 1
        : Math.min(index, blocks.length - 1);
  const position =
    blocks
      .slice(0, selectedIndex)
      .reduce((sum, node) => sum + node.nodeSize, 0) + 1;
  return editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.replaceWith(0, tr.doc.content.size, blocks);
      return true;
    })
    .setTextSelection(position)
    .run();
}
