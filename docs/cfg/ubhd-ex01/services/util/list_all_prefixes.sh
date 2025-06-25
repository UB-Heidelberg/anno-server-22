#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
SED='/^\s+prefixes:$/,/:$|^\S/{
  s~[\x22\x27]$~~
  s~^\s+\- [\x22\x27](http)~\1~p
  }'
cd -- "$(readlink -m -- "$BASH_SOURCE"/../..)" &&
  sed -nre "$SED" -- *.yaml | sort -V
