/**
 * BREATHING COSMOS - BREATHING DETECTION
 * Handles breath input modes: manual, microphone, guided
 */

import { clamp, Easing } from './utils.js';

// ========================================
// BREATHING STATE
// ========================================

export const BreathPhase = {
    INHALE: 'inhale',
    HOLD_IN: 'hold_in',
    EXHALE: 'exhale',
    HOLD_OUT: 'hold_out'
};

// ========================================
// BREATHING DETECTOR
// ========================================

export class BreathingDetector {
    constructor() {
        // Current mode: 'manual', 'mic', 'guided'
        this.mode = 'manual';

        // Breath state
        this.state = {
            phase: BreathPhase.EXHALE,
            intensity: 0.5, // 0.0 - 1.0
            duration: 0, // Time in current phase (seconds)
            totalCycles: 0, // Complete breath cycles
            isActive: false
        };

        // Manual mode
        this.isPressed = false;
        this.targetIntensity = 0.5;

        // Microphone (Phase 2)
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.micDataArray = null;

        // Guided mode (Phase 2)
        this.guidedPattern = null;
        this.guidedTimer = 0;

        // Smoothing
        this.smoothingFactor = 0.15;
        this.transitionSpeed = 2.0; // Speed of intensity changes

        // Event listeners
        this.listeners = {
            phaseChange: [],
            cycleComplete: []
        };

        this._setupManualControls();
    }

    // ========================================
    // MANUAL MODE
    // ========================================

    _setupManualControls() {
        // Spacebar hold = inhale
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat && this.mode === 'manual') {
                e.preventDefault();
                this.isPressed = true;
                this.targetIntensity = 1.0;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space' && this.mode === 'manual') {
                e.preventDefault();
                this.isPressed = false;
                this.targetIntensity = 0.0;
            }
        });

        // Mouse/touch hold
        const canvas = document.getElementById('cosmos-canvas');

        const handlePointerDown = (e) => {
            if (this.mode === 'manual') {
                this.isPressed = true;
                this.targetIntensity = 1.0;
            }
        };

        const handlePointerUp = (e) => {
            if (this.mode === 'manual') {
                this.isPressed = false;
                this.targetIntensity = 0.0;
            }
        };

        canvas.addEventListener('mousedown', handlePointerDown);
        canvas.addEventListener('mouseup', handlePointerUp);
        canvas.addEventListener('mouseleave', handlePointerUp);

        canvas.addEventListener('touchstart', handlePointerDown);
        canvas.addEventListener('touchend', handlePointerUp);
        canvas.addEventListener('touchcancel', handlePointerUp);
    }

    // ========================================
    // MICROPHONE MODE (Phase 2)
    // ========================================

    async initMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();

            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;

            this.microphone.connect(this.analyser);

            const bufferLength = this.analyser.frequencyBinCount;
            this.micDataArray = new Uint8Array(bufferLength);

            this.mode = 'mic';
            return true;
        } catch (error) {
            console.error('Microphone access denied:', error);
            this.mode = 'manual';
            return false;
        }
    }

    _updateFromMicrophone() {
        if (!this.analyser || !this.micDataArray) return;

        this.analyser.getByteFrequencyData(this.micDataArray);

        // Calculate RMS volume
        let sum = 0;
        for (let i = 0; i < this.micDataArray.length; i++) {
            sum += this.micDataArray[i] * this.micDataArray[i];
        }
        const rms = Math.sqrt(sum / this.micDataArray.length);

        // Map RMS to intensity (0-255 -> 0-1)
        const rawIntensity = clamp(rms / 128, 0, 1);

        // Detect breathing pattern from volume changes
        // Rising = inhale, falling = exhale
        const delta = rawIntensity - this.state.intensity;

        if (Math.abs(delta) > 0.01) {
            this.targetIntensity = rawIntensity;
        }
    }

    // ========================================
    // GUIDED MODE (Phase 2)
    // ========================================

    setGuidedPattern(pattern) {
        // Pattern: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 }
        this.guidedPattern = pattern;
        this.guidedTimer = 0;
        this.mode = 'guided';
    }

    _updateFromGuided(deltaTime) {
        if (!this.guidedPattern) return;

        const p = this.guidedPattern;
        this.guidedTimer += deltaTime;

        const totalTime = p.inhale + p.holdIn + p.exhale + p.holdOut;

        if (this.guidedTimer >= totalTime) {
            this.guidedTimer = 0;
            this._emitEvent('cycleComplete');
        }

        // Determine phase and intensity
        let elapsed = this.guidedTimer;

        if (elapsed < p.inhale) {
            // Inhale
            const t = elapsed / p.inhale;
            this.targetIntensity = Easing.easeInOutSine(t);
            this.state.phase = BreathPhase.INHALE;
        } else if (elapsed < p.inhale + p.holdIn) {
            // Hold inhale
            this.targetIntensity = 1.0;
            this.state.phase = BreathPhase.HOLD_IN;
        } else if (elapsed < p.inhale + p.holdIn + p.exhale) {
            // Exhale
            const t = (elapsed - p.inhale - p.holdIn) / p.exhale;
            this.targetIntensity = 1.0 - Easing.easeInOutSine(t);
            this.state.phase = BreathPhase.EXHALE;
        } else {
            // Hold exhale
            this.targetIntensity = 0.0;
            this.state.phase = BreathPhase.HOLD_OUT;
        }
    }

    // ========================================
    // UPDATE
    // ========================================

    update(deltaTime) {
        if (!this.state.isActive) return;

        // Update based on mode
        switch (this.mode) {
            case 'mic':
                this._updateFromMicrophone();
                break;
            case 'guided':
                this._updateFromGuided(deltaTime);
                break;
            case 'manual':
            default:
                // Manual mode - targetIntensity set by input handlers
                break;
        }

        // Smooth intensity transition
        const intensityDelta = this.targetIntensity - this.state.intensity;
        this.state.intensity += intensityDelta * this.smoothingFactor;

        // Clamp intensity
        this.state.intensity = clamp(this.state.intensity, 0, 1);

        // Update duration
        this.state.duration += deltaTime;

        // Phase detection (for manual/mic modes)
        if (this.mode !== 'guided') {
            const prevPhase = this.state.phase;

            // Simple threshold-based phase detection
            if (this.state.intensity > 0.8) {
                this.state.phase = BreathPhase.INHALE;
            } else if (this.state.intensity > 0.6) {
                this.state.phase = BreathPhase.HOLD_IN;
            } else if (this.state.intensity > 0.2) {
                this.state.phase = BreathPhase.EXHALE;
            } else {
                this.state.phase = BreathPhase.HOLD_OUT;
            }

            // Detect phase change
            if (prevPhase !== this.state.phase) {
                this.state.duration = 0;
                this._emitEvent('phaseChange', this.state.phase);

                // Count complete cycles (exhale -> inhale)
                if (prevPhase === BreathPhase.EXHALE && this.state.phase === BreathPhase.INHALE) {
                    this.state.totalCycles++;
                    this._emitEvent('cycleComplete');
                }
            }
        }
    }

    // ========================================
    // CONTROL
    // ========================================

    start() {
        this.state.isActive = true;
    }

    pause() {
        this.state.isActive = false;
    }

    reset() {
        this.state.totalCycles = 0;
        this.state.duration = 0;
        this.state.intensity = 0.5;
        this.state.phase = BreathPhase.EXHALE;
    }

    // ========================================
    // EVENTS
    // ========================================

    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    _emitEvent(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    // ========================================
    // GETTERS
    // ========================================

    getState() {
        return { ...this.state };
    }

    getPhaseText() {
        const phrases = {
            [BreathPhase.INHALE]: 'Inhale',
            [BreathPhase.HOLD_IN]: 'Hold',
            [BreathPhase.EXHALE]: 'Exhale',
            [BreathPhase.HOLD_OUT]: 'Rest'
        };
        return phrases[this.state.phase] || 'Breathe';
    }
}

export default BreathingDetector;
