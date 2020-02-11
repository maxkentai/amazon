class AudioPlayer {
    constructor(audioContext, filename, speed, attack, decay) {

        this.activeElement = 0;
        this.inactiveElement = 1;
        this.attack = attack;
        this.decay = decay;

        // with web audio api
        this.audioElements = [];
        this.sources = [];
        this.gains = [];

        this.speed = speed;

 
        for (let i = 0; i < 2; i++) {
            this.audioElements[i] = document.createElement("audio");
            this.audioElements[i].addEventListener('loadedmetadata', () => {
                // console.log('loaded');
                // this.sampleRate = this.audioElements[0].mozSampleRate;
                // console.log(this.audioElements[0]);
            }, false);
            this.audioElements[i].src = filename;
            this.audioElements[i].loop = true;

            this.sources[i] = audioContext.createMediaElementSource(this.audioElements[i]);
            // console.log('source' + i, this.sources[i]);

            this.gains[i] = audioContext.createGain();
            this.gains[i].gain.setValueAtTime(0, audioContext.currentTime); // init with 0 gain
            // console.log('gain' + i, this.gains[i]);

            let con = this.sources[i].connect(this.gains[i]);
            // console.log('con' + i, con);

            let conn = this.gains[i].connect(audioContext.destination);
            // console.log('conn' + i, conn);
            // this.sources[i].connect(this.gains[i]).connect(audioContext.destination);
        }

    }

    loadedMetadataFunction() {
        this.sampleRate = this.audioElements[0].mozSampleRate;
        console.log(this.sampleRate);
    }


    play() {
        for (let i = 0; i < this.audioElements.length; i++) {
            this.audioElements[i].play();
        }
        this.fadeIn(this.activeElement);
    }

    pause() {
        for (let i = 0; i < this.audioElements.length; i++) {
            this.audioElements[i].pause();
            this.gains[i].gain.setValueAtTime(0, audioContext.currentTime); // mute gains
        }
    }

    paused() {
        let paused = false;
        for (let i = 0; i < 2; i++) {
            if (this.audioElements[i].paused) {
                paused = true;
                break;
            }
        }
        return paused;
    }

    getVolume(Idx) {}

    getTime() {
        return this.audioElements[this.activeElement].currentTime * this.speed;
    }

    setTime(time) {
        // change between the two audio elements for smooth playback
        this.activeElement++;
        if (this.activeElement > 1) this.activeElement = 0;
        this.inactiveElement = this.activeElement + 1;
        if (this.inactiveElement > 1) this.inactiveElement = 0;

        this.audioElements[this.activeElement].currentTime = time / this.speed;

        this.fadeIn(this.activeElement);
        this.fadeOut(this.inactiveElement);

    }

    setFile(filename, speed) {
        for (let i = 0; i < this.audioElements.length; i++) {
            this.audioElements[i].src = filename;
            this.speed = speed;
        }
    }

    fadeIn(element) {
        this.gains[element].gain.cancelScheduledValues(0);
        this.gains[element].gain.setValueAtTime(this.gains[element].gain.value, audioContext.currentTime);
        this.gains[element].gain.linearRampToValueAtTime(1, audioContext.currentTime + this.attack); // fade in active element
    }

    fadeOut(element) {
        this.gains[element].gain.cancelScheduledValues(0);
        this.gains[element].gain.setValueAtTime(this.gains[element].gain.value, audioContext.currentTime); //
        this.gains[element].gain.linearRampToValueAtTime(0, audioContext.currentTime + this.decay); // fade out inactive element
    }

    setAttack(attack) {
        this.attack = attack;
    }
    setDecay(decay) {
        this.decay = decay;
    }
}