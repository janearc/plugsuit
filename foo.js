var disp = require( 'shell-pluggable' );

disp.add_plug( function ( args ) {
	// If the callback is called as:
	//   callback( { help: true, dialogue: console.log } )
	//
	if (args['help']) {
		return function (dialogue) { dialogue( 'something helpful' ) }
	}

	// Is it a good idea to do this for self-identification of the function?
	// or better to just return the name?
	//
	if (args['whatis']) {
		return function (dialogue) { dialogue( 'name of the plug' ) }
	}

	// If we get to this point we assume we are Doing Things rather than just
	// describing ourselves or reporting to the environment.
	var R = require( 'rmm' );

	// Here we assume we're just being invoked like with sendak-usage/nopt
	//
	if (args['amazon']) {
		// Operating in Amazon mode
		//
	}
	else if (args['github']) {
		// We're operating on github
		//
	}

} )


var dg = require( 'deep-grep' )
	, rds = require('fs').readDirSync
	, tasks = dg.flatten( rds( 'bin/js' ).filter( function (f) { 
			return is_file( f ) ? f : is_dir( f ) ? rds( f ) : ()
		} ) );

// 'tasks' is all the files under bin/js
//

tasks.forEach( function (f) {
	var this_plug = require( f );
	disp.add_plug( this_plug.plug() )
}
