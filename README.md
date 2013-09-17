Machine Learning challenge SWOC 2013
====================================

Rise of the Pictionary machines
-------------------------------

This is software to run an automated machine recognition contest, based on
sketch recognition.

Basically:

> It is software to make computers play Pictionary!

You'll need Node.js to run the software. It consists of 4 parts:

- The *arbiter*: this is the piece of Node.js server-code that picks a word
  that should be drawn. All recognition algorithms report their guess to the
  arbiter and get points if their guesses are correct.
- The *sketchboard*: a client-side web application, hosted by the arbiter.
  Designed to be loaded on an iPad (and only an iPad). This is used by a human
  to draw the sketches that should be guessed.
- The *scoreboard*: a client-side web application, hosted by the arbiter, that
  displays the current drawing, the guesses of all algorithms and the score of
  each algorithm. This is for the benefit of human observers.
- The *player*: a command-line node.js application that should be run for each
  algorithm. It will receive sketch data from the arbiter, write them to a PNG
  file and call an executable which is expected to produce the algorithm's
  guess.

Additionally needed will be programs (typically C++ applications based on OpenCV,
but can be anything) that read images and try to guess their contents.

Prerequisites
--------------

- Node.js on any machine involved.
- Packages installed for the applications you need to run (arbiter & player, 
  run `npm install`).
- For the Player application (needed by everyone wanting to participate with a
  guessing algorithm), a server-side implementation of HTML5 Canvas is
  required.  Instructions are in the `player` subdirectory.
  

How to run
-----------

- Start `node arbiter.js` on any machine.
- On a machine attached to a beamer, open a browser to
  'http://arbiter-server:3000/' and select the 'scoreboard' application.
- On an iPad, open a browser to 'http://arbiter-server:3000/' and select the
  'sketchboard' application.
- On every computer that wants to participate, start
    
    node player.js http://arbiter-server:3000/ TeamName path/to/guesser

Guessing Application
--------------------

Your guessing application will be called by `player.js` every time there is an
image to recognize. The image will be in PNG format and its filename will be
passed as the first command-line argument.

The application must produce its guess (and nothing else) on `stdout`. Its
location should be given as a command-line argument to player.js, and the
argument should be a single filename. The program will be run in its own
directory.

Related Code
-------------

Wouldn't you know it, there's also example code for creating a guesser. It can
be found here:

https://github.com/rix0rrr/swoc-framework

It's based on the work by Mathias Eitz at 

http://cybertron.cg.tu-berlin.de/eitz/projects/classifysketch/
