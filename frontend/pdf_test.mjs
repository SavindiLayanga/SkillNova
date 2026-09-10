
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

async function run() {
  const fileData = fs.readFileSync("c:/Users/Dell/OneDrive/Documents/skillNova/backend/public/uploads/cv_AdiXLdDZ8RNid9ARutETHDwFMKv1_1786719991871.pdf");
  const data = new Uint8Array(fileData);
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  
  let pageText = "";
  let lastY = null;
  for (const item of textContent.items) {
    if (lastY !== null && Math.abs(lastY - item.transform[5]) > 2) {
      pageText += "\n";
    }
    pageText += item.str;
    lastY = item.transform[5];
  }
  console.log(pageText.slice(0, 500));
}
run();

