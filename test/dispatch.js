var assert   = require( 'assert' )
	, chai     = require( 'chai' )
	, canned_argv = [
			'node',
			'/Users/jane/dev/jane/plugsuit/examples/eva-pilot.js',
			'asuka',
			'--shinji'
		]
	, plugsuit = require( '../lib/plugsuit.js' ).init( 'examples/pilots', canned_argv );

it( 'dispatch a plug', function () {
	assert( plugsuit.dispatch( process.argv ), 'dispatch() returns true' );
} );
