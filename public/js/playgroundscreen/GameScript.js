

var GameScript = (function() {
    
   
    function GameScript(Game) {
        
        this.svgElem = Game.svgElem;
        this.svgWraper = Game.svgWraper;
        this.elemList = Game.elemStatus;
        this.Game = Game;
        this.actualScript = '';
        
        this.mainGroup;
        this.init();
        
        this.animationOrder = [
            { name : 'desert', duration : 20000 },
            { name : 'tilt', duration : 5 },
            { name : 'grillage', duration : 20000 },
            { name : 'rainbow', duration : 5 },
            { name : 'border', duration : 10000 }
        ]
        
        this.timingBeer = 30000;
        
    }
    
    /******************************
     *
     *  init
     *  
     *  prepare the field
     *  by creating a group
     *  witch will be set first
     *  so his position will be under
     *  all the future new element
     *
     ******************************/
    GameScript.prototype.init = function() {
        
        this.mainGroup = this.svgElem.g().attr({
            id : 'scriptedGroup'
        })
        
    }
    
    /******************************
     *
     *  start
     *  
     *  time to start
     *
     ******************************/
    GameScript.prototype.start = function() {
        var _this = this;
        
        this.nextScript();
        this.goldenBeer();
        
    }
    
    /******************************
     *
     *  nextScript
     *  
     *  go to the next script
     *  on the list
     *
     ******************************/
    GameScript.prototype.nextScript = function() {
        var _this = this;
        
        var scriptToLaunch;
        
        if( this.actualScript == '' ) scriptToLaunch = this.animationOrder[0];
        else {
            
            for(elemKey in this.animationOrder) {
                
                if(_this.animationOrder[elemKey].name == _this.actualScript) {
                    
                    if( (+elemKey+1) < Object.keys(_this.animationOrder).length ) scriptToLaunch = _this.animationOrder[(+elemKey+1)];
                    else scriptToLaunch = _this.animationOrder[0];
                    
                    break;
                }
            }
        }
        
        this.actualScript = scriptToLaunch.name;
        this[scriptToLaunch.name](scriptToLaunch.duration);
        
    }
    
    /******************************
     *
     *  desert
     *  
     *  nothing special
     *
     ******************************/
    GameScript.prototype.desert = function(duration) {
        var _this = this;
        
        setTimeout(function(){ _this.nextScript(); }, duration);
        
    }
    
    /******************************
     *
     *  rainbow
     *  
     *  change the element of
     *  color
     *
     ******************************/
    GameScript.prototype.rainbow = function(turnToComplete) {
        var _this = this;
        var animatedSpeed = 1000;
        
        var turnCompleted = 0;
        var accumulateTime = 0;
        var listColor = [
            '#cb0623',
            '#ee8a00',
            '#eace00',
            '#009e35',
            '#008ebe',
            '#493f92',
            '#890881',
            '#000000'
        ];
        
        
        //let make a rectangle in the background and delete it after
        var bgRect = this.svgElem.rect(0, 0, this.svgWraper.width(), this.svgWraper.height()).attr({
            fill : '#FFFFFF'
        });
        
        this.mainGroup.add(bgRect);
        
        for(var h = 0; h < turnToComplete; h++)
            for(var i = 0; i<listColor.length ; i++) {
                
                (function(j, time) {
                    setTimeout(function() {
                        var eveyElements = _this.Game.getElementsList();
                        
                        //new turn
                        if(j == (listColor.length-1)) turnCompleted++;
                        
                        //BG color setting
                        var randomColor = listColor[Math.floor(Math.random()*listColor.length)];
                        if(listColor[j] != randomColor) bgRect.animate({ fill : randomColor }, animatedSpeed);
                        
                        //elements color setting
                        for(elemKey in eveyElements) {
                            var elem = eveyElements[elemKey].body;
                            
                            if( elem.attr('class') == 'element' ) elem.animate({fill : listColor[j]}, animatedSpeed);
                            else break;
                        }
                        
                        //is it finish ?
                        if(turnCompleted == turnToComplete) setTimeout(function() { bgRect.remove(); _this.resetGameScripts(); _this.nextScript(); }, +animatedSpeed+10);
                        
                    }, accumulateTime);
                
                }(i, accumulateTime))
                   
                accumulateTime += animatedSpeed;
            }
        
    }
    
    /******************************
     *
     *  grillage
     *  
     *  change the element of
     *  color
     *
     ******************************/
    GameScript.prototype.grillage = function(duration) {
        var _this = this;
        var accumulateTime = 0;
        
        var rect = this.svgElem.rect(0,0, this.svgWraper.width(), this.svgWraper.height()).attr({
            fill : 'none'
        });
        
        var pathSource = this.svgElem.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({
            fill: "none",
            stroke: "#000000",
            strokeWidth: 10
        });
        
        path = pathSource.pattern(0, 0, 20, 20);
        
        rect.attr({
            fill : path,
            opacity : 0
        })
        
        this.mainGroup.append(rect);
        
        accumulateTime += 1000;
        rect.animate({
            opacity : 1
        }, accumulateTime);
        
        accumulateTime += duration/2;
        setTimeout(function() {
            
            pathSource.attr({ strokeWidth : 5 });
            var path2 = pathSource.pattern(0, 0, 10, 10);
            
            rect.attr({
                fill : path2
            })
            
        }, accumulateTime);
        
        accumulateTime += duration/2;
        setTimeout(function() {
            
            rect.animate({
                opacity : 0
            }, 1000);
            
        }, accumulateTime);
        
        accumulateTime += 1000;
        setTimeout(function() {
            
            rect.remove();
            _this.nextScript();
            
        }, accumulateTime);
        
        
    }
    
    GameScript.prototype.border = function(duration) {
        var _this = this;
        
        var elemTemplate = this.Game.elemSvg.elemTemplate;
        
        var objToReturn = jQuery.extend(true, {}, elemTemplate);
        
        elemTemplate.fill = "#FFFFFF";
        elemTemplate.stroke = "#000000";
        elemTemplate.strokeWidth = 1;
        
        this.Game.elemSvg.elemTemplate = elemTemplate;
        
        var eveyElements = this.Game.getElementsList();
        
        for(elemKey in eveyElements) {
            
            var elem = eveyElements[elemKey];
            elem.body.attr({
                fill : elemTemplate.fill,
                stroke : elemTemplate.stroke,
                strokeWidth : elemTemplate.strokeWidth
            });
            
        }
        
        setTimeout(function(){
        
            _this.Game.elemSvg.elemTemplate = objToReturn;
            for(elemKey in eveyElements) {
            
                var elem = eveyElements[elemKey];
                elem.body.attr({
                    fill : objToReturn.fill,
                    stroke : objToReturn.stroke,
                    strokeWidth : objToReturn.strokeWidth
                });
                
            }
            _this.nextScript();
        }, duration);
        
    }
    
    GameScript.prototype.tilt = function(nbrOfTime) {
        var _this = this;
        
        var i = 0;
        
        function firstTilt() {
        
            _this.svgWraper.animate({
                left : '1%'
            }, 200, function() {
                $(this).animate({
                    left : '-1%'
                }, 500, function() {
                    $(this).animate({
                        left : '0%'
                    }, 200, function() {
                        secondTitl();
                    })
                })
                    
            })
        }
        
        
        function secondTitl() {
           
           _this.svgWraper.animate({
                left : '5%'
            }, 200, function() {
                $(this).animate({
                    left : '-5%'
                }, 500, function() {
                    $(this).animate({
                        left : '0%'
                    }, 200, function() {
                        i++;
                        if(i == nbrOfTime)_this.nextScript();
                        else firstTilt();
                    })
                })
                    
            }) 
            
        }
        
        firstTilt();
        
        
    }
    
    
    /******************************
     *
     *  goldenBeer
     *  
     *  set the golden beer coin
     *
     ******************************/
    GameScript.prototype.goldenBeer = function() {
        var _this = this;
        
        var GBelem = {};
        
        var GBavatar = {
            avatarUrl : '',
            size : 50,
            step : 10,
            fill : '#FAED32',
        };
        
        
        function creatAvatar() {
            
            GBelem = {};
            
            //1 - First descide of the size
            GBelem.size = GBavatar.size;
            
            //2 - the start point and end point
            GBelem.points = _this.Game.elemSvg.randomRange(GBelem.size);
            
            //3 - moving axis ( the one wich will be use during the animation to find the other axes )
            var distanceX = ( GBelem.points.A.x > GBelem.points.B.x ? GBelem.points.A.x - GBelem.points.B.x : GBelem.points.B.x - GBelem.points.A.x );
            var distanceY = ( GBelem.points.A.y > GBelem.points.B.y ? GBelem.points.A.y - GBelem.points.B.y : GBelem.points.B.y - GBelem.points.A.y );
            GBelem.movingAxis = distanceX > distanceY ? 'X' : 'Y';
            
            //4 - step ( give the speed of the element )
            GBelem.step = GBavatar.step;
            if(
               ( GBelem.movingAxis == 'X' && GBelem.points.A.x > GBelem.points.B.x ) ||
               ( GBelem.movingAxis == 'Y' && GBelem.points.A.y > GBelem.points.B.y ) 
              ) GBelem.step = GBelem.step*-1;
            
            //5 - the equation of the string
            GBelem.stringEquation = _this.Game.elemSvg.stringEquation( GBelem.points.A.x, GBelem.points.A.y, GBelem.points.B.x, GBelem.points.B.y );
            
            GBelem.id = 'theGoldenBeer';
            
            //6 - generate the element on the page
            
            GBelem.body = _this.svgElem.image(
                '/img/beer.png',//take a random image from the image list
                GBelem.points.A.x,
                GBelem.points.A.y,
                GBelem.size,
                GBelem.size
            ).attr({
                id: GBelem.id,
                r: GBelem.size/2,
                style: 'transform:translate(-50%, -50%)'//need that because the hitbox cercle center start at the top left
            });
            
            /*
            GBelem.body = _this.svgElem.circle(
                GBelem.points.A.x,
                GBelem.points.A.y,
                GBelem.size
            ).attr({
                fill: GBavatar.fill,
                stroke : GBavatar.fill,
                strokeWidth : 0,
                id: GBelem.id
            });
            */
            
            GBelem.callBack = (function(status, playerId) {
                
                if( status == 'deleted' ) {
                    
                } else if( status == 'touch' && undefined !== playerId ) {
                    
                    //he won a beer !
                    _this.Game.youNeedABeer( playerId );
                    _this.Game.removePlayer( playerId );
                    
                }
                
                var elemList = _this.Game.getElementsList();
                for( elem in elemList ) {
                
                    if( elemList[elem].id == GBelem.id ) {
                        elemList[elem].body.remove();
                        _this.Game.deleteElem( elem );
                    }
                
                }
                
            
            })
            
            return GBelem;
            
        }
        
        var GBinterval;
        clearInterval(GBinterval);
        
        GBinterval = setInterval(function() {
            
            var GBtoPush = creatAvatar();
            
            _this.Game.elemStatus.push( GBtoPush );
            
        }, this.timingBeer);
        
    }
    
    /******************************
     *
     *  resetGameScripts
     *  
     *  prepare the field for the
     *  next script
     *
     ******************************/
    GameScript.prototype.resetGameScripts = function() {
        
        
        
    }
    
    
   
    return GameScript;
   
}());