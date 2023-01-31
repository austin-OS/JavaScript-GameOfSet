//
// Created by Thomas Li
// Originally Written in Ruby 6 September 2022
// Translated to JavaScript 27 October 2022
//

////
// This is a Ruby-to-JavaScript translation of the CardUtility
// module in our initial implementation of the game of Set, 
// which can be seen at:
// https://github.com/cse3901-2022au-giles/team4-project2.
// 
// All code and documentation comments below this paragraph have 
// been copied and adapted from the card_kernel.rb and card.rb 
// files from the original repository.

////
// This object contains secondary utility methods for the Card 
// class.
//
// The following class methods are available:
//   mismatchedAttributes(cardList)
//   isSet(cardList, cardsPerSet)
//   possibleSets(cardList, cardsPerSet)
//   numPossibleCards(attributeSet)
//   IdToCard(attributeSet, id)
//   cardToId(attributeSet, card)
const cardUtility = {

  ////
  // Returns the list of attribute names among which the given
  // list of cards fails to meet the set-forming property in
  // which either all cards have the same value or all cards have
  // different values. Useful for determining sets and diagnosing
  // why certain cards do not form a set
  //
  // @param cardList : string of Card
  //   The array of Card objects to check
  // @requires
  //   [all cards in cardList are based on the same set of
  //   possible attributes]
  // @ensures
  //   mismatchedAttributes.type = string of name_t and
  //   mismatchedAttributes = [all attribute names for which the
  //   cards in cardList do not either all have the same value
  //   or all have different values]
  mismatchedAttributes(cardList) {
    let mismatches = []; // to be returned

    // go through each attribute and record ones where the
    // set-forming criteria are not met
    if (cardList.length > 0) {
      cardList[0].attributeNames().forEach((attrName) => {
        // can determine whether attribute values are either all
        // the same or all different by recording the list of all
        // values and checking how many unique elements there are
        let attrValues = cardList.map((card) => card.attribute(attrName));

        // the number of unique values should either match
        // the number of cards (all different) or equal 1
        // (all the same)
        attrValues = new Set(attrValues)
        if (attrValues.size !== 1 && attrValues.size !== cardList.length) {
          mismatches.push(attrName);
        }
      });
    }

    return mismatches;
  },

  ////
  // Returns whether or not the given list of cards forms a set.
  // This requires both that all attributes meet the set-forming
  // criteria and that the necessary number of cards is present
  // (3 in standard Set)
  //
  // @param cardList : string of Card
  //   The array of Card objects to check
  // @param cardsPerSet : int
  //   The number of cards in a valid set
  // @requires
  //   [all cards in cardList are based on the same set of
  //   possible attributes]
  // @ensures
  //   isSet.type boolean and
  //   isSet = [true if cardList is a valid set, false otherwise]
  isSet(cardList, cardsPerSet) {
    // two checks: one for the right amount of cards and one for
    // no mismatched attributes
    return cardList.length === cardsPerSet && this.mismatchedAttributes(cardList).length === 0
  },

  ////
  // Returns all possible sets that can be formed among distinct
  // combinations of cards in the given list.
  //
  // @param cardList : string of Card
  //   The array of Card objects to check
  // @param cardsPerSet : int
  //   The number of cards in a valid set
  // @requires
  //   [all cards in cardList are based on the same set of
  //   possible attributes]
  // @ensures
  //   possibleSets.type = string of string of Card and
  //   possibleSets = [every distinct combination of 
  //   cardsPeSet cards in cardList that forms a valid set]
  possibleSets(cardList, cardsPerSet) {
    let sets = [] // to be returned

    // represent the cards being checked as an array of indices
    // within the deck, run through all possible distinct
    // combinations of distinct indices until all have been
    // checked
    let cardIndices = Array(cardsPerSet).fill().map((element, index) => index);

    // the indices are kept in ascending order to make sure that
    // they form distinct combinations
    // the last one has a maximum value of deck.length - 1, and
    // each previous one has a maximum value one lower than that
    // of the one after it
    // the last elements of card_indices get incremented first,
    // with the iteration ending once the first element passes
    // its maximum value
    while (cardIndices[0] <= cardList.length - cardIndices.length) {
      // get the array of actual Card objects
      let cards = cardIndices.map((index) => cardList[index]);

      // check whether it's a set, record it if it is
      if (this.isSet(cards, cardsPerSet)) {
        sets.push(cards);
      }

      // update the indices to the next valid distinct
      // combination
      let i = cardIndices.length - 1;
      cardIndices[i]++;
      // if any index exceeds its bounds, try incrementing the
      // index listed before it and then resetting it later
      while (cardIndices[i] > cardList.length - (cardIndices.length - i)) {
        i--;
        cardIndices[i]++;
      }
      // in keeping with the ascending order, the minimum value
      // that any of the listed indices can take on is one 
      // greater than the current value of the one before it
      for (let j = i + 1; j < cardIndices.length; j++) {
        cardIndices[j] = cardIndices[j - 1] + 1;
      }
    }

    return sets;
  },

  ////
  // Returns the number of possible unique cards that can be
  // generate from a given attribute set.
  //
  // @param attributeSet : map(name_t : string of value_t)
  //   An object listing every possible value associated with each
  //   possible card attribute
  // @requires
  //   N/A
  // @ensures
  //   numPossibleCards = |deck| for deck : set of Card where
  //     for each c : Card where
  //       c.keys = attributeSet.keys and
  //       for each attrName in c.keys
  //         c.value(attrName) is in attributeSet.value(attrName)
  //     c is in deck
  numPossibleCards(attributeSet) {
    let result = 1; // to be returned
    // every additional attribute increases the number of
    // possible cards by a factor of the number of possible
    // values for that attribute
    Object.keys(attributeSet).forEach((attrName) => {
      result *= attributeSet[attrName].length
    });

    return result;
  },

  ////
  // Allows a two-way mapping between the cards generated from a
  // given attribute set and a range of ID numbers between 0 and
  // one minus the total number of possible cards, with this
  // function returning the ID associated with a given Card object
  //
  // @param attributeSet : map(name_t : string of value_t)
  //   An object listing every possible value associated with each
  //   possible card attribute
  // @param card: Card
  //   The Card object to map
  // @requires
  //   card.keys = attributeSet.keys and
  //   for all attrName in card.keys
  //     card.value(attrName) is in attributeSet.value(attrName)
  //   and
  // @ensures
  //   cardToId.type = int and
  //   0 <= id <= numPossibleCards(attributeSet) - 1
  //   and
  //   for each card1, card2 where [preconditions met]
  //     if card1 != card2 then card_to_id(attributeSet, card1)
  //     != cardToId(attributeSet, card2)
  cardToId(attributeSet, card) {
    // Each attribute value is associated with an offset starting
    // from 0, with the ID being the sum of the offsets.
    // Subsequent attributes have their offsets magnified by the
    // number of values for the previous attribute so as to avoid
    // any ambiguity as to how the ID is broken down.
    // e.g. For three values per attribute, Attribute 1's values
    // have offsets 0, 1, and 2; Attribute 2's values have
    // offsets 0, 3, and 6, etc.
    let id = 0; // to be returned
    let magnitude = 1;

    Object.keys(attributeSet).forEach((attrName) => {
      // get offset of current attribute and factor it in
      id += attributeSet[attrName].indexOf(card.attribute(attrName)) * magnitude;

      // prepare to repeat process with next attribute
      magnitude *= attributeSet[attrName].length
    });

    return id;
  },

  ////
  // Allows a two-way mapping between the cards generated from a
  // given attribute set and a range of ID numbers between 0 and
  // one minus the total number of possible cards, with this
  // function returning the Card object corresponding to the
  // given ID
  //
  // @param attributeSet : map(name_t : string of value_t)
  //   An object listing every possible value associated with each
  //   possible card attribute
  // @param id : int
  //   The ID number to map
  // @requires
  //   0 <= id <= numPossibleCards(attributeSet) - 1
  // @ensures
  //   idToCard.type = Card and
  //   idToCard.keys = attributeSet.keys and
  //   for all attrName in idToCard.keys
  //     idToCard.value(attrName) is in attributeSet.value
  //     (attrName)
  //   and
  //   cardToId(attributeSet, idToCard) = id
  idToCard(attributeSet, id) {
    // essentially reverse the process from cardToId
    let cardAttributes = {};
    let idCopy = id;
    Object.keys(attributeSet).forEach((attrName) => {
      // get offset and corresponding value for current attribute
      let offset = id % attributeSet[attrName].length;
      cardAttributes[attrName] = attributeSet[attrName][offset];

      // prepare to find offset for next attribute
      id -= offset;
      id /= attributeSet[attrName].length;
    })

    // construct and reutnr card object based on attribute object
    return new Card(cardAttributes, idCopy);
  }

};