
window.Images = new ImageLoader();

/////////////////////////////////////////
//
// CandyEntity
//
var CandyEntity = function(game, color, gridPosition){
	this.Game = game;
	this.GridPosition = gridPosition || {X: 0, Y: 0};
	this.Color = color;
	this.GameEntity = new GameEntity(
		game.GameScreen, 
		null, 
		{X: 32, Y: 32}, 
		Images.GetImage(color), 
		color
	);
	this.SetGridPosition(gridPosition.X, gridPosition.Y);
};
CandyEntity.prototype = {
	Update: function(){ },
	SetGridPosition: function(x, y){
		this.GridPosition.X = x;
		this.GridPosition.Y = y;
		this.GameEntity.SetPosition({
			X: this.Game.GridOffset.X + (x * 32), 
			Y: this.Game.GridOffset.Y + (y * 32)
		});
	},
	Delete: function(){
		this.GameEntity.Delete();
	},
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
	this.GridOffset = {X: 0, Y: 0};
	this.CandyTypes = ["Red", "Blue", "Cyan", "Green", "Yellow"];
	this.Changed = false;
	
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
		this.BuildGrid(15, 15);
	},
	Proc: function(gameScreen){
		
	},
	End: function(gameScreen){ },
	GetCandy: function(x, y){
		return this.Grid[y][x];
	},
	SetCandy: function(x, y, candy){
		this.Grid[y][x] = candy;
		this.Changed = true;
		candy.SetGridPosition(x, y);
	},
	RemoveCandy: function(x, y){
		var candy = this.Grid[y][x];
		this.Grid[y][x] = null;
		this.Changed = true;
		return candy;
	},
	BuildGrid: function(width, height){
		var x,y;
		this.GridSize = {X: width, Y: height};
		this.GridOffset.X = (this.GameScreen.Size.X - ((width - 1) * 32)) / 2.0;
		this.GridOffset.Y = (this.GameScreen.Size.Y - ((height - 1) * 32)) / 2.0;
		this.Grid = [];
		for(y=0;y<height;y++){
			this.Grid.push([]);
			for(x=0;x<width;x++){
				var candyType = this.CandyTypes[Math.floor(Math.random() * this.CandyTypes.length)]; 
				var entCandy = new CandyEntity(this,
					candyType,
					{X: x, Y: y});
				this.Grid[y].push(entCandy);
				this.GameScreen.AddEntity(entCandy);
			}
		}
		this.Changed = true;
	},
	Debug: false
};

