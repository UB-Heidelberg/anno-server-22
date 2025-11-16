#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function create_bcrypt_rss_token () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  which htpasswd |& grep -qPe '^/' || return $(
    echo 'E: Cannot find htpasswd.' \
      'Try installing apt package apache2-utils.' >&2)
  local N_REMAIN="$1"
  [ "${N_REMAIN:-0}" -ge 1 ] || N_REMAIN=5
  local KEY= HASH=
  for (( ; N_REMAIN >= 0 ; N_REMAIN -= 1 )); do
    KEY="$(head --bytes=30 -- /dev/urandom | base64 | tr /+ _-)"
    HASH="$(htpasswd -inB . <<<"$KEY")"
    HASH="${HASH#*:}"
    echo "keyHash: '$HASH' # ?key=$KEY"
  done
}










create_bcrypt_rss_token "$@"; exit $?
