import * as Tone from "tone";

// Synth State Interface
interface OscillatorState {
  wave: Tone.ToneOscillatorType;
  octave: number;
  detune: number;
}

interface SynthState {
  oscA: OscillatorState;
  oscB: OscillatorState;
  mix: number;
  filter: {
    type: BiquadFilterType;
    cutoff: number;
    q: number;
  };
  lfo: {
    dest: string;
    rate: number;
    depth: number;
  };
  env: {
    attack: number;
    decay: number;
    sustain: number; // percentage (0-100)
    release: number;
  };
  fx: {
    drive: number;
    delayTime: number;
    delayFeedback: number;
    delayMix: number;
    reverbSize: number;
    reverbMix: number;
  };
}

interface SeqStep {
  active: boolean;
  note: string;
}

// Default state
const synthState: SynthState = {
  oscA: { wave: "sawtooth", octave: 0, detune: 0 },
  oscB: { wave: "sine", octave: 1, detune: 10 },
  mix: 50,
  filter: { type: "lowpass", cutoff: 2000, q: 2.0 },
  lfo: { dest: "none", rate: 5.0, depth: 30 },
  env: { attack: 0.1, decay: 0.3, sustain: 70, release: 0.5 },
  fx: { drive: 0, delayTime: 0.3, delayFeedback: 30, delayMix: 20, reverbSize: 2.5, reverbMix: 15 }
};

// Sequencer Grid data (8 steps)
const seqSteps: SeqStep[] = [
  { active: true, note: "C4" },
  { active: false, note: "E3" },
  { active: true, note: "G3" },
  { active: false, note: "C4" },
  { active: true, note: "A3" },
  { active: false, note: "E4" },
  { active: true, note: "B4" },
  { active: true, note: "C5" }
];

// Notes & frequencies maps
const noteFrequencies: Record<string, number> = {
  "C3": 130.81, "C#3": 138.59, "D3": 146.83, "D#3": 155.56, "E3": 164.81,
  "F3": 174.61, "F#3": 185.00, "G3": 196.00, "G#3": 207.65, "A3": 220.00,
  "A#3": 233.08, "B3": 246.94, "C4": 261.63, "C#4": 277.18, "D4": 293.66,
  "D#4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00,
  "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88, "C5": 523.25
};

const keyboardMap: Record<string, string> = {
  "KeyA": "C3", "KeyW": "C#3", "KeyS": "D3", "KeyE": "D#3", "KeyD": "E3",
  "KeyF": "F3", "KeyT": "F#3", "KeyG": "G3", "KeyY": "G#3", "KeyH": "A3",
  "KeyU": "A#3", "KeyJ": "B3", "KeyK": "C4", "KeyO": "C#4", "KeyL": "D4",
  "KeyP": "D#4", "Semicolon": "E4"
};

// Presets database
const presets: Record<string, SynthState> = {
  "default": {
    oscA: { wave: "sawtooth", octave: 0, detune: 0 },
    oscB: { wave: "sine", octave: 1, detune: 10 },
    mix: 50,
    filter: { type: "lowpass", cutoff: 2000, q: 2.0 },
    lfo: { dest: "none", rate: 5.0, depth: 30 },
    env: { attack: 0.1, decay: 0.3, sustain: 70, release: 0.5 },
    fx: { drive: 0, delayTime: 0.3, delayFeedback: 30, delayMix: 20, reverbSize: 2.5, reverbMix: 15 }
  },
  "synth-piano": {
    oscA: { wave: "triangle", octave: 0, detune: 0 },
    oscB: { wave: "sine", octave: 1, detune: 8 },
    mix: 65,
    filter: { type: "lowpass", cutoff: 1500, q: 1.0 },
    lfo: { dest: "none", rate: 1.0, depth: 0 },
    env: { attack: 0.01, decay: 0.8, sustain: 5, release: 1.2 },
    fx: { drive: 0, delayTime: 0.35, delayFeedback: 20, delayMix: 15, reverbSize: 3.5, reverbMix: 25 }
  },
  "synth-guitar": {
    oscA: { wave: "triangle", octave: 0, detune: 0 },
    oscB: { wave: "sawtooth", octave: 1, detune: 12 },
    mix: 70,
    filter: { type: "lowpass", cutoff: 900, q: 2.2 },
    lfo: { dest: "none", rate: 1.0, depth: 0 },
    env: { attack: 0.01, decay: 0.6, sustain: 0, release: 1.5 },
    fx: { drive: 5, delayTime: 0.3, delayFeedback: 15, delayMix: 10, reverbSize: 2.8, reverbMix: 20 }
  },
  "zombie-groan": {
    oscA: { wave: "sawtooth", octave: -2, detune: -10 },
    oscB: { wave: "square", octave: -1, detune: 10 },
    mix: 50,
    filter: { type: "lowpass", cutoff: 500, q: 5.5 },
    lfo: { dest: "cutoff", rate: 8.5, depth: 40 },
    env: { attack: 0.4, decay: 0.5, sustain: 80, release: 0.8 },
    fx: { drive: 35, delayTime: 0.25, delayFeedback: 15, delayMix: 15, reverbSize: 4.2, reverbMix: 35 }
  },
  "cosmic-lead": {
    oscA: { wave: "sawtooth", octave: 0, detune: 0 },
    oscB: { wave: "triangle", octave: 1, detune: 15 },
    mix: 60,
    filter: { type: "lowpass", cutoff: 3500, q: 5.0 },
    lfo: { dest: "pitch", rate: 6.2, depth: 20 },
    env: { attack: 0.15, decay: 0.4, sustain: 60, release: 0.8 },
    fx: { drive: 12, delayTime: 0.4, delayFeedback: 45, delayMix: 35, reverbSize: 3.5, reverbMix: 30 }
  },
  "ambient-pad": {
    oscA: { wave: "sine", octave: -1, detune: -5 },
    oscB: { wave: "triangle", octave: 0, detune: 8 },
    mix: 50,
    filter: { type: "lowpass", cutoff: 900, q: 1.2 },
    lfo: { dest: "cutoff", rate: 1.2, depth: 45 },
    env: { attack: 0.8, decay: 0.8, sustain: 85, release: 1.6 },
    fx: { drive: 0, delayTime: 0.6, delayFeedback: 55, delayMix: 25, reverbSize: 4.8, reverbMix: 50 }
  },
  "retro-pluck": {
    oscA: { wave: "square", octave: 0, detune: 0 },
    oscB: { wave: "sawtooth", octave: 0, detune: 5 },
    mix: 40,
    filter: { type: "lowpass", cutoff: 1400, q: 6.0 },
    lfo: { dest: "none", rate: 5.0, depth: 0 },
    env: { attack: 0.01, decay: 0.22, sustain: 10, release: 0.2 },
    fx: { drive: 8, delayTime: 0.3, delayFeedback: 25, delayMix: 25, reverbSize: 2.0, reverbMix: 15 }
  },
  "sub-drop": {
    oscA: { wave: "sine", octave: -2, detune: 0 },
    oscB: { wave: "triangle", octave: -2, detune: 0 },
    mix: 75,
    filter: { type: "lowpass", cutoff: 180, q: 1.0 },
    lfo: { dest: "none", rate: 1.0, depth: 0 },
    env: { attack: 0.05, decay: 0.7, sustain: 20, release: 0.4 },
    fx: { drive: 20, delayTime: 0.3, delayFeedback: 0, delayMix: 0, reverbSize: 1.2, reverbMix: 5 }
  },
  "cyberpunk": {
    oscA: { wave: "sawtooth", octave: -1, detune: -8 },
    oscB: { wave: "square", octave: -1, detune: 8 },
    mix: 50,
    filter: { type: "lowpass", cutoff: 650, q: 7.0 },
    lfo: { dest: "cutoff", rate: 7.5, depth: 35 },
    env: { attack: 0.04, decay: 0.35, sustain: 45, release: 0.35 },
    fx: { drive: 45, delayTime: 0.25, delayFeedback: 15, delayMix: 12, reverbSize: 1.8, reverbMix: 10 }
  }
};

// Global audio nodes
let isAudioStarted = false;
let synthA: Tone.PolySynth<Tone.Synth>;
let synthB: Tone.PolySynth<Tone.Synth>;
let oscGainA: Tone.Gain;
let oscGainB: Tone.Gain;
let mainFilter: Tone.Filter;
let distortion: Tone.Distortion;
let feedbackDelay: Tone.FeedbackDelay;
let reverb: Tone.Freeverb;
let vibrato: Tone.Vibrato;
let lfo: Tone.LFO;
let lfoFilterGain: Tone.Gain;
let analyser: Tone.Analyser;
let sequence: Tone.Sequence | null = null;

// Initialize Tone.js Audio Graph
async function initAudio() {
  if (isAudioStarted) return;
  
  try {
    await Tone.start();
  } catch (error) {
    console.warn("Audio context failed to start:", error);
    return;
  }
  isAudioStarted = true;

  // Synths (using PolySynth of MonoSynth config for filter tracking or simple Synth)
  synthA = new Tone.PolySynth(Tone.Synth);
  synthB = new Tone.PolySynth(Tone.Synth);

  // Mix gains
  oscGainA = new Tone.Gain(0.5);
  oscGainB = new Tone.Gain(0.5);

  // Filter & FX Chain
  mainFilter = new Tone.Filter(synthState.filter.cutoff, synthState.filter.type);
  mainFilter.Q.value = synthState.filter.q;

  distortion = new Tone.Distortion(synthState.fx.drive / 100);
  feedbackDelay = new Tone.FeedbackDelay(synthState.fx.delayTime, synthState.fx.delayFeedback / 100);
  feedbackDelay.wet.value = synthState.fx.delayMix / 100;

  reverb = new Tone.Freeverb({
    roomSize: synthState.fx.reverbSize / 5.0,
    wet: synthState.fx.reverbMix / 100
  });

  // LFO Modulator
  lfo = new Tone.LFO(synthState.lfo.rate, -1, 1).start();
  lfoFilterGain = new Tone.Gain(0);
  vibrato = new Tone.Vibrato(synthState.lfo.rate, synthState.lfo.depth / 100.0);
  vibrato.wet.value = 0;

  // Analyser for UI Oscilloscope
  analyser = new Tone.Analyser("waveform", 1024);

  // Connections
  synthA.connect(oscGainA);
  synthB.connect(oscGainB);
  
  oscGainA.connect(vibrato);
  oscGainB.connect(vibrato);
  vibrato.connect(mainFilter);

  lfo.connect(lfoFilterGain);
  lfoFilterGain.connect(mainFilter.frequency);

  // Chain effects in series
  mainFilter.chain(distortion, feedbackDelay, reverb, Tone.Destination);
  
  // Route destination output to visualizer analyser
  Tone.Destination.connect(analyser);

  // Load initial settings
  applyParameters();
  setupVisualizer();
  
  console.log("Tone.js synth initialized.");
}

function applyParameters() {
  if (!isAudioStarted) return;

  // 1. Reset modulations by setting gains/wet to 0 instead of disconnecting nodes
  if (lfoFilterGain) lfoFilterGain.gain.value = 0;
  if (vibrato) vibrato.wet.value = 0;

  // 2. Oscillators Waveforms
  synthA.set({
    oscillator: { type: synthState.oscA.wave },
    detune: synthState.oscA.detune
  });
  synthB.set({
    oscillator: { type: synthState.oscB.wave },
    detune: synthState.oscB.detune
  });

  // 3. Mix gains
  const mixB = synthState.mix / 100.0;
  oscGainA.gain.value = 1.0 - mixB;
  oscGainB.gain.value = mixB;

  // 4. Envelope values
  const sustainVal = synthState.env.sustain / 100.0;
  const envConfig = {
    envelope: {
      attack: synthState.env.attack,
      decay: synthState.env.decay,
      sustain: sustainVal,
      release: synthState.env.release
    }
  };
  synthA.set(envConfig);
  synthB.set(envConfig);

  // 5. Filter
  mainFilter.type = synthState.filter.type;
  mainFilter.frequency.value = synthState.filter.cutoff;
  mainFilter.Q.value = synthState.filter.q;

  // 6. Effects
  distortion.distortion = synthState.fx.drive / 100.0;
  
  feedbackDelay.delayTime.value = synthState.fx.delayTime;
  feedbackDelay.feedback.value = synthState.fx.delayFeedback / 100.0;
  feedbackDelay.wet.value = synthState.fx.delayMix / 100.0;

  reverb.roomSize.value = synthState.fx.reverbSize / 5.0;
  reverb.wet.value = synthState.fx.reverbMix / 100.0;

  // 7. LFO modulation target re-applying
  lfo.frequency.value = synthState.lfo.rate;

  if (synthState.lfo.dest === "cutoff") {
    // Sweep cutoff freq: baseCutoff +/- depth percent of 2500Hz
    const sweepDepth = (synthState.lfo.depth / 100.0) * 2500;
    lfo.min = -sweepDepth;
    lfo.max = sweepDepth;
    lfoFilterGain.gain.value = 1;
  } else if (synthState.lfo.dest === "pitch" && vibrato) {
    // Modulate synth tuning using vibrato
    vibrato.frequency.value = synthState.lfo.rate;
    vibrato.depth.value = synthState.lfo.depth / 100.0;
    vibrato.wet.value = 1;
  }
}

// Polyphonic key triggers
async function triggerNoteOn(note: string) {
  const powerBtn = document.getElementById("power-btn");
  if (powerBtn && !powerBtn.classList.contains("active")) {
    return;
  }

  await initAudio();
  if (Tone.context.state === "suspended") {
    await Tone.context.resume();
  }

  const noteA = Tone.Frequency(note).transpose(synthState.oscA.octave * 12).toNote();
  const noteB = Tone.Frequency(note).transpose(synthState.oscB.octave * 12).toNote();

  synthA.triggerAttack(noteA);
  synthB.triggerAttack(noteB);
  
  highlightKeyboardKey(note, true);
}

function triggerNoteOff(note: string) {
  if (!isAudioStarted) return;
  const noteA = Tone.Frequency(note).transpose(synthState.oscA.octave * 12).toNote();
  const noteB = Tone.Frequency(note).transpose(synthState.oscB.octave * 12).toNote();

  synthA.triggerRelease(noteA);
  synthB.triggerRelease(noteB);

  highlightKeyboardKey(note, false);
}

// Sequencer start/stop
async function toggleSequencer() {
  const powerBtn = document.getElementById("power-btn");
  if (powerBtn && !powerBtn.classList.contains("active")) {
    return;
  }

  await initAudio();
  
  const playBtn = document.getElementById("seq-play")!;
  const stopBtn = document.getElementById("seq-stop")!;

  if (playBtn.classList.contains("active")) {
    // Stop
    Tone.Transport.stop();
    Tone.Transport.position = 0; // Reset to beginning of timeline

    playBtn.classList.remove("active");
    stopBtn.classList.add("active");
    
    // Clear playing indicator dots
    document.querySelectorAll(".step-dot").forEach(d => d.classList.remove("triggered"));
    document.querySelectorAll(".step-btn").forEach(b => b.classList.remove("playing"));
  } else {
    // Play
    playBtn.classList.add("active");
    stopBtn.classList.remove("active");

    Tone.Transport.bpm.value = parseInt((document.getElementById("seq-bpm") as HTMLInputElement).value);

    if (!sequence) {
      sequence = new Tone.Sequence(
        (time, stepIdx) => {
          const step = seqSteps[stepIdx];
          if (step.active) {
            const note = step.note;
            const noteA = Tone.Frequency(note).transpose(synthState.oscA.octave * 12).toNote();
            const noteB = Tone.Frequency(note).transpose(synthState.oscB.octave * 12).toNote();

            // Gate length of 85% of step
            const stepDur = Tone.Time("8n").toSeconds();
            const gate = stepDur * 0.85;

            synthA.triggerAttackRelease(noteA, gate, time);
            synthB.triggerAttackRelease(noteB, gate, time);
          }

          // Visual scheduler syncs frame renders close to precise audio time
          Tone.Draw.schedule(() => {
            triggerVisualStep(stepIdx);
          }, time);
        },
        [0, 1, 2, 3, 4, 5, 6, 7],
        "8n"
      );
      
      // Start the sequence once relative to Transport timeline
      sequence.start(0);
    }
    
    Tone.Transport.start();
  }
}

// Highlight running sequencer column and dot
function triggerVisualStep(stepIdx: number) {
  // Glow dots
  document.querySelectorAll(".step-dot").forEach((dot, idx) => {
    dot.classList.toggle("triggered", idx === stepIdx);
  });

  // Glow grid steps
  document.querySelectorAll(".step-btn").forEach(btn => {
    const btnStep = parseInt(btn.getAttribute("data-step") || "-1");
    btn.classList.toggle("playing", btnStep === stepIdx);
  });

  // Playback keyboard visual flash
  const step = seqSteps[stepIdx];
  if (step.active) {
    highlightKeyboardKey(step.note, true);
    setTimeout(() => highlightKeyboardKey(step.note, false), 150);
  }
}

// Highlight keyboard key UI
function highlightKeyboardKey(note: string, active: boolean) {
  const keyElement = document.querySelector(`.key[data-note="${note}"]`);
  if (keyElement) {
    keyElement.classList.toggle("active", active);
  }
}

// Draw Oscilloscope Canvas
function setupVisualizer() {
  const canvas = document.getElementById("oscilloscope") as HTMLCanvasElement;
  const canvasCtx = canvas.getContext("2d")!;

  function resizeCanvas() {
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function draw() {
    requestAnimationFrame(draw);
    if (!isAudioStarted || !analyser) return;

    const values = analyser.getValue() as Float32Array;
    const bufferLength = values.length;

    canvasCtx.fillStyle = "rgba(10, 12, 17, 0.4)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 3 * window.devicePixelRatio;
    
    // Wave neon gradient
    const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "#06b6d4");
    gradient.addColorStop(0.5, "#d946ef");
    gradient.addColorStop(1, "#a855f7");
    
    canvasCtx.strokeStyle = gradient;
    canvasCtx.shadowBlur = 10;
    canvasCtx.shadowColor = "rgba(6, 182, 212, 0.6)";

    canvasCtx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      // Scale float value (-1 to 1) to canvas height
      const v = values[i];
      const y = (v * canvas.height / 2.0) + (canvas.height / 2.0);

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2.0);
    canvasCtx.stroke();
    canvasCtx.shadowBlur = 0; // reset
  }

  draw();
}

// ADSR envelope visualizer calculations
function updateEnvelopeVisualizer() {
  const attack = parseFloat((document.getElementById("env-attack") as HTMLInputElement).value);
  const decay = parseFloat((document.getElementById("env-decay") as HTMLInputElement).value);
  const sustain = parseFloat((document.getElementById("env-sustain") as HTMLInputElement).value);
  const release = parseFloat((document.getElementById("env-release") as HTMLInputElement).value);

  const container = document.querySelector(".env-visualizer-container");
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;
  
  const svg = document.getElementById("env-svg");
  if (svg) {
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  const startX = 10;
  const endX = width - 10;
  const baselineY = height - 10;
  const peakY = 10;
  
  const availableWidth = endX - startX;

  // Distribute percentages of the actual available width:
  // Attack: 10% base + up to 15% (Range: 10% to 25%)
  // Decay: 10% base + up to 15% (Range: 10% to 25%)
  // Sustain: 25% (fixed)
  // Release: 10% base + up to 15% (Range: 10% to 25%)
  const attackWidth = (0.10 + (attack / 2.0) * 0.15) * availableWidth;
  const decayWidth = (0.10 + (decay / 2.0) * 0.15) * availableWidth;
  const sustainWidth = 0.25 * availableWidth;
  const releaseWidth = (0.10 + (release / 3.0) * 0.15) * availableWidth;

  const aX = startX + attackWidth;
  const dX = aX + decayWidth;
  const sX = dX + sustainWidth;
  const rX = sX + releaseWidth;

  const sY = baselineY - (sustain / 100.0) * (baselineY - peakY);

  const pathD = `M 0 ${baselineY} L ${startX} ${baselineY} L ${aX} ${peakY} L ${dX} ${sY} L ${sX} ${sY} L ${rX} ${baselineY} L ${width} ${baselineY}`;

  document.getElementById("env-path")!.setAttribute("d", pathD);
  
  document.getElementById("dot-attack")!.setAttribute("cx", aX.toString());
  document.getElementById("dot-attack")!.setAttribute("cy", peakY.toString());
  
  document.getElementById("dot-decay")!.setAttribute("cx", dX.toString());
  document.getElementById("dot-decay")!.setAttribute("cy", sY.toString());
  
  document.getElementById("dot-sustain")!.setAttribute("cx", sX.toString());
  document.getElementById("dot-sustain")!.setAttribute("cy", sY.toString());
}

// Load presets into inputs and state
function loadPreset(name: string) {
  const preset = presets[name];
  if (!preset) return;

  // Release all active voices to prevent stuck notes when swapping presets
  if (isAudioStarted) {
    synthA.releaseAll();
    synthB.releaseAll();
  }

  Object.assign(synthState, JSON.parse(JSON.stringify(preset)));

  // Load into UI controls
  // 1. Oscillators
  (document.getElementById("osc-a-octave") as HTMLInputElement).value = synthState.oscA.octave.toString();
  document.getElementById("osc-a-octave-val")!.innerText = (synthState.oscA.octave >= 0 ? "+" : "") + synthState.oscA.octave;
  (document.getElementById("osc-a-detune") as HTMLInputElement).value = synthState.oscA.detune.toString();
  document.getElementById("osc-a-detune-val")!.innerText = synthState.oscA.detune + "c";

  (document.getElementById("osc-b-octave") as HTMLInputElement).value = synthState.oscB.octave.toString();
  document.getElementById("osc-b-octave-val")!.innerText = (synthState.oscB.octave >= 0 ? "+" : "") + synthState.oscB.octave;
  (document.getElementById("osc-b-detune") as HTMLInputElement).value = synthState.oscB.detune.toString();
  document.getElementById("osc-b-detune-val")!.innerText = (synthState.oscB.detune >= 0 ? "+" : "") + synthState.oscB.detune + "c";

  (document.getElementById("osc-mix") as HTMLInputElement).value = synthState.mix.toString();

  document.querySelectorAll('.wave-selector[data-osc="a"] .wave-btn').forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-wave") === synthState.oscA.wave);
  });
  document.querySelectorAll('.wave-selector[data-osc="b"] .wave-btn').forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-wave") === synthState.oscB.wave);
  });

  // 2. Filter & LFO
  (document.getElementById("filter-cutoff") as HTMLInputElement).value = synthState.filter.cutoff.toString();
  document.getElementById("filter-cutoff-val")!.innerText = synthState.filter.cutoff + " Hz";
  (document.getElementById("filter-q") as HTMLInputElement).value = synthState.filter.q.toString();
  document.getElementById("filter-q-val")!.innerText = synthState.filter.q.toFixed(1);

  document.querySelectorAll(".filter-type-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-type") === synthState.filter.type);
  });

  (document.getElementById("lfo-rate") as HTMLInputElement).value = synthState.lfo.rate.toString();
  document.getElementById("lfo-rate-val")!.innerText = synthState.lfo.rate.toFixed(1) + " Hz";
  (document.getElementById("lfo-depth") as HTMLInputElement).value = synthState.lfo.depth.toString();
  document.getElementById("lfo-depth-val")!.innerText = synthState.lfo.depth + "%";

  document.querySelectorAll(".lfo-dest-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-dest") === synthState.lfo.dest);
  });

  // 3. Envelopes
  (document.getElementById("env-attack") as HTMLInputElement).value = synthState.env.attack.toString();
  document.getElementById("env-attack-val")!.innerText = synthState.env.attack.toFixed(2) + "s";
  (document.getElementById("env-decay") as HTMLInputElement).value = synthState.env.decay.toString();
  document.getElementById("env-decay-val")!.innerText = synthState.env.decay.toFixed(2) + "s";
  (document.getElementById("env-sustain") as HTMLInputElement).value = synthState.env.sustain.toString();
  document.getElementById("env-sustain-val")!.innerText = synthState.env.sustain + "%";
  (document.getElementById("env-release") as HTMLInputElement).value = synthState.env.release.toString();
  document.getElementById("env-release-val")!.innerText = synthState.env.release.toFixed(2) + "s";

  updateEnvelopeVisualizer();

  // 4. Effects
  (document.getElementById("fx-drive") as HTMLInputElement).value = synthState.fx.drive.toString();
  document.getElementById("fx-drive-val")!.innerText = synthState.fx.drive === 0 ? "Clean" : synthState.fx.drive + "%";

  (document.getElementById("fx-delay-time") as HTMLInputElement).value = synthState.fx.delayTime.toString();
  document.getElementById("fx-delay-time-val")!.innerText = synthState.fx.delayTime.toFixed(2) + "s";
  (document.getElementById("fx-delay-feedback") as HTMLInputElement).value = synthState.fx.delayFeedback.toString();
  document.getElementById("fx-delay-feedback-val")!.innerText = synthState.fx.delayFeedback + "%";
  (document.getElementById("fx-delay-mix") as HTMLInputElement).value = synthState.fx.delayMix.toString();
  document.getElementById("fx-delay-mix-val")!.innerText = synthState.fx.delayMix + "%";

  (document.getElementById("fx-reverb-size") as HTMLInputElement).value = synthState.fx.reverbSize.toString();
  let revLabel = "Mid";
  if (synthState.fx.reverbSize < 1.5) revLabel = "Small";
  else if (synthState.fx.reverbSize > 3.5) revLabel = "Hall";
  document.getElementById("fx-reverb-size-val")!.innerText = revLabel;

  (document.getElementById("fx-reverb-mix") as HTMLInputElement).value = synthState.fx.reverbMix.toString();
  document.getElementById("fx-reverb-mix-val")!.innerText = synthState.fx.reverbMix + "%";

  applyParameters();
}

// Bind UI actions to event handlers
function bindOscillatorEvents() {
  const getEl = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

  document.querySelectorAll(".wave-selector .wave-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const osc = btn.parentElement?.getAttribute("data-osc");
      const wave = btn.getAttribute("data-wave") as Tone.ToneOscillatorType;
      
      btn.parentElement?.querySelectorAll(".wave-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (osc === "a") {
        synthState.oscA.wave = wave;
      } else {
        synthState.oscB.wave = wave;
      }
      applyParameters();
    });
  });

  getEl<HTMLInputElement>("osc-a-octave")?.addEventListener("input", (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    synthState.oscA.octave = val;
    const valEl = getEl("osc-a-octave-val");
    if (valEl) valEl.innerText = (val >= 0 ? "+" : "") + val;
  });
  getEl<HTMLInputElement>("osc-a-detune")?.addEventListener("input", (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    synthState.oscA.detune = val;
    const valEl = getEl("osc-a-detune-val");
    if (valEl) valEl.innerText = val + "c";
    applyParameters();
  });
  getEl<HTMLInputElement>("osc-b-octave")?.addEventListener("input", (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    synthState.oscB.octave = val;
    const valEl = getEl("osc-b-octave-val");
    if (valEl) valEl.innerText = (val >= 0 ? "+" : "") + val;
  });
  getEl<HTMLInputElement>("osc-b-detune")?.addEventListener("input", (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    synthState.oscB.detune = val;
    const valEl = getEl("osc-b-detune-val");
    if (valEl) valEl.innerText = (val >= 0 ? "+" : "") + val + "c";
    applyParameters();
  });
  getEl<HTMLInputElement>("osc-mix")?.addEventListener("input", (e) => {
    synthState.mix = parseInt((e.target as HTMLInputElement).value);
    applyParameters();
  });
}

function bindFilterAndLFOEvents() {
  const getEl = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

  document.querySelectorAll(".filter-type-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-type-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      synthState.filter.type = btn.getAttribute("data-type") as BiquadFilterType;
      applyParameters();
    });
  });
  getEl<HTMLInputElement>("filter-cutoff")?.addEventListener("input", (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    synthState.filter.cutoff = val;
    const valEl = getEl("filter-cutoff-val");
    if (valEl) valEl.innerText = val + " Hz";
    applyParameters();
  });
  getEl<HTMLInputElement>("filter-q")?.addEventListener("input", (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    synthState.filter.q = val;
    const valEl = getEl("filter-q-val");
    if (valEl) valEl.innerText = val.toFixed(1);
    applyParameters();
  });

  document.querySelectorAll(".lfo-dest-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".lfo-dest-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      synthState.lfo.dest = btn.getAttribute("data-dest") || "none";
      applyParameters();
    });
  });
  getEl<HTMLInputElement>("lfo-rate")?.addEventListener("input", (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    synthState.lfo.rate = val;
    const valEl = getEl("lfo-rate-val");
    if (valEl) valEl.innerText = val.toFixed(1) + " Hz";
    applyParameters();
  });
  getEl<HTMLInputElement>("lfo-depth")?.addEventListener("input", (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    synthState.lfo.depth = val;
    const valEl = getEl("lfo-depth-val");
    if (valEl) valEl.innerText = val + "%";
    applyParameters();
  });
}

function bindEnvelopeEvents() {
  const getEl = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

  getEl<HTMLInputElement>("env-attack")?.addEventListener("input", (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    synthState.env.attack = val;
    const valEl = getEl("env-attack-val");
    if (valEl) valEl.innerText = val.toFixed(2) + "s";
    updateEnvelopeVisualizer();
    applyParameters();
  });
  getEl<HTMLInputElement>("env-decay")?.addEventListener("input", (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    synthState.env.decay = val;
    const valEl = getEl("env-decay-val");
    if (valEl) valEl.innerText = val.toFixed(2) + "s";
    updateEnvelopeVisualizer();
    applyParameters();
  });
  getEl<HTMLInputElement>("env-sustain")?.addEventListener("input", (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    synthState.env.sustain = val;
    const valEl = getEl("env-sustain-val");
    if (valEl) valEl.innerText = val + "%";
    updateEnvelopeVisualizer();
    applyParameters();
  });
  getEl<HTMLInputElement>("env-release")?.addEventListener("input", (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    synthState.env.release = val;
    const valEl = getEl("env-release-val");
    if (valEl) valEl.innerText = val.toFixed(2) + "s";
    updateEnvelopeVisualizer();
    applyParameters();
  });
}

function bindEffectsEvents() {
  const getEl = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

  getEl<HTMLInputElement>("fx-drive")?.addEventListener("input", (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    synthState.fx.drive = val;
    const valEl = getEl("fx-drive-val");
    if (valEl) valEl.innerText = val === 0 ? "Clean" : val + "%";
    applyParameters();
  });
  getEl<HTMLInputElement>("fx-delay-time")?.addEventListener("input", (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    synthState.fx.delayTime = val;
    const valEl = getEl("fx-delay-time-val");
    if (valEl) valEl.innerText = val.toFixed(2) + "s";
    applyParameters();
  });
  getEl<HTMLInputElement>("fx-delay-feedback")?.addEventListener("input", (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    synthState.fx.delayFeedback = val;
    const valEl = getEl("fx-delay-feedback-val");
    if (valEl) valEl.innerText = val + "%";
    applyParameters();
  });
  getEl<HTMLInputElement>("fx-delay-mix")?.addEventListener("input", (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    synthState.fx.delayMix = val;
    const valEl = getEl("fx-delay-mix-val");
    if (valEl) valEl.innerText = val + "%";
    applyParameters();
  });
  getEl<HTMLInputElement>("fx-reverb-size")?.addEventListener("input", (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    synthState.fx.reverbSize = val;
    let revLabel = "Mid";
    if (val < 1.5) revLabel = "Small";
    else if (val > 3.5) revLabel = "Hall";
    const valEl = getEl("fx-reverb-size-val");
    if (valEl) valEl.innerText = revLabel;
    applyParameters();
  });
  getEl<HTMLInputElement>("fx-reverb-mix")?.addEventListener("input", (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    synthState.fx.reverbMix = val;
    const valEl = getEl("fx-reverb-mix-val");
    if (valEl) valEl.innerText = val + "%";
    applyParameters();
  });
}

function bindGlobalEvents() {
  const getEl = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

  getEl<HTMLSelectElement>("preset-select")?.addEventListener("change", (e) => {
    loadPreset((e.target as HTMLSelectElement).value);
  });

  getEl<HTMLInputElement>("master-volume")?.addEventListener("input", (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    const valEl = getEl("volume-val");
    if (valEl) valEl.innerText = val + "%";
    if (isAudioStarted) {
      Tone.Destination.volume.value = Tone.gainToDb(val / 100.0);
    }
  });

  const powerBtn = getEl("power-btn");
  powerBtn?.addEventListener("click", async () => {
    await initAudio();
    if (Tone.context.state === "running") {
      const playBtn = document.getElementById("seq-play");
      if (playBtn && playBtn.classList.contains("active")) {
        await toggleSequencer();
      }

      await (Tone.context as any).rawContext.suspend();
      powerBtn.classList.remove("active");
      document.querySelector(".vis-indicator")?.classList.remove("active");
    } else {
      await Tone.context.resume();
      powerBtn.classList.add("active");
      document.querySelector(".vis-indicator")?.classList.add("active");
    }
  });
}

function bindKeyboardEvents() {
  const keyboard = document.getElementById("synth-keyboard");
  if (!keyboard) return;

  keyboard.addEventListener("mousedown", async (e) => {
    const key = (e.target as HTMLElement).closest(".key");
    if (key) {
      const note = key.getAttribute("data-note");
      if (note) {
        await triggerNoteOn(note);
        (key as HTMLElement).dataset.pressed = "true";
      }
    }
  });

  window.addEventListener("mouseup", () => {
    document.querySelectorAll('.key[data-pressed="true"]').forEach(key => {
      const note = key.getAttribute("data-note");
      if (note) triggerNoteOff(note);
      delete (key as HTMLElement).dataset.pressed;
    });
  });

  keyboard.addEventListener("touchstart", async (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const key = document.elementFromPoint(touch.clientX, touch.clientY)?.closest(".key");
    if (key) {
      const note = key.getAttribute("data-note");
      if (note) {
        await triggerNoteOn(note);
        (key as HTMLElement).dataset.touched = "true";
      }
    }
  });

  keyboard.addEventListener("touchend", () => {
    document.querySelectorAll('.key[data-touched="true"]').forEach(key => {
      const note = key.getAttribute("data-note");
      if (note) triggerNoteOff(note);
      delete (key as HTMLElement).dataset.touched;
    });
  });

  const keysPressed: Record<string, boolean> = {};

  window.addEventListener("keydown", async (e) => {
    if (e.repeat) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

    const note = keyboardMap[e.code];
    if (note && !keysPressed[e.code]) {
      keysPressed[e.code] = true;
      await triggerNoteOn(note);
    }
  });

  window.addEventListener("keyup", (e) => {
    const note = keyboardMap[e.code];
    if (note && keysPressed[e.code]) {
      delete keysPressed[e.code];
      triggerNoteOff(note);
    }
  });
}

function bindSequencerEvents() {
  const getEl = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

  const stepButtons = document.querySelectorAll(".step-btn");
  stepButtons.forEach((btn, idx) => {
    if (seqSteps[idx].active) {
      btn.classList.add("active");
    }
    
    btn.addEventListener("click", () => {
      seqSteps[idx].active = !seqSteps[idx].active;
      btn.classList.toggle("active", seqSteps[idx].active);
    });
  });

  const noteSelectors = document.querySelectorAll(".note-select");
  noteSelectors.forEach(select => {
    select.addEventListener("change", (e) => {
      const stepIdx = parseInt((e.target as HTMLSelectElement).getAttribute("data-step") || "0");
      seqSteps[stepIdx].note = (e.target as HTMLSelectElement).value;
    });
  });

  getEl<HTMLInputElement>("seq-bpm")?.addEventListener("input", (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    const valEl = getEl("bpm-val");
    if (valEl) valEl.innerText = val.toString();
    if (isAudioStarted) {
      Tone.Transport.bpm.value = val;
    }
  });

  getEl("seq-play")?.addEventListener("click", () => toggleSequencer());
  
  getEl("seq-stop")?.addEventListener("click", () => {
    const playBtn = getEl("seq-play");
    if (playBtn?.classList.contains("active")) {
      toggleSequencer();
    }
  });

  getEl("seq-clear")?.addEventListener("click", () => {
    seqSteps.forEach((step, idx) => {
      step.active = false;
      stepButtons[idx].classList.remove("active");
    });
  });
}

function bindEvents() {
  bindOscillatorEvents();
  bindFilterAndLFOEvents();
  bindEnvelopeEvents();
  bindEffectsEvents();
  bindGlobalEvents();
  bindKeyboardEvents();
  bindSequencerEvents();
}

// Window load initializer
window.addEventListener("load", () => {
  bindEvents();
  updateEnvelopeVisualizer();
  loadPreset("default");
  window.addEventListener("resize", updateEnvelopeVisualizer);
});
