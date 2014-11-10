

var ElementsSvg = (function() {
    
   
    function ElementsSvg(svgElem, parent) {
        
        this.svgElem = svgElem;
        this.svgWraper = parent;
        this.elemImgUrl = [
            '/img/earth.png',
            '/img/jupiter.png',
            '/img/mars.png',
            '/img/mercure.png',
            '/img/neptune.png',
            '/img/saturn.png',
            '/img/uranus.png',
            '/img/venus.png',
        ]
        this.elemTemplate = {
            sizeRange : {
                min : 50,
                max : 110
            },
            shape : 'image',
            posRange : this.svgWraper.width()+this.svgWraper.height(),
            minRangeDistance : 10,
            stepRange : {
                min : 1,
                max : 10
            },
            fill : '#000000',
            stroke : "#000000",
            strokeWidth : 0
            /*callBack : (function(){})*/
        };
        this.totalNbrEnemi = 0;
        this.nbrOfEnemis = 30;
        
        this.elemList = [];
        this.interval = false;
        
        this.init();
        this.g = 0;
    }
    
    /******************************
     *
     *  init
     *  
     *  init the SVG
     *
     ******************************/
    ElementsSvg.prototype.init = function() {
        var _this = this;
        
        this.start();
        
    }
    
    
    /******************************
     *
     *  start
     *
     *  init the loop
     *
     ******************************/
    ElementsSvg.prototype.start = function() {
        var _this = this;
        
        if(this.interval !== false) clearInterval(this.interval);
        
        var enemisToMake = _this.nbrOfEnemis - Object.keys(_this.elemList).length;
            if( enemisToMake > 0 ) {
                for(var i = 0; i < enemisToMake ; i++) {
                _this.randomElemGenerator();
            }
        }
        
        return this.elemList;
        
    }
    
    /******************************
     *
     *  movingElem
     *
     *  move to the next step
     *  the element passed in
     *  the argument
     *  
     *
     ******************************/
    ElementsSvg.prototype.movingElem = function(elem) {
        var _this = this;
        
        /*
         * calcul de l'equation de la droite  :
         *
         * Y = m*X + b  ( avec  m = (y1-y2/x1-x2) )
         * X = (Y-b)/m
         *
         * premierement trouver b (ordonnee a l'origine)
         *
         * b = Y - (y1-y2/x1-x2)*X
         *
         **/
        
        /*
         * ensuite faire defiler X1 jusqu'a X2 si X1 - X2 > Y1 - Y2 sinon faire defile Y1 jusqu'a Y2
         *
         **/
        
        var imgType     = elem.body.type == 'image' ? true : false;
        var imgTypeX    = imgType ? 'x' : 'cx';
        var imgTypeY    = imgType ? 'y' : 'cy';
        
        if(elem.movingAxis == 'X') {
                var X = +elem.body.attr(imgTypeX)+elem.step;
                var Y = Math.round( elem.stringEquation.m*X+elem.stringEquation.b );
            
        } else {
            
            var Y = +elem.body.attr(imgTypeY)+elem.step;
            var X = Math.round( (Y-elem.stringEquation.b)/elem.stringEquation.m );
            
        }
        
        if(isNaN(X)) {
            X = elem.body.attr(imgTypeX);
        } else if(isNaN(Y)) {
            Y = elem.body.attr(imgTypeY);
        }
        
        if(imgType)
            elem.body.attr({
                x : X,
                y : Y
            });
        else
            elem.body.attr({
                cx : X,
                cy : Y
            });
        
        
        //if the element reach the end of his jurney, remove it from the DOM and return the keyword deleted
        if(
            ( elem.movingAxis == 'X' && elem.step > 0 && X >= elem.points.B.x ) ||
            ( elem.movingAxis == 'X' && elem.step < 0 && X <= elem.points.B.x ) ||
            ( elem.movingAxis == 'Y' && elem.step < 0 && Y <= elem.points.B.y ) ||
            ( elem.movingAxis == 'Y' && elem.step > 0 && Y >= elem.points.B.y )
           ) {
            
            elem.body.remove();
            if(elem.callBack !== undefined) {
                elem.callBack('deleted');
            }
            else return 'deleted';
        }
        
    }
    
    /******************************
     *
     *  randomElemGenerator
     *  
     *  gather information genereated
     *  mostly randomly,
     *  to generate an element
     *  and add it in the elements list
     *
     ******************************/
    ElementsSvg.prototype.randomElemGenerator = function(elemType) {
        var _this = this;
        
        var myElem = {};
        
        //1 - First descide of the size
        myElem.size = Math.floor(Math.random() * (this.elemTemplate.sizeRange.max - this.elemTemplate.sizeRange.min + 1)) + this.elemTemplate.sizeRange.min;
        
        //2 - the start point and end point
        myElem.points = this.randomRange(myElem.size);
        
        //3 - moving axis ( the one wich will be use during the animation to find the other axes )
        var distanceX = ( myElem.points.A.x > myElem.points.B.x ? myElem.points.A.x - myElem.points.B.x : myElem.points.B.x - myElem.points.A.x );
        var distanceY = ( myElem.points.A.y > myElem.points.B.y ? myElem.points.A.y - myElem.points.B.y : myElem.points.B.y - myElem.points.A.y );
        myElem.movingAxis = distanceX > distanceY ? 'X' : 'Y';
        
        //4 - step ( give the speed of the element )
        myElem.step = Math.floor(Math.random() * (this.elemTemplate.stepRange.max - this.elemTemplate.stepRange.min + 1)) + this.elemTemplate.stepRange.min;
        if(
           ( myElem.movingAxis == 'X' && myElem.points.A.x > myElem.points.B.x ) ||
           ( myElem.movingAxis == 'Y' && myElem.points.A.y > myElem.points.B.y ) 
          ) myElem.step = myElem.step*-1;
        
        //5 - the equation of the string
        myElem.stringEquation = this.stringEquation( myElem.points.A.x, myElem.points.A.y, myElem.points.B.x, myElem.points.B.y );
        
        this.totalNbrEnemi +=1;
        myElem.id = 'ElementNbr'+this.totalNbrEnemi;
        
        //6 - generate the element on the page        
        if( this.elemTemplate.shape == 'image' ) {
            myElem.body = this.svgElem.image(
                this.elemImgUrl[Math.floor(Math.random()*this.elemImgUrl.length)],//take a random image from the image list
                myElem.points.A.x,
                myElem.points.A.y,
                myElem.size,
                myElem.size
            ).attr({
                r: myElem.size/2,
                id: myElem.id,
                class : 'element',
                style: 'transform:translate(-50%, -50%)'//need that because the hitbox cercle center start at the top left
            });
        }  
        else if( this.elemTemplate.shape == 'circle' ) {
            myElem.body = this.svgElem.circle(
                myElem.points.A.x,
                myElem.points.A.y,
                myElem.size
            ).attr({
                fill: this.elemTemplate.fill,
                stroke : this.elemTemplate.stroke,
                strokeWidth : this.elemTemplate.strokeWidth,
                id: myElem.id,
                class : 'element'
            });
        }
        
        //7 - add it to the list of elements
        this.elemList.push( myElem );
        
    }
    
    
    /******************************
     *
     *  stringEquation
     *  
     *  Y = m*X + b
     *
     *  when m = (y1-y2/x1-x2)
     *
     *  and b = Y - (y1-y2/x1-x2)*X
     *
     *  return obj ( with the equartion elements )
     *
     ******************************/
    ElementsSvg.prototype.stringEquation = function(Ax, Ay, Bx, By) {
        
        var M = ( (Ay-By)/(Ax-Bx) );
        
        return {
            m : Math.round(M*100)/100,
            b : Math.round( ( (Ay - M*Ax)*100 ) /100)
        }
    }
    
    
    /******************************
     *
     *  randomRange
     *
     *  find randomly 2 point on
     *  the rectangle and verify
     *  that they are not too close
     *
     *  return Obj (A and B)
     *
     ******************************/
    ElementsSvg.prototype.randomRange = function(elemSize) {
        var _this = this;
        
        function randRange() {
            
            var num1 = Math.floor(Math.random() * _this.elemTemplate.posRange*2+1) - _this.elemTemplate.posRange;
            var num2 = Math.floor(Math.random() * _this.elemTemplate.posRange*2+1) - _this.elemTemplate.posRange;
            
            //are they too close from each other ?
            if(
               ( num1 > num2 && num1 - num2 <  _this.elemTemplate.posRange*10/100 ) ||
               ( num1 < num2 && num2 - num1 <  _this.elemTemplate.posRange*10/100 )
               ) return randRange();
            else {
                //let's calculate theire coordonne
                var Apoints = { y : 0, x : 0 };
                var Bpoints = { y : 0, x : 0 };
                
                if( num1 > 0 ) {
                    if( num1 <= _this.svgWraper.width() ) Apoints = { y : -elemSize, x : num1 };
                    else Apoints = { y : num1-_this.svgWraper.width(), x : _this.svgWraper.width()+elemSize }
                } else {
                    if( num1*-1 <= _this.svgWraper.height() ) Apoints = { y : num1*-1, x : -elemSize };
                    else Apoints = { y : _this.svgWraper.height()+elemSize, x : (num1*-1)-_this.svgWraper.height() }
                }
                
                if( num2 > 0 ) {
                    if( num2 <= _this.svgWraper.width() ) Bpoints = { y : -elemSize, x : num2 };
                    else Bpoints = { y : num2-_this.svgWraper.width(), x : _this.svgWraper.width()+elemSize }
                } else {
                    if( num2*-1 <= _this.svgWraper.height() ) Bpoints = { y : num2*-1, x : -elemSize };
                    else Bpoints = { y : _this.svgWraper.height(), x : (num2*-1)-_this.svgWraper.height() }
                }
              
                return {
                    A : Apoints,
                    B : Bpoints
                }
            }
        }
        
        return randRange();
    }
   
    return ElementsSvg;
   
}());



















