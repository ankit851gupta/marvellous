/**
 * BREATHING COSMOS - MAIN APPLICATION
 * Orchestrates all systems and animation loop
 */

import { BreathingDetector } from './breathing.js';
import { VisualRenderer } from './visuals/renderer.js';
import { AudioEngine } from './audio/engine.js';
import { UIController } from './ui.js';
import { FPSCounter } from './utils.js';

// ========================================
// MAIN APPLICATION
// ========================================

class BreathingCosmosApp {
    constructor() {
        // Systems
        this.breathing = null;
        this.visuals = null;
        this.audio = null;
        this.ui = null;

        // Animation
        this.isRunning = false;
        this.lastTime = 0;
        this.animationFrameId = null;

        // Performance
        this.fpsCounter = new FPSCounter();

        this._init();
    }

    async _init() {
        console.log('Initializing Breathing Cosmos...');

        // Get canvas
        const canvas = document.getElementById('cosmos-canvas');
        if (!canvas) {
            console.error('Canvas not found!');
            return;
        }

        // Initialize systems
        this.breathing = new BreathingDetector();
        this.visuals = new VisualRenderer(canvas);
        this.audio = new AudioEngine();
        this.ui = new UIController(this);

        // Setup event listeners
        this.breathing.on('cycleComplete', () => {
            console.log('Breath cycle completed:', this.breathing.state.totalCycles);
        });

        // Hide loading screen
        setTimeout(() => {
            this.ui.hideLoading();
        }, 1000);

        console.log('Breathing Cosmos initialized');
    }

    // ========================================
    // SESSION CONTROL
    // ========================================

    async startSession(mode = 'manual') {
        console.log('Starting session in mode:', mode);

        // Initialize audio
        await this.audio.init();

        // Set breathing mode
        if (mode === 'mic') {
            const success = await this.breathing.initMicrophone();
            if (!success) {
                console.warn('Microphone not available, falling back to manual');
                return false;
            }
        }

        // Start breathing detection
        this.breathing.start();

        // Start audio
        await this.audio.start();

        // Start animation loop
        this.start();

        return true;
    }

    pauseSession() {
        this.breathing.pause();
        this.audio.stop();
    }

    resumeSession() {
        this.breathing.start();
        this.audio.start();
    }

    resetSession() {
        this.breathing.reset();
        this.visuals.reset();
        this.ui.sessionStartTime = Date.now();
    }

    // ========================================
    // ANIMATION LOOP
    // ========================================

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = performance.now();
        this._animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    _animate(currentTime = 0) {
        if (!this.isRunning) return;

        // Calculate delta time
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap at 100ms
        this.lastTime = currentTime;

        // Update systems
        this.breathing.update(deltaTime);
        const breathState = this.breathing.getState();

        this.visuals.update(breathState, deltaTime);
        this.audio.update(breathState);
        this.ui.update();

        // Render
        this.visuals.render();

        // Update FPS
        const fps = this.fpsCounter.update();
        if (fps < 30) {
            console.warn('Low FPS:', fps);
        }

        // Continue loop
        this.animationFrameId = requestAnimationFrame((time) => this._animate(time));
    }

    // ========================================
    // CONTROLS
    // ========================================

    setVisualMode(mode) {
        this.visuals.setMode(mode);
    }

    setPalette(palette) {
        this.visuals.setPalette(palette);
        this.audio.setPalette(palette);
    }

    toggleAudio() {
        return this.audio.toggleMute();
    }

    async saveScreenshot() {
        try {
            const blob = await this.visuals.captureScreenshot(2);

            // Download screenshot
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `breathing-cosmos-${Date.now()}.png`;
            a.click();

            URL.revokeObjectURL(url);

            console.log('Screenshot saved');
            this.ui.showNotification('Screenshot saved!');
        } catch (error) {
            console.error('Failed to save screenshot:', error);
        }
    }
}

// ========================================
// INITIALIZE APP
// ========================================

let app;

window.addEventListener('DOMContentLoaded', () => {
    app = new BreathingCosmosApp();

    // Expose to window for debugging
    window.breathingCosmos = app;
});

export default BreathingCosmosApp;
