var assert   = require( 'assert' )
	, chai     = require( 'chai' )
	, plugsuit = require( '../lib/plugsuit.js' )

// read the examples directory for init
//
it( 'simple plugsuit.init() off disk', function () {
	assert( plugsuit.init( 'examples/pilots' ), 'simple read init' );
} );
