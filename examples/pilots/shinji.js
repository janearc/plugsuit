// shinji.js
//   responds appropriately to all crises in evangelion and saves the world.
//   sort of.

var why = require('htd').get( 'SEGV' );

var meta = function () {
	return {
		'args' : {
			'instrumentality' : [ Boolean, 'The end is nigh!' ],
			'NERV'            : [ Boolean, 'Surely Masato can help us!' ],
			'angel'           : [ Boolean, 'Save us, Shinji!' ]
		},

		'name' : 'shinji',
		'abstract' : 'Be a super hero. Or don\'t.'
	}
};

var plug = function (args) {
	var replies = {
		'instrumentality' : '*turns to orange juice*',
		'NERV'            : '*cries*',
		'angel'           : 'the proper tool for this is asuka.js, sorry!'
	};

	if (args['gendo']) { process.exit( why.numeric ) }

	Object.keys( args ).forEach( function (arg) {
		if (replies[arg]) {
			console.log( replies[arg] );
		}
	} );
};

module.exports = plug;
plug.meta      = meta;
