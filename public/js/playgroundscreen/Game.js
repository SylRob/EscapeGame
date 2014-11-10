

var Game = (function() {
    
   
    function Game(svgElem, parent) {
        
        this.svgElem = svgElem;
        this.svgWraper = parent;
        
        this.playerAvatar = {
            size : 50,
            shape : 'circle',
            userMaxSpeed : 5
        }
        
        this.gameScript;
        this.elemSvg;
        this.playerFeature;
        
        this.elemStatus = {};
        this.playerList = [];
        this.interval = [];
        this.startInvicibleTime = 4000;
        this.g = 0;
        this.init();        
    }
    
    /******************************
     *
     *  init
     *  
     *  warn the players
     *
     ******************************/
    Game.prototype.init = function() {
        var _this = this;
        socket.emit('thePlayGroundHasArrive');
        
        var globalRect = this.svgElem.rect( 0, 0, this.svgWraper.width(), this.svgWraper.height() )
        .attr({
            fill: '#FFFFFF',
            stroke: "#000",
            strokeWidth: 5
        });
        
        $(window).on('resize', function() {
            globalRect.attr({
                width : _this.svgWraper.width(),
                height : _this.svgWraper.height()
            })
        });
        
        // init these variable here are important for the posisition of the element in the DOM
        this.gameScript = new GameScript(this);
        this.elemSvg = new ElementsSvg(this.svgElem, this.svgWraper);
        this.playerFeature = new PlayerFeature(this.svgElem, this.svgWraper);
        
        
        this.start();
    }
    
    /******************************
     *
     *  start
     *  
     *  init the SVG
     *  and set the main loop
     *
     ******************************/
    Game.prototype.start = function() {
        var _this = this;
        
        this.elemStatus = this.elemSvg.start();
        this.gameScript.start();
        
        this.interval = setInterval(function() {            
            
            //time to move !!
            for(elem in _this.elemStatus) {
                if(_this.elemStatus.hasOwnProperty(elem) && undefined != _this.elemStatus[elem]){
                    
                    if( _this.elemSvg.movingElem(_this.elemStatus[elem]) === 'deleted') {
                        delete _this.elemStatus[elem];
                        _this.elemSvg.randomElemGenerator();
                        continue;
                    }
                    
                    if(Object.keys(_this.playerList).length > 0 && undefined !== elem) _this.didIKillSomeone(elem);
                    
                } else clearInterval(_this.interval);
                
            }
            
        }, 30);
        
        
    }
    
    /******************************
     *
     *  didIKillSomeone
     *  
     *  check if a player touch
     *  an element
     *
     ******************************/
    Game.prototype.didIKillSomeone = function(elem) {
        var _this = this;
        
        var myElem = this.elemStatus[elem];
        
        if( undefined === myElem ) return false;
        
        var imgType     = myElem.body.type == 'image' ? true : false;
        var imgTypeX    = imgType ? 'x' : 'cx';
        var imgTypeY    = imgType ? 'y' : 'cy';
        
        var elemX = +myElem.body.attr(imgTypeX);
        var elemY = +myElem.body.attr(imgTypeY);
        var elemR = +myElem.body.attr('r');
        
        
        
        for(var playerId in this.playerList) {
           
            var player = _this.playerList[playerId];
            
            if( undefined === player || undefined === player.svgAvatar || player.invicible ) continue;
            
            
            
            var playerType     = player.svgAvatar.type == 'image' ? true : false;
            var playerTypeX    = playerType ? 'x' : 'cx';
            var playerTypeY    = playerType ? 'y' : 'cy';
            
            var playerX = +player.svgAvatar.attr(playerTypeX);
            var playerY = +player.svgAvatar.attr(playerTypeY);
            var playerR = +player.svgAvatar.attr('r');
            
            //string length AB² = (Bx - Ax)² + (By - Ay)²
            
            var stringLength = Math.round( Math.sqrt( Math.pow( ( playerX-elemX ),2) + Math.pow( ( playerY-elemY ),2 ) ) *100 ) / 100;
            stringLength = stringLength < 0 ? stringLength*-1 : stringLength;
            
            //if the addition of half of the length of the player avatar and the element are longer than the length of the string -> dead
            if( ( playerR+elemR ) > stringLength ) {
                
                //special event when touch ?
                if(myElem.callBack !== undefined) myElem.callBack('touch', playerId);
                //no ? then you are DEAD !
                else _this.youAreDead(playerId);
            }
            
        }
        
    }
    
    /******************************
     *
     *  youNeedABeer
     *  
     *  gice a free beer to the player
     *
     ******************************/
    Game.prototype.youNeedABeer = function(playerId) {
        
        socket.emit('youNeedABeer', playerId);
        
    }
    
    /******************************
     *
     *  getElementsList
     *  
     *  get the element list from
     *  Game
     *
     ******************************/
    Game.prototype.getElementsList = function() {
        
        return this.elemStatus;
        
    }
    
    /******************************
     *
     *  getElementsList
     *  
     *  get the element list from
     *  Game
     *
     ******************************/
    Game.prototype.deleteElem = function(elem) {
           
        delete this.elemStatus[elem];
        
    }
    
    /******************************
     *
     *  youAreDead
     *
     *  a player lost
     *
     ******************************/
    Game.prototype.youAreDead = function(playerId) {   
        socket.emit('youAreDead', playerId);
        this.playerList[playerId].svgAvatar.remove();
        delete this.playerList[playerId];
    }
    
    
    /******************************
     *
     *  addNewPlayer
     *  is called every "newPlayer"
     *  event
     *  take a Player object as
     *  parameter and compare the
     *  id to the other player
     *  if new ID then add the player
     *  to the playerList array
     *
     ******************************/
    Game.prototype.addNewPlayer = function( Player ) {
        
        if( typeof(Player) != 'object' || Player.id == '' ) {
            throw new Error('a problem happpend with this player');
            return false;
        }
        
        var iid = Player.id;
        
        if(this.playerList.length > 1) {
            for(otherPlayer in this.playerList) {
                if(otherPlayer.id == Player.id) {
                    throw new Error('double ID');
                    return false;
                }
            }
        }
        
        this.playerList[iid] = Player;
        
        this.playerList[iid].svgAvatar = this.playerFeature.initAvatar(Player);
        this.playerList[iid].invicible = false;
        
        this.youAreInvicible( this.playerList[iid] );
        
    }
    
    /******************************
     *
     *  youAreInvicible
     *  
     *  add 3 secondes of invicibility
     *  to the player
     *
     ******************************/
    Game.prototype.youAreInvicible = function( Player ) {
        
        Player.invicible = true;
        
        this.playerFeature.iAmInvicible(Player, this.startInvicibleTime);
        
        setTimeout(function() {
            
            Player.invicible = false;
            
        }, this.startInvicibleTime);
        
    }
    
    
    Game.prototype.updatePlayerPos = function( playerPos ) {
        
        var myPlayer = this.playerList[playerPos.playerId];
        
        if( undefined === myPlayer ) {
            delete this.playerList[playerPos.playerId];
            return false;
        }
        
        this.playerFeature.updatePlayerPos( myPlayer, playerPos );
    }
    
    /******************************
     *
     *  removePlayer
     *  is called every "playerLeft"
     *  event
     *  take a id string
     *  look for the ID in the player
     *  list and remove it from the
     *  playerList
     *
     ******************************/
    
    Game.prototype.removePlayer = function( id ) {
        var _this = this;
        
        if(id == null) return false;
        
        
        if(undefined == id || id == '' || Object.keys(this.playerList).length < 1) {
            /*throw new Error('no player found');
            return false;*/            
        } else {
            for(var i = 0 ; i < Object.keys(this.playerList).length ; i++) {
                
                if(_this.playerList[id]) {
                    
                    _this.playerList[id].svgAvatar.remove();
                    
                    delete _this.playerList[id];
                    
                    return false;
                }
            }
        }
        
    }
   
    return Game;
   
}());