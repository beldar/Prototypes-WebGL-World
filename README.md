#WebGL Rotating World with add on elements

This prototype features a WebGL rendered world globe where add ons get attached to it depending on the sliders value.

![Preview](https://raw.githubusercontent.com/beldar/Prototypes-WebGL-World/master/world.gif)

## Install

Dependencies
------------

You have to have installed [bower](http://bower.io/), and [compass](http://compass-style.org/install/). To install the first two you'll need [node](http://nodejs.org/) too.

This project is build with [Yeoman](http://yeoman.io/).

Install
-------

Once you have all those and cloned the repo, go to the root of the project and run:

    bower install

That will download all the js and css dependencies of the project.

Then run:

    npm install

This will download all the node dependencies (including grunt)

Finally you can launch the site running:

    grunt serve

You can build the project ready for production like this:

    grunt build

That will leave everything ready on the `/dist` folder
