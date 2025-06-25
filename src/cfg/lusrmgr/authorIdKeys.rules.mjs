// -*- coding: utf-8, tab-width: 2 -*-
const EX = {};
/*

Non-URL author ID keys must be a combination of one or more "name parts".
A name part must consist of one or more of:

  * Letters and digits from the "Basic Latin" Unicode block: A-Z, a-z, 0-9
  * U+002B plus sign (+)
  * U+002D hyphen-minus (-)
  * U+002E full stop (.)
  * U+005F low line (_)

Each name part may optionally be followed by exactly one separator.
Acceptable separators are:

  * U+0021 exclamation mark (!)
  * U+002F solidus (/)
  * U+0040 commercial at (@)
  * U+007E tilde (~)

Reasons why certain separators are forbidden:

  * U+0025 percent sign (%): Avoid double URL encoding.
  * U+003A colon (:): Avoid overlap with valid UUID URLs.

*/

EX.acceptableNonUrlKeyIdRgx = /^(?:[A-Za-z0-9\+\-\._][\!\/@\~]?)+$/; /*
No `+` after [A-Z…]: Could compete with the outer `+` if `[]?` skips. */


export default EX;
