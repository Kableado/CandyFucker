
/////////////////////////////////////////
//
// GameScreen
//
var GameScreen = function(idScreen, funcInit, funcProc, funcEnd, tps){
	this.Screen = document.getElementById(idScreen);
	this.Ctx = this.Screen.getContext('2d');
	this.Size = {X: this.Screen.width, Y: this.Screen.height};
	this.Entities = [];
	this.NewEntities = [];
	this.Running = false;
	this.FuncInit = funcInit;
	this.FuncProc = funcProc;
	this.FuncEnd = funcEnd;
	this.TPS = tps || 10;
	
	this.TickTime = 1000/this.TPS;
	this.AccTickTime = this.TickTime;
	this.PreviousTime = 0;
	
	this.Mouse = new Mouse(this.Screen, this.Size);
	
	var self = this;
	this.Tick = function(){
		while(self.AccTickTime>=self.TickTime){
			self.Update();
			if(self.FuncProc){
				self.FuncProc(self);
			}
			self.Mouse.Update();
			self.CleanDead();
			self.InsertAdded();
			self.AccTickTime -= self.TickTime;
		}
		self.Draw(self.AccTickTime/self.TickTime);
		
		var timeNow = performance.now();
		self.AccTickTime += timeNow - self.PreviousTime;
		self.PreviousTime = timeNow;
		
		if(self.Running){
			window.requestAnimationFrame(self.Tick);
		}else{
			if(self.FuncEnd){
				self.FuncEnd(self);
			}
		}
	}
};
GameScreen.prototype = {
	// For internal use
	CleanDead: function(){
		var i = this.Entities.length-1;
		while(i>0){
			if(this.Entities[i].GameEntity.Deleted){
				this.Entities.splice(i,1);
			}
			i--;
		}
	},
	InsertAdded: function(){
		for(var i=0,n=this.NewEntities.length;i<n;i++){
			this.Entities.push(this.NewEntities[i]);
		}
		this.NewEntities = [];
	},
	Update: function(){
		for(var i=0,n=this.Entities.length;i<n;i++){
			var entity = this.Entities[i];
			if(!entity.GameEntity.Deleted){
				entity.GameEntity.Update();
				if(entity.Update){
					entity.Update();
				}
			}
		}
	},
	Draw: function(factor){
		this.Ctx.clearRect(0, 0, this.Size.X, this.Size.Y);
		for(var i=0,n=this.Entities.length;i<n;i++){
			var entity = this.Entities[i];
			if(!entity.GameEntity.Deleted){
				entity.GameEntity.Draw(factor);
			}
		}
	},
	
	// For public use
	Start: function(){
		if(this.Running == false && this.FuncInit){
			this.FuncInit(this);
		}
		this.Running = true;
		
		this.PreviousTime = performance.now();
		this.Tick();
	},
	Stop: function(){
		this.Running = false;
	},
	AddEntity: function(newEntity){
		this.NewEntities.push(newEntity);
	},
	Debug: false
};


/////////////////////////////////////////
//
// GameEntity
//
var GameEntity = function(gameScreen, position, size, image, type){
	this.GameScreen = gameScreen;
	if(position){
		this.Position = {X: position.X, Y: position.Y};
		this.PositionDest = {X: position.X, Y: position.Y};
	}else{
		this.Position = {X: 0, Y: 0};
		this.PositionDest = {X: 0, Y: 0};
	}
	this.Size = size || {X: 0, Y: 0};
	this.Type = type || "Undefined";
	this.Image = image;
	this.Deleted = false;
};
GameEntity.prototype = {
	Update: function(){
		this.Position.X = this.PositionDest.X;
		this.Position.Y = this.PositionDest.Y;
	},
	Draw: function(factor){
		if(!this.Image){ return; }
		var x = this.Position.X - factor * (this.Position.X - this.PositionDest.X);
		var y = this.Position.Y - factor * (this.Position.Y - this.PositionDest.Y);
		this.GameScreen.Ctx.drawImage(this.Image,
			x - (this.Size.X / 2),
			y - (this.Size.Y / 2));
	},
	SetImage: function(image){
		this.Image = image;
	},
	SetPosition: function(position){
		this.Position.X = position.X;
		this.Position.Y = position.Y;
		this.PositionDest.X = position.X;
		this.PositionDest.Y = position.Y;
	},
	UpdatePosition: function(position){
		this.Position.X = this.PositionDest.X;
		this.Position.Y = this.PositionDest.Y;
		this.PositionDest.X = position.X;
		this.PositionDest.Y = position.Y;
	},
	Delete: function(){
		this.Deleted = true;
	},
	Debug: false
};


/////////////////////////////////////////
//
// Mouse
//
var Mouse = function(screen, size){
	this.Screen = screen;
	this.Size = size || {X: screen.width, Y: screen.height};
	
	this.Down = false;
	this.StartPosition = {X: 0, Y: 0};
	this.EndPosition = {X: 0, Y: 0};
	
	this.Screen.onmousedown = this.OnMouseDown.bind(this);
	this.Screen.onmousemove = this.OnMouseMove.bind(this);
	this.Screen.onmouseup = this.OnMouseUp.bind(this);
	this.Screen.onmouseleave = this.OnMouseLeave.bind(this);
};
Mouse.prototype = {
	GetEventPoistion: function(event){
		var position = {X: event.clientX, Y: event.clientY};
		var element = this.Screen;
		while(element){
			position.X -= element.offsetLeft;
			position.Y -= element.offsetTop;
			element = element.offsetParent;
		}
		position.X = (position.X / this.Screen.offsetWidth) * this.Size.X;
		position.Y = (position.Y / this.Screen.offsetHeight) * this.Size.Y;
		return position;
	},
	OnMouseDown: function(event){
		var position = this.GetEventPoistion(event);
		this.RealDown = true;
		this.Down = true;
		this.StartPosition.X = position.X;
		this.StartPosition.Y = position.Y;
		this.EndPosition.X = position.X;
		this.EndPosition.Y = position.Y;
	},
	OnMouseMove: function(event){
		if(this.RealDown == false){ return; }
		var position = this.GetEventPoistion(event);
		this.RealDown = true;
		this.Down = true;
		this.EndPosition.X = position.X;
		this.EndPosition.Y = position.Y;
	},
	OnMouseUp: function(event){
		var position = this.GetEventPoistion(event);
		this.RealDown = false;
		this.EndPosition.X = position.X;
		this.EndPosition.Y = position.Y;
	},
	OnMouseLeave: function(){
		this.RealDown = false;
		this.Down = false;
	},
	Update: function(){
		if(this.RealDown == false){
			this.Down = false;
		}
	},
	Cancel: function(){
		this.RealDown = false;
		this.Down = false;
	},
	Debug: false
};


/////////////////////////////////////////
//
// ImageLoader
//
var ImageLoader = function(imageList, funcOnLoad){
	this.Images = {};
};
ImageLoader.prototype = {
	IsImageOk: function(img){
		if (!img.complete) {
			return false;
		}
		if (typeof img.naturalWidth !== "undefined" && img.naturalWidth === 0) {
			return false;
		}
		return true;
	},
	LoadImages: function(imageList, funcOnLoad){
		this.ImageCount = imageList.length;
		this.FuncOnLoad = funcOnLoad;
		
		var i,n;
		for(i=0,n=imageList.length;i<n;i++){
			var name = imageList[i].Name;
			this.Images[name] = new Image();
		}
		
		var self = this;
		var launched = false;
		var privateOnLoad = function(){
			if(launched){ return; }
			var count = 0;
			for (var name in self.Images) {
				if (self.Images.hasOwnProperty(name)) {
					if(self.IsImageOk(self.Images[name])){
						count++;
					}
				}
			}
			
			console.log("Images: " + count + "/" + self.ImageCount);
			if(count == self.ImageCount){
				launched = true;
				if(self.FuncOnLoad){
					self.FuncOnLoad();
				}
			}
		};
		for(i=0,n=imageList.length;i<n;i++){
			var name = imageList[i].Name;
			this.Images[name].onload = privateOnLoad;
			this.Images[name].src = imageList[i].Url;
		}
		privateOnLoad();
	},
	GetImage: function(name){
		return this.Images[name];
	},
	Debug: false
};

