import { Project } from "../types";

export interface OpenGraphMetaResult {
  title: string;
  description: string;
  image: string;
  url: string;
  priceAmount: string;
  priceCurrency: string;
  siteName: string;
  type: string;
  twitterCard: string;
  htmlSnippet: string;
}

/**
 * Creates a formatted 1200x630 Open Graph summary card image using an off-screen/hidden Canvas.
 */
export async function generateProjectOGImage(
  project: Project,
  options?: {
    theme?: "midnight" | "emerald" | "slate" | "amber";
    computedDistance?: string | number;
  }
): Promise<string> {
  const width = 1200;
  const height = 630;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to create 2D canvas context");
  }

  const theme = options?.theme || "midnight";
  const distance = options?.computedDistance ? `${options.computedDistance} mi away` : "Local Area";

  // Color Palettes
  let bgGradStart = "#090d16";
  let bgGradEnd = "#1e293b";
  let accentColor = "#f59e0b"; // amber
  let accentTextColor = "#ffffff";
  let priceBg = "#059669"; // emerald
  let priceText = "#ffffff";

  if (theme === "emerald") {
    bgGradStart = "#022c22";
    bgGradEnd = "#0f766e";
    accentColor = "#34d399";
    priceBg = "#10b981";
  } else if (theme === "slate") {
    bgGradStart = "#0f172a";
    bgGradEnd = "#334155";
    accentColor = "#38bdf8";
    priceBg = "#0284c7";
  } else if (theme === "amber") {
    bgGradStart = "#1c1917";
    bgGradEnd = "#451a03";
    accentColor = "#fbbf24";
    priceBg = "#d97706";
  }

  // 1. Draw Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, bgGradStart);
  bgGrad.addColorStop(1, bgGradEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Grid Lines overlay
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 3. Ambient Glow Circles
  const radialGlow = ctx.createRadialGradient(width * 0.85, height * 0.2, 20, width * 0.85, height * 0.2, 350);
  radialGlow.addColorStop(0, `${accentColor}33`);
  radialGlow.addColorStop(1, "transparent");
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 4. Outer Clean Border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // 5. Header: Platform Brand & Verified Badges
  // Brand Box
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  roundRect(ctx, 48, 48, 54, 54, 14);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.font = "900 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("HS", 75, 75);

  // Brand Name
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("HOT SPOT WORKSHOP", 116, 50);

  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.font = "600 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Verified Trade Job Exchange • $0 Contractor Lead Fees", 116, 82);

  // Header Badges on Right
  const badgeRight = width - 48;
  
  // Escrow Protected Badge
  ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
  ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
  ctx.lineWidth = 2;
  const badgeWidth = 240;
  ctx.beginPath();
  roundRect(ctx, badgeRight - badgeWidth, 48, badgeWidth, 54, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#34d399";
  ctx.font = "800 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🛡️ ESCROW PROTECTED", badgeRight - (badgeWidth / 2), 75);

  // 6. Left Column vs Right Photo/Card Box
  const hasPhoto = project.images && project.images.length > 0;
  const leftColWidth = hasPhoto ? 680 : 1080;

  // Urgency tag if emergency
  let curY = 145;
  if (project.isEmergency) {
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    roundRect(ctx, 48, curY, 180, 36, 8);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚡ EMERGENCY JOB", 138, curY + 18);
    curY += 52;
  }

  // 7. Project Title (Large, Bold, High Contrast)
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 46px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  
  const titleLines = wrapText(ctx, project.title, leftColWidth);
  const maxTitleLines = 2;
  const displayedTitleLines = titleLines.slice(0, maxTitleLines);
  
  for (let i = 0; i < displayedTitleLines.length; i++) {
    let line = displayedTitleLines[i];
    if (i === maxTitleLines - 1 && titleLines.length > maxTitleLines) {
      line += "...";
    }
    ctx.fillText(line, 48, curY + i * 54);
  }
  curY += displayedTitleLines.length * 54 + 18;

  // 8. Description Snippet
  ctx.fillStyle = "rgba(226, 232, 240, 0.85)";
  ctx.font = "500 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const descText = project.description || "Escrow guaranteed contractor matching with verified project budget.";
  const descLines = wrapText(ctx, descText, leftColWidth);
  const maxDescLines = 2;
  for (let i = 0; i < Math.min(descLines.length, maxDescLines); i++) {
    let line = descLines[i];
    if (i === maxDescLines - 1 && descLines.length > maxDescLines) line += "...";
    ctx.fillText(line, 48, curY + i * 32);
  }

  // 9. Key Specs Pill Bar (Budget, Location, Timeline, Distance)
  const statsY = height - 150;
  
  // Price Tag Card
  ctx.fillStyle = priceBg;
  ctx.beginPath();
  roundRect(ctx, 48, statsY, 310, 80, 16);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("TARGET VERIFIED BUDGET", 68, statsY + 14);

  ctx.fillStyle = priceText;
  ctx.font = "900 36px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(`$${project.budget.toLocaleString()}`, 68, statsY + 34);

  // Location Card
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  roundRect(ctx, 376, statsY, 340, 80, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.font = "700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("JOB LOCATION", 396, statsY + 14);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(`📍 ${project.city}, ${project.state}`, 396, statsY + 38);

  // 10. Right Column Photo or Branded Visualizer
  const photoX = width - 420;
  const photoY = 145;
  const photoW = 372;
  const photoH = 340;

  if (hasPhoto) {
    try {
      const img = await loadImageSafe(project.images[0]);
      ctx.save();
      ctx.beginPath();
      roundRect(ctx, photoX, photoY, photoW, photoH, 20);
      ctx.clip();
      
      // Draw image covering box
      drawImageProp(ctx, img, photoX, photoY, photoW, photoH);
      
      // Gradient overlay on bottom of photo
      const imgGrad = ctx.createLinearGradient(photoX, photoY + photoH * 0.5, photoX, photoY + photoH);
      imgGrad.addColorStop(0, "transparent");
      imgGrad.addColorStop(1, "rgba(0, 0, 0, 0.85)");
      ctx.fillStyle = imgGrad;
      ctx.fillRect(photoX, photoY, photoW, photoH);

      ctx.restore();

      // Photo border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      roundRect(ctx, photoX, photoY, photoW, photoH, 20);
      ctx.stroke();

      // Photo caption pill
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.beginPath();
      roundRect(ctx, photoX + 16, photoY + photoH - 46, photoW - 32, 32, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`📸 Verified Project Photo (${distance})`, photoX + photoW / 2, photoY + photoH - 30);
    } catch {
      drawFallbackRightBox(ctx, photoX, photoY, photoW, photoH, project, distance, accentColor);
    }
  } else {
    drawFallbackRightBox(ctx, photoX, photoY, photoW, photoH, project, distance, accentColor);
  }

  // 11. Footer Direct URL Bar
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "600 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(`Direct Project Link: hotspotworkshop.com/project/${project.id}`, width - 48, height - 34);

  return canvas.toDataURL("image/png");
}

/**
 * Dynamically updates or creates Open Graph, Twitter Card, and Product price meta tags in document.head
 */
export function applyOpenGraphMetaTags(
  project: Project,
  imageDataUrl?: string
): OpenGraphMetaResult {
  const title = `${project.title} | $${project.budget.toLocaleString()} Target Budget in ${project.city}, ${project.state} - Hot Spot Workshop`;
  const description = `${project.description ? project.description.slice(0, 180) : "Verified local contractor project with escrow guarantee."} Budget: $${project.budget.toLocaleString()}. Location: ${project.city}, ${project.state}. $0 contractor lead fees.`;
  const url = `https://hotspotworkshop.com/project/${project.id}`;
  const priceAmount = project.budget.toString();
  const priceCurrency = "USD";
  const siteName = "Hot Spot Workshop";
  const type = "website";
  const twitterCard = "summary_large_image";
  const image = imageDataUrl || (project.images && project.images[0]) || "https://hotspotworkshop.com/og-default.png";

  if (typeof document !== "undefined") {
    // 1. Update Document Title
    document.title = title;

    // 2. Helper to set/update meta tag
    const setMeta = (attrName: "property" | "name", attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // OpenGraph Standard Meta Tags
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:image:type", "image/png");
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", siteName);

    // OpenGraph / E-Commerce Price Meta Tags
    setMeta("property", "og:price:amount", priceAmount);
    setMeta("property", "og:price:currency", priceCurrency);
    setMeta("property", "product:price:amount", priceAmount);
    setMeta("property", "product:price:currency", priceCurrency);

    // Twitter Card Meta Tags
    setMeta("name", "twitter:card", twitterCard);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);
    setMeta("name", "twitter:url", url);

    // Canonical link tag
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", url);
  }

  const htmlSnippet = `<!-- Open Graph / Facebook -->
<meta property="og:type" content="${type}" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${image.startsWith("data:") ? "[Generated Canvas 1200x630 PNG Image Data]" : image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="${siteName}" />
<meta property="og:price:amount" content="${priceAmount}" />
<meta property="og:price:currency" content="${priceCurrency}" />
<meta property="product:price:amount" content="${priceAmount}" />
<meta property="product:price:currency" content="${priceCurrency}" />

<!-- Twitter -->
<meta name="twitter:card" content="${twitterCard}" />
<meta name="twitter:url" content="${url}" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${image.startsWith("data:") ? "[Generated Canvas 1200x630 PNG Image Data]" : image}" />`;

  return {
    title,
    description,
    image,
    url,
    priceAmount,
    priceCurrency,
    siteName,
    type,
    twitterCard,
    htmlSnippet,
  };
}

/**
 * Canvas Helper: Draw fallback decorative card if project image is not available or fails cross-origin load
 */
function drawFallbackRightBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  project: Project,
  distance: string,
  accentColor: string
) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, 20);
  ctx.fill();
  ctx.stroke();

  // Shield Icon
  ctx.fillStyle = accentColor;
  ctx.font = "56px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🔨", x + w / 2, y + 80);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Hot Spot Workshop", x + w / 2, y + 140);

  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Verified Trade Job Dispatch", x + w / 2, y + 172);
  ctx.fillText(`📍 ${project.city}, ${project.state}`, x + w / 2, y + 204);

  // Escrow Box inside
  ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
  ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  roundRect(ctx, x + 24, y + 240, w - 48, 70, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#34d399";
  ctx.font = "800 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("✓ 100% Free Contractor Bidding", x + w / 2, y + 265);

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "600 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Direct Client Communication", x + w / 2, y + 290);
}

/**
 * Canvas Helper: Draws an image inside a box preserving aspect ratio and covering bounds
 */
function drawImageProp(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const r = Math.min(w / iw, h / ih);
  let nw = iw * r;
  let nh = ih * r;
  let cx = 1;
  let cy = 1;
  let cw = 1;
  let ch = 1;
  let ar = 1;

  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
  nw *= ar;
  nh *= ar;

  cw = iw / (nw / w);
  ch = ih / (nh / h);
  cx = (iw - cw) * 0.5;
  cy = (ih - ch) * 0.5;

  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;

  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

/**
 * Canvas Helper: Draws a rounded rectangle path
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

/**
 * Canvas Helper: Wraps text to fit maximum width
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Loads an image safely with CORS handling
 */
function loadImageSafe(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = src;
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
