// import json dialogues
import data from './Dialogue.json' with { type: 'json' };


// GAME STATE

const GameState = {
  IDLE: "idle",
  DIALOGUE: "dialogue",
  SAFE_LOCKED: "safeLocked"
};

let currentState = GameState.IDLE;


// CORE VARIABLES

let clickCount = 0;
const maxStage = 5;
let dialogueIndex = 0;


let safeClicked = false;

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
  }


  playAnimation(animationSrc) {
    if (this.image && animationSrc) {
      this.image.src = animationSrc;
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

    case GameState.SAFE_LOCKED:
      // Deactivate safe clicking

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
    spawnCharacters();
    currentState = GameState.DIALOGUE;
    advanceDialogue();
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


function handleDialogueClick() {
  advanceDialogue();

  // if (activeSpeaker) {
  //   const spoke = activeSpeaker.speak();

  //   // simple speaker switching 
  //   if (!spoke && activeSpeaker === Noman) {
  //     activeSpeaker = Yesman;
  //     activeSpeaker.speak();
  //   }
  // }
}

function advanceDialogue() {
  if (dialogueIndex >= data.length) return;

  const entry = data[dialogueIndex];

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


  if (entry.Animations) {
  for (const charName in entry.Animations) {
    const animSrc = entry.Animations[charName];

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
    "./drawings/yesman/yesman P.jpg"
  );

  Mommo = new Character(
    "Mommo",
    "./drawings/mommo/mommo P.jpg"
  );

   // Now that we *have* instances, update the lookup:
  characters.Noman = Noman;
  characters.Yesman = Yesman;
  characters.Mommo = Mommo;
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