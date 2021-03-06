Audio = {};

function soundFx(src, loop) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.loop = loop;

    this.play = function(){
      this.sound.play();
      if(this.loop) this.sound.loop = true;
    }
    this.stop = function(){
      this.sound.pause();
    }
}

Audio.files = {
  numberSelect: new soundFx('../assets/sound/select_number_1.wav'),
  numberDeSelect: new soundFx('../assets/sound/deselect_number.wav'),
  won: new soundFx('../assets/sound/win.wav'),
  clear: new soundFx('../assets/sound/clear.wav'),
  control: new soundFx('../assets/sound/control_check.wav'),
  hit: new soundFx('../assets/sound/hit.wav'),
  play: new soundFx('../assets/sound/winner.wav'),
  bigWin: new soundFx('../assets/sound/winner.wav'),
  loop: new soundFx('../assets/sound/background.mp3', true)
}

Audio.Play = function(){
  //if(Game.sound.on) Audio.files.bigWin.play();
}

Audio.Settings = function(){
  if(Game.sound.on) Audio.files.control.play();
}

Audio.ClearAll = function(){
  if(Game.sound.on) Audio.files.clear.play();
}

Audio.QuickPick = function(){
  if(Game.sound.on) Audio.files.clear.play();
}

Audio.Won = function(){
  if(Game.sound.on) Audio.files.won.play();
}

Audio.BigWin = function(){
  if(Game.sound.on) Audio.files.bigWin.play();
}

Audio.Select = function(){
  if(Game.sound.on) Audio.files.numberSelect.play();
}

Audio.DeSelect = function(){
  if(Game.sound.on) Audio.files.numberDeSelect.play();
}

Audio.Background = function() {
  if(Game.sound.music_on) Audio.files.loop.play();
}

Audio.BackgroundOff = function() {
  Audio.files.loop.stop();
}