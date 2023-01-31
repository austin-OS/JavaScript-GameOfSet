# Welcome to Set (Again)!

This is browser-based adaptation of our [previous Ruby-based implementation of Set](https://github.com/cse3901-2022au-giles/team4-project2), written using JavaScript, HTML, and CSS.

## Table of Contents
1. [Overview](#overview)
    1. [The Game of Set](#the-game-of-set)
    2. [Included Features](#included-features)
    3. [Possible Improvements](#possible-improvements)
    4. [Technologies Used](#technologies-used)
2. [Player Guide](#player-guide)
    1. [Starting the Program](#starting-the-program)
    2. [Pre-Game Setup](#pre-game-setup)
    3. [Main Game Loop](#main-game-loop)
    4. [Ending the Game](#ending-the-game)
3. [Code Guide](#code-guide)
    1. [The Main Program](#the-main-program)
    2. [The Model](#the-model)
    3. [The View and Controller](#the-view-and-controller)
    4. [Test Suites](#test-suites)
    5. [Other Files](#other-files)
    6. [Documentation and Style](#documentation-and-style)
4. [Credits](#credits)
5. [References](#references)

## Overview

### The Game of Set

[We already wrote about this in the README for our previous implementation of the game.](https://github.com/cse3901-2022au-giles/team4-project2#the-game-of-set) The conceptual details are all the same, with the only differences coming in the form of how we go about implementing them.

### Included Features

We tried to add more-or-less the same set of [features](https://github.com/cse3901-2022au-giles/team4-project2#included-features) that were present in our previous implementation. The status of each of them is as follows:

#### Real-Time Multiplayer

Hotkeys are back, and better than ever because you can now register any key, not just ones that correspond to a text character.

![](https://cdn.discordapp.com/attachments/1019067030663598080/1037020900836507708/unknown.png)

And that we means we were also able to re-implement:

#### Support For Arbitrary Player Counts

![](https://cdn.discordapp.com/attachments/1019067030663598080/1037027510032019527/unknown.png)

Not much needs to said about this one.

#### A GUI

This part was almost a given. It's probably harder to implement a web-based game that *doesn't* have one.

This is also a notable area of improvement over the previous version in that, as you may have noticed from the screenshots, the pre-game menu is also GUI-based now, rather than us doing that weird thing where we start in the console and then launch a window.

#### Adjustable Time Limits

Time limits are back, and this time you can also set the limit for how long a player has to form a set once they make a call, which probably doesn't make as much of a difference but is still neat.

![](https://cdn.discordapp.com/attachments/1019067030663598080/1037028550919852162/unknown.png)

#### 5-Attribute Mode

This part unfortunately didn't make it, though perhaps that's not too big of a loss since it was close to unplayable anyways.

The reason is that, for expedience, we ended up using a set of PNGs downloaded from the internet to render our card faces instead of attempting to procedurally generate them, which limits our ability to make modifications to the attribute set.

#### Hint Button

We did add this new feature to partially make up for that, and depending on how proficient you are may be either more or less useful.

![](https://cdn.discordapp.com/attachments/1019067030663598080/1037031412748001322/unknown.png)

### Possible Improvements

Same as [last time](https://github.com/cse3901-2022au-giles/team4-project2/tree/Scroing#possible-improvements), except now there's also the possibility of re-implementating 5-attribute mode and 3-attribute mode.

### Technologies Used

This project was written using vanilla JavaScript for the program logic and HTML and CSS for visuals.

## Player Guide

### Starting the Program

Once you have cloned or otherwise downloaded the contents of this repository, the program can be run by simply opening **"set.html"** in the browser.

### Pre-Game Setup

Upon launching the page, the user enters a menu that allows them to configure the player list and the time limits. Player names can be set by changing the contents of the corresponding textbox, and hotkeys can be set by pressing the "Register Hotkey" or "Change Hotkey" button and then pressing the key to use. The rest of the buttons and inputs should be mostly self-explanatory.

![](https://cdn.discordapp.com/attachments/1019067030663598080/1037026270116065351/unknown.png)

Once all players have hotkeys, the game can be started.

### Main Game Loop

This part is essentially the same [as it was](https://github.com/cse3901-2022au-giles/team4-project2#main-game-loop). Press a hotkey to claim a set, click on cards to form the set, receive points if you form a valid set, receive a penalty if you run out of time or select an invalid set, and so on until either the game's time limit is reached or no more sets can be formed from the remaining cards. The only notable differences are that the UI looks slightly different and that the scoring has been simplified to involve the player either receiving 1 point or losing 1 point in any event.

![](https://cdn.discordapp.com/attachments/1019067030663598080/1037029885820010546/unknown.png)

### Ending the Game

Once the end conditions are reached, the user is taken to a screen that displays the standings and the time taken and contains a button to go back to the pre-game setup menu.

![](https://cdn.discordapp.com/attachments/1019067030663598080/1037029812411314357/unknown.png)

The menu also will remember the player list and the configured settings, making replays more convenient. The fact that replays are possible at all without having to relaunch the program marks another improvement over the previous version, where the program would terminate due to the fact that we could figure out how to close the Ruby2D window without also stopping execution on the console.

## Code Guide

### The Main Program

The **"set.html"** file is the entry point for the program, as mentioned earlier. It imports the CSS file and all of the JavaScript files but contains relatively little content itself, with almost all of the UI elements generated in the JavaScript code.

### The Model

The back-end code was almost directly copied and translated from [the Ruby version](https://github.com/cse3901-2022au-giles/team4-project2#the-model), and is present in the **"Model"** directory. 

The main difference is that each of the kernel and secondary classes have been directly consolidated into a single class instead of being combined through inheritance, while the CardUtility module has become the standalone cardUtility object, to simplify the design and avoid having to deal with the quirks of JavaScript's OOP model.

### The View and Controller

For expedience, the code responsible for both rendering the on-screen UI elements and handling user interaction with them was consolidated. The **"pregameMenu.js"** and **"gameScreen.js"** files in the **"View"** directory handle both view and controller functionality for the main menu and the in-game UI, respectively. The **"main.js"** file on the top level acts as the starting point for the program, and currently simply consists of a call to render the menu in the document body.

Also for expedience, the implementation of the view and the controller is procedural rather than object-oriented, consisting of a collection of functions and a collection of global variables. Perhaps it's not best-practice, but refactoring and reorganizing the code would not be too difficult.

As mentioned earlier, the faces of the cards themselves are generated by displaying PNG files rather than through procedural generation like in the previous version. The image files can be found under the **"card_images_v2"** directory, with the original **"card_images"** directory also containing images but with the faces mismatched to the card IDs.s

Some of the styling is applied dynamically in the JavaScript code, but parts that remain constant throughout the program's run are defined statically in the **"style.css"** file.

### Test Suites

Unit testing was done using the **Jest** testing framework. Testing was performed on the Card and CardUtility classes found in **Model/card.js** and **Model/cardUtility.js** to ensure that the the card methods for recieving and modifying information of a card object is functional.

To use the test suites, you must have a few different programs installed. The first of which is Node.js. To install Node.js, enter the following command.
```
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install 16 --lts
```
You also must have Jest installed globally, which can be done with the following command.
```
npm install -g jest
```
After that, relocate your working directory to the Testing directory. You should see the file **card.test.js**. This is the file that contains the test suites. Once inside the testing directory, you can run the tests in **card.test.js** with the following command.
```
npm test
```
The result of the test cases should run in the terminal, showing you how many tests ran, how many of those tests passed, and what the cause of any test failures were.

### Other Files

The **"globalConstants.js"** file contains an object listing all global constant values used in the main program, including the full attribute set, the number of cards per set, the number of cards initially dealt, the time limit for identifying a set, and the sizes and margins for the interface areas, among other things.

The **"Unused"** directory contains all files that are not utilized by the main program in the final implementation. It several driver programs used in earlier test version of the game.

### Documentation and Style

The long-form documentation comments on the Model classes have been copied almost word-for-word from the Ruby implementation. Documentation on other classes and procedures was written in less detail for expedience, but is still present.

When writing our JavaScript code, we attempted to follow [the same style guide used by the Mozilla Developer Network (MDN)](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Writing_style_guide/Code_style_guide/JavaScript).

## Credits

This project was developed by:
- **[Thomas Li](https://github.com/li11315-osu)**
- **[Canaan Porter](https://github.com/CPort28)**
- **[Austin Greer](https://github.com/austin-OS)**
- **[Alvin Ishimwe](https://github.com/ai003)**

## References
- The repository for our previous implementation of Set: https://github.com/cse3901-2022au-giles/team4-project2 
- MDN's JavaScript Style Guide: https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Writing_style_guide/Code_style_guide/JavaScript