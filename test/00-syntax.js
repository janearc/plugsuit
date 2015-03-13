var assert = require( 'assert' )
	, chai   = require( 'chai' );

it( 'Passing syntax.', function () {
	assert( require( '../lib/plugsuit.js' ), 'require' );
} );
