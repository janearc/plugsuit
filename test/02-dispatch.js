var assert   = require( 'assert' )
	, chai     = require( 'chai' )
	, canned_argv = function () { return [
			'node',
			'/Users/jane/dev/jane/plugsuit/examples/eva-pilot.js',
			'asuka',
			'--eva-02'
		] }
	, plugsuit = require( '../lib/plugsuit.js' ).init( 'examples/pilots', canned_argv() );

it( 'dispatch a plug', function () {
	assert( plugsuit( canned_argv() ), 'dispatch() returns true' );
} );
