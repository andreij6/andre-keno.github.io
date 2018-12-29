Audio = {};

function sound(src) {
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
  numberSelect: new sound('assets/sound/select_number_1.wav'),
  numberDeSelect: new sound('assets/sound/deselect_number.wav'),
  won: new sound('assets/sound/win.wav'),
  clear: new sound('assets/sound/clear.wav'),
  control: new sound('assets/sound/control_check.wav'),
  hit: new sound('assets/sound/hit.wav'),
  play: new sound('assets/sound/winner.wav'),
  bigWin: new sound('assets/sound/winner.wav')
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