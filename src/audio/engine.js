/**
 * BREATHING COSMOS - AUDIO ENGINE
 * Manages Web Audio API and synthesizer
 */

import { BreathingSynth } from './synth.js';

// ========================================
// AUDIO ENGINE
// ========================================

export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.synth = null;

        this.isInitialized = false;
        this.isPlaying = false;
        this.isMuted = false;

        this.currentPalette = 'deepSpace';
    }

    async init() {
        if (this.isInitialized) return true;

        try {
            // Create AudioContext
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();

            // Create synth
            this.synth = new BreathingSynth(this.ctx);

            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            return false;
        }
    }

    async start() {
        if (!this.isInitialized) {
            await this.init();
        }

        // Resume AudioContext if suspended (browser autoplay policy)
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }

        if (this.synth && !this.isPlaying) {
            this.synth.start();
            this.isPlaying = true;
        }
    }

    stop() {
        if (this.synth && this.isPlaying) {
            this.synth.stop();
            this.isPlaying = false;
        }
    }

    update(breathState) {
        if (this.isPlaying && this.synth && !this.isMuted) {
            this.synth.update(breathState);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;

        if (this.synth) {
            if (this.isMuted) {
                this.synth.mute();
            } else {
                this.synth.unmute();
            }
        }

        return this.isMuted;
    }

    setVolume(volume) {
        if (this.synth) {
            this.synth.setVolume(volume);
        }
    }

    setPalette(paletteName) {
        this.currentPalette = paletteName;
        // Phase 2: Different sound palettes
        // Could reinitialize synth with different parameters
    }
}

export default AudioEngine;
