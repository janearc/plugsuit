//
// shell-pluggable
//
//   a library for creating extensible shell tools for shellish people.
//

'use strict;'

var dg         = require( 'deep-grep' )
	, fs         = require( 'fs' )
	, rds        = fs.readdirSync
	, path       = require( 'path' )
	, plugsuit   = { }
	, S          = require( 'singleton' ).get()
	, su         = require( 'sendak-usage' )

S.plugsuit = plugsuit;

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
	return dg.flatten( rds( dir ).map( function (f) {
		var test = path.resolve( dir.concat( '/', f ) );
		logger.debug( 'examining ' + test );
		return is_file( test ) ? test : is_dir( test ) ? rds( test ) : [ ]
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

	return su_pd;
}

function def_argv_handler (argv) {
	if (argv[0].substr(0, 2) != '--') {
		var child_task = argv.shift()
			, child_args = argv
	}
	return { task: child_task, args: child_args }
}

// return logger.error( 'Don\'t know anything about a ' + plug + ' plug, sorry.' );

plugsuit.init = function ( dir ) {
	// log4js instantiation
	//
	plugsuit.logger = logwrap;

	// Read in the tasks, check for metadata
	//
	plugsuit.plugs = get_tasks( dir ).map( function (t) {
		logger.info( 'requiring ' + t );
		var plug = require( t );
		if (! plug.meta()) {
			return logger.error( 'plug ' + t + ' failed test for metadata' );
		};

		return plug;
	} );

	if (plugsuit.plugs.length < 1) {
		return logger.error( 'Attempted to read ' + dir + ' and found no pluggables.' );
	}

	plugsuit.plugs.forEach( function (p) {
		if ((p.argv_handler) && ((typeof p.argv_handler) == 'function')) {
			// They've set their own handler
			//
			logger.info( 'plug '.concat( p.meta().name, ' supplied own argv handler.' ) );
		}
		else {
			// They're going to use the default handler
			//
			logger.info( 'plug '.concat( p.meta().name, ' using default argv handler.' ) );
			p.argv_handler = def_argv_handler;
		}
	} );
}

plugsuit.dispatch = function ( argv ) {
	var runplugs = [ ];
	plugsuit.plugs.forEach( function (p) {
		var r = p.argv_handler( argv );
		if ((r.task == p.meta().name) && r.args) {
			// We found a winner!
			//
			runplugs.push( p );
		}
		else {
			// This is not the plug we're looking for. nop.
			//
			22/7;
		}
	} );
}

module.exports = {
	init: plugsuit.init,
	dispatch: plugsuit.dispatch
};
