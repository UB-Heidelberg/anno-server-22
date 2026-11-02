#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function chapterize () {
  local FLAGS=,
  if [ "$1" == --cwd ]; then FLAGS+="$1,"; shift; fi

  local DESCR="$1"
  case "$DESCR" in
    dinst_* )
      DESCR="$1"
      DESCR="${DESCR//_/ }"
      DESCR="${DESCR#* }"
      DESCR="${DESCR^}"
      ;;
    '' ) shift;;
    * ) shift;;
  esac

  [ -n "$DESCR" ] || DESCR="$*"
  [[ "$FLAGS" == *,--cwd,* ]] && DESCR+=" @ $PWD"
  local BAR_FMT='====[%(%F %T %Z)T]=== %s ====\n'
  printf -- "$BAR_FMT" -1 "$DESCR"
  [ "$#" -ge 1 ] || return 0
  local DURA_SEC="$EPOCHSECONDS" DURA_HR=
  "$@"
  local RV=$?
  let DURA_SEC="$EPOCHSECONDS-$DURA_SEC"
  if [ "$RV" == 0 ]; then
    DESCR="done: $DESCR"
  else
    echo
    DESCR="FAIL (rv=$RV): $DESCR"
  fi
  TZ=UTC printf -v DURA_HR '%( %Hh  %Mm  %Ss )T' "$DURA_SEC"
  DURA_HR="${DURA_HR// 00[hms] /}"
  DURA_HR="${DURA_HR//  / }"
  DURA_HR="${DURA_HR//  / }"
  DURA_HR="${DURA_HR# }"
  DURA_HR="${DURA_HR% }"
  DURA_HR="${DURA_HR// /:}"
  DURA_HR="${DURA_HR#0}"
  [ -n "$DURA_HR" ] || DURA_HR='0s'
  printf -- "${BAR_FMT//=/-}" -1 "$DESCR [$DURA_HR]"
  echo
  return "$RV"
}





[ "$1" == --lib ] && return 0; "$@"; exit $?
