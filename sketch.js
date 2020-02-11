/*
on run {input, parameters}
	tell application "Terminal"
		do script "cd /Users/kentai/Documents/Code/P5js/ZF2_05"
		
		do script "node server.js" in window 1
	end tell
	
	delay 2
	
	tell application "Google Chrome"
		open location "http://localhost:3000/zf2/"
	end tell
	
	delay 10
	
	tell application "System Events"
		key code 49
	end tell
	
	return input
end run
*/

let img, img2;
let imgConstr;
let freqImg;
let images = new Array(10);

let duration;

let stepInterval = 20; // in seconds
let currentTime = 0;
let stepTime = 600; // in seconds

let audioContext;

let timerOn;
let displayTime = 0; // playback time for display in seconds 0-86400

let audioPlayer;
let listener;

// let attack = 0.25;
// let decay = 0.5;

let attack = 4;
let decay = 9;

let zoom = 8;

let timeout;
let mouseTimeout;

let filenames = ["data/ZF2_binaural_mixdown_96kHz.mp3", "data/ZF2_binaural_mixdown_48kHz.mp3", "data/ZF2_binaural_mixdown_24kHz.mp3", "data/ZF2_binaural_mixdown_12kHz.mp3"];
let speeds = [1, 0.5, 0.25, 0.125];

// let imageFiles = [
//   "data/sp24-Stunden_cut_weiss-02-gestaucht-vertikal.png",
//   "data/sp24-Stunden_cut_weiss-02-verkleinert.png",
//   "data/sp24-Stunden_cut_schwarz-02-gestaucht-vertikal.png",
//   "data/sp24-Stunden_cut_schwarz-02-verkleinert.png"
// ];

let sel;

let speedSlider;
let uiVisible = false;
const uiHeight = 540;

// var socket;
// let timeToSend;


function preload() {
  img = loadImage("data/sp24-Stunden_cut_weiss-02-gestaucht-vertikal.png");
}



function setup() {
  // createCanvas(1200, 800);
  // createCanvas(1920, 1080);
  createCanvas(displayWidth, displayHeight);
  noSmooth();
  noCursor();

  freqImg = loadImage("data/frequencies.png");


  // socket = io.connect('https://localhost:3000');
  // socket.on('time', timeReceived);


  // imgConstr = createGraphics(width, height);
  // imgConstr = createGraphics(img.width / 2, img.height);
  // imgConstr.image(img, 0, 0, imgConstr.width, imgConstr.height, 0, 0, img.width, img.height);
  // img = imgConstr;


  // for (let i = 0; i < images.length; i++) {
  //   images[i] = createGraphics(img.width, img.height);


  //   // images[i].noTint();   // night image
  //   // images[i].tint(255, i * 255 / (images.length-1));   // night image
  //   images[i].image(img, 0, 0);
  //   images[i].blend(img2, 0, 0, img2.width, img2.height, 0, 0, img.width, img.height, MULTIPLY);
  //   // images[i].tint((images.length - 1 - i) * 255 / (images.length - 1), (images.length - 1 - i) * 255 / (images.length - 1)); // day image
  //   // images[i].image(img, 0, 0);
  // }

  // createP('');
  textArea = createElement('textarea', 'Here you can hear and see a 24 hours long soundtrack of sounds from the rain forest near the ZF2 station north of Manaus.\n\n' +
    'On 20th August 2019 several audio recorders were placed at different locations around and on a tower near the station.' +
    'They recorded the environmental sounds non stop for a whole day. Later the records were combined into a single spatial soundtrack and a spectrogram of it was made.\n\n' +
    'You can hear and see how the sounds in the forest change with the daily rhythm of the animals.\n\n' +
    'The SLOW/FAST Slider lets you speed up the playback of the soundtrack, from realtime to compressing it down to 4 minutes\n\n' +
    'The ZOOM OUT/ZOOM IN Slider lets you zoom into the spectrogram to see more details. On the vertical axis is the frequency from very low up to 40000 Hz\n\n' +
    'AUDIO PITCH lets you select the pitch of the soundtrack from original down to minus 3 Octaves. This makes it possible to hear sounds that are too high for humans to perceive.\n\n' +
    'The soundtrack is designed for listening with headphones');
  textArea.hide();
  textArea.style('width', width / 2 - 200 + 'px');
  textArea.style('height', '360px');
  textArea.style('font-size', '16px');
  textArea.style('border', 'none');
  button = createButton('play');

  button.hide();
  button.style('width', '100px');
  button.mousePressed(togglePlay);

  sel = createSelect();
  sel.option('ORIGINAL');
  sel.option('-1');
  sel.option('-2');
  sel.option('-3');
  sel.changed(selectChanged);
  sel.hide();
  sel.style('width', '100px');


  function selectChanged() {
    console.log(sel.value());
    currentTime = audioPlayer.getTime();
    let paused = audioPlayer.paused();

    switch (sel.value()) {
      case 'ORIGINAL':
        audioPlayer.setFile(filenames[0], speeds[0]);
        break;
      case '-1':
        audioPlayer.setFile(filenames[1], speeds[1]);
        break;
      case '-2':
        audioPlayer.setFile(filenames[2], speeds[2]);
        break;
      case '-3':
        audioPlayer.setFile(filenames[3], speeds[3]);
        break;
    }
    audioPlayer.setTime(currentTime);
    if (!paused) {
      audioPlayer.play();
      // setTimeout(() => {audioPlayer.play()}, 10);
    }

  }



  // imgSel = createSelect();
  // imgSel.option('day hi');
  // imgSel.option('day lo');
  // imgSel.option('night hi');
  // imgSel.option('night lo');
  // imgSel.changed(imgSelectChanged);

  // function imgSelectChanged() {

  //   switch (imgSel.value()) {
  //     case 'day hi':
  //       img = loadImage(imageFiles[0], imgLoaded)
  //       break;
  //     case 'day lo':
  //       img = loadImage(imageFiles[1], imgLoaded)
  //       break;
  //     case 'night hi':
  //       img = loadImage(imageFiles[2], imgLoaded)
  //       break;
  //     case 'night lo':
  //       img = loadImage(imageFiles[3], imgLoaded)
  //       break;
  //   }
  // }

  function imgLoaded(img) {
    console.log('image size: ' + img.width, img.height);
  }

  // createP('');

  speedSlider = createSlider(0, 100, 10, 1);
  speedSlider.style('width', '200px');
  speedSlider.style('background', 'red');
  speedSlider.hide();
  speedSlider.input(speedChanged);

  function speedChanged() {
    let pStepInterval = stepInterval;
    stepTime = speedSlider.value();

    if (stepTime > 60) {
      stepInterval = 10;
    } else {
      stepInterval = 20;
    }
    stepTime = stepTime * 60;

    // if (stepTime > 60) {
    //   stepInterval = 20 / (stepTime - 59);
    //   stepTime = 7200 / (stepTime - 59);
    // } else {
    //   stepInterval = 20;
    //   stepTime = stepTime * 60;
    // }
    if (!audioPlayer.paused() && stepInterval != pStepInterval) {
      setTimer(true);
    }
  }

  // createSpan(' time step');
  // stepTimeSlider = createSlider(1, 60, stepTime, 1);
  // stepTimeSlider.changed(stepTimeChanged);

  // function stepTimeChanged() {
  //   stepTime = stepTimeSlider.value() * 60;
  // }

  // createP('');

  // attackSlider = createSlider(0, 10, attack, 0.1);
  // attackSlider.changed(attackChanged);

  // function attackChanged() {

  //   attack = attackSlider.value();
  //   audioPlayer.setAttack(attack);
  // }

  // decaySlider = createSlider(0, 15, decay, 0.1);
  // decaySlider.changed(decayChanged);

  // function decayChanged() {
  //   decay = decaySlider.value();
  //   audioPlayer.setDecay(decay);
  // }


  zoomSlider = createSlider(1, 1000, zoom, 0.1);
  zoomSlider.style('width', '200px');
  zoomSlider.hide();

  zoomSlider.input(zoomChanged);

  function zoomChanged() {
    zoom = zoomSlider.value();
  }



  audioContext = new AudioContext({
    sampleRate: 48000
  });

  console.log(audioContext.sampleRate);

  if (audioContext.state === 'suspended') {
    audioContext.resume();
    console.log('conntext resumed');
  }

  // audioPlayer = new AudioPlayer(audioContext, "data/ZF2_binaural_mixdown_96kHz.mp3", 1);
  audioPlayer = new AudioPlayer(audioContext, "data/ZF2_binaural_mixdown_96kHz.mp3", 1, attack, decay);
  // audioPlayer = new AudioPlayer(audioContext, "data/ZF2_binaural_mixdown_12kHz.wav", 0.125);

  duration = 86400;

  currentTime = hour() * 3600 + minute() * 60 + second();
  audioPlayer.setTime(currentTime);
  // togglePlay();

  listener = audioContext.listener;
  listener.setOrientation(0, 0, -1, 0, 1, 0);

  console.log('img width: ' + img.width + ' height: ' + img.height); // img width: 16177 height: 2395
  hideUI();
}


// function timeReceived(time) {
//   // noStroke();
//   // fill(199);
//   // ellipse(data.x, data.y, 20, 20);
//   console.log('Receiving Time: ' + time);
// }



function setAudioPlayerTime() {
  currentTime = audioPlayer.getTime() + stepTime + random(-stepTime / 20, stepTime / 20);
  if (currentTime > duration) currentTime = 0;

  audioPlayer.setTime(currentTime);
}




function draw() {
  background(255);


  displayTime = getCurrentDisplayTime();

  // let index = floor(map(mouseX, 0, width, 0, images.length - 1));
  // displaySpectrogram(displayTime, images[index]);
  if (zoom > 1) {
    displaySpectrogram(displayTime, img, zoom, 0, height - 100);
    displaySpectrogram(displayTime, img, 1, height - 100, 100);
  } else {
    displaySpectrogram(displayTime, img, zoom, 0, height);
  }

  displayPlayPosition(displayTime);

  textSize(30);
  strokeWeight(0);
  textAlign(LEFT);
  fill(0);
  text((floor(displayTime / 3600) + "").padStart(2, '0') + ':' + (floor(displayTime / 60 % 60) + "").padStart(2, '0') + ':' + (floor(displayTime % 60) + "").padStart(2, '0'), width - 230 - 100, 100);
  // text((floor(displayTime / 3600) + "").padStart(2, '0') + ':' + (floor(displayTime / 60 % 60) + "").padStart(2, '0') + ':' + ((displayTime % 60).toFixed(1) + "").padStart(4, '0'), width - 700 , 100);
  // text('Step Interval: ' + stepInterval.toFixed(2) + 's', 100, height - 20);
  // text('Time Step: ' + stepTime + 's', 400, height - 20);
  // text('Attack: ' + attack.toFixed(2) + 's', 360, height - 20);
  // text('Decay: ' + decay.toFixed(2) + 's', 560, height - 20);
  // text(floor(frameRate()), 20, 20);

  // text('Volume: ' + audioPlayer.getVolume(0), 660, height - 20);
  text('AMAZON ZF2 24 HOURS', 100, 100);

  if (uiVisible) {
    displayFrequencies();
    // textSize(30);
    textAlign(LEFT);
    text('SLOW', width - 730, 200);
    text('FAST', width - 230 - 100, 200);
    text('ZOOM OUT', width - 730, 300);
    text('ZOOM IN', width - 230 - 100, 300);
    text('AUDIO PITCH', width - 730, 400);

    if (mouseX > 0 && mouseX < width && mouseY > uiHeight && mouseY < height) {
      text('<- CLICK & DRAG ->', mouseX + 10, mouseY + 9);
    }

    // text('AMAZON ZF2 24 HOURS gdbgdg', 100, 200);
  }

  // changeZoom()


}

function changeZoom() {
  zoom *= 1.0001;
  if (zoom > 1000) {
    zoom = 1;
  }
}

function displaySpectrogram(time, img, zoom, y, height) {
  // console.log(img);
  let imgXPos = time * img.width / duration; // x position in the image for a time
  let displayXPos = time * width / duration;

  let displayX;
  let displayW;
  let imgX;
  let imgW;

  const displayXOffset = width / 2;

  if (imgXPos < img.width / 2) { // playback time in first half of the image

    displayX = displayXOffset - (displayXPos * zoom);
    displayW = (displayXOffset + displayXPos) * zoom;
    stroke(0, 255, 0);
    imgX = 0;
    imgW = img.width / 2 + imgXPos;

    image(img, displayX, y, displayW, height, imgX, 0, imgW, img.height);

    if (displayX > 0) { // draw the second part of the image on the left side, if necessary
      displayW = (displayXOffset - displayXPos) * zoom;;
      displayX = displayX - displayW;

      imgW = (img.width / 2 - imgXPos);
      imgX = -1 + img.width - img.width / 2 + imgXPos;
    }

    image(img, displayX, y, displayW, height, imgX, 0, imgW, img.height);

  } else { // playback time in second half of the image

    displayW = width * zoom;
    displayX = (width - displayXPos) * zoom + displayXOffset - displayW;

    imgX = 0;
    imgW = img.width - 1;
    image(img, displayX, y, displayW, height, imgX, 0, imgW, img.height);
    // text('displayXPos: ' + floor(displayXPos) + ' displayX: ' + floor(displayX) + ' displayW: ' + floor(displayW) + ' imgXPos: ' + round(imgXPos) + ' imgX: ' + floor(imgX) + ' imgW: ' + floor(imgW), 20, 20);

    if (displayX + displayW < width) { // draw the second part of the image on the right side, if necessary

      displayX = displayX + displayW;
      displayW = (displayXPos - (width / 2)) * zoom;
      imgW = imgXPos - img.width / 2;
      imgX = 0;
      image(img, displayX, y, displayW, height, imgX, 0, imgW, img.height);
    }
  }


}

function displayFrequencies() {
  if (zoom > 1) {
    image(freqImg, width / 2, 0, 30, height - 100);
  } else {
    image(freqImg, width / 2, 0, 30, height);
  }
}

function displayPlayPosition(time) {
  let xPosition = time / duration * width;
  stroke(0);
  strokeWeight(1);
  // if (uiVisible) line(width / 2, uiHeight, width / 2, height);
  // else 
  line(width / 2, 0, width / 2, height);
  if (zoom > 1) {
    line(0, height - 100, width, height - 100);
  }
  // for (let i = 0; i < height; i+=10) {
  //   let c = get(width/2, i);
  //   stroke(c);
  //   point(width/2, i);
  // }
  // line(xPosition, 0, xPosition, height);
}

function togglePlay() {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  if (audioPlayer.paused()) {
    audioPlayer.play();
    audioPlayer.setAttack(attack);
    audioPlayer.setDecay(decay);
    setTimer(true);
    button.html('pause');
  } else {
    setTimer(false);
    button.html('play');
    audioPlayer.pause();
  }
}


function setTimer(on) {
  if (on) {
    clearTimeout(timeout);
    timerOn = true;
    let timer = function () {
      if (timerOn) {
        setAudioPlayerTime();
        timeout = setTimeout(timer, stepInterval * 1000);
      }
    }
    timeout = setTimeout(timer, stepInterval * 1000);

  } else {
    timerOn = false;
    clearTimeout(timeout);
  }
}


function getCurrentDisplayTime() {
  let targetDisplayTime = audioPlayer.getTime();
  // tbd: 2400 wrap around smoothing

  // if (timeToSend != floor(targetDisplayTime)) {
  //   timeToSend = floor(targetDisplayTime);
  //   socket.emit('time', timeToSend);
  //   console.log(timeToSend);

  // }

  return targetDisplayTime
  // return displayTime + (targetDisplayTime - displayTime) * 0.1;
}


function mouseClicked() {
  if (!fullscreen()) fullscreen(true);

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  if (audioPlayer.paused()) {
    audioPlayer.play();
    setTimer(true);
    button.html('pause');
  }

  // if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
  //   currentTime = mouseX / width * duration;
  //   audioPlayer.setTime(currentTime);
  // }
}

function mousePressed() {
  clearTimeout(mouseTimeout);

  // if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {}
}


function mouseDragged() {

  if (mouseX > 0 && mouseX < width && mouseY > uiHeight && mouseY < height) {
    if (mouseY < height - 100) {
      currentTime = audioPlayer.getTime() + (pmouseX - mouseX) * duration / (zoom * width);
      if (currentTime >= duration) currentTime -= duration;
      if (currentTime < 0) currentTime += duration;

      audioPlayer.setTime(currentTime);

    } else {
      currentTime = audioPlayer.getTime() + (pmouseX - mouseX) * duration / (width);
      if (currentTime >= duration) currentTime -= duration;
      if (currentTime < 0) currentTime += duration;

      audioPlayer.setTime(currentTime);
    }
  }
}

function mouseMoved() {
  clearTimeout(mouseTimeout);
  showUI();

  mouseTimeout = setTimeout(() => {
    if (!mouseIsPressed) {
      hideUI();
    }
  }, 3000);

}

function mouseReleased() {
  clearTimeout(mouseTimeout);

  mouseTimeout = setTimeout(() => {
    hideUI();
  }, 3000);
}

function showUI() {
  uiVisible = true;
  // speedSlider.style('visibility', 'hidden');
  positionElements();
  textArea.show();
  speedSlider.show();
  zoomSlider.show();
  sel.show();
  // button.show();
  cursor();
}

function hideUI() {
  uiVisible = false;
  textArea.hide();
  speedSlider.hide();
  zoomSlider.hide();
  sel.hide();
  button.hide();
  noCursor();
}

function positionElements() {
  textArea.position(100, 170);

  speedSlider.position(width - 480 - 70, 180);
  zoomSlider.position(width - 480 - 70, 280);
  sel.position(width - 430 - 20, 380);
  button.position(width - 430, 480);

  //
  // attackSlider.position(width - 480 - 70, 450);
  // decaySlider.position(width - 480 - 70, 500);
}


function keyPressed() {
  // console.log(keyCode);
  if (keyCode == 32) {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    if (!fullscreen()) fullscreen(true);
    hideUI();
    noSmooth();
    togglePlay();
  }
}