
window.Images = new ImageLoader();

/////////////////////////////////////////
//
// CandyEntity
//
var CandyEntity = function(game, position, type){
	this.Game = game;
	this.GameEntity = new GameEntity(
		game.GameScreen, 
		position, 
		{X: 32, Y: 32}, 
		Images.GetImage(type), 
		type
	);
};
CandyEntity.prototype = {
	Update: function(){ },
	Debug: false
};


/////////////////////////////////////////
//
// CandyFucker
//
var CandyFucker = function(idScreen){
	var self = this;
	this.GameScreen = new GameScreen(idScreen, 
		this.Init.bind(this),
		this.Proc.bind(this),
		this.End.bind(this)
	);
	this.Grid = null;
	this.GridOffset = {}
	
	window.Images.LoadImages(
		[
			{Name: "Red", Url: "gfx/Red.png"},
			{Name: "Blue", Url: "gfx/Blue.png"},
			{Name: "Cyan", Url: "gfx/Cyan.png"},
			{Name: "Green", Url: "gfx/Green.png"},
			{Name: "Yellow", Url: "gfx/Yellow.png"},
		],
		function(){
			self.GameScreen.Start();
		}
	);
	
};
CandyFucker.prototype = {
	Init: function(gameScreen){
		var test;
		test = new CandyEntity(this, {X: 100, Y: 100}, "Red");
		this.GameScreen.AddEntity(test);
		test = new CandyEntity(this, {X: 132, Y: 100}, "Blue");
		this.GameScreen.AddEntity(test);
		test = new CandyEntity(this, {X: 164, Y: 100}, "Cyan");
		this.GameScreen.AddEntity(test);
		test = new CandyEntity(this, {X: 196, Y: 100}, "Green");
		this.GameScreen.AddEntity(test);
		test = new CandyEntity(this, {X: 228, Y: 100}, "Yellow");
		this.GameScreen.AddEntity(test);
	},
	Proc: function(gameScreen){
		
	},
	End: function(gameScreen){
		
	},
	Debug: false
};

