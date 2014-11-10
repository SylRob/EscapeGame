

var GamePad = (function($) {
   
    function GamePad(elem, Player) {
        
        this.player = Player;
        this.elem = elem;
        this.init();
        this.pageWidth = this.elem.width();
        this.pageHeight = this.elem.height();
        this.middlePoint = {
            x : this.pageWidth/2,
            y : this.pageHeight/2
        }
        this.interval = false;
    }
    
    /******************************
     *
     *  init
     *  assign the event to the
     *  approriate function
     *  and pass it to the player
     *  class
     *
     ******************************/
    GamePad.prototype.init = function() {
        var _this = this;
        
        this.setting();
        
        
        $(window).off('resize').on('resize', function() {
            _this.assignPageSize();
        }).resize();
        
        this.elem.off('touchstart touchmove mousemove').on('touchstart touchmove mousemove', function(event) {
            
            var passingObJ = _this.wrapResults( _this.myDirection(event), _this.mySpeed(event) );
            
            if( event.type == 'touchstart') {
                if( _this.interval === false ) {
                    (function(passingObJ){
                        _this.interval = setInterval(function() {
                            _this.player.whatIsMyDirection(passingObJ);
                        }, 30);
                    }(passingObJ));
                }
            } else {
                if( _this.interval !== false ) {
                    clearInterval(_this.interval);
                    _this.interval = false;
                }
                _this.player.whatIsMyDirection(passingObJ);
            }
            
            
            event.preventDefault();            
        });
        
        this.elem.off('touchend').on('touchend', function(event) {
            clearInterval(_this.interval); _this.interval = false;
        });
        
        
    }
    
    /******************************
     *
     *  setting
     *  change the color of the
     *  page and add a center point
     *  need the Player.avatar
     *  object
     *
     ******************************/
    
    GamePad.prototype.setting = function() {
        
        var avatar = this.player.avatar;
        
        /*this.elem.css({
            backgroundColor : avatar.primaryColor,
            position : 'relative'
        })*/
        
        $('<img />')
        .attr({
            id : 'centerPoint',
            src : avatar.imgUrl
        })
        .css({
            width           : '80px',
            height          : '80px',
            left            : '50%',
            top             : '50%',
            marginLeft      : '-40px',
            marginTop       : '-40px',
            borderRadius    : '50%',
            position        : 'absolute',
        }).appendTo('#'+this.elem.attr('id'));
        
    }
    
    /******************************
     *
     *  mySpeed
     *  calcul the speed given
     *  from the position of the
     *  cursor compare to the center
     *  of the page
     *
     ******************************/
    
    GamePad.prototype.mySpeed = function(event) {
        return 0.5;
    }
    
    /******************************
     *
     *  myDirection
     *  take the user position
     *  draw a triangle with the center
     *  of the screen and give the
     *  angle in degree
     *  
     *  return float
     *
     ******************************/
    GamePad.prototype.myDirection = function(event) {
        
        var pointerEventToXY = function(e){
            var out = {x:0, y:0};
            if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
              var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
              out.x = touch.pageX;
              out.y = touch.pageY;
            } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
              out.x = e.pageX;
              out.y = e.pageY;
            }
            return out;
        };
        
        var posUser = {
            x   : pointerEventToXY(event).x,
            y   : pointerEventToXY(event).y
        }
        
        // lets make the 3 point of the triangle
        var thirdPoint = {
            x   : posUser.x,
            y   : this.middlePoint.y
        }
        
        //triangle part length
        var AB = ( this.middlePoint.x - posUser.x > 0 ? this.middlePoint.x - posUser.x : posUser.x - this.middlePoint.x );
        var AC = ( this.middlePoint.y - posUser.y > 0 ? this.middlePoint.y - posUser.y : posUser.y - this.middlePoint.y );
        //Hypotenuse
        var BC = Math.round( Math.sqrt( Math.pow(AC, 2) + Math.pow(AB, 2) ) );
        
        var Bangle = Math.acos( AB/BC )* (180 / Math.PI);
        
        //on the x axe
        if(this.middlePoint.x - posUser.x == 0 && this.middlePoint.y - posUser.y > 0) Bangle = 90;
        else if(this.middlePoint.x - posUser.x == 0 && this.middlePoint.y - posUser.y < 0) Bangle = 270;
        
        //on the y axe
        else if(this.middlePoint.y - posUser.y == 0 && this.middlePoint.x - posUser.x > 0) Bangle = 180;
        else if(this.middlePoint.y - posUser.y == 0 && this.middlePoint.x - posUser.x < 0) Bangle = 0;
        
        //other cases
        else if(this.middlePoint.x - posUser.x > 0 && this.middlePoint.y - posUser.y > 0) Bangle = 180-Bangle;
        else if(this.middlePoint.x - posUser.x < 0 && this.middlePoint.y - posUser.y > 0) Bangle = Bangle;
        else if(this.middlePoint.x - posUser.x > 0 && this.middlePoint.y - posUser.y < 0) Bangle = Bangle+180;
        else if(this.middlePoint.x - posUser.x < 0 && this.middlePoint.y - posUser.y < 0) Bangle = 360-Bangle;
        
        //round to the first decimal
        return Math.round(Bangle * 10) / 10;
    }
    
    /******************************
     *
     *  wrapResults
     *  gather the speed and direction
     *
     ******************************/
    GamePad.prototype.wrapResults = function(obj1, obj2) {
        
        return {
            degree : obj1,
            speed : obj2
        }
        
    }
    
    /******************************
     *
     *  assignPageSize
     *  triggered when the page
     *  is resize, orientation
     *  change, and reasign
     *  the widh/heigth, center
     *  point of the GamePad
     *
     ******************************/
    GamePad.prototype.assignPageSize = function() {
        this.pageWidth = this.elem.width();
        this.pageHeight = this.elem.height();
        this.middlePoint = {
            x : this.pageWidth/2,
            y : this.pageHeight/2
        }
    }
    
    
    /******************************
     *
     *  destroy
     *
     *  unbind the events
     *
     ******************************/
    /*GamePad.prototype.destroy = function() {
        
        this.elem.off('touchstart touchmove mousemove touchend');
        $(window).off('resize');
        
    }*/
    
   
    return GamePad;
   
}(jQuery));