//
// Created by Thomas Li
// Originally Written in Ruby 7 September 2022
// Translated to JavaScript 28 October 2022
//

////
// This is a Ruby-to-JavaScript translation of the PlayerState
// class family in our initial implementation of the game of Set, 
// which can be seen at:
// https://github.com/cse3901-2022au-giles/team4-project2.
// 
// All code and documentation comments below this paragraph have 
// been copied and adapted from the player_state_kernel.rb, 
// player_state_secondary.rb and player_state.rb files from the 
// original repository.

////
// This class represents a single player in a game of Set.
//
// Mathematical Model:
//
//   Include the model for Card and GameState
//
//   this = (game_state, id, name, cards, penalties) :
//   (GameState, int, string of char, string of Card, int)
//
//   [i.e. the abstract state consists of a reference to the
//   state of the game that the player is in, the identification
//   fields (a numeric ID and a verbal name), and the basic
//   information needed for scorekeeping (a record of all cards
//   received and a penalty counter)]
//
//   Invariants:
//   |this.cards| = |set(this.cards)|
//   [i.e. all cards are distinct]
//   this is in set(this.game_state.player_list)
//   [i.e. the reference to the game state is consistent both ways]
//
// Kernel methods:
//   initialize(game_state, id, name)
//   receiveCard(card)
//   receivePenalty(amount = 1)
//   getGameState
//   getId
//   getName
//   getCards
//   numPenalties
//
// Secondary methods:
//   callSet
//   getDeck
//   numCards
class PlayerState {

  // pointer to corresponding GameState object
  gameState;
  // numeric ID
  id;
  // verbal screen name
  name;
  // All card groups in the player and game states are
  // represented with the Deck class in the concrete state for
  // consistency and to make it easier to maintain the
  // invariants
  // Correspondence: ~this.cards.card_list = this.cards
  cards;
  // penalty counter
  penalties;

  ////
  // Initialize a player object given a reference to the state
  // object for the game that the player will be in, along with
  // the player's ID and name, assigning the parameters to
  // their corresponding fields while setting everything else
  // to their starting values.
  //
  // @param gameState : GameState
  // @param id : int
  // @param name : string of char
  // @ensures
  //   this.game_state = gameState
  //   this.id = id
  //   this.name = name
  //   this.cards = <>
  //   this.penalties = 0
  constructor(gameState, id, name) {
    this.gameState = gameState;
    this.id = id;
    this.name = name;
    this.cards = Deck.new(gameState.getAttributeSet());
    this.penalties = 0;
  }

  ////
  // Add the given card to the player's hand, unless it's
  // already there, in which case it does nothing
  //
  // @param card : Card
  // @ensures
  //   set(this.cards) = {card} union set(//this.cards)
  receiveCard(card) {
    this.cards.addToTop(card);
  }

  ////
  // Increases the player's penalty counter by the specified
  // amount, incrementing it by default
  //
  // @param amount : int
  // @ensures
  //   this.penalties = //this.penalties + amount
  receivePenalty(amount = 1) {
    this.penalties += amount;
  }

  ////
  // Accessor for this.gameState
  getGameState() {
    return this.gameState;
  }

  ////
  // Accessor for this.id
  getId() {
    return this.id;
  }

  ////
  // Accessor for this.name
  getName() {
    return this.name;
  }

  ////
  // Accessor for this.cards
  getCards() {
    return this.cards.getCardList();
  }

  ////
  // Indicate to the game state that the player sees a set
  // and wants to claim it. Essentially a wrapper for the
  // corresponding method in the GameState interface but
  // with the player parameter encapsulated for a bit of
  // extra convenience.
  //
  // @ensures
  //   if //this.game_state.active_player = null
  //     this.game_state.active_player = this
  callSet() {
    this.gameState.handleSetCall(this);
  }

  ////
  // Return the player's hand of cards in the form of a
  // Deck object, potentially allowing for more convenient
  // manipulation if the class becomes more complex, with
  // the ordering consistent with that of the list
  // representation of the player's cards.
  //
  // @ensure
  //   getDeck = (this.game_state.attribute_set, this.cards)
  getDeck() {
    return this.cards;
  }

  ////
  // Return number of cards in player's hand, as a shorthand
  // for situations where this is all of the information
  // that's needed.
  //
  // @ensure
  //   num_cards = |this.cards|
  getNumCards() {
    return this.cards.size;
  }

}