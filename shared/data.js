function Guess(teamName, passWord, word) {
  this.teamName = teamName;
  this.passWord = passWord;
  this.word     = word;
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Drawing(width, height, lines) {
    this.width  = width || 0;
    this.height = height || 0;
    this.lines  = lines || [];
}

function Player(name) {
	this.name = name;
	this.score = 0;
	this.latestGuess = "";
}

function GameState() {
    this.round = 1;
    this.players = [];
}

function Line(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
}

function Round() {
    this.roundNr = 0;
    this.word = "";
}

function Game() {
    this.gameState = new GameState();
    this.drawing   = new Drawing();
    this.round = new Round();
}


if (typeof exports != 'undefined') module.exports = {
    Guess     : Guess,
    Player    : Player,
    GameState : GameState,
    Line      : Line,
    Drawing   : Drawing,
    Game      : Game,
    Point     : Point
}
