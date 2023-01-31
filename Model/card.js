//
// Created by Thomas Li
// Originally Written in Ruby 6 September 2022
// Translated into JavaScript 27 October 2022
//

////
// This is a Ruby-to-JavaScript translation of the Card class 
// family in our initial implementation of the game of Set, 
// which can be seen at:
// https://github.com/cse3901-2022au-giles/team4-project2.
// 
// All code and documentation comments below this paragraph have 
// been copied and adapted from the card_kernel.rb and card.rb 
// files from the original repository.

////
// This class represents a single card in a game of Set.
//
// Mathematical Model:
//
//   Define name_t and value_t as arbitrary types representing
//   the card's attribute names and attribute values (most
//   likely to be strings or symbols)
//
//   this : map(name_t -> value_t)
//
//   [abstract state consists of attribute names, mapped to
//   axxociated abstract values]
//
// The following instance methods are available:
//   constructor(attrObj)
//   attributeNames()
//   getAttribute(attrName)
class Card {

  // use JS object as the data representation
  // @correspondence ~this.cardAttributes = this
  cardAttributes = {};

  ////
  // Creates a new card.
  //
  // @param attrObj : map(name_t -> value_t)
  //   A hash mapping the name of each of the card's attributes
  //   to the value associated with the attribute
  // @requires
  //   N/A
  // @ensures
  //   this.cardRepresentation = attrObj
  constructor(attrObj, ID) {
    this.cardAttributes = attrObj;
    this.cardID = ID;
  }

  ////
  // Returns an array listing the names of the card's attributes
  //
  // @requires
  //   N/A
  // @ensures
  //   attributeNames = this.keys
  attributeNames() {
    return Object.keys(this.cardAttributes);
  }

  ////
  // Returns the cards ID
  //
  // @requires
  //   N/A
  // @ensures
  //   attributeNames = this.keys
  cardID() {
    return this.cardID;
  }

  // Returns the value associated with a given attribute name,
  // assuming that the given name is present in the data
  // representation
  //
  // @param attributeName : name_t
  //   The name of the attribute to return the value of
  // @requires
  //   attrName is in this.keys
  // @ensures
  //   attribute = this.value(attrName)
  attribute(attrName) {
    return this.cardAttributes[attrName]
  }

}