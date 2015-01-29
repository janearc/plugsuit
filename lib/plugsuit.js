//
// shell-pluggable
//
//   a library for creating extensible shell tools for shellish people.
//

'use strict;'

var dg       = require( 'deep-grep' )
	, rds      = require( 'fs' ).readDirSync
	, plugsuit = require( 'singleton' ).get()
	, su       = require( 'sendak-usage' )

var logger  = require( 'log4js' ).getLogger() // {{{
	, logwrap = {
		debug : function (s) { if (process.env.DEBUG != undefined) { logger.debug(s) } },
		info  : function (s) { if (process.env.DEBUG != undefined) { logger.info(s) } },
		warn  : function (s) { if (process.env.DEBUG != undefined) { logger.warn(s) } },
		error : function (s) { if (process.env.DEBUG != undefined) { logger.error(s); return new Error(s) } },
	}; // }}}

function is_dir( f )  { return fs.statSync( f ).isDirectory() }
function is_file( f ) { return fs.statSync( f ).isFile()      }

function get_tasks( dir ) {
	return dg.flatten( rds( 'bin' ).filter( function (f) {
		return is_file( f ) ?  f : is_dir( f ) ?  rds( f ) : [ ]
	} ) );
}

// Unwrap the tinier syntax we use for plugsuit usage here into something more
// like what sendak-usage uses.
//
function unwrap_pd (meta) {
	var args = meta.args;

	// So iteration is the root of all evil. However, we can't unbox in
	// javascript, so we declare here, and then iterate below.
	//
	var su_pd = { };

	Object.keys( args ).forEach( function (key) {
		var clause = args[key];

		su_pd[key] = {
			'type'        : args[key][0],
			'description' : args[key][1],
		};
	} );
}

// TODO: writeme, kthx
//
function wrap_argv (argv) {

}

plugsuit.init = function ( dir ) {
	// log4js instantiation
	//
	plugsuit.logger = logwrap;

	// Read in the tasks, check for metadata, create usage data.
	//
	plugsuit.tasks = get_tasks( dir ).filter( function (t) {
		var plug = require( t );
		if (! plug.meta()) {
			return logger.error( 'plug ' + t + ' failed test for metadata' );
		};

		plug.usage = su.parsedown( unwrap_pd( plug.meta().args ), wrap_argv( process.argv ) );

		return plug;
	} );
}
