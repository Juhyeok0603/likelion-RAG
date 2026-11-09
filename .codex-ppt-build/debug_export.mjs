import { Presentation, PresentationFile } from "file:///C:/Users/juhye/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });
p.theme.defaultFont = "Arial";
p.theme.colorScheme = {
  name: "Warm",
  themeColors: { accent1: "#F58A3C", accent2: "#FFB36B", accent3: "#FFF1B8", accent4: "#F2C95C", accent5: "#F7C7A0", accent6: "#FCE8B7", bg1: "#FFFFFF", bg2: "#FFF9E8", tx1: "#2F2925", tx2: "#75685F", dk1: "#000000", dk2: "#2F2925", lt1: "#FFFFFF", lt2: "#FFE6CF", hlink: "#F58A3C", folHlink: "#B96D38" },
};
const master = p.masters.add("Warm Master");
master.setColorMap({ bg1: "bg1", tx1: "tx1", accent1: "accent1" });
master.background.ref = "bg1";
p.slides.add();
await (await PresentationFile.exportPptx(p)).save("C:/Users/juhye/Desktop/대학자료/멋사14기/실습/RAG/.codex-ppt-build/debug.pptx");
