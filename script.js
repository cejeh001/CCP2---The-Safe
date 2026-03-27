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

const DialogueRoute = {
  DATA: data,
  FAIL:fail,
  SUCCESS: success
};

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
let currentDialogue = DialogueRoute.DATA;

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

// QTE VARIABLES
let qteActive = false;
let qteSuccess = false;
let qteTimer = null;
let qteAnimationFrame = null;
let qteStartTime = null;
let qteDuration = 2000; // How long the QTE lasts (milliseconds)
let qteTarget = null;
let qteContainer = null;

// QTE animation parameters
let qteStartX = -150; // Start off-screen left
let qteEndX = null;   // Will be set based on screen width
let qteY = null;      // Will be set randomly
let qteElement = null;

const safe = document.getElementById("safe");
const clickText = document.getElementById("click-count");
const dialogueBox = document.getElementById("dialogue-box");
// const characterContainer = document.getElementById("character-container");

function setSafeAnimation(src) {
  if (!src) return;
  safe.src = src;
}

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
  if (this.image && this.image.src !== animationSrc) {
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
  console.log("STATE:", currentState, "CLICKS:", clickCount, "separate clicks:", separateClickCount);
  console.log("CLICK WORKED", currentState, dialogueIndex);

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
      break;

    case GameState.QTE:
      handleQTEClick();
      break;

    case GameState.RESULT_SUCCESS:
      currentDialogue = DialogueRoute.SUCCESS;
      advanceDialogue();
      break;

    case GameState.RESULT_FAIL:
      currentDialogue = DialogueRoute.FAIL;
      advanceDialogue();
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

// this is the point in the dialogue index where the separate state will activate
let separateDialogueMark = 53;


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

function handleQTEClick() {
  if (!qteActive) return;

  qteSuccess = true;
  endQTE();
}

function advanceDialogue() {
  if (dialogueIndex >= currentDialogue.length) return;
  
  // Check if this dialogue entry should trigger QTE
  const entry = currentDialogue[dialogueIndex];
  
  // Add QTE trigger check - you can mark specific dialogue entries to trigger QTE
  if (entry.TriggerQTE === true) {
    triggerQTE();
    dialogueIndex++;
    return;
  }
  
  if (dialogueIndex === separateDialogueMark) currentState = GameState.SEPARATE;
  // if (dialogueIndex === closeTabMark) {
  //   currentState = GameState.TAB_WARNING;
  //   startTabCountdown();
  //   return;
  // }

  // const entry = currentDialogue[dialogueIndex];

  let speaker = characters[entry.Character];

  if (entry.Character === "Noman") speaker = Noman;
  if (entry.Character === "Yesman") speaker = Yesman;
  if (entry.Character === "Mommo") speaker = Mommo;

  // if there is no speaker, move on
  if (!speaker) {
    dialogueIndex++;
    return;
  };

  

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

      // 👇 HANDLE SAFE HERE
      if (charName === "Safe") {
        setSafeAnimation(animSrc);
        continue;
      }

      const char = characters[charName];

      if (char) {
        char.spawn();
        char.playAnimation(animSrc);
        }
    }
  }

  // speaker.spawn();
  // speaker.speak(entry.Dialogue);

  if (entry.Character === "Safe") {
    addDialogue("Safe", entry.Dialogue);
  } else {
    speaker.spawn();
    speaker.speak(entry.Dialogue);
    dialogueIndex++;
  }
  
}

// function for checking animation. Not every object has a character speaking,
// which causes a freeze. If there is no speaker or dialogue, it should move onto the object's animation instead.never mind
// i'll just make the safe another character.

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
    dialogueIndex = 59;
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

// character urging timing function
// check if separate click is increasing in a certain amount of time
// if so, do nothing
// if it isn't, urge
// function urgeTimer(){

//   if (isUrging){
//     return;
//   }

//   if (!isUrging) {
//     isUrging = true;
//     urgeTimer = setTimeout(() => {
//       if (separateClickCount === separateClickCount){
//         urge();
//         isUrging = false;
//       }
//     }, 3000);
//   }
// };

// function openSafe(video) {
//   const actualVideo = document.createElement("video");
//   actualVideo.id = "openSafe";
//   actualVideo.src = video;
//   actualVideo.autoplay = true;
//   actualVideo.onended = () => {
//     actualVideo.remove();
//     currentState = GameState.DIALOGUE;
//     advanceDialogue();
//   };
//   document.getElementById("game-container").appendChild(actualVideo);
  
// }

function openSafe(video) {
  const vid = document.createElement("video");
  vid.src = video;
  vid.autoplay = true;

  vid.addEventListener("ended", () => {
    vid.remove();

    currentState = GameState.DIALOGUE;
    dialogueIndex = 60;
    // advanceDialogue(); // continues from SAME index
  });

  document.getElementById("game-container").appendChild(vid);
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
// QTE variables moved to top with other core variables

// QTE FUNCTIONS

// Function to initialize QTE elements
function initQTE() {
  qteContainer = document.getElementById("qte-container");
  qteElement = document.getElementById("qte-target");
  
  if (!qteElement) {
    console.error("QTE element not found!");
    return;
  }
  
  // Add click handler to the QTE target
  qteElement.addEventListener("click", (e) => {
    e.stopPropagation();
    if (qteActive) {
      qteSuccess = true;
      endQTE();
    }
  });
}

// Function to trigger QTE from anywhere in your game
function triggerQTE() {
  if (currentState === GameState.QTE) return; // Already in QTE
  
  currentState = GameState.QTE;
  startQTE();
}

function startQTE() {
  console.log("Starting QTE...");
  
  qteActive = true;
  qteSuccess = false;
  
  // Set random Y position (between 20% and 80% of screen height)
  const windowHeight = window.innerHeight;
  qteY = Math.random() * (windowHeight * 0.6) + (windowHeight * 0.2);
  
  // Set end X position (right side of screen)
  qteEndX = window.innerWidth + 100;
  
  // Position the QTE target
  qteElement.style.top = qteY + "px";
  qteElement.style.left = qteStartX + "px";
  
  // Show the container
  qteContainer.style.display = "block";
  
  // Start animation
  qteStartTime = performance.now();
  animateQTE(qteStartTime);
  
  // Set timeout to end QTE if player doesn't click
  qteTimer = setTimeout(() => {
    if (qteActive) {
      endQTE();
    }
  }, qteDuration);
}

function animateQTE(now) {
  if (!qteActive) return;
  
  const elapsed = now - qteStartTime;
  const progress = Math.min(elapsed / qteDuration, 1);
  
  // Easing function for smooth movement (ease-out)
  const easeOut = 1 - Math.pow(1 - progress, 3);
  
  // Calculate current X position
  const currentX = qteStartX + (qteEndX - qteStartX) * easeOut;
  
  // Update element position
  qteElement.style.left = currentX + "px";
  
  // Optional: Add scaling effect as it moves
  const scale = 1 + progress * 0.5; // Grows slightly as it moves
  qteElement.style.transform = `scale(${scale})`;
  
  // Continue animation if still active and not finished
  if (progress < 1 && qteActive) {
    qteAnimationFrame = requestAnimationFrame(animateQTE);
  } else if (progress >= 1 && qteActive) {
    // Reached the end without being clicked
    endQTE();
  }
}

function endQTE() {
  console.log("Ending QTE. Success:", qteSuccess);
  
  if (!qteActive) return;
  
  qteActive = false;
  
  // Clean up
  if (qteTimer) {
    clearTimeout(qteTimer);
    qteTimer = null;
  }
  
  if (qteAnimationFrame) {
    cancelAnimationFrame(qteAnimationFrame);
    qteAnimationFrame = null;
  }
  
  // Hide QTE container
  if (qteContainer) {
    qteContainer.style.display = "none";
  }
  
  // Reset element position and transform
  if (qteElement) {
    qteElement.style.left = "";
    qteElement.style.transform = "";
  }
  
  // Change state based on success/failure
  if (qteSuccess) {
    console.log("QTE Success! Transitioning to RESULT_SUCCESS");
    currentState = GameState.RESULT_SUCCESS;
    currentDialogue = DialogueRoute.SUCCESS;
    dialogueIndex = 0;
    advanceDialogue();
  } else {
    console.log("QTE Failed! Transitioning to RESULT_FAIL");
    currentState = GameState.RESULT_FAIL;
    currentDialogue = DialogueRoute.FAIL;
    dialogueIndex = 0;
    advanceDialogue();
  }
}

// Add window resize handler to recalculate QTE positions
window.addEventListener('resize', () => {
  if (qteActive) {
    // If QTE is active, recalculate end position
    qteEndX = window.innerWidth + 100;
  }
});

// Call init when the page loads
document.addEventListener('DOMContentLoaded', () => {
  initQTE();
});

// function startTabCountdown() {
//   let timeLeft = 3;

//   tabTimer = setInterval(() => {
//     if (currentState !== GameState.TAB_WARNING) {
//       clearInterval(tabTimer);
//       return;
//     }

//     if (timeLeft > 0) {
//       showCountdown(timeLeft); // update UI text
//       timeLeft--;
//     } else {
//       clearInterval(tabTimer);
//       triggerQTE();
//     }
//   }, 1000);
// }

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