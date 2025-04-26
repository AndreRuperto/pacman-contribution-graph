export var Sound;
(function (Sound) {
    Sound["DEFAULT"] = "https://cdn.jsdelivr.net/npm/pacman-contribution-graph/src/assets/sounds/pacman_chomp.wav";
    Sound["BEGINNING"] = "https://cdn.jsdelivr.net/npm/pacman-contribution-graph/src/assets/sounds/pacman_beginning.wav";
    Sound["GAME_OVER"] = "https://cdn.jsdelivr.net/npm/pacman-contribution-graph/src/assets/sounds/pacman_death.wav";
    Sound["EAT_GHOST"] = "https://cdn.jsdelivr.net/npm/pacman-contribution-graph/src/assets/sounds/pacman_eatghost.wav";
    Sound["EAT_FRUIT"] = "src/assets/sounds/pac-man-power-pellet-1s.wav";
})(Sound || (Sound = {}));
export class MusicPlayer {
    constructor() {
        this.sounds = new Map();
        this.currentSource = null;
        this.defaultSource = null;
        this.isMuted = false;
        this.audioContext = new AudioContext();
    }
    static getInstance() {
        if (!MusicPlayer.instance) {
            MusicPlayer.instance = new MusicPlayer();
        }
        return MusicPlayer.instance;
    }
    async preloadSounds() {
        for (const sound of Object.values(Sound)) {
            const response = await fetch(sound);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sounds.set(sound, audioBuffer);
        }
    }
    async play(sound) {
        if (this.isMuted) {
            return;
        }
        if (this.currentSource) {
            try {
                this.currentSource.stop();
            }
            catch (ex) { }
        }
        const buffer = this.sounds.get(sound);
        if (!buffer) {
            console.error(`Sound ${sound} not found`);
            return;
        }
        this.currentSource = this.audioContext.createBufferSource();
        this.currentSource.buffer = buffer;
        this.currentSource.connect(this.audioContext.destination);
        if (!this.isMuted) {
            this.currentSource.start();
        }
        return new Promise((resolve) => {
            this.currentSource.onended = () => {
                this.currentSource = null;
                resolve();
            };
        });
    }
    startDefaultSound() {
        if (this.defaultSource) {
            try {
                this.defaultSource.stop();
            }
            catch (ex) { }
        }
        const buffer = this.sounds.get(Sound.DEFAULT);
        if (!buffer) {
            console.error('Default sound not found');
            return;
        }
        this.defaultSource = this.audioContext.createBufferSource();
        this.defaultSource.buffer = buffer;
        this.defaultSource.loop = true;
        this.defaultSource.connect(this.audioContext.destination);
        if (!this.isMuted) {
            this.defaultSource.start();
        }
    }
    stopDefaultSound() {
        if (this.defaultSource) {
            try {
                this.defaultSource.stop();
            }
            catch (ex) { }
            this.defaultSource = null;
        }
    }
    mute() {
        this.isMuted = true;
        if (this.currentSource) {
            this.currentSource.disconnect();
        }
        if (this.defaultSource) {
            this.defaultSource.disconnect();
        }
    }
    unmute() {
        this.isMuted = false;
        if (this.currentSource) {
            this.currentSource.connect(this.audioContext.destination);
        }
        if (this.defaultSource) {
            this.defaultSource.connect(this.audioContext.destination);
        }
    }
}
