#!/usr/bin/env node

// eva-pilot.js
//   manage eva pilots for NERV

'use strict;'

var tasks = require( 'plugsuit' ).init( 'examples/pilots' );

tasks.dispatch( process.argv )
