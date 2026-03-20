// import json dialogues
import data from './Dialogue.json' with { type: 'json' };
import fail from './fail.json' with {type: 'json'};
import success from './success.json' with {type: 'json'};

// GAME STATE

// const GameState = {
//   IDLE: "idle",
//   DIALOGUE: "dialogue",
//   SAFE_LOCKED: "safeLocked",
//   SEPARATE: "separateClick"
// };

const GameState = {
  IDLE: "idle",
  DIALOGUE: "dialogue",
  SEPARATE: "separate",
  TAB_WARNING: "tab_warning",
  QTE: "qte",
  RESULT_SUCCESS: "result_success",
  RESULT_FAIL: "result_fail"
};

let currentState = GameState.IDLE;


// CORE VARIABLES

let clickCount = 0;
const maxStage = 5;
let dialogueIndex = 0;

let maxClicks = 10;
let blowUpPoint = 30
let separateClickCount = 0
let isUrging = false;

let closeTabMark = 60;

let safeClicked = false;

let urgeTimer = null;

const safe = document.getElementById("safe");
const clickText = document.getElementById("click-count");
const dialogueBox = document.getElementById("dialogue-box");
// const characterContainer = document.getElementById("character-container");

// CHARACTER CLASS
class Character {
  constructor(name, imageSrc) {
    this.name = name;
    this.imageSrc = imageSrc;
    // this.animations = animations;
    this.spawned = false;
    this.image = null //holds DOM element
  }

  // playAnimation(animationName) {
  //   this.image.src = this.animations[animationName];
  // }

  spawn() {
    if (!this.spawned) {
      this.image = createCharacterImage(this.imageSrc, this.name);
      // document.getElementById(this.name).classList.add("character");
      this.spawned = true;
    }
    else {return};
  }


  playAnimation(animationSrc) {
    if (this.image != animationSrc) {
      this.image.src = animationSrc;
    }

    else {
      this.image = this.image;
    }
  }

  speak(line) {
    // // check the character of the next dialogue line in JSON
    // // if character, set active speaker to them
    // // if not, do nothing
    // let nextChar = this.name[currentLine + 1];
    // if (nextChar === this.name) {
    //   if (this.currentLine < this.dialogueLines.length) {
    //   addDialogue(this.name, this.dialogueLines[this.currentLine]);
    //   this.currentLine++;
    //   return true;
    // }
    // }

    // if (this.currentLine < this.dialogueLines.length) {
    //   addDialogue(this.name, this.dialogueLines[this.currentLine]);
    //   this.currentLine++;
    //   return true;
    // }
    // return false;

    addDialogue(this.name, line);
  }
}


// UI

function addDialogue(characterName, text) {
  const p = document.createElement("p");
  p.textContent = `${characterName}: ${text}`;

  dialogueBox.innerHTML = "";
  dialogueBox.appendChild(p);
}


// CHARACTERS

let Noman = null;
let Yesman = null;
// let activeSpeaker = null;
let Mommo = null;

const nomanImg = document.getElementById("noman-img");
const mommoImg = document.getElementById("mommo-img");
const yesmanImg = document.getElementById("yesman-img");

const characters = {
  Noman: Noman,
  Yesman: Yesman,
  Mommo: Mommo
};

// nomanFirstTime = true;
// YesmanFirstTime = true;
// MommoFirstTime = true;

// INPUT

safe.addEventListener("click", () => {
  safeClicked = true;
});
window.addEventListener("beforeunload", () => {
  // optional: save state / mark player "escaped"
});


// GAME LOOP

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();


// UPDATE

function update() {
  console.log("STATE:", currentState, "CLICKS:", clickCount);


  if (!safeClicked) return;

  switch (currentState) {

    case GameState.IDLE:
      handleIdleClick();
      break;

    case GameState.DIALOGUE:
      handleDialogueClick();
      break;

    case GameState.SEPARATE:
      handleSeparateClick();
      // Deactivate safe clicking

      break;

    case GameState.QTE:
      handleQTEClick();
      break;
  }

  safeClicked = false;
}


// STATE HANDLERS

function handleIdleClick() {
  if (clickCount < maxStage) {
    clickCount++;
  }

  if (clickCount === maxStage) {
    // delete click count
    clickText.remove();
    spawnCharacters();
    currentState = GameState.DIALOGUE;
    advanceDialogue(data);
  }
}

// function for creating invisible image elements for each character
function createCharacterImage(src, name){

  const img = document.createElement("img"); // create element
  img.src = src;                             // set image
  img.id = name.toLowerCase();               // optional but useful
  img.classList.add("character");

  document.getElementById("character-container")
          .appendChild(img);
  return img;
}

// // change character's image (new animation thing)
// function changeCharacterImage(src, name){

//   const img = document.getElementById(name);  get character element name
//   img.src = src;                              set image
//   // img.id = name.toLowerCase();                optional but useful
//   // img.classList.add("character");

//   // document.getElementById("character-container")
//   //         .appendChild(img);
//   return img;
// }

// this is the point in the dialogue index where the separate state will activate
let separateDialogueMark = 53;

function handleDialogueClick() {
  advanceDialogue(data);

  // if (activeSpeaker) {
  //   const spoke = activeSpeaker.speak();

  //   // simple speaker switching 
  //   if (!spoke && activeSpeaker === Noman) {
  //     activeSpeaker = Yesman;
  //     activeSpeaker.speak();
  //   }
  // }
}

function handleQTEClick() {
  if (!qteActive) return;

  qteSuccess = true;
  endQTE();
}

function advanceDialogue(dialogueRoute) {
  if (dialogueIndex >= dialogueRoute.length) return;
  if (dialogueIndex === separateDialogueMark) currentState = GameState.SEPARATE;
  if (dialogueIndex === closeTabMark) {
    currentState = GameState.TAB_WARNING;
    startTabCountdown();
    return;
  }

  const entry = dialogueRoute[dialogueIndex];

  let speaker = characters[entry.Character];

  if (entry.Character === "Noman") speaker = Noman;
  if (entry.Character === "Yesman") speaker = Yesman;
  if (entry.Character === "Mommo") speaker = Mommo;

  if (!speaker) return;

  // if (entry.Character === "Noman") {

  //   Noman.speak(entry.Dialogue);
  //   // Noman.playAnimation(Noman.animations[dialogueIndex]) wrong; don't tie it to the dialogjue index
    
  // }

  // else if (entry.Character === "Yesman") {
  //   Yesman.speak(entry.Dialogue);
  // }

  // else if (entry.Character === "Mommo") {
  //   Mommo.speak(entry.Dialogue);
  // }

  // if (entry.nomanAnimation) {
  //   Noman.playAnimation(entry.nomanAnimation);
  // }

  // else if (entry.yesmanAnimation) {
  //   Yesman.playAnimation(entry.yesmanAnimation);
  // }

  // else if (entry.mommoAnimation) {
  //   Mommo.playAnimation(entry.mommoAnimation);
  // }

  // else {return};

  // if (entry.Animation) {
  //   speaker.playAnimation(entry.Animation);
  // }


  if (entry.Animation) {
  for (const charName in entry.Animation) {
    const animSrc = entry.Animation[charName];

    const char = characters[charName];

    if (char) {
      // ensure they exist
      char.spawn();

      // set the animation
      char.playAnimation(animSrc);
    }
  }
}

  speaker.spawn();
  speaker.speak(entry.Dialogue);
  dialogueIndex++;
}


// RENDER

function render() {
  clickText.textContent = `Clicks: ${clickCount}`;
}


// SPAWN LOGIC

function spawnCharacters() {

  // const nomanLines = data
  //   .filter(d => d.Character === "Noman")
  //   .map(d => d.Dialogue);

  // const yesmanLines = data
  //   .filter(d => d.Character === "Yesman")
  //   .map(d => d.Dialogue);

  Noman = new Character(
    "Noman",
    "./drawings/noman/noman spawn.gif"
    // {
    //   "noman-spawn": "./drawings/noman/noman spawn.gif",
    //   "noman closed eyes smiling": "./drawings/noman/noman closed eyes smiling.jpg",
    //   "noman looking at yesman": "./drawings/noman/noman looking at yesman"
    // }
  );

  Yesman = new Character(
    "Yesman",
    "./drawings/yesman/yesman spawn.png"
  );

  Mommo = new Character(
    "Mommo",
    "./drawings/mommo/Mommo tired.png"
  );

   // Now that we *have* instances, update the lookup:
  characters.Noman = Noman;
  characters.Yesman = Yesman;
  characters.Mommo = Mommo;
}



// clicks for safe only
function handleSeparateClick(){
  // set clickcount to 0
  // clickCount = 0; bad bc it resets everytime, preventing anything from happening

  separateClickCount++;

  // if safe clicks reach max clicks, open safe sequence
  if (separateClickCount >=  maxClicks){
    // open safe sequence
    openSafe("./drawings/opensafe.mp4");
    return;
  }

  // use setTimeout to countdown to urge function; if three seconds pass, use urge function
  // while loop checks if the dialogue index has reached the point where Yesman blows it up
  // while (dialogueIndex < blowUpPoint){
  //   setTimeout(urge(), 3000);
  // }

  if (!isUrging) {
    isUrging = true;
    urgeTimer = setTimeout(() => {
      urge();
      isUrging = false;
    }, 3000);
  }
}



function openSafe(video) {
  const actualVideo = document.createElement("video");
  actualVideo.id = "openSafe";
  actualVideo.src = video;
  actualVideo.autoplay = true;
  actualVideo.onended = () => {
    // fade away
    actualVideo.visibility = hidden;
    actualVideo.opacity = 0;
    // video.transition = {visibility: 0s 2s,
    //                      opacity: 2s linear
    //                     };

    currentState = GameState.Dialogue;
    // maybe show final text or next sequence
  };
  document.getElementById("game-container").appendChild(video);
}

// let blowupCount = 0;

function urge(){
  advanceDialogue();
  // blowupCount ++;
  // yesman and mommo urge the player to open the safe. it changes with each countdown
  // advanceDialogue();

  // check if dialogue index has reached the point where Yesman blows up the safe
  // if it has, go to opensafe animation
  if (dialogueIndex === blowUpPoint) {
    openSafe("./drawings/opensafe.mp4");
    return;
  };
}




let tabTimer;
let qteActive = false;
let qteSuccess = false;
let qteTimer = null;

function triggerQTE() {
  currentState = GameState.QTE;
  startQTE();
}

function startQTE() {
  currentState = GameState.QTE;

  qteActive = true;
  qteSuccess = false;

  // showQTEPrompt(); // e.g. "CLICK NOW!"

  // player has 800ms–1500ms (tweak this for difficulty)
  qteTimer = setTimeout(endQTE, 1000);
}

function endQTE() {
  if (!qteActive) return;

  qteActive = false;
  clearTimeout(qteTimer);

  if (qteSuccess) {
    currentState = GameState.RESULT_SUCCESS;
    advanceDialogue(success);
  } else {
    currentState = GameState.RESULT_FAIL;
    advanceDialogue(fail);
  }
}

function startTabCountdown() {
  let timeLeft = 3;

  tabTimer = setInterval(() => {
    if (currentState !== GameState.TAB_WARNING) {
      clearInterval(tabTimer);
      return;
    }

    if (timeLeft > 0) {
      showCountdown(timeLeft); // update UI text
      timeLeft--;
    } else {
      clearInterval(tabTimer);
      triggerQTE();
    }
  }, 1000);
}

// function that handles animations of characters
// have a list of gifs of them
// Check Dialogue Index.
// If it's a certain number, play a certain animation

// function addCharacterImg(character) {
//   // create img element
//   let newImg = document.createElement("img");
//   // make source the character's animation
//   newImg.src = character.
//   // add element
//   characterContainer.appendChild(newImg);
// }



// sort out character animation appearances