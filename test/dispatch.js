var assert   = require( 'assert' )
	, chai     = require( 'chai' )
	, plugsuit = require( '../lib/plugsuit.js' ).init( 'examples/pilots' );

plugsuit.logger( JSON.stringify( plugsuit ) );

it( 'dispatch a plug', function () {
	assert( plugsuit.dispatch( process.argv ), 'dispatch() returns true' );
} );
