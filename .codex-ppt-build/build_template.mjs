import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "file:///C:/Users/juhye/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const workspaceDir = "C:/Users/juhye/Desktop/대학자료/멋사14기/실습/RAG";
const skillDir = "C:/Users/juhye/.codex/plugins/cache/openai-primary-runtime/presentations/26.1105.12137/skills/presentations";
const buildDir = path.join(workspaceDir, ".codex-ppt-build");
const outputDir = path.join(workspaceDir, "output");
const finalPath = path.join(outputDir, "white_yellow_orange_template.pptx");
const fontFamily = "Arial";

const P = {
  white: "#FFFFFF",
  yellow: "#FFF1B8",
  yellowSoft: "#FFF9E8",
  orange: "#FFB36B",
  orangeSoft: "#FFE6CF",
  orangeStrong: "#F58A3C",
  ink: "#2F2925",
  muted: "#75685F",
  line: "#EEDFD2",
};

function setText(shape, text, options = {}) {
  shape.text = text;
  shape.text.style = {
    typeface: fontFamily,
    fontSize: options.fontSize ?? 24,
    bold: options.bold ?? false,
    color: options.color ?? P.ink,
    alignment: options.alignment ?? "left",
    verticalAlignment: options.verticalAlignment ?? "top",
    autoFit: "shrinkText",
    insets: options.insets ?? 0,
  };
}

function addText(slide, name, text, position, options = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name,
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  setText(shape, text, options);
  return shape;
}

function addPlaceholder(layout, name, type, index, text, position, options = {}) {
  const shape = layout.placeholders.add({
    type,
    index,
    text,
    geometry: "textbox",
    position,
    fill: options.fill ?? "none",
    line: options.line ?? { style: "solid", fill: "none", width: 0 },
  });
  shape.name = name;
  setText(shape, text, options);
  return shape;
}

function addFurniture(layout, geometry, name, position, fill, options = {}) {
  const shape = layout.shapes.add({
    geometry,
    name,
    position,
    fill,
    line: options.line ?? { style: "solid", fill: "none", width: 0 },
  });
  if (options.borderRadius != null) shape.borderRadius = options.borderRadius;
  return shape;
}

function fillSlide(presentation, layoutName, values) {
  const slide = presentation.slides.add({ layout: layoutName });
  slide.placeholders.addFromLayout();
  for (const [name, value] of Object.entries(values)) {
    slide.placeholders.getItem(name).text = value;
  }
  return slide;
}

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function main() {
  await fs.mkdir(buildDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });

  const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  presentation.theme.defaultFont = fontFamily;
  presentation.theme.colorScheme = {
    name: "Soft Yellow Orange",
    themeColors: {
      accent1: P.orangeStrong,
      accent2: P.orange,
      accent3: P.yellow,
      accent4: "#F2C95C",
      accent5: "#F7C7A0",
      accent6: "#FCE8B7",
      bg1: P.white,
      bg2: P.yellowSoft,
      tx1: P.ink,
      tx2: P.muted,
      dk1: "#000000",
      dk2: P.ink,
      lt1: P.white,
      lt2: P.orangeSoft,
      hlink: P.orangeStrong,
      folHlink: "#B96D38",
    },
  };

  const cover = presentation.slides.add();
  cover.background.fill = P.white;
  addFurniture(cover, "roundRect", "cover-yellow-field", { left: 755, top: 0, width: 525, height: 720 }, P.yellowSoft, { borderRadius: 0 });
  addFurniture(cover, "ellipse", "cover-orange-circle", { left: 878, top: 104, width: 280, height: 280 }, P.orangeSoft);
  addFurniture(cover, "ellipse", "cover-yellow-circle", { left: 1030, top: 380, width: 170, height: 170 }, P.yellow);
  addText(cover, "cover-title", "PRESENTATION TITLE", { left: 84, top: 170, width: 650, height: 150 }, { fontSize: 54, bold: true, verticalAlignment: "middle" });
  addText(cover, "cover-subtitle", "Subtitle or short description", { left: 86, top: 350, width: 560, height: 70 }, { fontSize: 24, color: P.muted });
  addText(cover, "cover-meta", "NAME  ·  DATE", { left: 86, top: 590, width: 420, height: 30 }, { fontSize: 13, bold: true, color: P.orangeStrong });

  const agenda = presentation.slides.add();
  agenda.background.fill = P.white;
  addFurniture(agenda, "roundRect", "agenda-yellow", { left: 785, top: 94, width: 400, height: 540 }, P.yellowSoft, { borderRadius: 32 });
  addText(agenda, "agenda-title", "AGENDA", { left: 78, top: 70, width: 560, height: 90 }, { fontSize: 42, bold: true });
  addText(agenda, "agenda-body", "01  First topic\n\n02  Second topic\n\n03  Third topic\n\n04  Fourth topic", { left: 80, top: 215, width: 610, height: 360 }, { fontSize: 26, color: P.ink, verticalAlignment: "middle" });
  addText(agenda, "agenda-note", "Add a short note or key message here.", { left: 840, top: 230, width: 290, height: 180 }, { fontSize: 25, bold: true, color: P.orangeStrong, verticalAlignment: "middle" });

  const section = presentation.slides.add();
  section.background.fill = P.yellowSoft;
  addFurniture(section, "rect", "section-bg", { left: 0, top: 0, width: 1280, height: 720 }, P.yellowSoft);
  addFurniture(section, "ellipse", "section-circle", { left: 800, top: 80, width: 360, height: 360 }, P.orangeSoft);
  addText(section, "section-number", "01", { left: 88, top: 130, width: 180, height: 110 }, { fontSize: 72, bold: true, color: P.orangeStrong });
  addText(section, "section-title", "SECTION TITLE", { left: 88, top: 280, width: 750, height: 130 }, { fontSize: 52, bold: true, verticalAlignment: "middle" });
  addText(section, "section-subtitle", "One sentence that introduces this section", { left: 90, top: 448, width: 680, height: 60 }, { fontSize: 22, color: P.muted });

  const titleBody = presentation.slides.add();
  titleBody.background.fill = P.white;
  addFurniture(titleBody, "roundRect", "body-field", { left: 590, top: 150, width: 600, height: 470 }, P.yellowSoft, { borderRadius: 28 });
  addText(titleBody, "body-title", "SLIDE TITLE", { left: 76, top: 72, width: 780, height: 82 }, { fontSize: 40, bold: true });
  addText(titleBody, "body-lead", "A concise statement that frames the slide.", { left: 78, top: 220, width: 430, height: 120 }, { fontSize: 28, bold: true, color: P.orangeStrong, verticalAlignment: "middle" });
  addText(titleBody, "body-content", "Add the main content here. Keep the text short enough to scan during a presentation.\n\nUse this area for supporting details, a small list, or a short explanation.", { left: 640, top: 205, width: 500, height: 330 }, { fontSize: 21, color: P.ink, verticalAlignment: "middle" });

  const comparison = presentation.slides.add();
  comparison.background.fill = P.white;
  addText(comparison, "compare-title", "TWO-COLUMN COMPARISON", { left: 76, top: 64, width: 900, height: 84 }, { fontSize: 40, bold: true });
  addFurniture(comparison, "roundRect", "left-field", { left: 78, top: 190, width: 530, height: 420 }, P.yellowSoft, { borderRadius: 26 });
  addFurniture(comparison, "roundRect", "right-field", { left: 670, top: 190, width: 530, height: 420 }, P.orangeSoft, { borderRadius: 26 });
  addText(comparison, "left-heading", "OPTION A", { left: 120, top: 230, width: 430, height: 55 }, { fontSize: 26, bold: true });
  addText(comparison, "left-content", "Add the first point of view, approach, or comparison item here.", { left: 120, top: 325, width: 430, height: 200 }, { fontSize: 22, color: P.muted });
  addText(comparison, "right-heading", "OPTION B", { left: 712, top: 230, width: 430, height: 55 }, { fontSize: 26, bold: true, color: P.orangeStrong });
  addText(comparison, "right-content", "Add the second point of view, approach, or comparison item here.", { left: 712, top: 325, width: 430, height: 200 }, { fontSize: 22, color: P.muted });

  const imageText = presentation.slides.add();
  imageText.background.fill = P.white;
  addText(imageText, "image-title", "IMAGE AND TEXT", { left: 76, top: 64, width: 900, height: 84 }, { fontSize: 40, bold: true });
  addFurniture(imageText, "roundRect", "image-slot", { left: 78, top: 180, width: 610, height: 430 }, P.yellowSoft, { borderRadius: 30, line: { style: "solid", fill: P.line, width: 1 } });
  addText(imageText, "image-slot-label", "DROP IMAGE HERE", { left: 150, top: 360, width: 466, height: 56 }, { fontSize: 20, bold: true, color: P.orangeStrong, alignment: "center", verticalAlignment: "middle" });
  addText(imageText, "image-heading", "Supporting headline", { left: 750, top: 220, width: 410, height: 90 }, { fontSize: 32, bold: true, verticalAlignment: "middle" });
  addText(imageText, "image-body", "Use this space for a short explanation that connects directly to the image.", { left: 752, top: 350, width: 400, height: 180 }, { fontSize: 22, color: P.muted });

  const quote = presentation.slides.add();
  quote.background.fill = P.white;
  addFurniture(quote, "roundRect", "quote-field", { left: 110, top: 118, width: 1060, height: 485 }, P.orangeSoft, { borderRadius: 38 });
  addFurniture(quote, "ellipse", "quote-dot", { left: 160, top: 165, width: 52, height: 52 }, P.orange);
  addText(quote, "quote-text", "“Add one memorable sentence or the main takeaway here.”", { left: 190, top: 235, width: 900, height: 200 }, { fontSize: 40, bold: true, alignment: "center", verticalAlignment: "middle" });
  addText(quote, "quote-source", "SOURCE OR SPEAKER", { left: 390, top: 485, width: 500, height: 40 }, { fontSize: 14, bold: true, color: P.orangeStrong, alignment: "center" });

  const closing = presentation.slides.add();
  closing.background.fill = P.orangeSoft;
  addFurniture(closing, "rect", "closing-bg", { left: 0, top: 0, width: 1280, height: 720 }, P.orangeSoft);
  addFurniture(closing, "roundRect", "closing-white", { left: 120, top: 90, width: 1040, height: 540 }, P.white, { borderRadius: 40 });
  addText(closing, "closing-title", "THANK YOU", { left: 260, top: 210, width: 760, height: 120 }, { fontSize: 58, bold: true, alignment: "center", verticalAlignment: "middle" });
  addText(closing, "closing-subtitle", "Questions or closing message", { left: 320, top: 365, width: 640, height: 60 }, { fontSize: 24, color: P.muted, alignment: "center" });
  addText(closing, "closing-contact", "email@example.com", { left: 390, top: 500, width: 500, height: 36 }, { fontSize: 16, bold: true, color: P.orangeStrong, alignment: "center" });

  const montage = await presentation.render({ montage: { columns: 2, width: 1600, gap: 20, padding: 20, background: "#EFEFEF" } });
  await writeBlob(path.join(buildDir, "template-montage.png"), montage);
  const previews = await presentation.render();
  for (let i = 0; i < previews.length; i += 1) {
    await writeBlob(path.join(buildDir, `slide-${String(i + 1).padStart(2, "0")}.png`), previews[i]);
    await fs.writeFile(path.join(buildDir, `slide-${String(i + 1).padStart(2, "0")}.layout.json`), await previews[i].layout.text());
  }

  const candidatePath = path.join(buildDir, "candidate.pptx");
  await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

  const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href);
  const result = await finalizePresentation({
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
    receiptPath: path.join(buildDir, "validation.json"),
  });
  console.log(JSON.stringify({ finalPath, result }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
