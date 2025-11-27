/**
 * BREATHING COSMOS - BREATH SYNTHESIZER
 * Generates breath-responsive ambient sounds
 */

import { lerp, clamp } from '../utils.js';

// ========================================
// BREATHING SYNTHESIZER
// ========================================

export class BreathingSynth {
    constructor(audioContext) {
        this.ctx = audioContext;

        // Oscillators
        this.droneOsc = null;
        this.breathOsc = null;
        this.shimmerOsc = null;

        // Gain nodes
        this.droneGain = null;
        this.breathGain = null;
        this.shimmerGain = null;
        this.masterGain = null;

        // Filter
        this.filter = null;

        // State
        this.isPlaying = false;
        this.currentBreathFreq = 200;
        this.targetBreathFreq = 200;

        this._init();
    }

    _init() {
        // Create master gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Lower volume for subtlety
        this.masterGain.connect(this.ctx.destination);

        // Create filter (low-pass for warmth)
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 2000;
        this.filter.Q.value = 1;
        this.filter.connect(this.masterGain);

        // Drone oscillator (deep sustained tone)
        this.droneOsc = this.ctx.createOscillator();
        this.droneOsc.type = 'sine';
        this.droneOsc.frequency.value = 60; // Deep bass

        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.value = 0.15;

        this.droneOsc.connect(this.droneGain);
        this.droneGain.connect(this.filter);

        // Breath oscillator (rises/falls with breathing)
        this.breathOsc = this.ctx.createOscillator();
        this.breathOsc.type = 'triangle';
        this.breathOsc.frequency.value = 200;

        this.breathGain = this.ctx.createGain();
        this.breathGain.gain.value = 0;

        this.breathOsc.connect(this.breathGain);
        this.breathGain.connect(this.filter);

        // Shimmer oscillator (high tones on breath holds)
        this.shimmerOsc = this.ctx.createOscillator();
        this.shimmerOsc.type = 'sine';
        this.shimmerOsc.frequency.value = 1200;

        this.shimmerGain = this.ctx.createGain();
        this.shimmerGain.gain.value = 0;

        this.shimmerOsc.connect(this.shimmerGain);
        this.shimmerGain.connect(this.filter);
    }

    start() {
        if (this.isPlaying) return;

        const now = this.ctx.currentTime;

        // Start oscillators
        this.droneOsc.start(now);
        this.breathOsc.start(now);
        this.shimmerOsc.start(now);

        // Fade in master gain
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(0, now);
        this.masterGain.gain.linearRampToValueAtTime(0.3, now + 2.0);

        this.isPlaying = true;
    }

    stop() {
        if (!this.isPlaying) return;

        const now = this.ctx.currentTime;

        // Fade out
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0, now + 1.0);

        // Stop oscillators after fade
        setTimeout(() => {
            this.droneOsc.stop();
            this.breathOsc.stop();
            this.shimmerOsc.stop();
            this.isPlaying = false;

            // Reinitialize for next play
            this._init();
        }, 1100);
    }

    update(breathState) {
        if (!this.isPlaying) return;

        const { intensity, phase } = breathState;
        const now = this.ctx.currentTime;

        // Map breath intensity to frequency (200Hz - 800Hz)
        this.targetBreathFreq = lerp(200, 800, intensity);

        // Smooth frequency transition
        this.currentBreathFreq = lerp(
            this.currentBreathFreq,
            this.targetBreathFreq,
            0.1
        );

        // Update breath oscillator frequency
        this.breathOsc.frequency.setTargetAtTime(
            this.currentBreathFreq,
            now,
            0.1
        );

        // Update breath gain (volume follows intensity)
        const breathVolume = clamp(intensity * 0.25, 0, 0.25);
        this.breathGain.gain.setTargetAtTime(breathVolume, now, 0.1);

        // Update filter cutoff (opens on inhale, closes on exhale)
        const filterFreq = lerp(800, 4000, intensity);
        this.filter.frequency.setTargetAtTime(filterFreq, now, 0.15);

        // Trigger shimmer on breath holds
        if (phase === 'hold_in' || phase === 'hold_out') {
            this.shimmerGain.gain.setTargetAtTime(0.08, now, 0.2);
        } else {
            this.shimmerGain.gain.setTargetAtTime(0, now, 0.3);
        }

        // Modulate shimmer frequency slightly
        const shimmerFreq = lerp(1000, 1500, Math.sin(now * 2) * 0.5 + 0.5);
        this.shimmerOsc.frequency.setTargetAtTime(shimmerFreq, now, 0.5);
    }

    setVolume(volume) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.setTargetAtTime(clamp(volume, 0, 1), now, 0.1);
    }

    mute() {
        this.setVolume(0);
    }

    unmute() {
        this.setVolume(0.3);
    }
}

export default BreathingSynth;
