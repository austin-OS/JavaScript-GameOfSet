//
// Created by Thomas Li
// Originally Written in Ruby 7 September 2022
// Translated to JavaScript 28 October 2022
//

////
// This is a Ruby-to-JavaScript translation of the Card class 
// family in our initial implementation of the game of Set, 
// which can be seen at:
// https://github.com/cse3901-2022au-giles/team4-project2.
// 
// All code and documentation comments below this paragraph have 
// been copied and adapted from the deck_kernel.rb,
// deck_secondary.rb, and deck.rb files from the original 
// repository.

////
// This class represents an ordered group of multiple distinct
// Set cards all based on the same attribute set.
//
// Mathematical Model:
//   Include the model for Card
//
//   this = (attributeSet, cardList) : (map(name_t -> string of
//   value_t), string of Card)
//
//   [i.e. the abstract state consists of the abstract states of
//   theconstituent cards, arranged in some order, and a reference
//   to full set of attribute names and values that the cards are
//   based on]
//
//   Invariants:
//   for each c in this.cardList
//     c.keys = this.attributeSet.keys
//     for each attrName in c.keys
//       c.value(attrName) is in this.attribute_set.value(attr_name)
//   and
//   |this.cardList| = |set(this.cardList)|
//
//   [i.e. the cards all need to be distinct and all need to be
//   based on the given attribute set]
//
// Kernel methods:
//   constructor(attributeSet, cardList)
//   addCard(card, posFromTop)
//   removeCard(card)
//   shuffle()
//   findByPos(posFromTop)
//   size()
//   attributeSet()
//
// Secondary methods:
//   generate()
//   clear()
//   addToTop(card)
//   addToBottom(card)
//   removeTop()
//   hasCard(card)
//   findById(id)
//   getId(card)
//   getCardList()
//   cardIdMap()
//   possibleSets(cardsPerSet)
//   hasSets(cardsPerSet)
//   isSet(cardsPerSet)
//   mismatchedAttributes()
class Deck {

  // keep track of all possible values for each possible
  // attribute using an object mapping names of lists of values
  attributeSet = {};
  // keep track of the list of cards currently in the deck
  cardList = [];

  ////
  // Constructs a deck, recording information on the attribute set
  // being used, that's empty by default but with an option to
  // initialize with cards included
  //
  // @param attributeSet : map(name_t -> string of value_t)
  //   A hash mapping the name of each attribute associated
  //   with possible cards in the deck to the list of possible
  //   values that can be associated with that attribute
  // @param cardList
  //   The list of cards to add to the deck, empty by default,
  //   with index 0 corresponding to the "top"
  // @requires
  //   for each c in cardList
  //     c.keys = attributeSet.keys
  //     for each attrName in c.keys
  //       c.value(attrName) is in attribute_set.value(attr_name)
  // @ensures
  //   this.attributeSet = attributeSet
  //   this.cardList = cards
  constructor(attributeSet, cardList = []) {
    this.attributeSet = attributeSet;
    this.cardList = cardList;
  }

  ////
  // Adds a card to the deck in the specified position relative
  // to the "top" of the deck, provided that it matches the
  // attribute set. Does nothing if the card is already present.
  //
  // @param card : Card
  //   The card to add
  // @param posFromTop : int
  //   The position within the deck's ordering to insert the
  //   card, relative to the "top"
  // @requires
  //   0 <= posFromTop <= |this.cardList|
  // @ensures
  //   if card is not in this.cardList
  //     this.cardList = upper * <card> * lower for upper, lower
  //     : string of Card where
  //       //this.card_List = upper * lower and
  //       |upper| = pos_from_top
  addCard(card, posFromTop) {
    if (!this.cardList.includes(card)) {
      this.cardList.splice(posFromTop, 0, card);
    }
  }

  ////
  // Removes the given card from the list, if it's present. Does
  // nothing otherwise
  //
  // @param card : Card
  //   The card to remove
  // @ensures
  //   if card is in //this.cardList
  //     this.cardList = upper * lower for upper, lower :
  //     string of Card where
  //       //this.cardList = upper * card * lower
  removeCard(card) {
    if (this.cardList.includes(card)) {
      this.cardList.splice(this.cardList.indexOf(card), 1);
    }
  }

  ////
  // Randomizes the order of the cards
  //
  // @ensures
  //   [this.cardList reordered in a random manner]
  shuffle() {
    // JavaScript doesn't have a built-in shuffle function, so
    // I adapated code from https://stackoverflow.com/a/12646864
    for (let i = this.cardList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cardList[i], this.cardList[j]] = [this.cardList[j], this.cardList[i]];
    }
  }

  ////
  // Finds and returns the card at the given position in the
  // deck, relative to the "top" and starting from 0. Returns
  // nil if the given position is out-of-bounds.
  //
  // @param posFromTop : int
  //   The position to search at
  // @requires
  //   0 <= pos
  // @ensures
  //   if posFromTop < |this.cardList|
  //     this.cardList = upper * <findByPos> * lower
  //   else
  //     findByPos = nil
  findByPos(posFromTop) {
    return this.cardList[posFromTop];
  }

  ////
  // Returns the number of cards in the deck
  //
  // @ensures
  //   size = |this.cardList|
  size() {
    return this.cardList.length
  }

  ////
  // Populates the deck with every possible card that can be
  // formed from the attribute set, in an arbitrary order,
  // regardless of the existing contents of the deck.
  //
  // @ensures
  //   |this.cardList| = cardUtility.numPossibleCards(this.
  //   attributeSet)
  //   [Given the representation invariants holding, this
  //   postcondition implies the conditions in the verbal
  //   description]
  generate() {
    for (let id = 0; id < cardUtility.numPossibleCards(this.attributeSet); ++id) {
      this.addCard(cardUtility.idToCard(this.attributeSet, id), 0);
    }
  }

  ////
  // Removes all cards currently in the deck
  //
  // @ensures
  //   this.card_list = <>
  clear() {
    while (this.size() > 0) {
      this.removeTop();
    }
  }

  ////
  // Adds a card at the "top" position of the deck, so long as
  // it matches the attribute set. Does nothing if the card is
  // already present.
  //
  // @param card : Card
  //   The card to add
  // @requires
  //   card.keys = this.attributeSet.keys
  //   for each attrName in card.keys
  //     card.value(attrName) is in this.attributeSet.value(
  //     attr_name)
  // @ensures
  //   if card is not in //this.cardList
  //     this.cardList = <card> * //this.cardList
  //   else
  //     this = //this
  addToTop(card) {
    this.addCard(card, 0);
  }

  ////
  // Adds a card at the opposite end of the "top" position of
  // the deck so long as it matches the attribute set. Does
  // nothing if the card is already present.
  //
  // @param card : Card
  //   The card to add
  // @requires
  //   card.keys = this.attributeSet.keys
  //   for each attrName in card.keys
  //     card.value(attrName) is in this.attributeSet.value(
  //     attrName)
  // @ensures
  //   if card is not in //this.cardList
  //     this.cardList = //this.cardList * <card>
  //   else
  //     this = //this
  addToBottom(card) {
    this.addCard(card, this.size() - 1);
  }

  ////
  // Removes and returns the card current in the deck's "top"
  // position, returns nil if the deck is empty.
  //
  // @ensures
  //   if |//this.cardList| > 0
  //     //this.cardList = <removeTop!> * this.cardList
  //   else
  //     removeTop! = nil
  removeTop() {
    let top = this.findByPos(0);
    this.removeCard(top);
    return top;
  }

  ////
  // Returns whether or not the given card is present in the
  // deck.
  //
  // @param card : Card
  //   The card to look for
  // @ensures
  //   hasCard = true if card is in this.cardList, false otherwise
  hasCard(card) {
    return this.getCardList().includes(card);
  }

  ////
  // Looks up a card in the deck based on its corresponding ID
  // as described in the CardUtility module. Returns the card
  // if found, returns nil otherwise.
  //
  // @param id : int
  //   The ID number for which to find the corresponding card
  //   given the attribute set used by this deck
  // @ensures
  //   if [corresponding card in this this.card_list]
  //     findById : Card
  //     findById is in this.card_list
  //     cardUtility.cardToId(this.attribute_set, find_by_id) = id
  //   else
  //     findById = nil
  findById(id) {
    let result = null;
    // search through deck for matching card, keep value as null
    // if one is not found
    for (let i = 0; i < this.size(); ++i) {
      result = this.findByPos(i);
      if (this.getId(card) != id) {
        result = null;
      } else {
        break;
      }
    }
    return result;
  }

  ////
  // Returns the ID of a given card based on the deck's attribute
  // set, regardless of whether the card itself is in the deck.
  // Essentially a wrapper for cardUtility.cardToId, but with the
  // attribute set encapsulated for extra convenience.
  //
  // @requires
  //   card.keys = this.attribute_set.keys
  //   for each attr_name in card.keys
  //     card.value(attr_name) is in this.attribute_set.value(
  //     attr_name)
  // @ensures
  //   cardUtility.idToCard(this.attribute_set, getId) = card
  getId(card) {
    return cardUtility.cardToId(this.attributeSet, card);
  }

  ////
  // Returns the cards in the set in array form, in the stored
  // order with the "top" at index 0.
  //
  // @ensures
  //   cardList = this.cardList
  getCardList() {
    // skipping the layered implementation stuff for expedience
    return this.cardList;
  }

  ////
  // Returns a hash in which the ID of each card in the deck
  // is mapped to the corresponding Card object.
  //
  // @ensures
  //   cardIdMap = map(int -> Card) and
  //   |cardIdMap| = |this.card_list| and
  //   for each id in card_id_map.keys
  //     cardIdMap.value(id) = cardUtility.idToCard(this.attribute_set, id) and
  //     cardIdMap.value(id) is in this.card_list
  cardIdMap() {
    let result = {};
    for (let i = 0; i < this.size(); ++i) {
      let card = this.findByPos(i);
      result[this.getId(card)] = card;
    }
    return result;
  }

  ////
  // Given the rules of the Set game that the deck is being used
  // in, return a list of every possible set that can be formed
  // from the cards in the deck, with sets represented as Deck
  // objects. Essentially a wrapper for Card.possible_ sets but
  // with the card lists encapsulated for extra convenience.
  //
  // @param cardsPerSet : int
  //   The number of cards in a valid set
  // @ensures
  //   possibleSets : string of Deck
  //   possibleSets = [every distinct combination of cardsPerSet
  //   cards in this.card_list that forms a valid set]
  possibleSets(cardsPerSet) {
    let result = [];
    cardUtility.possibleSets(this.cardList, cardsPerSet).forEach((set) => {
      result.push(new Deck(this.attributeSet, set));
    })
    return result;
  }

  ////
  // Returns whether or not a set can be formed from the cards
  // in the deck, to provide a shorthand for situations where
  // this is all the information that is needed.
  //
  // @param cardsPerSet : int
  //   The number of cards in a valid set
  // @ensures
  //   hasSets = true iff [there is a combination of cardsPerSet
  //   cards in this.card_list that forms a valid set]
  hasSets(cardsPerSet) {
    return (this.possibleSets(cardsPerSet).length > 0);
  }

  ////
  // Returns whether or not the cards in the deck are themselves
  // a set.
  //
  // @param cardsPerSet : int
  //   The number of cards in a valid set
  // @ensures
  //   is_set? = true iff this.card_list.size == cards_per_set
  //   and [this.card_list is a valid set]
  isSet(cardsPerSet) {
    return cardUtility.isSet(this.cardList, cardsPerSet);
  }

  ////
  // Returns the list of the names of the attributes for which
  // the cards in the deck do not meet the set-forming criteria
  // (all the same or all different), to help diagnose why the
  // cards would not form a set. Essentially a wrapper for
  // cardUtility.mismatchedAttributes, but with the card list 
  // encapsulated for extra convenience.
  //
  // @ensures
  //   mismatchedAttributes.type = string of name_t and
  //   mismatchedAttributes = [all attribute names for which the
  //   cards in this.cardList do not either all have the same
  //   value or all have different values]
  mismatchedAttributes() {
    return cardUtility.mismatchedAttributes(this.cardList);
  }

}
