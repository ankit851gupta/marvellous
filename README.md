# Breathing Cosmos ✨

Transform your breath into living cosmic art. A meditative generative experience that combines wellness with beauty.

## Overview

Breathing Cosmos is an interactive web experience where your breathing creates evolving cosmic visualizations and ambient soundscapes. Each session produces unique, shareable artwork.

### Features

- **Breath-Responsive Art**: Inhale to expand the cosmos, exhale to crystallize patterns
- **Ambient Soundscape**: Generative audio that rises and falls with your breath
- **Multiple Input Modes**: Manual control (spacebar/click) or microphone detection
- **Save & Share**: Export high-resolution screenshots of your cosmic creations
- **Meditative Experience**: Combines stress relief with creative expression

## Quick Start

1. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
2. Choose your input mode:
   - **Begin Journey**: Use spacebar or mouse/touch to breathe
   - **Use Microphone**: Detect breathing from audio (requires permission)
3. Breathe naturally and watch the cosmos respond
4. Press `ESC` to pause and save your artwork

## Keyboard Shortcuts

- **Space**: Hold to inhale (manual mode)
- **H**: Hide/show UI
- **M**: Mute/unmute audio
- **S**: Save screenshot
- **R**: Reset session
- **F**: Toggle fullscreen
- **ESC**: Pause session

## How It Works

### Breathing Detection

- **Manual Mode**: Hold spacebar, click, or touch to simulate inhaling. Release to exhale.
- **Microphone Mode**: Real-time audio analysis detects your breathing pattern.

### Visual System

**Nebula Mode** (MVP): Particle-based cosmic nebula that:
- Expands outward on inhale
- Contracts toward center on exhale
- Spawns more particles based on breath intensity
- Features background starfield with twinkling effect
- Uses radial gradients and glow effects

### Audio System

Generative ambient soundscape with three layers:
1. **Drone**: Deep sustained bass tone (60Hz)
2. **Breath Tone**: Rises from 200Hz to 800Hz on inhale, falls on exhale
3. **Shimmer**: High crystalline tones (1200Hz) triggered on breath holds

## Project Structure

```
breathing-cosmos/
├── index.html              # Main HTML
├── styles.css             # Cosmic ethereal styling
├── src/
│   ├── main.js            # App orchestration & animation loop
│   ├── breathing.js       # Breath detection system
│   ├── ui.js              # UI controller
│   ├── utils.js           # Helper functions
│   ├── visuals/
│   │   ├── renderer.js    # Canvas rendering engine
│   │   └── nebula.js      # Nebula particle visual
│   └── audio/
│       ├── engine.js      # Web Audio management
│       └── synth.js       # Breath-responsive synthesizer
└── README.md
```

## Design Philosophy

**Cosmic Ethereal Minimalism**: A refined aesthetic combining:
- Deep space blacks with luminous particles
- Sophisticated typography (Cormorant Garamond + Work Sans)
- Ethereal glows and atmospheric depth
- Gallery-quality generative art

**Color Palette**:
- Deep Space: Dark purples and blues (#0a0e1a → #9d4edd)
- Accent: Cyan glow (#00d4ff) and gold highlights (#ffd700)

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (test mic permissions)
- **Mobile**: Touch controls supported

## Performance

- Target: 60 FPS on desktop, 30 FPS on mobile
- Optimized particle count based on device
- Efficient canvas rendering with fade trails
- Web Audio API for smooth synthesis

## Future Enhancements (Phase 2+)

- [ ] Sacred Geometry visual mode
- [ ] Fluid Dynamics visual mode
- [ ] Aurora Waves visual mode
- [ ] Guided breathing patterns (4-7-8, Box breathing)
- [ ] Multiple color palettes
- [ ] Multiple sound palettes
- [ ] Video recording (30-60s clips)
- [ ] URL-based sharing
- [ ] Community gallery
- [ ] Mobile app version

## Technical Details

- **Pure JavaScript**: No framework dependencies
- **ES6 Modules**: Clean, modular code
- **Web Audio API**: For generative soundscapes
- **Canvas 2D**: For particle rendering (WebGL upgrade planned)
- **MediaDevices API**: For optional microphone input

## Credits

Created with Claude Code using the frontend-design skill.

Typography: Cormorant Garamond (Google Fonts) + Work Sans

## License

MIT License - Feel free to use and modify for personal and commercial projects.

---

**Breathe deeply. Create beautifully.** ✨
