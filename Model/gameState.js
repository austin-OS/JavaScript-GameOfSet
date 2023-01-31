//
// Created by Thomas Li
// Originally Written in Ruby 7 September 2022
// Translated to JavaScript 28 October 2022
//

////
// This is a Ruby-to-JavaScript translation of the GameState
// class family in our initial implementation of the game of Set, 
// which can be seen at:
// https://github.com/cse3901-2022au-giles/team4-project2.
// 
// All code and documentation comments below this paragraph have 
// been copied and adapted from the game_state_kernel.rb, 
// game_state_secondary.rb, and game_state.rb files from the 
// original repository.
//

////
// This class represents a single game of Set
//
// Mathematical Model:
//
//   Include the models for Card and PlayerState
//
//   this = (attribute_set, cards_per_set, player_list,
//   face_down_cards, face_up_cards, active_player,
//   selected_cards) : (map(name_t -> string of value_t), int,
//   string of PlayerState, string of Card, string of Card,
//   PlayerState, string of Card)
//
//   [i.e. the abstract state of the game consists of:
//   - basic information about the rules (the attribute set for
//   the deck and the number of cards in a valid set)
//   - the abstract states of the players in the game
//   - the cards that haven't yet been given to players (some of
//   which are face-down and and some of which are face up)
//   - indicators for which player is currently trying to form a
//   set and what cards they've selected, the basic information
//   needed for implementing the core gameplay mechanic]
//
//   Invariants:
//   |this.player_list| = |set(this.player_list)|
//   [i.e. no player state is listed twice]
//   and
//   for each distinct player1, player2 in player_list
//       player1.id != player2.id and
//       set(player1.cards) intersect set(player2.cards) = {}
//   [i.e. the players all have different IDs and all have
//   different cards in their hands]
//   and
//   for each player in player_list
//       set(player.cards) intersect set(this.face_up_cards) = {}
//       set(player.cards) intersect set(this.face_down_cards) = {}
//   [i.e. no player has any cards that haven't been given out yet]
//   and
//   set(this.face_up_cards) intersect set(this.face_down_cards)
//   = {}
//   [i.e. no card is both face-up and face-down]
//   and
//   this.active_player is in set(this.player_list)
//   [i.e. the player forming the set is a player in the game]
//   and
//   set(this.selected_cards) is a subset of set(this.
//   face_up_cards)
//   [i.e. the cards being selected for set formation are among
//   the cards are currently face-up]
//   and
//   for each c in this.face_down_cards * this.face_up_cards *
//   concat(player.hand for each player in this.player_list)
//     c.keys = this.attribute_set.keys
//     for each attr_name in c.keys
//       c.value(attr_name) is in this.attribute_set.value(attr_name)
//   [i.e. all cards either face-down, face-up, or in one of the
//   players' hands are based on the given attribute set]
//   and
//   |set(this.face_down_cards)| = |this.face_down_cards| and
//   |set(this.face_up_cards)| = |this.face_up_cards| and
//   |set(this.selected_cards)| = |this.selected_cards|
//   [i.e. all listed cards are distinct - the Player model
//   invariants handle this for the players' decks]
//   and
//   |this.face_up_cards| + |this.face_down_cards| + sum(|player
//   .cards| for each player in player_list) = [the total number
//   of distinct cards that can be formed from this.attribute_set]
//   [i.e. all of the possible cards are either face-down,
//   face-up, or in one of the players' hands]
//
// Kernel methods:
//   constructor(attributeSet, cardsPerSet)
//   addPlayer(playerName)
//   removePlayer(player)
//   getPlayerList()
//   shuffleCards()
//   getFaceDownCards()
//   getFaceUpCards()
//   revealCard()
//   handleSetCall(player)
//   getActivePlayer()
//   getSelectedCards()
//   selectCard(card)
//   deselectCard(card)
//   clearSetCall!()
//   giveCard(player, card)
//   givePenalty(player, amount = 1)
//   attributeSet()
//   getCardsPerSet()
//
// Secondary methods:
//   findPlayerById(id)
//   playerIdMap()
//   getFaceDownDeck()
//   getFaceUpDeck()
//   getSelectedDeck()
//   toggleCardSelection(card)
//   clearSelection()
//   possibleSets()
//   possibleSetsAsDecks()
//   canFormSets()
//   setFormed()
//   mismatchedAttributes()
//   giveSet()
//   penalizeActivePlayer(amount = 1)
class GameState {

  // @correspondence
  // ~this.face_down_cards.card_list = this.face_down_cards
  // ~this.face_up_cards.card_list = this.face_up_cards
  // ~this.selected_cards.card_list = this.selected_cards
  // All card groups in the player and game states are
  // represented with the Deck class in the concrete state for
  // consistency and to make it easier to maintain the
  // invariants
  attributeSet;
  cardsPerSet;
  playerList;
  faceDownCards;
  faceUpCards;
  activePlayer;
  selectedCards;

  ////
  // Constructs an object given information about the rules of
  // the game (card attributes, number of cards in a valid set),
  // with the state corresponding to that of a game in which no
  // players have joined and no actions have been taken yet
  // (empty player list, all cards are face down and in some
  // arbitrary order).
  //
  // @param attributeSet : map(name_t -> string of value_t)
  // @param cardsPerSet : int
  // @ensures
  //   this.attribute_set = attributeSet
  //   this.cards_per_set = cardsPerSet
  //   this.player_list = <>
  //   this.face_down_cards = [all possible cards that can be
  //   formed from attribute_set, satisfying the invariants
  //   listed in the mathematical model]
  //   this.face_up_cards = <>
  //   this.active_player = nil
  //   this.selected_cards = nil
  constructor(attributeSet, cardsPerSet) {
    this.attributeSet = attributeSet;
    this.cardsPerSet = cardsPerSet;
    this.playerList = [];
    this.faceDownCards = new Deck(attributeSet);
    this.faceUpCards = new Deck(attributeSet);
    this.activePlayer = null;
    this.selectedCards = new Deck(attributeSet);

    // all cards present in face-down deck to begin
    this.faceDownCards.generate();
  }

  ////
  // Generate a new player object and add it to the player list,
  // also returning a reference to the object, based on a given
  // name, with the ID being auto-generated to some arbitrary
  // value that is distinct from all other present IDs.
  //
  // @param playerName : string of char
  // @ensures
  //   this.player_list = //this.player_list * <add_player!> and
  //   addPlayer.name = player_name and
  //   addPlayer.game_state = this and
  //   addPlayer.cards = <> and
  //   addPlayer.penalties = 0
  addPlayer(playerName) {
    // get unique ID
    let playerID = 0;
    if (this.playerList.length > 0) {
      playerID = Math.max(...this.playerList.map((player) => player.getID())) + 1;
    }

    // generate, add, and return player object
    let player = new PlayerState(this, playerID, playerName);
    this.playerList.push(player);
    return player;
  }

  ////
  // Removes the given player state object from the list, if
  // it's present. Does nothing if it's not present.
  //
  // @param player : Player
  // @requires
  //   player.cards = <> (to maintain the invariant)
  // @ensures
  //   player is not in this.player_list
  removePlayer(player) {
    if (this.playerList.includes(player)) {
      this.playerList.splice(this.playerList.indexOf(player), 1);
    }
  }

  ////
  // Accessor for this.player_list
  getPlayerList() {
    return this.playerList;
  }

  ////
  // Randomizes the order of the face-down deck, so that the
  // next card to be turned face-up will be unexpected.
  //
  // @ensures
  //   this.face_down_cards = permute(//this.face_down_cards) and
  //   [order of this.face_down_cards is randomized]
  shuffleCards() {
    this.faceDownCards.shuffle();
  }

  ////
  // Accessor for this.face_down_cards
  getFaceDownCards() {
    return this.faceDownCards.getCardList();
  }

  ////
  // Accessor for this.face_up_cards
  getFaceUpCards() {
    return this.faceUpCards.getCardList();
  }

  ////
  // Takes the "top" card in the face-down deck (the one that
  // appears first in the abstract representation) and moves it
  // to the face-up deck, also returning a reference to the
  // card. If the face-down deck is empty, the function does
  // nothing and returns nil.
  //
  // @ensures
  //   if |//this.face_down_cards| > 0
  //     //this.face_down_cards = <reveal_card!> * this.
  //     face_down_cards and
  //     revealCard is in this.face_up_cards
  //   else
  //     this = //this
  //     revealCard = nil
  revealCard() {
    let revealedCard = this.faceDownCards.removeTop(); // to be returned - will be null if face-down deck is empty
    if (revealedCard != null) {
      this.faceUpCards.addToBottom(revealedCard);
    }
    return revealedCard;
  }

  ////
  // Set an indicator that the specified player is the one
  // currently trying to form a set, provided that they're in the
  // player list and that there isn't another player trying to do
  // so. If these conditions aren't met, then the function does
  // nothing.
  //
  // @ensures
  //   if //this.active_player = nil and player is in this.player_list
  //     this.active_player = player
  //     this.selected_cards = <>
  //   else
  //     this = //this
  handleSetCall(player) {
    if (this.playerList.includes(player) && this.activePlayer == null) {
      this.activePlayer = player;
      this.selectedCards.clear();
    }
  }

  ////
  // Accessor for this.active_player
  getActivePlayer() {
    return this.activePlayer;
  }

  ////
  // Accessor for this.selected_cards
  getSelectedCards() {
    return this.selectedCards.getCardList();
  }

  ////
  // Indicates that the given card is being used for forming
  // a set, provided that it's one of the cards in the face-up
  // deck and that it hasn't already been selected. If these
  // conditions aren't met, then the function does nothing. If
  // the card is added and the number of selected cards exceeds
  // the number of cards in a valid set, then the earliest-
  // selected card, assuming cards were only selected through
  // this method, is automatically deselected.
  //
  // @param card : Card
  // @ensures
  //   if card is in //this.face_up_cards and card is not in
  //   //this.selected_cards
  //     if |//this.selected_cards| < this.cards_per_set
  //       this.selected_cards = <card> * //this.selected_cards
  //     else
  //       for remaining : string of Card, removed : Card where
  //       //this.selected_cards = remaining * <removed>
  //         this.selected_cards = <card> * remaining
  //   else
  //     this = //this
  selectCard(card) {
    if (this.faceUpCards.hasCard(card)) {
      this.selectedCards.addToBottom(card); // Deck class has built-in duplicate prevention
      // manage size of selection
      if (this.selectedCards.size > this.cardsPerSet) {
        // if each card is added to the bottom, the earliest-
        // selected card will be on top
        this.selectedCards.removeTop();
      }
    }
  }

  ////
  // Removes the given card from the list of cards selected for
  // set formation, if it's present. Otherwise, this function
  // does nothing.
  //
  // @param card : Card
  // @ensures
  //   card is not in this.selected_cards
  deselectCard(card) {
    this.selectedCards.removeCard(card);
  }

  ////
  // Indicate that the player currently trying to form a set
  // is now no longer doing so.
  //
  // @ensures
  //   this.active_player = nil
  //   this.selected_cards = <>
  clearSetCall() {
    this.activePlayer = null;
    this.selectedCards.clear();
  }

  ////
  // Takes a given card in the face-up deck and puts it in the
  // specified player's hand, so long as the player is in the
  // game's player list. If not, this function does nothing.
  //
  // @ensures
  //   if card is in //this.face_up_cards and player is in
  //   //this.player_list
  //     card is in player.cards
  //     card is not in this.face_up_cards
  //   else
  //     this = //this
  giveCard(player, card) {
    if (this.playerList.includes(player) && this.faceUpCards.hasCard(card)) {
      this.faceUpCards.removeCard(card);
      player.receiveCard(card);
    }
  }

  ////
  // Increases the specified player's penalty counter by the
  // specified amount (1 by default), so long as they're in the
  // game's player list. If not, this function does nothing
  //
  // @param player : Player
  // @param amount : int
  // @ensures
  //   if player is in this.player_list
  //     player.penalties = //player.penalties + amount
  givePenalty(player, amount = 1) {
    if (this.playerList.includes(player)) {
      player.receivePenalty(amount);
    }
  }

  ////
  // Accessor for this.attribute_set
  getAttributeSet() {
    return this.attributeSet;
  }

  ////
  // Accessor for this.cards_per_set
  getCardsPerSet() {
    return this.cardsPerSet;
  }

  ////
  // Returns a reference to the player object in the player
  // list with the matching ID number if one is present.
  // Returns nil otherwise.
  //
  // @param id : int
  // @ensures
  //   if there exists p in this.player_list where p.id =
  //   player_id
  //     findPlayerById = p
  //   else
  //     findPlayerById = nil
  findPlayerById(id) {
    let result = null;
    // look through player list until finding matching ID
    // leave value as null if none found
    this.getPlayerList().forEach((player) => {
      if (result != null && player.getID() == id) {
        result = player;
      }
    });
    return result;
  }

  ////
  // Returns the list of players in the form of a hash with
  // the player IDs as keys and the player objects as values.
  //
  // @ensures
  //   playerIdMap : map(int -> Player) where for each p
  //   in this.player_list
  //     p.id is in playerIdMap.keys and
  //     playerIdMap.value(p.id) = p
  //   and
  //   |playerIdMap| = |this.player_list|
  playerIdMap() {
    let result = {}
    // map each player object to corresponding ID
    this.getPlayerList().forEach((player) => {
      result[player.getID()] = player;
    });
    return result;
  }

  ////
  // Returns the list of face-down cards in the form of a Deck
  // object, with the ordering matching that of the abstract
  // state, to allow more convenient manipulation of the cards
  //
  // @ensures
  //   getFaceDownDeck : Deck where
  //     getFaceDownDeck.attribute_set = this.attribute_set
  //     getFaceDownDeck.cards = face_down_cards
  getFaceDownDeck() {
    return this.faceDownCards;
  }

  ////
  // Returns the list of face-up cards in the form of a Deck
  // object, with the ordering matching that of the cards in the
  // abstract state, to allow more convenient manipulation of
  // the cards
  //
  // @ensures
  //   getFaceUpDeck : Deck where
  //     getFaceUpDeck.attribute_set = this.attribute_set
  //     getFaceUpDeck.cards = face_up_cards
  getFaceUpDeck() {
    return this.faceUpCards;
  }

  ////
  // Returns the list of selected cards in the form of a Deck
  // object, with the ordering matching that of the cards in the
  // abstract state, to allow more convenient manipulation of
  // the cards
  //
  // @ensures
  //   getSelectedDeck : Deck where
  //     getSelectedDeck.attribute_set = this.attribute_set
  //     getSelectedDeck.cards = selected_cards
  getSelectedDeck() {
    return this.selectedCards;
  }

  ////
  // Calls the select_card! method on the card if it's not
  // already selected, and calls the deselect_card! method
  // if it is.
  //
  // @param card : Card
  // @ensures
  //   if card is in //this.face_up_cards and card is not in
  //   //this.selected_cards
  //     if |//this.selected_cards| < this.cards_per_set
  //       this.selected_cards = <card> * //this.selected_cards
  //     else
  //       for remaining : string of Card, removed : Card where
  //       //this.selected_cards = remaining * <removed>
  //         this.selected_cards = <card> * remaining
  //   else
  //     card is not in this.selected_cards
  toggleCardSelection(card) {
    // check presence of card in selection, then make
    // appropriate call
    if (this.getSelectedCards().includes(card)) {
      this.deselectCard(card);
    } else {
      this.selectCard(card);
    }
  }

  ////
  // Deselects all currently-selected cards.
  //
  // @ensures
  //   this.selected_cards = <>
  clearSelection() {
    this.getSelectedCards().forEach((card) => {
      this.deselectCard(card);
    })
  }

  ////
  // Returns the list of all sets that can be formed from the
  // face-up cards, with each set represented as an array of
  // Card objects, for consistency with the abstract model
  //
  // @ensures
  //   possible_sets : string of string of Card where
  //   possible_sets = [every distinct combination of this.
  //   cards_per_set cards in this.face_up_cards that forms a
  //   valid set]
  possibleSets() {
    return cardUtility.possibleSets(this.getFaceUpCards(), this.getCardsPerSet());
  }

  ////
  // Returns the list of all sets that can be formed from the
  // face-up cards, with each set represented as a Deck object,
  // for consistency in the case that the client decides to
  // handle all card groupings through the Deck class.
  //
  // @ensures
  //   possible_sets_as_decks : string of Deck where
  //   possible_sets_as_decks = [every distinct combination of
  //   this.cards_per_set cards in this.face_up_cards that forms
  //   a valid set]
  possibleSetsAsDecks() {
    return this.getFaceUpDeck().possibleSets(this.getCardsPerSet());
  }

  ////
  // Returns whether or not any valid sets can be formed from the
  // face-up cards, for situations where this is all of the
  // information that is needed.
  //
  // @ensures
  //   canFormSets = true if [there exists a subset of
  //   this.cards_per_set cards in this.face_up_cards that
  //   forms a valid set], false otherwise
  canFormSets() {
    return (this.possibleSets().length > 0);
  }

  ////
  // Returns whether or not the group of currently-selected cards
  // constitutes a valid sdt given the rules of the game
  //
  // @ensures
  //   setFormed = true if |this.selected_cards| = this.
  //   cards_per_set and [this.selected_cards is a valid set],
  //   false otherwise
  setFormed() {
    return this.getSelectedDeck().isSet();
  }

  ////
  // Returns the list of attributes among which the currently-
  // selected cards do not meet the set-forming criteria of
  // either all values being the same or all values being
  // different, to help diagnose why the cards would not form a
  // set.
  //
  // @ensures
  //   mismatchedAttributes : string of name_t where
  //   mismatchedAttributes = [all attribute names for which the
  //   cards in card_list do not either all have the same value
  //   or all have different values]
  mismatchedAttributes() {
    return this.getSelectedDeck.mismatchedAttributes();
  }

  ////
  // Takes the currently-selected cards and gives them to the
  // player trying to form a set, in the case that they have
  // indeed successfully formed one with the selected cards.
  // This is probably the only situation where any cards would
  // be given out, though the giveCard function is retained
  // for modularity. To maintain the invariant, the list of
  // currently selected cards is also cleared.
  //
  // @ensures
  //   if [//this.selected_cards is a set]
  //     set(//this.selected_cards) is not a subset of this.
  //     face_up_cards and
  //     set(//this.selected_cards) is a subset of this.
  //     active_player.cards and
  //     this.selected_cards = <>
  giveSet(player) {
    if (this.setFormed()) {
      this.getSelectedCards.forEach((card) => {
        this.giveCard(this.getActivePlayer(), card);
      });
      this.clearSelection();
    }
  }

  ////
  // Increases the penalty counter of the player currently
  // trying to form a set by the specified amount (1 by
  // default). This is probably the only situation where
  // any penalties would need to be given out, but the
  // givePenalty kernel method is retained for modularity
  //
  // @ensures
  //   this.active_player.penalties = //this.active_player.
  //   penalties + amount
  penalizeActivePlayer(amount = 1) {
    this.givePenalty(this.getActivePlayer(), amount);
  }

}