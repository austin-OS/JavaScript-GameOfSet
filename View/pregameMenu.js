// This file contains all methods for generating and handling
// user interaction with the main menu, which also contains the
// pre-game setup interface

// reference to HTML element to render in
let menuParentElement = null;
// other UI elements
let headerBox = null;
let addPlayerBox = null;
let settingsBox = null;
let startButtonBox = null;

// indicator of whether the game can be started
let canStartGame = false;

// current player list, including names and hotkeys
let players = [
  {name: 'Player 1', hotkey: null}
];

// index in player list for player currently trying to register
// a hotkey - set to null if none are
let playerRegisteringHotkey = null;

// settings values
let currentSettings = {
  gameTimeLimit: 0,
  setFormationTimeLimit: 10
}

// set up interface area 
function initPregameMenu(parent) {
  menuParentElement = parent;
  menuParentElement.innerHTML = "";

  // add header element
  headerBox = document.createElement("div");
  menuParentElement.appendChild(headerBox);

  // set grid layout for setup interface areas
  menuGrid = document.createElement("div");
  menuParentElement.appendChild(menuGrid);
  menuGrid.style.display = "grid";
  menuGrid.style.gridTemplateColumns = "0.6fr 0.4fr"

  // add containers for setup interface to grid
  addPlayerBox = document.createElement("div");
  settingsBox = document.createElement("div");
  menuGrid.appendChild(addPlayerBox);
  menuGrid.appendChild(settingsBox);

  // add container for start button
  startButtonBox = document.createElement("div");
  menuParentElement.appendChild(startButtonBox);

  // render element contents
  renderMenuHeader();
  renderAddPlayerBox();
  renderSettingsBox();
  renderStartButton();

  // set event listener for registering hotkeys
  window.onkeyup = (e) => {
    if (playerRegisteringHotkey != null) {
      if (playerRegisteringHotkey >= players.length) {
        // check if indicator is in range
        playerRegisteringHotkey = null;
      }
      else if (!players.map((p) => p.hotkey).includes(e.key) || players[playerRegisteringHotkey].hotkey == e.key) {
        // record input key as hotkey unless it's already taken
        players[playerRegisteringHotkey].hotkey = e.key;
        // clear indicator and redisplay player listings
        playerRegisteringHotkey = null;
        renderPlayerListings();
      } else {
        window.alert(`Hotkey ${e.key} already taken`);
      }
    }
  }
}

// functions for rendering elements
function renderMenuHeader() {
  // add the header itself if it's not already there
  if (headerBox.innerHTML == "") {
    let menuHeader = document.createElement("h1");
    menuHeader.id = "menuHeader";
    menuHeader.textContent = "Welcome to Set!";
    headerBox.appendChild(menuHeader);
  }
}
function renderAddPlayerBox() {
  // add content areas if they're not already present
  if (addPlayerBox.innerHTML == "") {
    // header text
    let headerText = addPlayerBox.appendChild(document.createElement("h2"));
    headerText.textContent = "Players";
    let subheaderText = addPlayerBox.appendChild(document.createElement("p"));
    subheaderText.textContent = "Add as many as you'd like. Each player picks a \"hotkey\" that, when pressed, allows them to call a set."

    // container for player listings
    let playerListings = addPlayerBox.appendChild(document.createElement("ol"));
    playerListings.id = "playerListings";
    renderPlayerListings();

    // button to add player
    let addPlayerButton = addPlayerBox.appendChild(document.createElement("button"));
    addPlayerButton.addEventListener("click", () => {
      players.push({name: "", hotkey: null});
      renderPlayerListings();
    })
    addPlayerButton.textContent = "Add a Player";
  }
}
function renderPlayerListings() {
  // helper function to render the list of players currently
  // added, including the textboxes for editing the names
  // and the button for registering hotkeys

  // adjust number of displayed listings to match internal state
  let playerListings = document.getElementById("playerListings");
  while (playerListings.childNodes.length < players.length) {
    let newListing = playerListings.appendChild(document.createElement("li"));
    newListing.innerHTML = `
    <p>
      Name: <input type="text" class="nameInput"></input> 
      Hotkey: <span class="listedHotkey"></span>
    </p>
    <p>
      <button class="addHotkeyButton">Register Hotkey</button> 
      <button class="removePlayerButton">Remove Player</button>
    </p>
    `;
  }
  while (playerListings.childNodes.length > players.length) {
    playerListings.removeChild(playerListings.lastChild);
  }
  // sync contents of each displayed listing with the
  // corresponding internal values
  for (let i = 0; i < playerListings.childNodes.length; ++i) {
    let listing = playerListings.childNodes[i];
    // set name textbox
    let nameInput = listing.querySelector(".nameInput");
    if (nameInput.value != players[i].name) {
      nameInput.value = players[i].name;
    }
    nameInput.onkeyup = () => {
      players[i].name = nameInput.value;
    }
    // set listed hotkey
    let listedHotkey = listing.querySelector(".listedHotkey");
    let hotkeyText = (players[i].hotkey == null ? "[none]" : players[i].hotkey);
    listedHotkey.textContent = hotkeyText;
    // set "register hotkey" button
    let addHotkeyButton = listing.querySelector(".addHotkeyButton");
    if (playerRegisteringHotkey != i) {
      addHotkeyButton.textContent = (players[i].hotkey == null ? "Register Hotkey" : "Change Hotkey");
      addHotkeyButton.onclick = () => {
        playerRegisteringHotkey = i;
        renderPlayerListings();
      }
      addHotkeyButton.disabled = false;
    } else {
      addHotkeyButton.textContent = "Press any key to select it as your hotkey";
      addHotkeyButton.disabled = true;
    }
    // set "remove player" button
    let removePlayerButton = listing.querySelector(".removePlayerButton");
    if (players.length == 1) {
      removePlayerButton.disabled = true;
    } else {
      removePlayerButton.disabled = false;
      removePlayerButton.onclick = () => {
        players.splice(i, 1);
        renderPlayerListings();
      }
    }
    // also redisplay the start button'
    renderStartButton();
  }

}
function renderSettingsBox() {
  // add content areas if they're not already present
  if (settingsBox.innerHTML == "") {
    // header text
    // let headerText = settingsBox.appendChild(document.createElement("h2"));
    // headerText.textContent = "Settings";

    // inserting HTML in a string because it's half past midnight
    // on Monday and I'm getting lazy
    settingsBox.innerHTML = `
    <h2> Settings </h2>
    <p>
      Time limit for a full game, in seconds (set to 0 for unlimited)
      <input type="number min="0" id="gameTimeLimitInput"></input>
    </p>
    <p>
      Time limit for a set call, in seconds (set to 0 for unlimited - not recommended for obvious reasons)
      <input type="number" min="0" id="setFormationTimeLimitInput"></input>
    </p>
    `;
  }
  // set input box for game time limit
  let gameTimeLimitInput = document.getElementById("gameTimeLimitInput");
  gameTimeLimitInput.value = currentSettings.gameTimeLimit;
  gameTimeLimitInput.oninput = () => {
    currentSettings.gameTimeLimit = gameTimeLimitInput.value;
  };
  // set input box for set formation time limit
  let setFormationTimeLimitInput = document.getElementById("setFormationTimeLimitInput");
  setFormationTimeLimitInput.value = currentSettings.setFormationTimeLimit;
  setFormationTimeLimitInput.oninput = () => {
    currentSettings.setFormationTimeLimit = setFormationTimeLimitInput.value;
  };
}
function renderStartButton() {
  // add the button itself if it's not already there
  let startButton = null;
  let startButtonID = "startButton";
  if (startButtonBox.innerHTML == "") {
    startButton = document.createElement("button");
    startButton.id = startButtonID;
    startButton.addEventListener("click", () => {
      if (canStartGame) {
        window.onkeyup = null; // clear event listener
        initGameScreen(menuParentElement, players, currentSettings);
      }
    });
    startButtonBox.appendChild(startButton);
  } else {
      startButton = document.getElementById(startButtonID);
  }

  // only enable button if at least proper setup has been
  // completed
  if (players.length == 0) {
    canStartGame = false;
    startButton.textContent = "Add At Least One Player Before Starting";
  }
  else if (!players.every((p) => p.hotkey != null) || playerRegisteringHotkey != null) {
    canStartGame = false;
    startButton.textContent = "Register a Hotkey for Each Player Before Starting";
  } else {
    canStartGame = true;
  }

  if (canStartGame) {
    startButton.textContent = "Start Game";
    startButton.disabled = false;
  } else {
    startButton.disabled = true;
  }
}