var assert   = require( 'assert' )
	, chai     = require( 'chai' )
	, canned_argv = function () { return [
			'node',
			'/Users/jane/dev/jane/plugsuit/examples/eva-pilot.js',
			'asuka',
			'--eva-02'
		] }
	, plugsuit = require( '../lib/plugsuit.js' );

it( 'dispatch a plug', function () {
	plugsuit.init( 'examples/pilots', canned_argv() );
	[ 'init', 'dispatch', 'plugs', 'logger', 'stdout', 'stderr' ].forEach( function (prop) {
		assert( plugsuit.hasOwnProperty( prop ), 'requisite property '.concat( prop, ' present' ) );
	} );
	assert( typeof plugsuit.init == 'function', 'init exists and is functiony' );
	assert( typeof plugsuit.plugs == 'object', 'plugs in plugsuit exist' );
	plugsuit.plugs.forEach( function (plug) {
		assert( typeof plug == 'function', 'can iterate over plugs and plugs look like functions' );
	} );
	assert( typeof plugsuit.stdout == 'function', 'plugsuit stdout looks functiony' );
	assert( typeof plugsuit.stderr == 'function', 'plugsuit stderr looks functiony' );
	assert( typeof plugsuit.logger == 'object', 'plugsuit has a logger object' );
} );
