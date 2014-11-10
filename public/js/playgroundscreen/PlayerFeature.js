

var PlayerFeature = (function() {
    
   
    function PlayerFeature(svgElem, svgWraper) {
        
        this.svgElem = svgElem;
        this.svgWraper = svgWraper;
        
        this.playerAvatar = {
            size : 50,
            shape : 'circle',
            userMaxSpeed : 5
        }        
    }
    
    
    /******************************
     *
     *  init
     *  add a new player
     *  on the field
     *
     ******************************/
    PlayerFeature.prototype.initAvatar = function(Player) {
        
        var mySvgAvatar = this.svgElem.image(
            Player.avatar.imgUrl,
            ( this.svgWraper.width()/2 - this.playerAvatar.size/2 ),
            ( this.svgWraper.height()/2 - this.playerAvatar.size/2 ),
            this.playerAvatar.size,
            this.playerAvatar.size
        ).attr({
            r: ( this.playerAvatar.size/2 ),
            id: Player.id,
            style: 'transform:translate(-50%, -50%)'
        });
        
        /*var mySvgAvatar = this.svgElem.circle(
            ( this.svgWraper.width()/2 - this.playerAvatar.size/2 ),
            ( this.svgWraper.height()/2 - this.playerAvatar.size/2 ),
            ( this.playerAvatar.size/2 )
        ).attr({
            fill: Player.avatar.secondaryColor,
            stroke: Player.avatar.primaryColor,
            strokeWidth: 5,
            id: Player.id 
        });*/
        
        return mySvgAvatar;
    }    
    
    
    PlayerFeature.prototype.updatePlayerPos = function( myPlayer, playerPos ) {
        
        /*if(myPlayer == 'dead' || undefined === myPlayer) {
            delete this.playerList[playerPos.playerId];
            return false;
        }*/
        
        var mySvgAvatar = myPlayer.svgAvatar;
        
        var playerType     = mySvgAvatar.type == 'image' ? true : false;
        var playerTypeX    = playerType ? 'x' : 'cx';
        var playerTypeY    = playerType ? 'y' : 'cy';
        
        var newCx = Math.round(+mySvgAvatar.attr(playerTypeX) + (this.playerAvatar.userMaxSpeed*playerPos.speed)*Math.cos( playerPos.degree*(Math.PI/180) ));
        var newCy = Math.round(+mySvgAvatar.attr(playerTypeY) - (this.playerAvatar.userMaxSpeed*playerPos.speed)*Math.sin( playerPos.degree*(Math.PI/180) ));
        
        //reach the boundaries ? X
        var avatarRealRayon = +mySvgAvatar.attr('r')+5;
        
        if( newCx+avatarRealRayon > this.svgWraper.width()) {
            newCx = this.svgWraper.width()-avatarRealRayon;
        } else if( newCx-avatarRealRayon < 0 ) {
            newCx = 0+avatarRealRayon;
        }
        //reach the boundaries ? Y
        if( newCy > 0 && newCy+avatarRealRayon > this.svgWraper.height()) {
            newCy = this.svgWraper.height()-avatarRealRayon;
        } else if( newCy-avatarRealRayon < 0 ) {
            newCy = 0+avatarRealRayon;
        }
        
        
        //assign the new values
        if(playerType)
            mySvgAvatar.attr({
                x : newCx,
                y : newCy
            });
        else        
            mySvgAvatar
            .attr({
                cx : newCx,
                cy : newCy
            });
    }
    
    /******************************
     *
     *  iAmInvicible
     *  
     *  add 3 secondes of invicibility
     *  to the player
     *
     ******************************/
    PlayerFeature.prototype.iAmInvicible = function( myPlayer, time ) {
        
        var mySvgAvatar = myPlayer.svgAvatar;
        
        mySvgAvatar.attr({
            opacity : 0.5
        })
        
        var i = 0;
        
        var timeOutInt = setInterval(function() {
            
            i += 1000;
            if( i >= time ) {
                
                mySvgAvatar.attr({
                    opacity : 1
                })
                clearInterval(timeOutInt);
            }
        }, 1000);
        
    }
    
    return PlayerFeature;
   
}());

















