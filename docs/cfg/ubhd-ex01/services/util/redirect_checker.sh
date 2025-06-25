#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
#
# This tool helps detect outdated annoBrowserRedirect settings.

function redirect_checker () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH" || return $?
  exec &> >(ts | tee -- tmp."$FUNCNAME".log)

  [ -n "$ANNO_ENDPOINT" ] ||
    local ANNO_ENDPOINT='https://anno.ub.uni-heidelberg.de/anno/'

  local UA_FF='Mozilla/5.0 (Windows NT 10.0; Win64; x64; '$(
    )'rv:136.0) Gecko/20100101 Firefox/136.0'

  local SED='
    \=^æ://Æ.test/=d
    \=^æ://Æ.ub.uni-heidelberg.de/æ_protected/=d
    \=^æ://æ-laureshamensis-digital.de/æ_protected/=d
    '
  SED="${SED//./'\.'}"
  SED="${SED//æ/'[a-z]+'}"
  SED="${SED//Æ/'[A-Za-z0-9_.-]+'}"
  exec < <(./list_all_prefixes.sh | sed -rf <(echo "$SED"))
  local URL_PREFIX=
  local UPR_OK=() UPR_UNKNOWN=() UPR_FAIL=()
  while IFS= read -rs URL_PREFIX; do
    check_one_prefix || return $?
  done

  if [ "${#UPR_FAIL[@]} ${#UPR_UNKNOWN[@]}" == 0 ]; then
    echo D: "All ${#UPR_OK[@]} prefixes redirected ok."
    return 0
  fi
  echo D: "Proper redirects (n=${#UPR_OK[@]}): ${UPR_OK[*]}" >&2
  [ "${#UPR_UNKNOWN[@]}" == 0 ] ||
    echo W: "Unknown redirects (n=${#UPR_UNKNOWN[@]}): ${UPR_UNKNOWN[*]}" >&2
  [ "${#UPR_FAIL[@]}" == 0 ] ||
    echo W: "Failing redirects (n=${#UPR_FAIL[@]}): ${UPR_FAIL[*]}" >&2
  return 2
}


function check_one_prefix () {
  echo "D: Checking URL prefix <$URL_PREFIX>: Searching for any annotation."
  local RSS_URL="${ANNO_ENDPOINT}by/subject_target"
  RSS_URL+=';fmt=rss:vh;limit=1/'"$URL_PREFIX*"
  local RSS_FEED="$(curl --silent -- "$RSS_URL")"
  local ANNO_URL="$RSS_FEED" PREV='RSS feed' DIVE=

  for DIVE in channel item link; do
    case "$DIVE:$RSS_FEED" in
      *:*"<$DIVE>"*"</$DIVE>"* )
        ANNO_URL="${ANNO_URL##*<$DIVE>}"
        ANNO_URL="${ANNO_URL%%</$DIVE>*}"
        ;;
      item:* )
        echo W: "Found no <$DIVE> in $PREV!" \
          'Seems like there are no annos targeting this URL prefix.' >&2
        UPR_UNKNOWN+=( "$URL_PREFIX" )
        return 0;;
      * )
        echo E: "Found no $DIVE in $PREV!" >&2
        UPR_FAIL+=( "$URL_PREFIX" )
        return 0;;
    esac
    PREV="<$DIVE>"
  done

  local ANNO_BASEID=
  case "$ANNO_URL" in
    "$ANNO_ENDPOINT"*/versions )
      ANNO_URL="${ANNO_URL%/*}"
      ANNO_BASEID="${ANNO_URL##*/}"
      ;;
    * )
      echo E: "Found unexpected anno ID URL: '$ANNO_URL'" >&2
      return 5;;
  esac
  echo "D: Checking redirect for: $ANNO_URL"
  local CURL_OPT=(
    --silent  # No progress bar
    --verbose # Show headers
    --location --max-redirs 20  # Follow redirects
    --user-agent "$UA_FF"
    --header 'Accept: text/html,application/xml;q=0.9,*/*;q=0.8'
    )

  local MARK='###_BEGIN_DATA_###'
  local DEST_HTML="$(
    ( curl "${CURL_OPT[@]}" -- "$ANNO_URL" | sed -e "1i$MARK"
    ) 2>&1 )"
  DEST_HTML="${DEST_HTML//$'\r'/}"
  local HEADERS="${DEST_HTML%%$MARK*}"
  [ "${#HEADERS}" -lt "${#DEST_HTML}" ] || DEST_HTML=
  DEST_HTML="${DEST_HTML##*$MARK}"
  local REDIR="$(<<<"$HEADERS" sed -nre 's~^< Location:\s+~~p')"
  REDIR="${REDIR##*$'\n'}"
  echo "D: Got redirected to <$REDIR>."
  DATA="$REDIR" PROP='URL' check_baseid_in_dest || return 0
  DATA="$DEST_HTML" PROP='HTML' check_baseid_in_dest || return 0

  UPR_OK+=( "$URL_PREFIX" )
}


function check_baseid_in_dest () {
  local MSG="Destination $PROP does not include the anno base ID"
  case "$DATA" in
    *"$ANNO_BASEID"* ) echo D: "OK: ${MSG/ not / }.";;
    * ) echo W: "$MSG!" >&2; UPR_FAIL+=( "$URL_PREFIX" ); return 3;;
  esac
}















redirect_checker "$@"; exit $?
