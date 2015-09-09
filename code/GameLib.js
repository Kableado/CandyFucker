
/////////////////////////////////////////
//
// GameScreen
//
var GameScreen = function(idScreen, funcInit, funcProc, funcEnd){
	this.Screen = document.getElementById(idScreen);
	this.Ctx = this.Screen.getContext('2d');
	this.Size = {X: this.Screen.width, Y: this.Screen.height};
	this.Entities = [];
	this.NewEntities = [];
	this.Running = false;
	this.FuncInit = funcInit;
	this.FuncProc = funcProc;
	this.FuncEnd = funcEnd;
	
	var self = this;
	this.Tick = function(){
		if(self.FuncProc){
			self.FuncProc(self);
		}
		self.CleanDead();
		self.InsertAdded();
		self.Update();
		self.Draw();
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
	Draw: function(){
		this.Ctx.clearRect(0, 0, this.Size.X, this.Size.Y);
		for(var i=0,n=this.Entities.length;i<n;i++){
			var entity = this.Entities[i];
			if(!entity.GameEntity.Deleted){
				entity.GameEntity.Draw();
			}
		}
	},
	
	// For public use
	Start: function(){
		if(this.Running == false && this.FuncInit){
			this.FuncInit(this);
		}
		this.Running = true;
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
	this.Position = position || {X: 0, Y: 0};
	this.Size = size || {X: 0, Y: 0};
	this.Type = type || "Undefined";
	this.Image = image;
	this.Deleted = false;
};
GameEntity.prototype = {
	Update: function(){ },
	Draw: function(factor){
		if(!this.Image){ return; }
		this.GameScreen.Ctx.drawImage(this.Image,
			this.Position.X - (this.Size.X / 2),
			this.Position.Y - (this.Size.Y / 2));
	},
	SetImage: function(image){
		this.Image = image;
	},
	Move: function(deltaPosition){
		this.Position.X += deltaPosition.X;
		this.Position.Y += deltaPosition.Y;
	},
	SetPosition: function(position){
		this.Position.X = position.X;
		this.Position.Y = position.Y;
	},
	Delete: function(){
		this.Deleted = true;
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
			
			console.log("Images: "+count+"/"+self.ImageCount);
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

