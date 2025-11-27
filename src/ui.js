/**
 * BREATHING COSMOS - UI CONTROLLER
 * Manages user interface interactions
 */

import { formatTime } from './utils.js';

// ========================================
// UI CONTROLLER
// ========================================

export class UIController {
    constructor(app) {
        this.app = app;

        // UI elements
        this.welcomeOverlay = document.getElementById('welcome-overlay');
        this.pauseOverlay = document.getElementById('pause-overlay');
        this.mainUI = document.getElementById('main-ui');
        this.loading = document.getElementById('loading');

        // Top bar elements
        this.breathPhaseText = document.querySelector('.breath-phase-text');
        this.sessionTimer = document.querySelector('.session-timer');
        this.breathCount = document.querySelector('.breath-count');

        // Buttons
        this.startManualBtn = document.getElementById('start-manual');
        this.startMicBtn = document.getElementById('start-mic');
        this.toggleUIBtn = document.getElementById('toggle-ui');
        this.toggleAudioBtn = document.getElementById('toggle-audio');
        this.saveScreenshotBtn = document.getElementById('save-screenshot');
        this.resetSessionBtn = document.getElementById('reset-session');
        this.resumeSessionBtn = document.getElementById('resume-session');
        this.saveAndExitBtn = document.getElementById('save-and-exit');
        this.newSessionBtn = document.getElementById('new-session');

        // Mode buttons
        this.modeButtons = document.querySelectorAll('.mode-button');

        // State
        this.sessionStartTime = 0;
        this.isUIVisible = true;

        this._setupEventListeners();
    }

    _setupEventListeners() {
        // Welcome overlay buttons
        this.startManualBtn.addEventListener('click', () => {
            this.app.startSession('manual');
            this.hideWelcome();
        });

        this.startMicBtn.addEventListener('click', async () => {
            const success = await this.app.startSession('mic');
            if (success) {
                this.hideWelcome();
            } else {
                alert('Microphone access denied. Starting in manual mode.');
                this.app.startSession('manual');
                this.hideWelcome();
            }
        });

        // Main UI controls
        this.toggleUIBtn.addEventListener('click', () => {
            this.toggleUI();
        });

        this.toggleAudioBtn.addEventListener('click', () => {
            const isMuted = this.app.toggleAudio();
            this.updateAudioButton(isMuted);
        });

        this.saveScreenshotBtn.addEventListener('click', () => {
            this.app.saveScreenshot();
        });

        this.resetSessionBtn.addEventListener('click', () => {
            this.app.resetSession();
        });

        // Pause overlay buttons
        this.resumeSessionBtn.addEventListener('click', () => {
            this.hidePause();
            this.app.resumeSession();
        });

        this.saveAndExitBtn.addEventListener('click', () => {
            this.app.saveScreenshot();
        });

        this.newSessionBtn.addEventListener('click', () => {
            this.hidePause();
            this.app.resetSession();
            this.app.resumeSession();
        });

        // Mode buttons
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.setActiveMode(mode);
                this.app.setVisualMode(mode);
            });
        });

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            // Don't trigger if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.code) {
                case 'KeyH':
                    this.toggleUI();
                    break;
                case 'KeyM':
                    const isMuted = this.app.toggleAudio();
                    this.updateAudioButton(isMuted);
                    break;
                case 'KeyS':
                    this.app.saveScreenshot();
                    break;
                case 'KeyR':
                    this.app.resetSession();
                    break;
                case 'KeyF':
                    this.toggleFullscreen();
                    break;
                case 'Escape':
                    if (!this.welcomeOverlay.classList.contains('active')) {
                        this.showPause();
                        this.app.pauseSession();
                    }
                    break;
            }
        });
    }

    // ========================================
    // OVERLAY CONTROLS
    // ========================================

    hideWelcome() {
        this.welcomeOverlay.classList.remove('active');
        this.sessionStartTime = Date.now();
    }

    showWelcome() {
        this.welcomeOverlay.classList.add('active');
    }

    showPause() {
        this.pauseOverlay.classList.add('active');

        // Update pause overlay stats
        const duration = (Date.now() - this.sessionStartTime) / 1000;
        document.getElementById('pause-duration').textContent = formatTime(duration);
        document.getElementById('pause-breaths').textContent =
            this.app.breathing.state.totalCycles.toString();
    }

    hidePause() {
        this.pauseOverlay.classList.remove('active');
    }

    hideLoading() {
        this.loading.classList.add('hidden');
    }

    // ========================================
    // UI VISIBILITY
    // ========================================

    toggleUI() {
        this.isUIVisible = !this.isUIVisible;

        if (this.isUIVisible) {
            this.mainUI.classList.remove('hidden');
        } else {
            this.mainUI.classList.add('hidden');
        }
    }

    // ========================================
    // UPDATE UI
    // ========================================

    update() {
        if (!this.app.breathing) return;

        const state = this.app.breathing.getState();

        // Update breath phase text
        if (this.breathPhaseText) {
            this.breathPhaseText.textContent = this.app.breathing.getPhaseText();
        }

        // Update session timer
        if (this.sessionTimer && this.sessionStartTime > 0) {
            const duration = (Date.now() - this.sessionStartTime) / 1000;
            this.sessionTimer.textContent = formatTime(duration);
        }

        // Update breath count
        if (this.breathCount) {
            this.breathCount.textContent = `${state.totalCycles} breath${state.totalCycles !== 1 ? 's' : ''}`;
        }
    }

    // ========================================
    // BUTTON STATES
    // ========================================

    updateAudioButton(isMuted) {
        // Update icon/text to show muted state
        if (isMuted) {
            this.toggleAudioBtn.style.opacity = '0.5';
        } else {
            this.toggleAudioBtn.style.opacity = '1';
        }
    }

    setActiveMode(modeName) {
        this.modeButtons.forEach(btn => {
            if (btn.dataset.mode === modeName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // ========================================
    // UTILITIES
    // ========================================

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    showNotification(message) {
        // Simple notification (could be enhanced with toast library)
        console.log('Notification:', message);
        // TODO: Phase 2 - implement toast notifications
    }
}

export default UIController;
