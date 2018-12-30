Audio = {};

function soundFx(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
      this.sound.play();
    }
    this.stop = function(){
      this.sound.pause();
    }
}

Audio.files = {
  numberSelect: new soundFx('assets/sound/select_number_1.wav'),
  numberDeSelect: new soundFx('assets/sound/deselect_number.wav'),
  won: new soundFx('assets/sound/win.wav'),
  clear: new soundFx('assets/sound/clear.wav'),
  control: new soundFx('assets/sound/control_check.wav'),
  hit: new soundFx('assets/sound/hit.wav'),
  play: new soundFx('assets/sound/winner.wav'),
  bigWin: new soundFx('assets/sound/winner.wav'),
  //loop: new loop('assets/sound/background.wav')
}

Audio.Play = function(){
  //if(GameCanvas.sound.on) Audio.files.bigWin.play();
}

Audio.Settings = function(){
  if(GameCanvas.sound.on) Audio.files.control.play();
}

Audio.ClearAll = function(){
  if(GameCanvas.sound.on) Audio.files.clear.play();
}

Audio.QuickPick = function(){
  if(GameCanvas.sound.on) Audio.files.clear.play();
}

Audio.Won = function(){
  if(GameCanvas.sound.on) Audio.files.won.play();
}

Audio.BigWin = function(){
  if(GameCanvas.sound.on) Audio.files.bigWin.play();
}

Audio.Select = function(){
  if(GameCanvas.sound.on) Audio.files.numberSelect.play();
}

Audio.DeSelect = function(){
  if(GameCanvas.sound.on) Audio.files.numberDeSelect.play();
}

Audio.Background = function() {
  //if(GameCanvas.sound.on) Audio.files.loop.play();
}