/** Transport Controls Web Component - Play/Pause/Next/Prev buttons. */
class TransportControls extends HTMLElement {
    constructor() {
        super();
        this.playing = false;
        this.onPlay = null;
        this.onPause = null;
        this.onNext = null;
        this.onPrev = null;
    }
    
    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.innerHTML = `
            <div class="transport-controls">
                <button id="prev-btn" class="transport-btn" title="Previous">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="19 20 9 12 19 4 19 20"></polygon>
                        <line x1="5" y1="19" x2="5" y2="5"></line>
                    </svg>
                </button>
                <button id="play-pause-btn" class="transport-btn play-pause" title="Play/Pause">
                    <svg id="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <svg id="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                </button>
                <button id="next-btn" class="transport-btn" title="Next">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 4 15 12 5 20 5 4"></polygon>
                        <line x1="19" y1="5" x2="19" y2="19"></line>
                    </svg>
                </button>
            </div>
        `;
    }
    
    attachEventListeners() {
        const playPauseBtn = this.querySelector('#play-pause-btn');
        const prevBtn = this.querySelector('#prev-btn');
        const nextBtn = this.querySelector('#next-btn');
        
        playPauseBtn?.addEventListener('click', () => {
            if (this.playing) {
                this.setPlaying(false);
                if (this.onPause) this.onPause();
            } else {
                this.setPlaying(true);
                if (this.onPlay) this.onPlay();
            }
        });
        
        prevBtn?.addEventListener('click', () => {
            if (this.onPrev) this.onPrev();
        });
        
        nextBtn?.addEventListener('click', () => {
            if (this.onNext) this.onNext();
        });
    }
    
    setPlaying(playing) {
        this.playing = playing;
        const playIcon = this.querySelector('#play-icon');
        const pauseIcon = this.querySelector('#pause-icon');
        
        if (playIcon && pauseIcon) {
            if (playing) {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            } else {
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            }
        }
    }
    
    setOnPlay(callback) {
        this.onPlay = callback;
    }
    
    setOnPause(callback) {
        this.onPause = callback;
    }
    
    setOnNext(callback) {
        this.onNext = callback;
    }
    
    setOnPrev(callback) {
        this.onPrev = callback;
    }
}

// Register the custom element
customElements.define('transport-controls', TransportControls);

