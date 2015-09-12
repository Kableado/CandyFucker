
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
	this.Locked = false;
	this.Falling = false;
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
		if(this.Locked){
			if(this.Falling){
				if(!this.CandyFall()){
					this.Falling = false;
					console.log("Stoped");
				}
			}else{
				if(this.ApplyRules()){
					this.Falling = true;
					console.log("Falling");
				}else{
					this.Locked = false;
					console.log("Stoped");
				}
			}
		}else{
			if(this.Changed){
				if(this.ApplyRules()){
					this.Locked = true;
					this.Falling = true;
					console.log("Falling");
				}
			}
		}
		this.Changed = false;
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
	RandomCandy: function(){
		return this.CandyTypes[Math.floor(Math.random() * this.CandyTypes.length)]; 
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
				var entCandy = new CandyEntity(this,
					this.RandomCandy(),
					{X: x, Y: y});
				this.Grid[y].push(entCandy);
				this.GameScreen.AddEntity(entCandy);
			}
		}
		this.Changed = true;
	},
	ScanHorizontalRuns: function(){
		var x,y;
		var xPrev,yPrev;
		var currentColor;
		var prevColor;
		var horizontalRuns = [];
		for(y=0;y<this.GridSize.Y;y++){
			yPrev = y;
			xPrev = 0;
			prevColor = "";
			for(x=0;x<this.GridSize.X;x++){
				var candy = this.GetCandy(x, y);
				if(candy){
					currentColor = candy.Color;
				}else{
					currentColor = "";
				}
				if(currentColor != prevColor){
					if((x-xPrev)>2){
						if(prevColor!=""){
							// Run found
							horizontalRuns.push({
								Start: {X: xPrev, Y: yPrev},
								End: {X: x-1, Y: y},
								Color: prevColor
							});
						}
					}
					xPrev = x;
					yPrev = y;
					prevColor = currentColor;
				}
			}
			if((x-xPrev)>2){
				if(prevColor!=""){
					// Run found
					horizontalRuns.push({
						Start: {X: xPrev, Y: yPrev},
						End: {X: x-1, Y: y},
						Color: prevColor
					});
				}
			}
		}
		return horizontalRuns;
	},
	ScanVerticalRuns: function(){
		var x,y;
		var xPrev,yPrev;
		var currentColor;
		var prevColor;
		var verticalRuns = [];
		for(x=0;x<this.GridSize.X;x++){
			yPrev = 0;
			xPrev = x;
			prevColor = "";
			for(y=0;y<this.GridSize.Y;y++){
				var candy = this.GetCandy(x, y);
				if(candy){
					currentColor = candy.Color;
				}else{
					currentColor = "";
				}
				if(currentColor != prevColor){
					if((y-yPrev)>2){
						if(prevColor!=""){
							// Run found
							verticalRuns.push({
								Start: {X: xPrev, Y: yPrev},
								End: {X: x, Y: y-1},
								Color: prevColor
							});
						}
					}
					xPrev = x;
					yPrev = y;
					prevColor = currentColor;
				}
			}
			if((y-yPrev)>2){
				if(prevColor!=""){
					// Run found
					verticalRuns.push({
						Start: {X: xPrev, Y: yPrev},
						End: {X: x, Y: y-1},
						Color: prevColor
					});
				}
			}
		}
		return verticalRuns;
	},
	RemoveRuns: function(runs){
		var pointsMultiplier = 10;
		var points = 0;
		for(var i=0,n=runs.length;i<n;i++){
			var run = runs[i];
			if(run.Start.X == run.End.X){
				// Vertical run
				for(var y=run.Start.Y;y<=run.End.Y;y++){
					var candy = this.RemoveCandy(run.Start.X, y);
					if(candy){
						candy.Delete();
						points += pointsMultiplier;
						pointsMultiplier = pointsMultiplier + 10;
					}
				}
			}else{
				// Horizontal run
				for(var x=run.Start.X;x<=run.End.X;x++){
					var candy = this.RemoveCandy(x, run.Start.Y);
					if(candy){
						candy.Delete();
						points += pointsMultiplier;
						pointsMultiplier = pointsMultiplier + 10;
					}
				}
			}
		}
		return points;
	},
	ApplyRules: function(){
		var horizontalRuns = this.ScanHorizontalRuns();
		var verticalRuns = this.ScanVerticalRuns();
		var runs = horizontalRuns.concat(verticalRuns);
		var points = this.RemoveRuns(runs);
		console.log(points)
		return (runs.length>0);
	},
	CandyFall: function(){
		var falling = false;
		var x,y;
		for(y=(this.GridSize.Y-1);y>=0;y--){
			for(x=0;x<this.GridSize.X;x++){
				var candy = this.GetCandy(x, y);
				if(candy==null){
					if(y==0){
						var entCandy = new CandyEntity(this,
							this.RandomCandy(),
							{X: x, Y: y-1});
						this.GameScreen.AddEntity(entCandy);
						this.SetCandy(x, y, entCandy);
						falling = true;
					}else{
						var candyUp = this.RemoveCandy(x, y-1);
						if(candyUp){
							this.SetCandy(x, y, candyUp);
							falling = true;
						}
					}
					
				}
			}
		}
		return falling;
	},
	Debug: false
};

