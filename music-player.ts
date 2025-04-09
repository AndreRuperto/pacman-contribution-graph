export enum Sound {
	DEFAULT = 'https://cdn.jsdelivr.net/npm/pacman-contribution-graph/src/assets/sounds/pacman_chomp.wav',
	BEGINNING = 'https://cdn.jsdelivr.net/npm/pacman-contribution-graph/src/assets/sounds/pacman_beginning.wav',
	GAME_OVER = 'https://cdn.jsdelivr.net/npm/pacman-contribution-graph/src/assets/sounds/pacman_death.wav',
	EAT_GHOST = 'https://cdn.jsdelivr.net/npm/pacman-contribution-graph/src/assets/sounds/pacman_eatghost.wav',
	EAT_FRUIT = 'src/assets/sounds/pac-man-power-pellet-1s.wav'
}

export class MusicPlayer {
	private static instance: MusicPlayer;
	private audioContext: AudioContext;
	private sounds: Map<Sound, AudioBuffer> = new Map();
	private currentSource: AudioBufferSourceNode | null = null;
	private defaultSource: AudioBufferSourceNode | null = null;
	public isMuted: boolean = false;

	private constructor() {
		this.audioContext = new AudioContext();
	}

	public static getInstance(): MusicPlayer {
		if (!MusicPlayer.instance) {
			MusicPlayer.instance = new MusicPlayer();
		}
		return MusicPlayer.instance;
	}

	public async preloadSounds(): Promise<void> {
		for (const sound of Object.values(Sound)) {
			const response = await fetch(sound);
			const arrayBuffer = await response.arrayBuffer();
			const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
			this.sounds.set(sound as Sound, audioBuffer);
		}
	}

	public async play(sound: Sound): Promise<void> {
		if (this.isMuted) {
			return;
		}
		if (this.currentSource) {
			try {
				this.currentSource.stop();
			} catch (ex) {}
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
			this.currentSource!.onended = () => {
				this.currentSource = null;
				resolve();
			};
		});
	}

	public startDefaultSound(): void {
		if (this.defaultSource) {
			try {
				this.defaultSource.stop();
			} catch (ex) {}
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

	public stopDefaultSound(): void {
		if (this.defaultSource) {
			try {
				this.defaultSource.stop();
			} catch (ex) {}
			this.defaultSource = null;
		}
	}

	public mute(): void {
		this.isMuted = true;
		if (this.currentSource) {
			this.currentSource.disconnect();
		}
		if (this.defaultSource) {
			this.defaultSource.disconnect();
		}
	}

	public unmute(): void {
		this.isMuted = false;
		if (this.currentSource) {
			this.currentSource.connect(this.audioContext.destination);
		}
		if (this.defaultSource) {
			this.defaultSource.connect(this.audioContext.destination);
		}
	}
}
