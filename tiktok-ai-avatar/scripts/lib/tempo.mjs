/**
 * Tempo and phase measurement for music beds.
 *
 * 🔴 WHY PRECISION SUDDENLY MATTERS. Until now a bed's BPM was a label used to
 * pick a track, so a 1% error was harmless. `beatAlignedActs` changed that: it
 * places every cut at `round(n × 60/bpm × fps)`, so the recorded BPM is now
 * load-bearing arithmetic. A 1% error at 150 BPM has drifted 5.9 frames —
 * ~200ms — by beat 46, which is exactly the defect the alignment was built to
 * remove. **A wrong BPM is now worse than no BPM.**
 *
 * ⭐ WHICH IS WHY THIS DOES NOT USE PLAIN AUTOCORRELATION. The 2026-07-24 sweep
 * that produced the numbers in TRACK_BPM was an autocorrelation peak-pick, good
 * to roughly ±1%, and the project notes already record it mis-locking on
 * `starlight` by +9.2% and returning 151.06 for a track that is 150.00 by
 * construction. Autocorrelation is used HERE only as a coarse seed; the
 * reported number comes from a least-squares fit of onset times against beat
 * indices across the whole track. Fitting ~70 beats over 30 seconds constrains
 * the period far better than any single correlation peak, because an error in
 * the period has to explain a growing mismatch at every later onset.
 *
 * ⭐ IT ALSO RETURNS PHASE, which nothing measured before. `beatAlignedActs`
 * assumes frame 0 of the video is beat 0 of the bed. That is only true if the
 * track's first downbeat sits at file zero — the property earlier restocks
 * chased by hand with head-trims. `phaseMs` says whether it holds, so a bed
 * that opens a beat and a half late is caught at registration rather than
 * after it has shipped under a video.
 *
 * ⭐⭐ THE POSITIVE CONTROL IS A SYNTHETIC CLICK TRACK, NOT A FILE FROM THE POOL.
 * `npm run music:verify` builds clicks at tempos it sets itself, measures them,
 * and exits non-zero before touching real music if any reading is off by more
 * than 0.1%. This caught two things nothing else would have:
 *
 * 1. The first version of this module read 128 BPM to within 0.0008% and 150 to
 *    within 1.8%, and looked equally confident doing both. The cause was that
 *    the autocorrelation can only test whole hop lags, and 150 BPM falls
 *    between two of them — a failure that only exists at some tempos, so any
 *    real-music spot check would have passed or failed by luck.
 * 2. The project notes named `voltslope-v08.mp3` as ground truth, "150.00 by
 *    construction", and used it to calibrate other estimates. Once the tool was
 *    validated on clicks it read that file at 152.2. The note was wrong, and
 *    everything calibrated against it inherited the error.
 *
 * **A file is not ground truth because a previous session asserted it. Only a
 * signal you construct yourself is.**
 */
import { execFileSync } from "node:child_process";

const SR = 22050;
const HOP = 256; // ~11.6ms
/** Tempo search range. Deliberately wide — generated music may miss its brief. */
export const BPM_MIN = 90;
export const BPM_MAX = 200;

/** Decodes any audio file to mono float32 at SR, via ffmpeg. */
export const decodeMono = (path) => {
  const raw = execFileSync(
    "ffmpeg",
    ["-v", "error", "-i", path, "-vn", "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"],
    { maxBuffer: 1 << 28 },
  );
  const n = Math.floor(raw.length / 4);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = raw.readFloatLE(i * 4);
  return out;
};

const WIN = 1024;

/** In-place iterative radix-2 FFT. No dependency is worth adding for this. */
const fft = (re, im) => {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k];
        const ai = im[i + k];
        const br = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const bi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ar + br;
        im[i + k] = ai + bi;
        re[i + k + len / 2] = ar - br;
        im[i + k + len / 2] = ai - bi;
        const ncr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = ncr;
      }
    }
  }
};

/**
 * Spectral-flux onset envelope, over a real STFT.
 *
 * 🪤 THE FIRST VERSION OF THIS USED BROADBAND ENERGY RISE AND WAS NOT GOOD
 * ENOUGH — it returned 152.32 BPM for `voltSlope`, which is 150.00 by
 * construction, with 57ms residuals. Broadband energy is dominated by the bass,
 * so a kick smears across several hops and a hi-hat contributes almost nothing;
 * the onset times were being read off the wrong part of the signal.
 *
 * Summing half-wave-rectified rise PER FREQUENCY BIN fixes it: a snare that
 * adds high-band energy over a sustaining bass note still registers, because
 * the bins that rise are counted independently of the bins that do not.
 * Log compression keeps a loud kick from drowning out everything quieter.
 */
export const onsetEnvelope = (x) => {
  const frames = Math.floor((x.length - WIN) / HOP);
  if (frames < 2) return new Float64Array(0);
  const bins = WIN / 2;
  const hann = new Float64Array(WIN);
  for (let i = 0; i < WIN; i++) hann[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (WIN - 1));

  const flux = new Float64Array(frames);
  let prev = new Float64Array(bins);
  const re = new Float64Array(WIN);
  const im = new Float64Array(WIN);

  for (let f = 0; f < frames; f++) {
    const off = f * HOP;
    for (let i = 0; i < WIN; i++) {
      re[i] = x[off + i] * hann[i];
      im[i] = 0;
    }
    fft(re, im);
    let s = 0;
    const cur = new Float64Array(bins);
    for (let k = 0; k < bins; k++) {
      // Log compression: without it the kick's bin dominates the sum and the
      // envelope reduces to the broadband version this replaced.
      cur[k] = Math.log1p(1000 * Math.hypot(re[k], im[k]));
      if (f > 0) s += Math.max(0, cur[k] - prev[k]);
    }
    flux[f] = s;
    prev = cur;
  }

  // Subtract a local mean, so a threshold means the same thing in a dense
  // section and a sparse one, then normalise to peak.
  const W = 8;
  const out = new Float64Array(frames);
  for (let f = 0; f < frames; f++) {
    let s = 0;
    let n = 0;
    for (let j = Math.max(0, f - W); j <= Math.min(frames - 1, f + W); j++, n++) s += flux[j];
    out[f] = Math.max(0, flux[f] - s / n);
  }
  const peak = Math.max(...out) || 1;
  for (let f = 0; f < frames; f++) out[f] /= peak;
  return out;
};

/**
 * Coarse period estimate, in seconds, by autocorrelation of the onset envelope.
 *
 * When `targetBpm` is given the search is confined to ±`bandPct` around it.
 *
 * ⭐⭐ WHY CONSTRAINING BEATS SEARCHING THE WHOLE RANGE, and why it is honest
 * rather than a thumb on the scale: an unconstrained autocorrelation cannot
 * distinguish a tempo from half or double it — a 150 BPM track correlates
 * strongly at 75 and 300, because every beat is also an every-other-beat. That
 * is a genuine ambiguity in the signal, not a bug, and the un-targeted sweep
 * above shows it: `blackVelvetAria` read 90.72 against a recorded 137.8 and
 * `violinEnergetic` reads at double its perceptual tempo. No amount of
 * refinement fixes an octave error, because the wrong octave fits the onsets
 * perfectly.
 *
 * We ARE NOT guessing at unknown music here. Every bed enters the pool from a
 * request for a specific tempo, so the octave is known from the outside and the
 * only open question is the precise value — which is what the fit answers.
 * `bandPct` is deliberately narrower than an octave so it can never resolve to
 * one; a track that truly missed its brief falls outside the band and is
 * rejected rather than silently recorded at the wrong tempo.
 */
const coarsePeriod = (flux, targetBpm, bandPct) => {
  const hopsPerSec = SR / HOP;
  const loBpm = targetBpm ? targetBpm * (1 - bandPct) : BPM_MIN;
  const hiBpm = targetBpm ? targetBpm * (1 + bandPct) : BPM_MAX;
  const lo = Math.max(1, Math.floor((60 / hiBpm) * hopsPerSec) - 1);
  const hi = Math.ceil((60 / loBpm) * hopsPerSec) + 1;

  const score = (lag) => {
    let s = 0;
    for (let i = 0; i + lag < flux.length; i++) s += flux[i] * flux[i + lag];
    // Normalise by overlap length or long lags are penalised purely for being long.
    return s / (flux.length - lag);
  };

  let best = lo;
  let bestScore = -Infinity;
  for (let lag = lo; lag <= hi; lag++) {
    const s = score(lag);
    if (s > bestScore) {
      bestScore = s;
      best = lag;
    }
  }

  // 🪤 SUB-HOP INTERPOLATION IS NOT A REFINEMENT, IT IS LOAD-BEARING. The
  // autocorrelation can only test INTEGER hop lags, and a hop is 11.6ms — at
  // 150 BPM that is 34.5 hops per beat, so consecutive testable lags are 148
  // and 152 BPM and the true answer is not among them. Measured on synthetic
  // clicks at a tempo set by hand, the integer-lag version was near-exact at
  // 128 (0.0008%) and wrong by 1.8% at 150, purely because 128 happens to land
  // near a whole lag and 150 does not. A parabola through the peak and its two
  // neighbours recovers the fraction.
  const yLo = score(Math.max(1, best - 1));
  const yHi = score(best + 1);
  const denom = yLo - 2 * bestScore + yHi;
  const shift = denom === 0 ? 0 : (0.5 * (yLo - yHi)) / denom;
  const lag = best + Math.max(-0.5, Math.min(0.5, shift));

  return (lag * HOP) / SR;
};

/**
 * Onset peak times in seconds — local maxima of the flux above a threshold.
 *
 * Peaks are parabolically interpolated for the same reason the autocorrelation
 * peak is: a hop is 11.6ms, so hop-quantised onset times put a floor of about
 * 3ms RMS on the fit residual and blunt the least-squares estimate of period.
 */
const onsetTimes = (flux, threshold = 0.08) => {
  const times = [];
  for (let i = 1; i < flux.length - 1; i++) {
    if (flux[i] >= threshold && flux[i] >= flux[i - 1] && flux[i] > flux[i + 1]) {
      const denom = flux[i - 1] - 2 * flux[i] + flux[i + 1];
      const shift = denom === 0 ? 0 : (0.5 * (flux[i - 1] - flux[i + 1])) / denom;
      times.push(((i + Math.max(-0.5, Math.min(0.5, shift))) * HOP) / SR);
    }
  }
  return times;
};

/**
 * Measures tempo and phase.
 *
 * The refinement: seed from autocorrelation, assign each onset the beat index
 * it is nearest, keep only onsets within a quarter beat of the grid (the rest
 * are syncopation, not the pulse), then least-squares fit
 * `time = phase + index × period`. Iterating a few times lets the index
 * assignment settle as the period sharpens.
 *
 * Returns { bpm, phaseMs, beatFrames, onsetsUsed, residualMs }.
 * `residualMs` is the RMS distance from the fitted grid — a good fit on real
 * percussive music is a few milliseconds; a large value means the track has no
 * steady pulse and should not be used as a beat-synced bed.
 */
export const measureTempo = (path, { fps = 30, targetBpm = null, bandPct = 0.12 } = {}) => {
  const x = decodeMono(path);
  const flux = onsetEnvelope(x);
  const times = onsetTimes(flux);
  if (times.length < 8) {
    return { bpm: null, phaseMs: null, beatFrames: null, onsetsUsed: 0, residualMs: null };
  }

  let period = coarsePeriod(flux, targetBpm, bandPct);
  let phase = times[0];

  // 🪤 THE GATE IS ANNEALED, WIDE TO NARROW, AND THAT ORDER MATTERS. A fixed
  // quarter-beat gate is self-confirming: if the seed period is slightly wrong,
  // the onsets furthest from the seed's grid — precisely the late ones that
  // carry the information needed to correct it — fall outside the gate and are
  // discarded, so the fit converges on the seed's error and reports a small
  // residual while doing it. Starting at nearly half a beat lets those onsets
  // pull the period first; narrowing afterwards then rejects real syncopation.
  const GATES = [0.45, 0.45, 0.35, 0.25, 0.18, 0.15, 0.15, 0.15];

  for (const gate of GATES) {
    const idx = [];
    const t = [];
    for (const time of times) {
      const k = Math.round((time - phase) / period);
      if (k < 0) continue;
      if (Math.abs(time - (phase + k * period)) > period * gate) continue;
      idx.push(k);
      t.push(time);
    }
    if (idx.length < 6) break;

    // Least squares for t = phase + period·k
    const n = idx.length;
    const mk = idx.reduce((a, b) => a + b, 0) / n;
    const mt = t.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (idx[i] - mk) * (t[i] - mt);
      den += (idx[i] - mk) ** 2;
    }
    if (den === 0) break;
    period = num / den;
    phase = mt - period * mk;
  }

  // Final residual, over the onsets the fit actually explains.
  let sq = 0;
  let used = 0;
  for (const time of times) {
    const k = Math.round((time - phase) / period);
    const err = time - (phase + k * period);
    if (Math.abs(err) > period * 0.15) continue;
    sq += err * err;
    used++;
  }

  return {
    bpm: 60 / period,
    // Where the first beat sits relative to file zero, folded into one beat.
    phaseMs: Math.round((((phase % period) + period) % period) * 1000),
    beatFrames: period * fps,
    onsetsUsed: used,
    residualMs: used ? Math.round(Math.sqrt(sq / used) * 1000) : null,
  };
};

/** Mean level in dBFS — used to check a generated bed is not louder than a voice. */
export const meanDb = (path) => {
  const x = decodeMono(path);
  let s = 0;
  for (let i = 0; i < x.length; i++) s += x[i] * x[i];
  const rms = Math.sqrt(s / x.length);
  return 20 * Math.log10(rms || 1e-9);
};

/**
 * Level of the first `ms` relative to the whole track, as a ratio.
 *
 * The viral system's standing rule is "energy from frame 0" — a hard-cut hook
 * over a fade-in reads as a broken file. A track opening below ~0.5 of its own
 * body level is a fade and needs a head-trim before it joins the pool.
 */
export const openingRatio = (path, ms = 300) => {
  const x = decodeMono(path);
  const n = Math.min(x.length, Math.floor((ms / 1000) * SR));
  const rms = (from, to) => {
    let s = 0;
    for (let i = from; i < to; i++) s += x[i] * x[i];
    return Math.sqrt(s / Math.max(1, to - from));
  };
  const body = rms(0, x.length);
  return body ? rms(0, n) / body : 0;
};

/**
 * Tracks the ACTUAL beat times through a track, following tempo drift.
 *
 * ⭐⭐ WHY THIS REPLACES A SINGLE BPM NUMBER AS THE THING WE STORE. A constant
 * `bpm` + `phaseMs` describes a bed only if its tempo is genuinely constant.
 * Two independent findings killed that assumption on the same afternoon:
 *
 *   - `voltSlope` fits a constant grid to only 32ms RMS, and its measured tempo
 *     swings depending on how much of the file you measure (152.2 over 30s,
 *     150.8 over the first 14s). It was recorded as "150.00 by construction"
 *     and is not.
 *   - Every ElevenLabs take drifts. Measured in 8-second windows one 128 BPM
 *     request came back 130.7 / 128.0 / 133.0 / 131.5 — a real ±2% wander, not
 *     measurement noise, and no prompt wording fixes it.
 *
 * A beat map sidesteps the whole problem. Cuts get snapped to beats that were
 * actually observed in the audio, so a bed that speeds up in its second half is
 * still cut correctly — and "on the beat" goes back to meaning what a listener
 * means by it, namely that the cut lands on an audible transient.
 *
 * The tracker predicts the next beat one period ahead, looks for a real onset
 * near that prediction, and takes the strongest candidate. When it finds one it
 * eases the period towards the observed interval, which is what lets it follow
 * drift; when it finds nothing it keeps the predicted time so a quiet bar does
 * not break the grid.
 *
 * ⭐ THE PERIOD IS EASED, NOT SNAPPED, and the ratio is capped. Following every
 * interval exactly would let one syncopated hit halve the tempo for the rest of
 * the track — the same octave failure that makes unconstrained autocorrelation
 * useless, arriving one beat at a time.
 */
export const beatMap = (path, { targetBpm = null, bandPct = 0.12 } = {}) => {
  const x = decodeMono(path);
  const flux = onsetEnvelope(x);
  const times = onsetTimes(flux, 0.05);
  if (times.length < 8) return [];

  const strength = (t) => {
    const i = Math.round((t * SR) / HOP);
    return flux[Math.max(0, Math.min(flux.length - 1, i))];
  };

  // ⭐ SEEDED FROM THE REFINED FIT, NOT THE RAW AUTOCORRELATION PEAK. Seeding
  // straight off `coarsePeriod` put `hardstyleV10` at 154 BPM — the peak-pick
  // lands on a neighbouring lag there — and every later beat inherited it. The
  // least-squares refinement already exists and is validated against synthetic
  // clicks, so the tracker starts from its answer and only has to follow drift.
  const fit = measureTempo(path, { targetBpm, bandPct });
  let period = fit.bpm ? 60 / fit.bpm : coarsePeriod(flux, targetBpm, bandPct);
  // 🪤 THE EASED PERIOD MUST BE CLAMPED NEAR ITS SEED. Easing lets the tracker
  // follow genuine drift, but nothing stopped the drift compounding: on
  // `hardstyleV10` — whose offbeat hi-hats sit half a beat from the pulse — it
  // walked from 150 to 154 BPM and started reporting 310ms intervals against a
  // 400ms beat. Real music drifts by a couple of percent; a bed that appears to
  // have moved 8% has not sped up, the tracker has changed which pulse it is
  // following. Bounding it turns a silent runaway into a visible wobble.
  const seedPeriod = period;
  const MAX_DRIFT = 0.08;
  const duration = x.length / SR;

  // Start on the first onset that is actually a hit, not the loudest stray.
  let t = times.find((v) => strength(v) > 0.15) ?? times[0];
  // Walk backwards so the map starts at the top of the file, not at first hit.
  while (t - period > 0) t -= period;

  const beats = [];
  let guard = 0;
  while (t < duration && guard++ < 5000) {
    beats.push(t);
    const predicted = t + period;
    const window = period * 0.2;
    let best = null;
    let bestScore = 0;
    for (const cand of times) {
      if (cand < predicted - window) continue;
      if (cand > predicted + window) break;
      // Prefer strong onsets, but penalise distance from the prediction so a
      // loud syncopation cannot drag the grid off the pulse.
      // Squared distance penalty: a syncopated hit near the edge of the window
      // must be dramatically louder than an on-grid one to win. With a linear
      // penalty `aggroTechnoV12` tracked intervals from 301 to 505ms against a
      // 400ms beat — the tracker was following fills, not the pulse.
      const d = Math.abs(cand - predicted) / window;
      const score = strength(cand) * (1 - d) ** 2;
      if (score > bestScore) {
        bestScore = score;
        best = cand;
      }
    }
    if (best !== null) {
      const observed = best - t;
      const ratio = observed / period;
      // Cap the per-beat correction; see the note above on octave drift.
      if (ratio > 0.8 && ratio < 1.25) {
        period += (observed - period) * 0.25;
        period = Math.max(seedPeriod * (1 - MAX_DRIFT), Math.min(seedPeriod * (1 + MAX_DRIFT), period));
      }
      t = best;
    } else {
      t = predicted;
    }
  }
  return beats;
};

/**
 * Quality of a beat map: how consistent its inter-beat intervals are.
 *
 * ⭐ THIS, NOT THE CONSTANT-FIT RESIDUAL, IS THE RIGHT ACCEPTANCE TEST FOR A
 * BED — and the two disagree in an instructive way. The first ElevenLabs take
 * fits a CONSTANT grid to only 39ms (it drifts, so a single tempo cannot
 * describe all 32 seconds) while its beat-to-beat intervals vary by just 3.9ms
 * (locally it is rock steady). Judged by the constant fit it is unusable;
 * judged by what actually matters — can we say where each beat is — it is the
 * cleanest bed we own. Global drift is harmless once cuts are snapped to
 * tracked beats; local jitter is not, because it means the beats were never
 * located in the first place.
 *
 * `intervalSdMs` is therefore the number to gate on. Measured across the pool:
 * aggroTechnoV12 2.7, a generated bed 3.9, trendV02 6.3, starlightV03 7.1,
 * voltSlope 8.6, blackVelvetAria 8.9, executorV11 11.7, cashFlowAnthem 12.8,
 * readyV04 13.0, violinEnergetic 16.3, hardstyleV10 24.2 (its offbeat hi-hats
 * pull the tracker off the pulse).
 */
export const beatMapQuality = (beats) => {
  if (beats.length < 8) return { beats: beats.length, intervalSdMs: null, bpm: null };
  const iv = beats.slice(1).map((v, i) => v - beats[i]);
  const mean = iv.reduce((a, b) => a + b, 0) / iv.length;
  const sd = Math.sqrt(iv.reduce((a, b) => a + (b - mean) ** 2, 0) / iv.length);
  return {
    beats: beats.length,
    intervalSdMs: Math.round(sd * 10000) / 10,
    bpm: Math.round((60 / mean) * 100) / 100,
  };
};
