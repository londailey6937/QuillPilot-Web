// Script to convert SVG favicon to PNG format
// This creates a standalone HTML file that can be opened in a browser
// to manually take a screenshot and save as PNG

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgContent = readFileSync(
  join(__dirname, "../public/favicon.svg"),
  "utf8"
);

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Favicon PNG Generator</title>
  <style>
    body {
      margin: 0;
      padding: 40px;
      background: #f0f0f0;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .instructions {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .instructions ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    .instructions li {
      margin: 8px 0;
    }
    .favicon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .favicon-item {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .favicon-item h3 {
      margin-top: 0;
      color: #2c3e50;
      font-size: 14px;
      font-weight: 600;
    }
    .favicon-preview {
      background: #f7e6d0;
      padding: 20px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 10px 0;
    }
    .code {
      background: #f5f5f5;
      padding: 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      color: #666;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Tome IQ Favicon PNG Generator</h1>

    <div class="instructions">
      <h2 style="margin-top:0; color: #ef8432;">Instructions:</h2>
      <ol>
        <li>Use browser DevTools to take screenshots of each favicon size below</li>
        <li>Or use an online SVG to PNG converter like <a href="https://cloudconvert.com/svg-to-png" target="_blank">CloudConvert</a></li>
        <li>Save the PNG files to the <code>/public</code> folder with the names shown below</li>
        <li>Update the HTML to reference the PNG files instead of SVG</li>
      </ol>
      <p><strong>Quick Method:</strong> You can also use this command in your terminal:</p>
      <div class="code">npm install -g sharp-cli && sharp -i public/favicon.svg -o public/favicon-32x32.png resize 32 32</div>
    </div>

    <div class="favicon-grid">
      <div class="favicon-item">
        <h3>16x16 (Standard)</h3>
        <div class="favicon-preview">
          <div style="width: 16px; height: 16px;">${svgContent
            .replace(/width="100"/, 'width="16"')
            .replace(/height="100"/, 'height="16"')}</div>
        </div>
        <div class="code">public/favicon-16x16.png</div>
      </div>

      <div class="favicon-item">
        <h3>32x32 (Standard)</h3>
        <div class="favicon-preview">
          <div style="width: 32px; height: 32px;">${svgContent
            .replace(/width="100"/, 'width="32"')
            .replace(/height="100"/, 'height="32"')}</div>
        </div>
        <div class="code">public/favicon-32x32.png</div>
      </div>

      <div class="favicon-item">
        <h3>48x48 (Windows)</h3>
        <div class="favicon-preview">
          <div style="width: 48px; height: 48px;">${svgContent
            .replace(/width="100"/, 'width="48"')
            .replace(/height="100"/, 'height="48"')}</div>
        </div>
        <div class="code">public/favicon-48x48.png</div>
      </div>

      <div class="favicon-item">
        <h3>64x64 (High DPI)</h3>
        <div class="favicon-preview">
          <div style="width: 64px; height: 64px;">${svgContent
            .replace(/width="100"/, 'width="64"')
            .replace(/height="100"/, 'height="64"')}</div>
        </div>
        <div class="code">public/favicon-64x64.png</div>
      </div>

      <div class="favicon-item">
        <h3>180x180 (Apple Touch)</h3>
        <div class="favicon-preview">
          <div style="width: 180px; height: 180px;">${svgContent
            .replace(/width="100"/, 'width="180"')
            .replace(/height="100"/, 'height="180"')}</div>
        </div>
        <div class="code">public/apple-touch-icon.png</div>
      </div>

      <div class="favicon-item">
        <h3>192x192 (Android)</h3>
        <div class="favicon-preview">
          <div style="width: 192px; height: 192px;">${svgContent
            .replace(/width="100"/, 'width="192"')
            .replace(/height="100"/, 'height="192"')}</div>
        </div>
        <div class="code">public/android-chrome-192x192.png</div>
      </div>

      <div class="favicon-item">
        <h3>512x512 (Android High)</h3>
        <div class="favicon-preview">
          <div style="width: 200px; height: 200px;">${svgContent
            .replace(/width="100"/, 'width="512"')
            .replace(/height="100"/, 'height="512"')}</div>
        </div>
        <div class="code">public/android-chrome-512x512.png</div>
      </div>

      <div class="favicon-item">
        <h3>Original SVG</h3>
        <div class="favicon-preview">
          <div style="width: 100px; height: 100px;">${svgContent}</div>
        </div>
        <div class="code">public/favicon.svg</div>
      </div>
    </div>

    <div class="instructions" style="margin-top: 40px;">
      <h2 style="margin-top:0; color: #ef8432;">Alternative: Use this SVG directly</h2>
      <p>Modern browsers support SVG favicons directly. The current implementation already uses SVG, which is:
      <ul>
        <li>✅ Scalable to any size</li>
        <li>✅ Sharp on all displays</li>
        <li>✅ Small file size</li>
        <li>✅ Supported in Chrome, Firefox, Safari, Edge</li>
      </ul>
      <p><strong>Note:</strong> If you need PNG for broader compatibility (older browsers, Windows taskbar), use an online converter or the sharp-cli command above.</p>
    </div>
  </div>
</body>
</html>`;

writeFileSync(join(__dirname, "../public/favicon-generator.html"), htmlContent);

console.log("✓ Favicon generator created at: public/favicon-generator.html");
console.log("✓ Open this file in your browser to view and save PNG versions");
console.log(
  "✓ The SVG favicon has been updated to match the AnimatedLogo design"
);
