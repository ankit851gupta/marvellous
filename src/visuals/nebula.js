/**
 * BREATHING COSMOS - NEBULA VISUAL MODE
 * Particle-based cosmic nebula that responds to breathing
 */

import { Vector2, random, clamp, getColorFromPalette, hexToRgba, lerp } from '../utils.js';

// ========================================
// PARTICLE CLASS
// ========================================

class Particle {
    constructor(x, y, palette = 'deepSpace') {
        this.position = new Vector2(x, y);
        this.velocity = Vector2.random(-0.5, 0.5);
        this.acceleration = new Vector2(0, 0);

        this.baseSize = random(1, 4);
        this.size = this.baseSize;
        this.maxSize = this.baseSize * 3;

        this.life = 1.0;
        this.maxLife = random(3, 8);
        this.age = 0;

        this.palette = palette;
        this.colorPosition = random(0.3, 0.9);

        this.twinklePhase = random(0, Math.PI * 2);
        this.twinkleSpeed = random(1, 3);

        this.opacity = random(0.4, 1.0);
    }

    update(deltaTime, breathIntensity, canvasWidth, canvasHeight) {
        // Age particle
        this.age += deltaTime;
        this.life = 1.0 - (this.age / this.maxLife);

        // Apply forces
        this.velocity.add(this.acceleration);
        this.velocity.limit(2);
        this.position.add(this.velocity.copy().multiply(deltaTime * 60)); // 60 FPS normalized

        // Breathing effect on size
        const breathScale = 1.0 + (breathIntensity * 0.8);
        this.size = clamp(this.baseSize * breathScale, this.baseSize, this.maxSize);

        // Slight drift toward center on exhale
        if (breathIntensity < 0.3) {
            const centerX = canvasWidth / 2;
            const centerY = canvasHeight / 2;
            const toCenter = new Vector2(centerX - this.position.x, centerY - this.position.y);
            toCenter.normalize().multiply(0.02);
            this.acceleration.add(toCenter);
        } else {
            // Expand outward on inhale
            const centerX = canvasWidth / 2;
            const centerY = canvasHeight / 2;
            const fromCenter = new Vector2(this.position.x - centerX, this.position.y - centerY);
            fromCenter.normalize().multiply(0.01 * breathIntensity);
            this.acceleration.add(fromCenter);
        }

        // Wrap around edges
        if (this.position.x < 0) this.position.x = canvasWidth;
        if (this.position.x > canvasWidth) this.position.x = 0;
        if (this.position.y < 0) this.position.y = canvasHeight;
        if (this.position.y > canvasHeight) this.position.y = 0;

        // Twinkle effect
        this.twinklePhase += this.twinkleSpeed * deltaTime;

        // Reset acceleration
        this.acceleration.multiply(0);

        return this.life > 0;
    }

    render(ctx) {
        if (this.life <= 0) return;

        const twinkle = (Math.sin(this.twinklePhase) + 1) / 2;
        const alpha = this.opacity * this.life * (0.6 + twinkle * 0.4);

        // Get color from palette
        const color = getColorFromPalette(this.palette, this.colorPosition);

        // Draw glow
        const glowRadius = this.size * 3;
        const glowGradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, glowRadius
        );

        glowGradient.addColorStop(0, hexToRgba(color, alpha * 0.8));
        glowGradient.addColorStop(0.5, hexToRgba(color, alpha * 0.3));
        glowGradient.addColorStop(1, hexToRgba(color, 0));

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.fillStyle = hexToRgba(color, alpha);
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ========================================
// NEBULA VISUAL MODE
// ========================================

export class NebulaVisual {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.particles = [];
        this.targetParticleCount = 800; // Start lower for performance
        this.maxParticles = 1500;

        this.palette = 'deepSpace';

        this.spawnTimer = 0;
        this.spawnRate = 0.05; // Seconds between spawns

        // Background stars (static)
        this.backgroundStars = this._generateBackgroundStars(200);
    }

    _generateBackgroundStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: random(0, this.canvasWidth),
                y: random(0, this.canvasHeight),
                size: random(0.5, 2),
                opacity: random(0.3, 0.8),
                twinklePhase: random(0, Math.PI * 2),
                twinkleSpeed: random(0.5, 2)
            });
        }
        return stars;
    }

    setPalette(paletteName) {
        this.palette = paletteName;
    }

    update(breathState, deltaTime) {
        const { intensity } = breathState;

        // Spawn particles based on breath intensity
        this.spawnTimer += deltaTime;

        const spawnMultiplier = 1.0 + (intensity * 2); // More spawns on inhale
        const adjustedSpawnRate = this.spawnRate / spawnMultiplier;

        while (this.spawnTimer >= adjustedSpawnRate && this.particles.length < this.maxParticles) {
            this.spawnTimer -= adjustedSpawnRate;
            this._spawnParticle(intensity);
        }

        // Update particles
        this.particles = this.particles.filter(particle =>
            particle.update(deltaTime, intensity, this.canvasWidth, this.canvasHeight)
        );

        // Adjust target particle count based on breath cycles
        if (breathState.totalCycles > 0) {
            this.targetParticleCount = Math.min(
                800 + (breathState.totalCycles * 50),
                this.maxParticles
            );
        }

        // Update background stars twinkle
        this.backgroundStars.forEach(star => {
            star.twinklePhase += star.twinkleSpeed * deltaTime;
        });
    }

    _spawnParticle(breathIntensity) {
        // Spawn from center with radial burst
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;

        const angle = random(0, Math.PI * 2);
        const distance = random(0, 100 * breathIntensity);

        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        const particle = new Particle(x, y, this.palette);

        // Give initial velocity based on spawn angle
        const speed = random(10, 30) * breathIntensity;
        particle.velocity = new Vector2(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        this.particles.push(particle);
    }

    render(ctx) {
        // Render background stars first
        this._renderBackgroundStars(ctx);

        // Render particles with blend mode
        ctx.globalCompositeOperation = 'lighter';

        for (const particle of this.particles) {
            particle.render(ctx);
        }

        ctx.globalCompositeOperation = 'source-over';
    }

    _renderBackgroundStars(ctx) {
        for (const star of this.backgroundStars) {
            const twinkle = (Math.sin(star.twinklePhase) + 1) / 2;
            const alpha = star.opacity * (0.7 + twinkle * 0.3);

            ctx.fillStyle = hexToRgba('#ffffff', alpha);
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    resize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;

        // Regenerate background stars for new canvas size
        this.backgroundStars = this._generateBackgroundStars(200);
    }

    reset() {
        this.particles = [];
        this.spawnTimer = 0;
    }
}

export default NebulaVisual;
