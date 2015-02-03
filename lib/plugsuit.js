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
	};

plugsuit.logger = logwrap; // }}}

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

	logger.debug( 'returning nopt to caller '.concat( JSON.stringify( su_pd ) ) );
	return su.parsedown( su_pd );
}

function def_argv_handler (argv) {
	// [ "/Users/jane/dev/jane/plugsuit/examples/eva-pilot.js","asuka","--shinji" ]
	if (argv[1].substr(0, 2) != '--') {
		var eva     = argv.shift()
			, pilot   = argv.shift()
			, mission = argv
	}
	return { task: pilot, args: mission }
}

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
	return plugsuit;
}

plugsuit.dispatch = function ( argv ) {
	logger.debug( 'argv received '.concat( JSON.stringify( argv ) ) );

	var runplugs = [ ];

	if (argv[0] == 'node') {
		logger.info( 'shifting first argument from argv' );
		argv.shift();
	}

	plugsuit.plugs.forEach( function (p) {
		var r    = p.argv_handler( argv )
			, name = p.meta().name;

		logger.debug( 'testing plug '.concat( name, ' with ', r.task ) );
		if ((r.task == name) && r.args) {
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
	if (runplugs.length <= 0) {
		logger.warn( 'no plugs volunteered.' )
	}
	var returns = { };
	runplugs.forEach( function (plug) {
		// So we've populated a list of plugs to actually run, here we run them.
		// The first return value from unwrap_pd is the same as from sendak-usage
		// so in this case that's nopt, which is what the plug is looking for.
		//
		returns[ plug.meta().name ] = plug( unwrap_pd( plug.meta() )[0] )
	} );
	logger.debug( 'results: ', JSON.stringify( returns, null, 2 ) );
	return returns;
}

module.exports = {
	init: plugsuit.init,
	dispatch: plugsuit.dispatch
};

// jane@cpan.org // vim:tw=79:ts=2:noet
