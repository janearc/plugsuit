#!/usr/bin/env node

// eva-pilot.js
//   manage eva pilots for NERV

'use strict;'

var plugsuit = require( 'plugsuit' );

plugsuit.init( 'examples/pilots' ).dispatch( process.argv )
