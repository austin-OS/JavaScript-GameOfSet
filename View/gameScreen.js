// This file contains all methods for generating and handling
// user interaction with the in-game UI

// globally used variables
// set of all possible attributes that can be assigned to 
// cards that can be used in the game
let attributes = {
number: ['one', 'two', 'three'],
pattern: ['solid', 'striped', 'open'],
color: ['red', 'green', 'purple'],
shape: ['diamond', 'squiggle', 'oval']
};
let cardsPerSet = 3;            // the number of cards needed to form a set
let initialFaceUpCards = 12;    // the inital number of cards to be dealt
let cardsSelected = 0;          // the tracker for how many cards have been selected
let faceDownCards = new Array;  // the array of cards that have not yet been dealt
let faceUpCards = new Array;    // the array of all cards that are currently being displayed
let selectedCards = new Array;  // the array of cards that are currently selected
let totalNumCards = 81;         // the number of cards to be played with (standard 81 for a functional game, other for testing)

let playerScores = [];
let activePlayerIndex = null;

// HTML element that all UI elements are rendered in
// gets assigned on initGameScreen function
let gameParentElement = null; 

var timer = null;
var timer_feature;
var startingTime = 0;
var totalTime = null; 
var currentTime = null;
let gameTimeLimit;
let setFormationTimeLimit;
let setFormationStartTime;
const timeFormat = num => num.toString().padStart(2, '0'); // Allows the time to stay in the right format (Hours:Minutes:Seconds)
const hhmmss = seconds => timeFormat(Math.floor(seconds / 3600)) + ":" + timeFormat(Math.floor(seconds / 60) % 60) + ":" + timeFormat(seconds % 60);


//                                       List of functions
//      checkGameEnd(): Checks if there are no cards left to deal and no possible sets to be formed. If this is true it will
//  take you to the game over screen.
//      renderCards(faceUpCards): Given an array of the IDs of the face up cards, this will create canvases for each of the
//  cards and draw the correct card face.
//      idListToCardList(cardIDs): Given an array of card IDs, this returns a list of the associated card objects.
//      checkDealExtraCards(cardIDList): Given an array of card IDs, this checks if any possible sets can be made and if not will deal 3 new cards
//  if there are cards left in the deck to be dealt.
//      renderScoreboard(): Writes a paragraph on the screen displaying the player's score.
//      processCardClick(): The function used to handle a click to one of the cards on the screen. This will select/deselect a card when clicked.
//      If 3 cards have been selected, then it also processes whether it is a set or not and modifies the decks accordingly.
//      createEventListeners(): Assigns an event listener to each canvas on the page

// handle full process of generating on-screen HTML elements
// and setting event and interval handlers in order to allow
// game start
function initGameScreen(parent, playerList, settings) {
  // populate content box with element containers
  gameParentElement = parent;
  gameParentElement.innerHTML = `
  <div class="float-container">
  <div id="cards"></div>
  <div id="scoreboard"></div>
  <br>
    <button id="quitButton" onclick="quitButton()">Quit Game</button>
  </div>
  <div id="statBox">
    <div id="cardCounter"></div>
    <div id="setCallTimer"></div>
  </div>
  <h1 id="gameTimer">Game Timer: </h1>
  <button onclick="hintButton()">Need a hint?</button>
  <div id="hintBox" style = "display: none"></div>
  <div id="messageBox">
  </div>
  `;

  // record settings values
  gameTimeLimit = settings.gameTimeLimit;
  if (gameTimeLimit <= 0) {
    gameTimeLimit = null;
  }
  setFormationTimeLimit = settings.setFormationTimeLimit;
  if (setFormationTimeLimit <= 0) {
    setFormationTimeLimit = null;
  }

  // Set up timer
  timer = document.getElementById("gameTimer"); // identify timer element
  startingTime = new Date().getTime(); // Gets the current time to start the timer with
  totalTime = null;

  // This allows the timer feature to work
  // We need to finish this by setting totalTime when the last set is completed
  timer_feature = setInterval(intervalHandler, 100);

  // setting up the game board
  // creating the initial deck of cards (card IDs 1-81)
  for (let i = 0; i < totalNumCards; i++) {
    faceDownCards[i] = i;
  }

  // shuffling cards
  for (let i = faceDownCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [faceDownCards[i], faceDownCards[j]] = [faceDownCards[j], faceDownCards[i]];
  }

  // getting the first 12 cards from the shuffled deck
  faceUpCards = [];
  for (let i = 0; i < initialFaceUpCards; i++) {
    let card = faceDownCards.shift();
    faceUpCards.unshift(card)
  }
  renderCards(faceUpCards);
  createEventListeners();

  // set up player states
  playerScores = [];
  playerList.forEach((p) => {
    playerScores.push({
      name: p.name,
      hotkey: p.hotkey,
      score: 0
    })
  })
  activePlayerIndex = null;

  //initializing scoreboard
  renderScoreBoard();

  //checking if no sets can be formed and dealing new sets if so
  checkDealExtraCards(faceUpCards);

  // set initial message
  document.getElementById("messageBox").innerHTML = `
  <p> The game has begun. If you see a set, press your hotkey to claim it. </p>
  `;
}

// to be called in split-second intervals to handle timers
function intervalHandler() {
  if (totalTime === null)  {
    var now = new Date().getTime();
    var total_time = now - startingTime;
    var seconds = Math.floor(total_time / 1000);
    currentTime = hhmmss(seconds);
    timer.innerHTML = "Current Game Time: " + currentTime;
    // check time limit on set call if applicable
    if (setFormationTimeLimit != null && activePlayerIndex != null && setFormationStartTime != null) {
      let setFormationTimeRemaining = setFormationTimeLimit - Math.floor((now - setFormationStartTime) / 1000);
      let activePlayer = playerScores[activePlayerIndex];
      if (setFormationTimeRemaining <= 0) {
        // penalize player and clear selection if out of time
        document.getElementById("setCallTimer").innerHTML = "";
        document.getElementById("messageBox").innerHTML = `
        <p>
          ${activePlayer.name} has run out of time. -1 set.
        </p>
        `;
        activePlayer.score--;
        activePlayerIndex = null;
        setFormationStartTime = null;
        clearSelection();
        renderScoreBoard();
      } else {
        // display time remaining otherwise
        document.getElementById("setCallTimer").innerHTML = `
        <p> ${setFormationTimeRemaining} seconds left to form a set </p>
        `;
      }
    } else {
      document.getElementById("setCallTimer").innerHTML = "";
    }
    // if game-wide time limit has been set, update remaining
    // time and check if it's expired
    if (gameTimeLimit != null) {
      let secondsRemaining = gameTimeLimit - seconds;
      timer.innerHTML = `Time Remaining: ${hhmmss(secondsRemaining)}`
      checkGameEnd();
    }
  } else {
    timer.style.color = "red";
    timer.innerHTML = "Total Time: " + totalTime;
  }
}

// checks if the game is over
function checkGameEnd() {
  let gameOver = false;
  let cardList = idListToCardList(faceUpCards);
  let sets = cardUtility.possibleSets(cardList, cardsPerSet);
  let now = new Date().getTime();
  if ((sets.length == 0 && faceDownCards.length == 0) || (gameTimeLimit != null && (now - startingTime) / 1000 > gameTimeLimit)) {
    // ending the game
    //console.log("Game Over");
    gameOver = true;
    // clear interval handler
    clearInterval(timer_feature);
    // clear keypress handler
    window.onkeydown = null;
    // record time
    totalTime = currentTime;
    // clearing all the html from the page
    gameParentElement.innerHTML = "";
    // display exit message
    let exitText = document.createElement("div");
    exitText.id = "gameOver";
    exitText.innerHTML = "<p>You have finished the game of set</p>\n";
    exitText.innerHTML += "<p>Final standings:</p>\n";
    exitText.innerHTML += `<ol id="standings"></ol>`;
    exitText.innerHTML += `<p>Your final game time was: ${totalTime}</p>`;
    gameParentElement.appendChild(exitText);    
    // display scoreboard, sorted in descending order of score
    playerScores.sort((a, b) => b.score - a.score).forEach((p) => {
      document.getElementById("standings").innerHTML += `
      <li>
      ${p.name} (hotkey ${p.hotkey}): ${p.score} Sets Formed
      </li>
      `;
    });
    // create button to return to menu
    renderReturnButton();
    
  }
  return gameOver;
}

// return to menu button
function renderReturnButton() {
  let returnButton = document.createElement("button");
    returnButton.textContent = "Return to Menu";
    returnButton.addEventListener("click", () => {
      initPregameMenu(gameParentElement);
    });
    gameParentElement.appendChild(returnButton);
}



// displays canvases for each card in play, assigns the cardID as the ID for each canvas
function renderCards(faceUpCards) {
  let x = document.getElementById("cards");
  x.innerHTML = '';
  // Setting up the HTML for each card
  for (let i = 0; i < faceUpCards.length; i++) {
    let cardID = faceUpCards[i];
    x.innerHTML += "<canvas id=\"" + cardID + "\"></canvas>";
    x.innerHTML += "<img id=\"source"+cardID+"\" style=\"display: none;\" src=\"card_images_v2/" +cardID+ ".png\"/>";
  }
  // Drawing the shapes to the card
  for (let i = 0; i < faceUpCards.length; i++) {
    let cardID = faceUpCards[i]
    let canv = document.getElementById(cardID);
    let ctx = canv.getContext("2d");
    let image = document.getElementById("source"+cardID);

    // image.addEventListener("load", (e) => {
    //     ctx.drawImage(image, 88, 54);
    // });

    // ctx.font = "40px serif";
    // ctx.fillText(cardID, 100, 75);
    //console.log("Wrote card: " + cardID);

    image.addEventListener("load", (e) => {
      ctx.drawImage(image, 88, 54);
    });

    // also update visible counts of cards in deck
    document.getElementById("cardCounter").innerHTML = `
    <p>
      ${faceUpCards.length + selectedCards.length} cards revealed, ${faceDownCards.length} cards left in the deck.
    </p>
    `;
  }

  // turning card ID list to card object list then printing the possible sets
  let onScreenCards = idListToCardList(faceUpCards);
  // FOR TESTING:
  //console.log(cardUtility.possibleSets(onScreenCards, cardsPerSet));
}

function idListToCardList(cardIDs) {
  let cardList = new Array;
  for (let i = 0; i < cardIDs.length; i++) {
      cardList[i] = cardUtility.idToCard(attributes, cardIDs[i]);
  }
  return cardList
}

// checks if there are any possible sets in the face up cards given the ID list. If not, it deals 3 more cards
function checkDealExtraCards(cardIDList) {
  let cardList = idListToCardList(cardIDList);
  let sets = cardUtility.possibleSets(cardList, cardsPerSet);
  if (sets.length == 0) {
    // dealing the next 3 cards in the face down deck
    for (let i = 0; i < cardsPerSet; i++) {
      if (faceDownCards.length > 0) {
        let card = faceDownCards.shift();
        faceUpCards.unshift(card);
      }
    }
    // render new set of cards
    renderCards(cardIDList);
    createEventListeners();
  }
  
}

function renderScoreBoard() {
  x = document.getElementById("scoreboard");
  x.innerHTML = "";
  x.innerHTML += "<h2> Scores </h2>";
  playerScores.forEach((p) => {
    x.innerHTML += `
    <p>
    ${p.name} (hotkey: ${p.hotkey}): ${p.score} sets
    </p>
    `;
  })
}

// toggles selection of a card when clicked
function processCardClick() {
  if (activePlayerIndex != null) {
    let activePlayer = playerScores[activePlayerIndex];

    // selects card if not selected, deselects if selected
    if(!selectedCards.includes(parseInt(this.id))) {
        // selects card
        // removing card from faceUpCards
        let index = faceUpCards.indexOf(parseInt(this.id));
        faceUpCards.splice(index, 1);
        // adding card to selected cards
        selectedCards.unshift(parseInt(this.id));
        this.style.border = '8px solid green';
    } else {
        // deselects card
        // removing card from selectedCards
        let index = selectedCards.indexOf(parseInt(this.id));
        selectedCards.splice(index, 1);
        // adding card to faceUpCards
        faceUpCards.unshift(parseInt(this.id));
        this.removeAttribute('style');
    }

    // FOR TESTING: 
    // console.log(idToCard(attributes, this.id));
    // console.log("Face Up Cards" + faceUpCards);
    // console.log("Selected Cards: " + selectedCards);

    let gameFinished = false;
    // checking if the number of cards to form a set has been selected
    if (selectedCards.length == cardsPerSet) {
        // determining if set is formed or not
        // creating card object list from card IDs
        let cardsToCheck = idListToCardList(selectedCards);
        if (cardUtility.isSet(cardsToCheck, cardsPerSet)) {
            // a set was formed
            let x = document.getElementById("messageBox");
            x.innerHTML = "";
            x.innerHTML = `A set was formed, that's +1 set for ${activePlayer.name}!`;

            let y = document.getElementById("hintBox");
            if (y.style.display === "block") {
            y.style.display = "none";
            }

            // giving player a point
            activePlayer.score++;

            // resetting selected cards
            selectedCards = [];

            // dealing the next 3 cards in the face down deck
            for (let i = 0; i < cardsPerSet; i++) {
                if (faceDownCards.length > 0) {
                    let card = faceDownCards.shift();
                    faceUpCards.unshift(card);
                }
            }

            // checking if game is over
            gameFinished = checkGameEnd();

            // runs to create the next round, only happens if game is not over
            if (!gameFinished) {
                // re rendering the card display
                renderCards(faceUpCards);
                createEventListeners();
                checkDealExtraCards(faceUpCards);
            }
        } else {
            // a set was not formed
            let mBox = document.getElementById("messageBox");
            mBox.innerHTML = "";
            mBox.innerHTML = `<p>A set was not formed, that is -1 set for ${activePlayer.name}. Try again</p>`
            mBox.innerHTML += "<p>The following attributes are mismatched: " + cardUtility.mismatchedAttributes(cardsToCheck) + "</p>";

            // decreasing player score
            activePlayer.score--;

            // clear selected cards
            clearSelection();
        }
        activePlayerIndex = null;
        setFormationStartTime = null;

        // re-rendering scoreboard
        if (!gameFinished) {
            renderScoreBoard();
        }
    }
  }  
}

// helper function to return selected cards to face-up deck
// and remove styling in case of unsuccessful set formation
function clearSelection() {
  // moving selected cards back to face up deck
  while (selectedCards.length > 0) {
    let card = selectedCards.shift();
    faceUpCards.unshift(card);
  }

  // removing selection styling for all canvases
  let x = document.getElementsByTagName("canvas");
  for (let i = 0; i < x.length; i++) {
      x[i].removeAttribute("style");
  }
}

// allows the player with the given hotkey to claim a set
function processHotkey(e) {
  // check if no other player is currently calling a set
  if (activePlayerIndex == null) {
    // check if hotkey is valid
    activePlayerIndex = playerScores.map((p) => p.hotkey).indexOf(e.key);
    //console.log(activePlayerIndex);
    if (activePlayerIndex < 0) {
      activePlayerIndex = null;
    } else {
      // indicator for active player has been set
      // update message box
      document.getElementById("messageBox").innerHTML = `
      <p>
        You're up, ${playerScores[activePlayerIndex].name}. Select ${cardsPerSet} cards to form a set.
      </p>`;
      // record current time to allow enforcement of time limit
      setFormationStartTime = new Date().getTime();
    }
  }
}

// Assigns event listeners to each card on the screen
function createEventListeners() {
  let x = document.getElementsByTagName("canvas");
  for (let i = 0; i < x.length; i++) {
    x[i].addEventListener("click", processCardClick, false);
  }
  window.onkeydown = processHotkey;
}

// This allows the hint button to show the number of possible sets if clicked.
function hintButton() {
  let currentCardsList = idListToCardList(faceUpCards);
  let hintNum = cardUtility.possibleSets(currentCardsList, cardsPerSet);
  var x = document.getElementById("hintBox");
  if (x.style.display === "none") {
    x.innerHTML = hintNum.length +" possible set(s)";
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

// functionality for the hint button to send the game to the exit menu
function quitButton() {

    // clearing all the html from the page
    gameParentElement.innerHTML = "";

    //creates new html for the exit page
    let quitMessage = document.createElement("div");
    totalTime = currentTime;
    quitMessage.id = "quitGame";
    quitMessage.innerHTML = "<p>You have quit the game of set</p>\n";
    quitMessage.innerHTML += "<p>Final standings:</p>\n";
    quitMessage.innerHTML += `<ol id="standings"></ol>`;
    quitMessage.innerHTML += `<p>Your final game time was: ${totalTime}</p>`;
    gameParentElement.appendChild(quitMessage);

    
      //output depending on if there was a higher score or not
      if(playerScores[0].score == playerScores[1].score) {
        document.getElementById("standings").innerHTML += 
        `<p> 
          There was a tie between ${playerScores[0].name} and ${playerScores[1].name}
        </p> `;
      } else {
        document.getElementById("standings").innerHTML += 
        `<p> 
          There highest score was ${playerScores[0].name}!
        </p> `;

      }
    
      
      
    

    renderReturnButton();

  
}
