export const WEB_COMPONENT_SOURCE_CODE = `/**
 * ==========================================================================
 * <cyber-dragon-avatar> Standalone Web Component
 * Fluid Motion TV & Dragon 9 Infinity Flow Voice-Reactive Smart Object
 * ==========================================================================
 */

class CyberDragonAvatarElement extends HTMLElement {
  static get observedAttributes() {
    return ['theme', 'freq', 'auto-sync', 'jaw-multiplier', 'mode', 'width', 'height'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.audioCtx = null;
    this.analyser = null;
    this.rafId = null;
    this.jawOpen = 0;
    this.isListening = false;
    this.themeColors = {
      'cyber-neon': { primary: '#06b6d4', secondary: '#3b82f6', accent: '#ec4899', energy: '#22d3ee', eye: '#f43f5e' },
      'solar-flare': { primary: '#f59e0b', secondary: '#ef4444', accent: '#fbbf24', energy: '#fb923c', eye: '#facc15' },
      'emerald-matrix': { primary: '#10b981', secondary: '#059669', accent: '#34d399', energy: '#6ee7b7', eye: '#a7f3d0' },
      'dragon9-chrono': { primary: '#0ea5e9', secondary: '#6366f1', accent: '#38bdf8', energy: '#818cf8', eye: '#38bdf8' }
    };
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const t = this.getAttribute('theme') || 'cyber-neon';
    const theme = this.themeColors[t] || this.themeColors['cyber-neon'];
    const width = this.getAttribute('width') || '100%';
    const height = this.getAttribute('height') || '400px';

    this.shadowRoot.innerHTML = \`
      <style>
        :host {
          display: block;
          position: relative;
          width: \${width};
          height: \${height};
          background: #09090b;
          border: 1px solid \${theme.primary}40;
          border-radius: 16px;
          overflow: hidden;
          font-family: system-ui, sans-serif;
          user-select: none;
        }
        .container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .hud {
          position: absolute;
          top: 12px;
          left: 12px;
          color: \${theme.energy};
          font-size: 11px;
          font-weight: bold;
        }
      </style>
      <div class="container">
        <div class="hud">DRAGON 9 // SMART OBJECT</div>
      </div>
    \`;
  }
}

if (!customElements.get('cyber-dragon-avatar')) {
  customElements.define('cyber-dragon-avatar', CyberDragonAvatarElement);
}
`;
