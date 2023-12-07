// -*- coding: utf-8, tab-width: 2 -*-

// for M in *.mjs; do echo "import ${M%.*} from './$M';"; done
import contentModes from './contentModes.mjs';
import core from './core.mjs';
import latestOnly from './latestOnly.mjs';
import orderedSearch from './orderedSearch.mjs';
import visibility from './visibility.mjs';


const EX = {
  // for M in *.mjs; do echo "  ...${M%.*},"; done
  ...contentModes,
  ...core,
  ...latestOnly,
  ...orderedSearch,
  ...visibility,
};


export default EX;