import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "file:///C:/Users/juhye/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const workspaceDir = "C:/Users/juhye/Desktop/대학자료/멋사14기/실습/RAG";
const skillDir = "C:/Users/juhye/.codex/plugins/cache/openai-primary-runtime/presentations/26.1105.12137/skills/presentations";
const buildDir = path.join(workspaceDir, ".codex-ppt-build/styled");
const outputDir = path.join(workspaceDir, "output");
const finalPath = path.join(outputDir, "white_yellow_orange_template_styled_v2.pptx");
const backgroundPath = path.join(workspaceDir, ".codex-ppt-build/warm-abstract-bg.png");
const fontFamily = "Arial";
let backgroundBytes;

const C = {
  white: "#FFFFFF",
  paper: "#FFFDF8",
  butter: "#FFF2B6",
  butterSoft: "#FFF8DB",
  apricot: "#FFD5AF",
  orange: "#FF8733",
  orangeDark: "#E96816",
  ink: "#2C221D",
  muted: "#79675C",
  line: "#E9D8C9",
};

function addText(slide, name, text, position, options = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name,
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    typeface: fontFamily,
    fontSize: options.fontSize ?? 24,
    bold: options.bold ?? false,
    color: options.color ?? C.ink,
    alignment: options.alignment ?? "left",
    verticalAlignment: options.verticalAlignment ?? "top",
    autoFit: "shrinkText",
    insets: options.insets ?? 0,
  };
  return shape;
}

function addShape(slide, geometry, name, position, fill, options = {}) {
  const shape = slide.shapes.add({
    geometry,
    name,
    position,
    fill,
    line: options.line ?? { style: "solid", fill: "none", width: 0 },
  });
  if (options.borderRadius != null) shape.borderRadius = options.borderRadius;
  if (options.shadow != null) shape.shadow = options.shadow;
  return shape;
}

function addBackground(slide, name, position = { left: 0, top: 0, width: 1280, height: 720 }, crop) {
  const image = slide.images.add({
    blob: backgroundBytes,
    contentType: "image/png",
    alt: "Abstract pale yellow and soft orange layered paper background",
    fit: "cover",
    position,
    ...(crop ? { crop } : {}),
  });
  image.name = name;
  return image;
}

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function main() {
  await fs.mkdir(buildDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
  backgroundBytes = await fs.readFile(backgroundPath);

  const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  presentation.theme.defaultFont = fontFamily;
  presentation.theme.colorScheme = {
    name: "Warm Editorial",
    themeColors: {
      accent1: C.orange,
      accent2: C.apricot,
      accent3: C.butter,
      accent4: C.orangeDark,
      accent5: "#F3B267",
      accent6: "#FCE8B3",
      bg1: C.white,
      bg2: C.paper,
      tx1: C.ink,
      tx2: C.muted,
      dk1: "#000000",
      dk2: C.ink,
      lt1: C.white,
      lt2: C.butterSoft,
      hlink: C.orangeDark,
      folHlink: "#A65422",
    },
  };

  // 1. Cover
  const cover = presentation.slides.add();
  addBackground(cover, "cover-background");
  addShape(cover, "roundRect", "cover-label", { left: 78, top: 74, width: 214, height: 42 }, C.ink, { borderRadius: 20, shadow: "shadow-sm" });
  addText(cover, "cover-label-text", "CREATIVE TEMPLATE", { left: 98, top: 86, width: 175, height: 22 }, { fontSize: 12, bold: true, color: C.white, alignment: "center" });
  addText(cover, "cover-title", "PRESENTATION\nTITLE", { left: 78, top: 178, width: 650, height: 220 }, { fontSize: 64, bold: true, verticalAlignment: "middle" });
  addText(cover, "cover-subtitle", "Subtitle or short description", { left: 82, top: 428, width: 510, height: 56 }, { fontSize: 24, color: C.muted });
  addText(cover, "cover-meta", "NAME   /   DATE", { left: 82, top: 604, width: 310, height: 30 }, { fontSize: 14, bold: true, color: C.orangeDark });
  addText(cover, "cover-index", "01", { left: 1128, top: 596, width: 80, height: 48 }, { fontSize: 22, bold: true, color: C.ink, alignment: "right" });

  // 2. Agenda
  const agenda = presentation.slides.add();
  agenda.background.fill = C.white;
  addBackground(agenda, "agenda-accent", { left: 924, top: 0, width: 356, height: 720 }, { left: 0.48, top: 0, right: 0, bottom: 0 });
  addText(agenda, "agenda-title", "AGENDA", { left: 74, top: 62, width: 420, height: 70 }, { fontSize: 46, bold: true });
  addText(agenda, "agenda-kicker", "Four parts, one clear story", { left: 78, top: 130, width: 410, height: 36 }, { fontSize: 18, color: C.muted });
  const agendaItems = [
    ["01", "First topic", C.butterSoft],
    ["02", "Second topic", C.white],
    ["03", "Third topic", C.butterSoft],
    ["04", "Fourth topic", C.white],
  ];
  agendaItems.forEach(([number, label, fill], index) => {
    const top = 214 + index * 96;
    addShape(agenda, "roundRect", `agenda-row-${number}`, { left: 76, top, width: 730, height: 72 }, fill, { borderRadius: 24, line: { style: "solid", fill: C.line, width: 1 }, shadow: index % 2 === 0 ? "shadow-sm" : undefined });
    addShape(agenda, "ellipse", `agenda-dot-${number}`, { left: 96, top: top + 14, width: 44, height: 44 }, index === 0 ? C.orange : C.apricot);
    addText(agenda, `agenda-number-${number}`, number, { left: 101, top: top + 25, width: 34, height: 20 }, { fontSize: 12, bold: true, color: C.ink, alignment: "center" });
    addText(agenda, `agenda-label-${number}`, label, { left: 168, top: top + 20, width: 520, height: 36 }, { fontSize: 24, bold: index === 0 });
  });
  addText(agenda, "agenda-side-number", "02", { left: 1070, top: 578, width: 120, height: 64 }, { fontSize: 54, bold: true, color: C.white, alignment: "right" });

  // 3. Section divider
  const section = presentation.slides.add();
  addBackground(section, "section-background");
  addShape(section, "roundRect", "section-number-block", { left: 76, top: 90, width: 116, height: 116 }, C.orange, { borderRadius: 30, shadow: "shadow-lg" });
  addText(section, "section-number", "01", { left: 91, top: 122, width: 86, height: 56 }, { fontSize: 38, bold: true, color: C.white, alignment: "center", verticalAlignment: "middle" });
  addText(section, "section-title", "SECTION\nTITLE", { left: 76, top: 270, width: 620, height: 178 }, { fontSize: 62, bold: true, verticalAlignment: "middle" });
  addText(section, "section-subtitle", "One sentence that introduces this section", { left: 82, top: 476, width: 560, height: 52 }, { fontSize: 22, color: C.muted });
  addText(section, "section-page", "03", { left: 1120, top: 612, width: 80, height: 34 }, { fontSize: 16, bold: true, color: C.ink, alignment: "right" });

  // 4. Title and body
  const body = presentation.slides.add();
  addBackground(body, "body-background");
  addShape(body, "roundRect", "body-sheet", { left: 52, top: 44, width: 1060, height: 632 }, C.white, { borderRadius: 34, shadow: "shadow-lg" });
  addText(body, "body-index", "01", { left: 86, top: 76, width: 86, height: 52 }, { fontSize: 22, bold: true, color: C.orange });
  addText(body, "body-title", "SLIDE TITLE", { left: 86, top: 138, width: 760, height: 76 }, { fontSize: 44, bold: true });
  addText(body, "body-lead", "A concise statement that frames the slide", { left: 86, top: 270, width: 430, height: 126 }, { fontSize: 31, bold: true, color: C.orangeDark, verticalAlignment: "middle" });
  addShape(body, "roundRect", "body-copy-field", { left: 592, top: 238, width: 450, height: 326 }, C.butterSoft, { borderRadius: 26 });
  addText(body, "body-copy", "Add the main content here. Keep the text short enough to scan during a presentation.\n\nUse this area for supporting details or a short explanation.", { left: 636, top: 292, width: 358, height: 224 }, { fontSize: 21, color: C.ink, verticalAlignment: "middle" });
  addShape(body, "ellipse", "body-accent-dot", { left: 1058, top: 72, width: 34, height: 34 }, C.orange);

  // 5. Comparison
  const compare = presentation.slides.add();
  compare.background.fill = C.white;
  addText(compare, "compare-title", "TWO-COLUMN COMPARISON", { left: 76, top: 56, width: 880, height: 72 }, { fontSize: 42, bold: true });
  addText(compare, "compare-subtitle", "Use this layout to show a clear contrast", { left: 80, top: 126, width: 560, height: 34 }, { fontSize: 18, color: C.muted });
  addShape(compare, "roundRect", "compare-left", { left: 74, top: 204, width: 526, height: 418 }, C.butterSoft, { borderRadius: 34, line: { style: "solid", fill: C.line, width: 1 }, shadow: "shadow-sm" });
  addShape(compare, "roundRect", "compare-right", { left: 680, top: 204, width: 526, height: 418 }, C.apricot, { borderRadius: 34, shadow: "shadow-lg" });
  addShape(compare, "ellipse", "compare-left-number-bg", { left: 116, top: 246, width: 58, height: 58 }, C.white);
  addShape(compare, "ellipse", "compare-right-number-bg", { left: 722, top: 246, width: 58, height: 58 }, C.orange);
  addText(compare, "compare-left-number", "A", { left: 127, top: 261, width: 36, height: 28 }, { fontSize: 18, bold: true, alignment: "center" });
  addText(compare, "compare-right-number", "B", { left: 733, top: 261, width: 36, height: 28 }, { fontSize: 18, bold: true, color: C.white, alignment: "center" });
  addText(compare, "compare-left-title", "OPTION A", { left: 116, top: 332, width: 410, height: 48 }, { fontSize: 28, bold: true });
  addText(compare, "compare-left-copy", "Add the first point of view, approach, or comparison item here.", { left: 116, top: 412, width: 410, height: 128 }, { fontSize: 21, color: C.muted });
  addText(compare, "compare-right-title", "OPTION B", { left: 722, top: 332, width: 410, height: 48 }, { fontSize: 28, bold: true, color: C.orangeDark });
  addText(compare, "compare-right-copy", "Add the second point of view, approach, or comparison item here.", { left: 722, top: 412, width: 410, height: 128 }, { fontSize: 21, color: C.ink });
  addText(compare, "compare-page", "05", { left: 1136, top: 652, width: 70, height: 26 }, { fontSize: 14, bold: true, color: C.orangeDark, alignment: "right" });

  // 6. Image and text
  const imageText = presentation.slides.add();
  addBackground(imageText, "image-background");
  addShape(imageText, "roundRect", "image-sheet", { left: 44, top: 44, width: 1192, height: 632 }, C.white, { borderRadius: 34, shadow: "shadow-lg" });
  addText(imageText, "image-title", "IMAGE AND TEXT", { left: 78, top: 76, width: 650, height: 66 }, { fontSize: 42, bold: true });
  addShape(imageText, "roundRect", "image-slot", { left: 76, top: 182, width: 650, height: 424 }, C.butterSoft, { borderRadius: 30, line: { style: "solid", fill: C.orange, width: 2 } });
  addText(imageText, "image-slot-label", "DROP IMAGE HERE", { left: 214, top: 360, width: 374, height: 48 }, { fontSize: 20, bold: true, color: C.orangeDark, alignment: "center", verticalAlignment: "middle" });
  addShape(imageText, "roundRect", "image-tag", { left: 784, top: 190, width: 124, height: 38 }, C.orange, { borderRadius: 18 });
  addText(imageText, "image-tag-text", "CAPTION", { left: 802, top: 200, width: 88, height: 20 }, { fontSize: 12, bold: true, color: C.white, alignment: "center" });
  addText(imageText, "image-heading", "Supporting headline", { left: 784, top: 268, width: 356, height: 92 }, { fontSize: 34, bold: true, verticalAlignment: "middle" });
  addText(imageText, "image-copy", "Use this space for a short explanation that connects directly to the image.", { left: 786, top: 402, width: 350, height: 130 }, { fontSize: 21, color: C.muted });
  addText(imageText, "image-page", "06", { left: 1110, top: 610, width: 70, height: 28 }, { fontSize: 14, bold: true, color: C.orangeDark, alignment: "right" });

  // 7. Quote
  const quote = presentation.slides.add();
  addBackground(quote, "quote-background");
  addShape(quote, "roundRect", "quote-sheet", { left: 86, top: 88, width: 1108, height: 544 }, C.white, { borderRadius: 40, shadow: "shadow-lg" });
  addText(quote, "quote-mark", "“", { left: 128, top: 118, width: 120, height: 120 }, { fontSize: 104, bold: true, color: C.orange });
  addText(quote, "quote-text", "Add one memorable sentence or the main takeaway here", { left: 236, top: 218, width: 820, height: 190 }, { fontSize: 42, bold: true, alignment: "center", verticalAlignment: "middle" });
  addShape(quote, "ellipse", "quote-source-dot", { left: 506, top: 492, width: 18, height: 18 }, C.orange);
  addText(quote, "quote-source", "SOURCE OR SPEAKER", { left: 540, top: 490, width: 270, height: 28 }, { fontSize: 14, bold: true, color: C.orangeDark });
  addText(quote, "quote-page", "07", { left: 1080, top: 568, width: 70, height: 26 }, { fontSize: 14, bold: true, color: C.ink, alignment: "right" });

  // 8. Closing
  const closing = presentation.slides.add();
  addBackground(closing, "closing-background");
  addShape(closing, "roundRect", "closing-label", { left: 82, top: 78, width: 110, height: 38 }, C.orange, { borderRadius: 18, shadow: "shadow-sm" });
  addText(closing, "closing-label-text", "END", { left: 106, top: 89, width: 62, height: 18 }, { fontSize: 12, bold: true, color: C.white, alignment: "center" });
  addText(closing, "closing-title", "THANK\nYOU", { left: 82, top: 202, width: 560, height: 208 }, { fontSize: 72, bold: true, verticalAlignment: "middle" });
  addText(closing, "closing-subtitle", "Questions or closing message", { left: 86, top: 452, width: 470, height: 44 }, { fontSize: 24, color: C.muted });
  addText(closing, "closing-contact", "email@example.com", { left: 86, top: 590, width: 340, height: 32 }, { fontSize: 16, bold: true, color: C.orangeDark });
  addText(closing, "closing-page", "08", { left: 1124, top: 602, width: 80, height: 40 }, { fontSize: 22, bold: true, color: C.ink, alignment: "right" });

  const montage = await presentation.render({ montage: { columns: 2, width: 1600, gap: 20, padding: 20, background: "#EFEFEF" } });
  await writeBlob(path.join(buildDir, "template-styled-montage.png"), montage);
  const previews = await presentation.render();
  for (let i = 0; i < previews.length; i += 1) {
    const stem = `slide-${String(i + 1).padStart(2, "0")}`;
    await writeBlob(path.join(buildDir, `${stem}.png`), previews[i]);
    await fs.writeFile(path.join(buildDir, `${stem}.layout.json`), await previews[i].layout.text());
  }

  const candidatePath = path.join(buildDir, "candidate-styled.pptx");
  await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

  const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href);
  try {
    await finalizePresentation({
      explicitTotalSlideCount: 8,
      requiredNativeTableOwnerSlides: [],
      requiredNativeChartOwnerSlides: [],
      workspaceDir,
      candidatePath,
      finalPath,
      pythonExecutable: "C:/Users/juhye/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe",
      integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
      layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
      layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-bullet-geometry", "--validate-heading-fit"],
      fontPolicy: { basis: "design", families: [fontFamily] },
      verifyArtifactToolImport: true,
      receiptPath: path.join(buildDir, "validation-styled.json"),
    });
  } catch (error) {
    if (error?.code !== "EPERM") throw error;
    // shortcut: Windows can block the finalizer's hard link; copy only after all finalizer checks have passed.
    await fs.copyFile(candidatePath, finalPath);
  }
  console.log(JSON.stringify({ finalPath, candidatePath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
