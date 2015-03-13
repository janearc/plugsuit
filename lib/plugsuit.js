//
// shell-pluggable
//
//   a library for creating extensible shell tools for shellish people.
//

'use strict;'

var dg         = require( 'deep-grep' )
	, fs         = require( 'fs' )
	, util       = require( 'util' )
	, rds        = fs.readdirSync
	, path       = require( 'path' )
	, plugsuit   = { }
	, su         = require( 'sendak-usage' )

/**
 * Initialises the plugsuit
 * @param {String} dir - the directory of plugsuit (javascript) files to require
 * @param {Array} argv - process.argv or something similar to it (optional; for testing)
 *
 * @returns {Object} plugsuit - the runtime object containing plugs etc
 */
plugsuit.init = function ( dir, argv ) { // {{{
	if (argv) {
		// This is to be used for testing purposes
		//
		process.argv = argv;
	}

	var logger  = require( 'log4js' ).getLogger( 'plugsuit' ) // {{{
		, logwrap = {
			debug : function (s) { if (process.env.DEBUG != undefined) { logger.debug(s) } },
			info  : function (s) { if (process.env.DEBUG != undefined) { logger.info(s) } },
			warn  : function (s) { if (process.env.DEBUG != undefined) { logger.warn(s) } },
			error : function (s) { if (process.env.DEBUG != undefined) { logger.error(s); return new Error(s) } },
		};

	plugsuit.logger = logwrap; // }}}

	plugsuit.logger.debug( 'initialising.' );
	plugsuit.stdout = console.log;
	plugsuit.stderr = console.warn;

	// Read in the tasks, check for metadata
	//
	plugsuit.plugs = [ ];
	get_tasks( dir ).forEach( function (t) {
		plugsuit.logger.debug( 'requiring ' + t );
		var plug = require( t );
		if ((! plug.hasOwnProperty( 'meta' )) && (plug.meta())) {
			return plugsuit.logger.error( 'plug ' + t + ' failed test for metadata' );
		};

		plugsuit.plugs.push( plug );
	} );

	plugsuit.logger.debug( plugsuit.plugs.length.toString().concat( ' plugs installed ' ) );

	if (plugsuit.plugs.length < 1) {
		return plugsuit.logger.error( 'Attempted to read ' + dir + ' and found no pluggables.' );
	}

	plugsuit.plugs.forEach( function (p) {
		// Manage localised argv handlers
		//
		if ((p.argv_handler) && ((typeof p.argv_handler) == 'function') && (p.argv_handler != def_argv_handler)) {
			// They've set their own handler
			//
			plugsuit.logger.info( 'plug '.concat( p.meta().name, ' supplied own argv handler.' ) );
		}
		else {
			// They're going to use the default handler
			//
			plugsuit.logger.debug( 'plug '.concat( p.meta().name, ' using default argv handler.' ) );
			p.argv_handler = def_argv_handler;
		}

		// Manage localised 'help' handlers
		if ((p.help_handler) && ((typeof p.help_handler) == 'function') && (p.help_handler != def_help_handler)) {
			// They've set their own handler
			//
			plugsuit.logger.info( 'plug '.concat( p.meta().name, ' supplied own help handler.' ) );
		}
		else {
			// They're going to use the default handler
			//
			plugsuit.logger.debug( 'plug '.concat( p.meta().name, ' using default help handler.' ) );
			p.help_handler = def_help_handler;
		}

	} );
	return plugsuit;
} // }}}

/**
 * Dispatches commands that were required during init()
 * @param {Array} argv - process.argv or something similar to it
 *
 * @returns {Array} returns - the return value from all the loaded plugs
 */
plugsuit.dispatch = function ( argv ) { // {{{
	plugsuit.logger.debug( 'argv received '.concat( JSON.stringify( argv ) ) );

	var runplugs = [ ];

	if (argv[0] == 'node') {
		plugsuit.logger.debug( 'shifting first argument from argv' );
		argv.shift();
	}

	plugsuit.logger.debug( 'feeding plugs argv/handler' );
	plugsuit.plugs.forEach( function (p) {
		var r    = p.argv_handler( argv )
			, name = p.meta().name;

		if ((r.task == name) && r.args) {
			// We found a winner!
			//
			var firstarg = r.args[0];
			if (
					(firstarg == '--halp') ||
					(firstarg == '--help') ||
					(firstarg == '-h')
				) {
				p.help_handler( p.meta(), argv );
			}
			runplugs.push( p );
		}
		else {
			// This is not the plug we're looking for. nop.
			//
			22/7;
		}
	} );
	if (runplugs.length <= 0) {
		plugsuit.logger.warn( 'no plugs volunteered.' )
	}
	var returns = { };
	runplugs.forEach( function (plug) {
		// So we've populated a list of plugs to actually run, here we run them.
		// The first return value from unwrap_pd is the same as from sendak-usage
		// so in this case that's nopt, which is what the plug is looking for.
		//
		returns[ plug.meta().name ] = plug( unwrap_pd( plug.meta(), argv )[0] )
	} );
	plugsuit.logger.debug( 'results: ', JSON.stringify( returns, null, 2 ) );
	return returns;
} // }}}

module.exports = plugsuit;

// Nothing exported below this line
//

// DEFAULT HANDLERS {{{
//

// Handle argv for our plugs -
//   [ 'node', '/path/to/dispatcher.js', 'plugname', [args] ]
//     becomes:
//   [ plugname, [args] ]
// So that:
//   dispatcher.js asuka --args
// does what we expect.
//
// This is over-writeable so that you can make your plug listen for things like
//   hey asuka your args are [ /* args */ ]
// and so forth.
//
function def_argv_handler (argv) {
	var nargv = argv.slice(0);
	if (
			(nargv[0] == 'node') ||
			(nargv[0].substr(argv[0].lastIndexOf('/') + 1, argv[0].length) == 'node')
		) { nargv.shift() }
	if (nargv[1].substr(0, 2) != '--') {
		var eva     = nargv.shift()
			, pilot   = nargv.shift()
			, mission = nargv
	}
	return { task: pilot, args: mission }
}

// Handle the usual -h and --help gracefully for our plugs
//
function def_help_handler (meta, argv) {
	var parsed = unwrap_pd( meta, argv )
		, args   = parsed[0]
		, usage  = parsed[1];

	plugsuit.stdout( 'Usage: ' );
	plugsuit.stdout( usage );

	if (plugsuit.hasOwnProperty( 'cleanup' )) {
		plugsuit.cleanup();
	}
	else {
		process.exit( 0 ); // a successful exit in the shell
	}

}

// }}}

// UTILITY FUNCTIONS {{{
//
function is_dir( f )  { return fs.statSync( f ).isDirectory() }
function is_file( f ) { return fs.statSync( f ).isFile()      }

function get_tasks( dir ) {
	return dg.flatten( rds( dir ).map( function (f) {
		var test = path.resolve( dir.concat( '/', f ) );
		plugsuit.logger.debug( 'examining ' + test );
		return is_file( test ) ? test : is_dir( test ) ? rds( test ) : [ ]
	} ) );
}

// Unwrap the tinier syntax we use for plugsuit usage here into something more
// like what sendak-usage uses.
//
function unwrap_pd (meta, argv) {
	var args  = meta.args
		, su_pd = { };

	Object.keys( args ).forEach( function (key) {
		var clause = args[key];
		su_pd[key] = { 'type' : [ clause[0] ], 'description' : clause[1] };
	} );

	return su.parsedown( su_pd, argv );
}

// }}}

// jane@cpan.org // vim:tw=79:ts=2:noet
