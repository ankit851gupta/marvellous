/**
 * BREATHING COSMOS - VISUAL RENDERER
 * Manages canvas rendering and visual modes
 */

import { NebulaVisual } from './nebula.js';
import { fadeCanvas } from '../utils.js';

// ========================================
// VISUAL RENDERER
// ========================================

export class VisualRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.mode = 'nebula';
        this.palette = 'deepSpace';

        this.activeVisual = null;

        this._setupCanvas();
        this._initVisuals();
    }

    _setupCanvas() {
        // Set canvas size to window size
        this.resize();

        // Handle window resize
        window.addEventListener('resize', () => this.resize());

        // Enable blend modes
        this.ctx.globalCompositeOperation = 'source-over';
    }

    _initVisuals() {
        // Initialize current visual mode
        switch (this.mode) {
            case 'nebula':
            default:
                this.activeVisual = new NebulaVisual(
                    this.canvas.width,
                    this.canvas.height
                );
                break;

            // Phase 2: Add more visual modes
            // case 'geometry':
            //     this.activeVisual = new GeometryVisual(...);
            //     break;
        }

        if (this.activeVisual && this.activeVisual.setPalette) {
            this.activeVisual.setPalette(this.palette);
        }
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;

        // Set display size
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;

        // Scale context for high DPI
        this.ctx.scale(dpr, dpr);

        // Set CSS size
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';

        // Notify active visual of resize
        if (this.activeVisual && this.activeVisual.resize) {
            this.activeVisual.resize(
                window.innerWidth,
                window.innerHeight
            );
        }
    }

    update(breathState, deltaTime) {
        if (this.activeVisual && this.activeVisual.update) {
            this.activeVisual.update(breathState, deltaTime);
        }
    }

    render() {
        // Fade effect for motion trails
        fadeCanvas(this.ctx, 0.15);

        // Render active visual
        if (this.activeVisual && this.activeVisual.render) {
            this.activeVisual.render(this.ctx);
        }

        // Optional: render vignette overlay
        this._renderVignette();
    }

    _renderVignette() {
        const { width, height } = this.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, maxRadius
        );

        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
    }

    setMode(modeName) {
        if (this.mode === modeName) return;

        this.mode = modeName;

        // Destroy old visual
        if (this.activeVisual && this.activeVisual.destroy) {
            this.activeVisual.destroy();
        }

        // Initialize new visual
        this._initVisuals();
    }

    setPalette(paletteName) {
        this.palette = paletteName;

        if (this.activeVisual && this.activeVisual.setPalette) {
            this.activeVisual.setPalette(paletteName);
        }
    }

    reset() {
        if (this.activeVisual && this.activeVisual.reset) {
            this.activeVisual.reset();
        }
    }

    // Screenshot functionality
    captureScreenshot(scale = 2) {
        return new Promise((resolve) => {
            // Create temporary high-res canvas
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            tempCanvas.width = this.canvas.width * scale;
            tempCanvas.height = this.canvas.height * scale;

            // Scale and draw current canvas
            tempCtx.scale(scale, scale);
            tempCtx.drawImage(this.canvas, 0, 0);

            // Add watermark
            tempCtx.font = '16px Work Sans';
            tempCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            tempCtx.textAlign = 'right';
            tempCtx.fillText(
                'Breathing Cosmos',
                tempCanvas.width / scale - 20,
                tempCanvas.height / scale - 20
            );

            // Convert to blob
            tempCanvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        });
    }
}

export default VisualRenderer;
