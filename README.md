what is plugsuit
---
if you are the sort of person who creates command-line tools that do lots of
discrete tasks which have little in common you may have come up with a way to
separate the tasks as required for orthogonality, while keeping the shared
code in one place. an example of a product that does this is [awscli](https://github.com/aws/aws-cli),
which accomplishes this by hiding the majority of the code back in a web
interface, with the code and error checking being done on the remote end,
rather than locally on the machine running the commands.

*plugsuit* allows you to create small, largely-self-contained 'plugs' that
contain code for doing things. rather than having to handle things like
command-line argument parsing, 'usage' strings, handling improper arguments,
and things of this nature, *plugsuit* allows you to focus on the actual code,
and manages the actual running of the eva^W primary process in a consistent,
unit-testable, easily-managed way.

if you find yourself with fifteen or more tasks that do different things but
need to share configuration or libraries, and you're doing this all in the
shell, *plugsuit* may be for you.

the code, show me the code
---
okay, so, *plugsuit* takes "plugs." an example of a plug follows:

```
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
		'eva-02'    : 'You're thinking in Japanese, aren't you? If you MUST think, do it in German!'
	};

	Object.keys( nopt ).forEach( function (arg) {
		if (replies[arg]) {
			console.log( replies[arg] );
		}
	} );
};

module.exports = plug;
plug.meta      = meta;
```
this defines a 'task' as `asuka`, and we presume this lives in `bin/asuka.js`.
we would then presumably create something that looks like
```
#!/usr/bin/env node

// eva-pilot.js
//   manage eva pilots for NERV

'use strict;'

var tasks = require( 'plugsuit' ).init( 'bin' );

tasks.dispatch( process.argv )
```
accordingly, one should then be able to run:
```
$ eva-pilot.js asuka --artillery
```
and the results should be as expected.

no really, what is *a* plugsuit?
---
probably you should watch [neon genesis evangelion](http://www.imdb.com/title/tt0169858/).

author
---
[@janearc](https://github.com/janearc), jane@cpan.org
