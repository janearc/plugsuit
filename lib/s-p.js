//
// shell-pluggable
//
//   a library for creating extensible shell tools for shellish people.
//

'use strict;'

var dg    = require( 'deep-grep' )
	, rds   = require( 'fs' ).readDirSync
	, plugs = require( 'singleton' ).get()

function is_dir( f )  { return fs.statSync( f ).isDirectory() }
function is_file( f ) { return fs.statSync( f ).isFile()      }

function get_tasks( dir ) {
	return dg.flatten( rds( 'bin' ).filter( function (f) {
		return is_file( f ) ? f : is_dir( f ) ? rds( f ) : ()
	} ) );
}

// 'tasks' is all the files under bin/js
//

tasks.forEach( function (f) {
	var this_plug = require( f );
	disp.add_plug( this_plug.plug() )
}
