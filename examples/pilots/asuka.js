// asuka.js
//   says some lovable, if over-enthusiastic things to the console
//   stolen shamelessly from: http://www.imdb.com/character/ch0018088/quotes

var meta = function () {
	return {
		'args' : {
			'eva-02'    : [ Boolean, 'Start Eva-02' ],
			'artillery' : [ Boolean, 'Take care of oncoming artillery' ],
			'shinji'    : [ Boolean, 'A Shinji appears!' ]
		},

		'name' : 'asuka',
		'abstract' : 'Various interactions with Asuka Langley Sôryû'
	}
};

var plug = function (nopt) {
	var replies = {
		'artillery' : 'Schwein-hund!',
		'shinji'    : 'How disgusting.',
		'eva-02'    : 'You\'re thinking in Japanese, aren\'t you? If you MUST think, do it in German!'
	};

	var count = 0;
	Object.keys( nopt ).forEach( function (arg) {
		if (replies[arg]) {
			console.log( replies[arg] );
			count++;
		}
	} );
	return count;
};

module.exports = plug;
plug.meta      = meta;
