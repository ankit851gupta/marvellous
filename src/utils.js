/**
 * BREATHING COSMOS - UTILITY FUNCTIONS
 * Helper functions for math, colors, easing, and more
 */

// ========================================
// MATH UTILITIES
// ========================================

export function lerp(start, end, t) {
    return start + (end - start) * t;
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function map(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

export function random(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
}

export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Seeded random for reproducibility
export class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    range(min, max) {
        return min + this.next() * (max - min);
    }
}

// ========================================
// EASING FUNCTIONS
// ========================================

export const Easing = {
    linear: t => t,

    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

    easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
    easeOutSine: t => Math.sin(t * Math.PI / 2),
    easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,

    // Breathing-specific easing
    breath: t => {
        // Smooth breathing curve
        return (Math.sin((t - 0.5) * Math.PI) + 1) / 2;
    }
};

// ========================================
// COLOR UTILITIES
// ========================================

// Color palettes from design system
export const ColorPalettes = {
    deepSpace: [
        '#0a0e1a',
        '#1a1f3a',
        '#2d1b69',
        '#5a189a',
        '#9d4edd'
    ],
    solarFlare: [
        '#1a0e00',
        '#4a1c00',
        '#ff6b35',
        '#ffa500',
        '#ffd700'
    ],
    northernLights: [
        '#001a1a',
        '#003d3d',
        '#00ffc8',
        '#00ff88',
        '#88ffaa'
    ],
    lunarGlow: [
        '#0a0a0f',
        '#1a1a2e',
        '#c0c0d0',
        '#e0e0f0',
        '#ffffff'
    ]
};

// Convert hex to RGB object
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// RGB to hex
export function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Interpolate between two colors
export function lerpColor(color1, color2, t) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    if (!c1 || !c2) return color1;

    const r = Math.round(lerp(c1.r, c2.r, t));
    const g = Math.round(lerp(c1.g, c2.g, t));
    const b = Math.round(lerp(c1.b, c2.b, t));

    return rgbToHex(r, g, b);
}

// Get color from palette with interpolation
export function getColorFromPalette(palette, t) {
    const paletteColors = ColorPalettes[palette] || ColorPalettes.deepSpace;
    const scaledT = t * (paletteColors.length - 1);
    const index = Math.floor(scaledT);
    const localT = scaledT - index;

    if (index >= paletteColors.length - 1) {
        return paletteColors[paletteColors.length - 1];
    }

    return lerpColor(paletteColors[index], paletteColors[index + 1], localT);
}

// Add alpha to hex color
export function hexToRgba(hex, alpha = 1) {
    const rgb = hexToRgb(hex);
    if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

// ========================================
// VECTOR 2D
// ========================================

export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    divide(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        }
        return this;
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        if (mag > 0) {
            this.divide(mag);
        }
        return this;
    }

    limit(max) {
        const mag = this.magnitude();
        if (mag > max) {
            this.normalize().multiply(max);
        }
        return this;
    }

    distance(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    copy() {
        return new Vector2(this.x, this.y);
    }

    static random(min = -1, max = 1) {
        return new Vector2(
            random(min, max),
            random(min, max)
        );
    }
}

// ========================================
// TIME UTILITIES
// ========================================

export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ========================================
// CANVAS UTILITIES
// ========================================

export function clearCanvas(ctx, alpha = 1) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function fadeCanvas(ctx, alpha = 0.1) {
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// Draw circle with glow effect
export function drawGlowCircle(ctx, x, y, radius, color, glowIntensity = 0.5) {
    ctx.save();

    // Glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
    gradient.addColorStop(0, hexToRgba(color, glowIntensity));
    gradient.addColorStop(0.5, hexToRgba(color, glowIntensity * 0.3));
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Core circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// ========================================
// PERFORMANCE UTILITIES
// ========================================

export class FPSCounter {
    constructor() {
        this.fps = 60;
        this.frames = 0;
        this.lastTime = performance.now();
    }

    update() {
        this.frames++;
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;

        if (deltaTime >= 1000) {
            this.fps = Math.round((this.frames * 1000) / deltaTime);
            this.frames = 0;
            this.lastTime = currentTime;
        }

        return this.fps;
    }
}

// ========================================
// STORAGE UTILITIES
// ========================================

export const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('LocalStorage not available:', e);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('LocalStorage not available:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('LocalStorage not available:', e);
            return false;
        }
    }
};

// ========================================
// EXPORT ALL
// ========================================

export default {
    lerp,
    clamp,
    map,
    random,
    randomInt,
    randomChoice,
    SeededRandom,
    Easing,
    ColorPalettes,
    hexToRgb,
    rgbToHex,
    lerpColor,
    getColorFromPalette,
    hexToRgba,
    Vector2,
    formatTime,
    clearCanvas,
    fadeCanvas,
    drawGlowCircle,
    FPSCounter,
    Storage
};
