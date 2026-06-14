# Tinker 🎹

A clean, midcentury-modern web-based audio sandbox and polyphonic synthesizer built with **TypeScript**, **Tone.js**, and **Bun**. 

## Features

- **Polyphonic Architecture**: Dual oscillators (Osc A & Osc B) with mix controls, detune, and octave shifting.
- **Modulation**: LFO routing to either filter cutoff or oscillator pitch (vibrato) to add movement and character.
- **Effects Chain**: Includes Distortion, Feedback Delay, and Reverb for rich, spatial soundscapes.
- **Step Sequencer**: An 8-step sequencer with customizable BPM and per-step pitch assignment.
- **Interactive Oscilloscope**: Real-time canvas-based waveform visualization.
- **Preset System**: Comes with multiple built-in patches like "Cosmic Lead", "Ambient Pad", and "Cyberpunk Bass".

## Tech Stack

- **[Bun](https://bun.sh/)**: The fast all-in-one JavaScript runtime and bundler. We use Bun's built-in development server to transpile TypeScript on the fly.
- **[Tone.js](https://tonejs.github.io/)**: A Web Audio framework for creating interactive music in the browser.
- **TypeScript**: Ensuring type-safe audio graph connections and DOM interactions.
- **Vanilla CSS**: Custom styling featuring a warm, soft Shaker / midcentury modern palette and clean, simple layout elements.

## Getting Started

### Prerequisites
Make sure you have [Bun](https://bun.sh/) and [Devbox](https://www.jetpack.io/devbox) installed.

### Installation
1. Clone the repository and enter the directory.
2. Install dependencies:
   ```bash
   bun install
   ```

### Running Locally
To start the development server, simply run:
```bash
bun run dev
```
Then open `http://localhost:3000` in your web browser.

## Cloudflare Deployment
This project is configured to deploy to Cloudflare using **Wrangler**.

### Local CLI Deployment
You can build and deploy directly from your terminal:
1. Authenticate with Cloudflare (one-time setup):
   ```bash
   bunx wrangler login
   ```
2. Build and deploy:
   ```bash
   bun run deploy
   ```
This automatically compiles your assets into the `dist/` directory and uploads them.

### Continuous Deployment (Git Integration)
If you connect your GitHub repository directly to Cloudflare Pages/Workers for automatic deployments, configure the build settings in the Cloudflare dashboard as follows:
* **Build command**: `bun install && bun run build`
* **Build output directory**: `dist`
* **Environment variables**:
  * `BUN_VERSION` = `latest`
  * `SKIP_DEPENDENCY_INSTALL` = `true` (forces Cloudflare to use Bun to resolve dependencies)

## Project Structure
- `public/index.html`: The main user interface structure.
- `public/style.css`: The styling rules defining the midcentury/Shaker aesthetic.
- `public/app.ts`: The core application logic, handling the Tone.js audio graph, sequencer, and UI bindings.

## License
This project is licensed under the MIT License - see the [LICENSE](file:///home/dday/bun-demo/LICENSE) file for details.

