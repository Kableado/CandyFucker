window.Images = new ImageLoader();
window.Sounds = new SoundLoader();


/////////////////////////////////////////
//
// Particle
//
var Particle = function (game, position, image) {
	this.Game = game;
	this.GameEntity = new GameEntity(
		game.GameScreen,
		position, {
			X: image.naturalWidth,
			Y: image.naturalHeight
		},
		image,
		"Particle");
	this.Speed = Vec2D.Scale(
		Vec2D.Normalize({
			X: Math.floor(Math.random() * 33) - 16,
			Y: Math.floor(Math.random() * 33) - 16
		}),
		48);
};
Particle.prototype = {
	Update: function () {
		this.Speed = Vec2D.Scale(this.Speed, 1.5);
		this.GameEntity.AddPosition(this.Speed);
		if (this.GameEntity.InsideScreen() === false) {
			this.GameEntity.Delete();
		}
	}
};


/////////////////////////////////////////
//
// CandyEntity
//
var CandyEntity = function (game, color, gridPosition) {
	this.Game = game;
	this.GridPosition = gridPosition || {
		X: 0,
		Y: 0
	};
	this.Color = color;
	this.GameEntity = new GameEntity(
		game.GameScreen,
		null, {
			X: 32,
			Y: 32
		},
		Images.GetImage("Balls" + color),
		"Candy");
	this.SetGridPosition(gridPosition.X, gridPosition.Y);
};
CandyEntity.prototype = {
	Update: function () {},
	SetGridPosition: function (x, y) {
		this.GridPosition.X = x;
		this.GridPosition.Y = y;
		this.GameEntity.UpdatePosition({
			X: this.Game.GridOffset.X + (x * 32),
			Y: this.Game.GridOffset.Y + (y * 32)
		});
	},
	Delete: function () {
		var frag;
		var i;
		for (i = 0; i < 4; i++) {
			frag = new Particle(
				this.Game,
				this.GameEntity.PositionDest,
				Images.GetImage("Frags" + this.Color));
			frag.GameEntity.Update();
			this.Game.GameScreen.AddEntity(frag);
		}
		this.GameEntity.Delete();
		window.Sounds.PlaySound("Explosion");
	},
	SetOffset: function (x, y) {
		this.GameEntity.UpdatePosition({
			X: (this.Game.GridOffset.X + (this.GridPosition.X * 32)) + x,
			Y: (this.Game.GridOffset.Y + (this.GridPosition.Y * 32)) + y
		});
	},
	ResetPosition: function () {
		this.SetGridPosition(this.GridPosition.X, this.GridPosition.Y);
	},
	Debug: false
};
CandyEntity.RandomCandy = function () {
	//var candyTypes = ["Red", "Blue", "Cyan", "Green", "Yellow"];
	var candyTypes = ["Red", "Blue", "Cyan", "Yellow"];
	return candyTypes[Math.floor(Math.random() * candyTypes.length)];
};


/////////////////////////////////////////
//
// CandyBoard
//
var CandyBoard = function (game) {
	this.Game = game;
	this.GridSize = {
		X: 0,
		Y: 0
	};
	this.Grid = null;

	this.Changed = false;
};
CandyBoard.prototype = {
	IsChanged: function () {
		return this.Changed;
	},
	GetCandy: function (x, y) {
		if (x < 0 || x > this.GridSize.X || y < 0 || y > this.GridSize.Y) {
			return null;
		}
		return this.Grid[y][x];
	},
	SetCandy: function (x, y, candy) {
		if (x < 0 || x > this.GridSize.X || y < 0 || y > this.GridSize.Y) {
			return;
		}
		this.Grid[y][x] = candy;
		this.Changed = true;
		candy.SetGridPosition(x, y);
	},
	RemoveCandy: function (x, y) {
		if (x < 0 || x > this.GridSize.X || y < 0 || y > this.GridSize.Y) {
			return;
		}
		var candy = this.Grid[y][x];
		this.Grid[y][x] = null;
		this.Changed = true;
		return candy;
	},
	BuildGrid: function (width, height) {
		var x,
			y;
		this.GridSize = {
			X: width,
			Y: height
		};
		// Allocate Grid
		this.Grid = [];
		for (y = 0; y < height; y++) {
			this.Grid.push([]);
			for (x = 0; x < width; x++) {
				this.Grid[y].push(null);
			}
		}

		// Fill Grid
		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				var entCandy = new CandyEntity(
					this.Game,
					CandyEntity.RandomCandy(), {
						X: x,
						Y: y
					});
				this.Game.GameScreen.AddEntity(entCandy);
				this.SetCandy(x, y, entCandy);
			}
		}
		this.Changed = true;
	},
	ScanHorizontalRuns: function () {
		var x,
			y;
		var xPrev,
			yPrev;
		var currentColor;
		var prevColor;
		var horizontalRuns = [];
		for (y = 0; y < this.GridSize.Y; y++) {
			yPrev = y;
			xPrev = 0;
			prevColor = "";
			for (x = 0; x < this.GridSize.X; x++) {
				var candy = this.GetCandy(x, y);
				if (candy) {
					currentColor = candy.Color;
				} else {
					currentColor = "";
				}
				if (currentColor !== prevColor) {
					if ((x - xPrev) > 2) {
						if (prevColor !== "") {
							// Run found
							horizontalRuns.push({
								Start: {
									X: xPrev,
									Y: yPrev
								},
								End: {
									X: x - 1,
									Y: y
								},
								Color: prevColor
							});
						}
					}
					xPrev = x;
					yPrev = y;
					prevColor = currentColor;
				}
			}
			if ((x - xPrev) > 2) {
				if (prevColor !== "") {
					// Run found
					horizontalRuns.push({
						Start: {
							X: xPrev,
							Y: yPrev
						},
						End: {
							X: x - 1,
							Y: y
						},
						Color: prevColor
					});
				}
			}
		}
		return horizontalRuns;
	},
	ScanVerticalRuns: function () {
		var x,
			y;
		var xPrev,
			yPrev;
		var currentColor;
		var prevColor;
		var verticalRuns = [];
		for (x = 0; x < this.GridSize.X; x++) {
			yPrev = 0;
			xPrev = x;
			prevColor = "";
			for (y = 0; y < this.GridSize.Y; y++) {
				var candy = this.GetCandy(x, y);
				if (candy) {
					currentColor = candy.Color;
				} else {
					currentColor = "";
				}
				if (currentColor !== prevColor) {
					if ((y - yPrev) > 2) {
						if (prevColor !== "") {
							// Run found
							verticalRuns.push({
								Start: {
									X: xPrev,
									Y: yPrev
								},
								End: {
									X: x,
									Y: y - 1
								},
								Color: prevColor
							});
						}
					}
					xPrev = x;
					yPrev = y;
					prevColor = currentColor;
				}
			}
			if ((y - yPrev) > 2) {
				if (prevColor !== "") {
					// Run found
					verticalRuns.push({
						Start: {
							X: xPrev,
							Y: yPrev
						},
						End: {
							X: x,
							Y: y - 1
						},
						Color: prevColor
					});
				}
			}
		}
		return verticalRuns;
	},
	ScanRuns: function () {
		var horizontalRuns = this.ScanHorizontalRuns();
		var verticalRuns = this.ScanVerticalRuns();
		return horizontalRuns.concat(verticalRuns);
	},
	ExplodeCandy: function (x, y) {
		var entCandy = this.RemoveCandy(x, y);
		if (entCandy) {
			entCandy.Delete();
			return true;
		}
		return false;
	},
	RemoveRuns: function (runs) {
		var pointsMultiplier = 10;
		var points = 0;
		var i;
		var n;
		for (i = 0, n = runs.length; i < n; i++) {
			var run = runs[i];
			if (run.Start.X === run.End.X) {
				// Vertical run
				for (var y = run.Start.Y; y <= run.End.Y; y++) {
					if (this.ExplodeCandy(run.Start.X, y)) {
						points += pointsMultiplier;
						pointsMultiplier = pointsMultiplier + 10;
					}
				}
			} else {
				// Horizontal run
				for (var x = run.Start.X; x <= run.End.X; x++) {
					if (this.ExplodeCandy(x, run.Start.Y)) {
						points += pointsMultiplier;
						pointsMultiplier = pointsMultiplier + 10;
					}
				}
			}
		}
		return points;
	},
	CandyFall: function () {
		var falling = false;
		var x;
		var y;
		for (y = (this.GridSize.Y - 1); y >= 0; y--) {
			for (x = 0; x < this.GridSize.X; x++) {
				var candy = this.GetCandy(x, y);
				if (candy === null) {
					if (y === 0) {
						var entCandy = new CandyEntity(
							this.Game,
							CandyEntity.RandomCandy(), {
								X: x,
								Y: y - 1
							});
						this.Game.GameScreen.AddEntity(entCandy);
						this.SetCandy(x, y, entCandy);
						falling = true;
					} else {
						var candyUp = this.RemoveCandy(x, y - 1);
						if (candyUp) {
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


/////////////////////////////////////////
//
// CandyFucker
//
var CandyFucker = function (idScreen, idInfoDisplay) {
	this.GameScreen = new GameScreen(idScreen,
		this.Init.bind(this),
		this.Proc.bind(this),
		this.End.bind(this),
		10);

	this.Board = new CandyBoard(this);
	this.Falling = false;
	this.GridOffset = {
		X: 0,
		Y: 0
	};

	this.InfoDisplay = document.getElementById(idInfoDisplay);
	this.Locked = false;
	this.Score = 0;

	this.SwapDirection = null;
	this.SwapDistance = 0;
	this.SwapCandy1 = null;
	this.SwapCandy2 = null;

	this.MaxSwapDistance = 32;

	this.LoadImages();
};
CandyFucker.prototype = {
	LoadImages: function () {
		var self = this;

		window.Images.LoadImages(
			[
				{
					Name: "BallsRed",
					Url: "gfx/BallsRed.png"
				},
				{
					Name: "BallsBlue",
					Url: "gfx/BallsBlue.png"
				},
				{
					Name: "BallsCyan",
					Url: "gfx/BallsCyan.png"
				},
				{
					Name: "BallsGreen",
					Url: "gfx/BallsGreen.png"
				},
				{
					Name: "BallsYellow",
					Url: "gfx/BallsYellow.png"
				},
				{
					Name: "FragsRed",
					Url: "gfx/FragsRed.png"
				},
				{
					Name: "FragsBlue",
					Url: "gfx/FragsBlue.png"
				},
				{
					Name: "FragsCyan",
					Url: "gfx/FragsCyan.png"
				},
				{
					Name: "FragsGreen",
					Url: "gfx/FragsGreen.png"
				},
				{
					Name: "FragsYellow",
					Url: "gfx/FragsYellow.png"
				}
			],
			function () {
				self.LoadSounds();
			});
	},
	LoadSounds: function () {
		var self = this;

		window.Sounds.LoadSounds(
			[
				{
					Name: "Explosion",
					Url: "sfx/explosion1.wav"
				},
				{
					Name: "PickCandy",
					Url: "sfx/pickcandy.wav"
				}
			],
			function () {
				self.GameScreen.Start();
			});
	},
	Init: function () {
		var width = 12;
		var height = 12;
		this.GridOffset.X = (this.GameScreen.Size.X - ((width - 1) * 32)) / 2.0;
		this.GridOffset.Y = (this.GameScreen.Size.Y - ((height - 1) * 32)) / 2.0;

		this.Board.BuildGrid(12, 12);

		this.UpdateInfoDisplay();
	},
	Proc: function () {
		if (this.Locked) {
			if (this.Falling) {
				if (!this.Board.CandyFall()) {
					this.Falling = false;
				}
			} else {
				if (this.ApplyRules()) {
					this.Falling = this.Board.CandyFall();
				} else {
					this.Locked = false;
				}
			}
		} else {
			if (this.GameScreen.Mouse.Down) {
				this.ProcessSwap();
			} else {
				this.CancelSwap();
			}
			if (this.Board.IsChanged()) {
				if (this.ApplyRules()) {
					this.Locked = true;
					this.Falling = this.Board.CandyFall();
				}
			}
		}
		this.Changed = false;
	},
	End: function () {},
	UpdateInfoDisplay: function () {
		this.InfoDisplay.innerHTML = "Score: " + this.Score;
	},
	ApplyRules: function () {
		var runs = this.Board.ScanRuns();
		var points = this.Board.RemoveRuns(runs);
		if (points > 0) {
			this.Score += points;
			this.UpdateInfoDisplay();
			console.log("Score: +" + points);
		}
		return (runs.length > 0);
	},
	ProcessSwap: function () {
		if (this.SwapDirection === null) {
			var candies = this.GameScreen.GetEntitiesUnderPoint(
				this.GameScreen.Mouse.StartPosition,
				"Candy");
			if (candies === null || candies.length === 0) {
				this.CancelSwap();
			} else {
				this.StartSwap(candies[0]);
				window.Sounds.PlaySound("PickCandy");
			}
		}
		if (this.SwapDirection !== null) {
			var x = this.GameScreen.Mouse.EndPosition.X -
				this.GameScreen.Mouse.StartPosition.X;
			var y = this.GameScreen.Mouse.EndPosition.Y -
				this.GameScreen.Mouse.StartPosition.Y;
			if (Math.abs(x) > Math.abs(y)) {
				if (x > 0) {
					this.ProcSwapRight(x);
				}
				if (x < 0) {
					this.ProcSwapLeft(-x);
				}
			} else {
				if (y > 0) {
					this.ProcSwapDown(y);
				}
				if (y < 0) {
					this.ProcSwapUp(-y);
				}
			}
		}
	},
	ProcSwapLeft: function (dist) {
		if (this.SwapDirection != "Left") {
			this.SwapDirection = "Left";
			if (this.SwapCandy2) {
				this.SwapCandy2.ResetPosition();
			}
			this.SwapCandy2 = this.Board.GetCandy(
				this.SwapCandy1.GridPosition.X - 1,
				this.SwapCandy1.GridPosition.Y);
		}
		this.SwapDistance = dist;
		if (this.SwapDistance > this.MaxSwapDistance) {
			this.DoSwap();
		} else {
			if (this.SwapCandy2) {
				this.SwapCandy1.SetOffset(-this.SwapDistance, 0);
				this.SwapCandy2.SetOffset(this.SwapDistance, 0);
			} else {
				this.SwapCandy1.ResetPosition();
			}
		}
	},
	ProcSwapRight: function (dist) {
		if (this.SwapDirection != "Right") {
			this.SwapDirection = "Right";
			if (this.SwapCandy2) {
				this.SwapCandy2.ResetPosition();
			}
			this.SwapCandy2 = this.Board.GetCandy(
				this.SwapCandy1.GridPosition.X + 1,
				this.SwapCandy1.GridPosition.Y);
		}
		this.SwapDistance = dist;
		if (this.SwapDistance > this.MaxSwapDistance) {
			this.DoSwap();
		} else {
			if (this.SwapCandy2) {
				this.SwapCandy1.SetOffset(this.SwapDistance, 0);
				this.SwapCandy2.SetOffset(-this.SwapDistance, 0);
			} else {
				this.SwapCandy1.ResetPosition();
			}
		}
	},
	ProcSwapUp: function (dist) {
		if (this.SwapDirection != "Up") {
			this.SwapDirection = "Up";
			if (this.SwapCandy2) {
				this.SwapCandy2.ResetPosition();
			}
			this.SwapCandy2 = this.Board.GetCandy(
				this.SwapCandy1.GridPosition.X, this.SwapCandy1.GridPosition.Y - 1);
		}
		this.SwapDistance = dist;
		if (this.SwapDistance > this.MaxSwapDistance) {
			this.DoSwap();
		} else {
			if (this.SwapCandy2) {
				this.SwapCandy1.SetOffset(0, -this.SwapDistance);
				this.SwapCandy2.SetOffset(0, this.SwapDistance);
			} else {
				this.SwapCandy1.ResetPosition();
			}
		}
	},
	ProcSwapDown: function (dist) {
		if (this.SwapDirection != "Down") {
			this.SwapDirection = "Down";
			if (this.SwapCandy2) {
				this.SwapCandy2.ResetPosition();
			}
			this.SwapCandy2 = this.Board.GetCandy(
				this.SwapCandy1.GridPosition.X,
				this.SwapCandy1.GridPosition.Y + 1);
		}
		this.SwapDistance = dist;
		if (this.SwapDistance > this.MaxSwapDistance) {
			this.DoSwap();
		} else {
			if (this.SwapCandy2) {
				this.SwapCandy1.SetOffset(0, this.SwapDistance);
				this.SwapCandy2.SetOffset(0, -this.SwapDistance);
			} else {
				this.SwapCandy1.ResetPosition();
			}
		}
	},
	StartSwap: function (candy) {
		this.SwapDirection = "";
		this.SwapCandy1 = candy;
		this.SwapCandy2 = null;
		this.SwapDistance = 0;
	},
	CancelSwap: function () {
		this.GameScreen.Mouse.Cancel();
		this.SwapDirection = null;
		if (this.SwapCandy1) {
			this.SwapCandy1.ResetPosition();
		}
		if (this.SwapCandy2) {
			this.SwapCandy2.ResetPosition();
		}
		this.SwapCandy1 = null;
		this.SwapCandy2 = null;
		this.SwapDistance = 0;
	},
	DoSwap: function () {
		if (this.SwapCandy1 === null || this.SwapCandy2 === null) {
			this.CancelSwap();
			return;
		}
		var x1 = this.SwapCandy1.GridPosition.X;
		var y1 = this.SwapCandy1.GridPosition.Y;
		var x2 = this.SwapCandy2.GridPosition.X;
		var y2 = this.SwapCandy2.GridPosition.Y;
		var candy1 = this.Board.RemoveCandy(x1, y1);
		var candy2 = this.Board.RemoveCandy(x2, y2);
		this.Board.SetCandy(x2, y2, candy1);
		this.Board.SetCandy(x1, y1, candy2);
		this.GameScreen.Mouse.Cancel();
		this.SwapDirection = null;
		this.SwapCandy1 = null;
		this.SwapCandy2 = null;
		this.SwapDistance = 0;
	},
	Debug: false
};

