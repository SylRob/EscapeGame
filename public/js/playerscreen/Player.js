

var Player = (function() {
   
    function Player(pseudo) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.pseudo = pseudo;
        this.myScore = 0;
        
        this.avatarList = {
            'blue' : {
                primaryColor    : '#4C55FF',
                secondaryColor  : '#90FFBF',
                imgUrl:'/img/ufoBlue.png'
            },
            'red' : {
                primaryColor    : '#E86C08',
                secondaryColor  : '#FF3204',
                imgUrl:'/img/ufoRed.png'
            },
            'green' : {
                primaryColor    : '#40FFCC',
                secondaryColor  : '#3AE860',
                imgUrl:'/img/ufoGreen.png'
            },
            'yellow' : {
                primaryColor    : '#E8C900',
                secondaryColor  : '#FFFA00',
                imgUrl:'/img/ufoYellow.png'
            },
            'pink' : {
                primaryColor    : '#E84396',
                secondaryColor  : '#DA56FF',
                imgUrl:'/img/ufoPink.png'
            },
            'orange' : {
                primaryColor    : '#E8775B',
                secondaryColor  : '#FFB371',
                imgUrl:'/img/ufoOrange.png'
            }
        }
        
        this.interval = null;
        
        this.avatar = {};
        
    }
    
    
    Player.prototype.myAvatar = function( option ) {        
        this.avatar = this.avatarList[option];
        
    }
    
    Player.prototype.initGamePad = function(elem) {        
        elem.css({
            backgroundColor : this.avatar.primaryColor,
            position : 'relative'
        })
    }
    
    Player.prototype.whatIsMyDirection = function(passingObj) {
        
        passingObj.playerId = this.id;
        
        socket.emit('touched', passingObj);
        
    }
    
    Player.prototype.iAmDead = function() {
        
        clearInterval(this.interval);
        var playerTime = $('#messageArea').text();
        $('.playerScore').text(playerTime);
        
        socket.emit('hereIsMyScore', this.pseudo, this.myScore);
        
    }
    
    Player.prototype.iNeedABeer = function() {
        
        clearInterval(this.interval);
        var playerTime = $('#messageArea').text();
        $('.playerScore').text(playerTime);
        
        $('#freeBeer').show();
        
    }
    
    Player.prototype.endOfTheGame = function(ranking) {
        var _this = this;
        
        var rankingList = '<ol>';
        
        for( palyerPseudo in ranking ) {
            
            var timeScore = addZero(ranking[palyerPseudo]);
            timeScore = formatTime(timeScore);
            
            rankingList += '<li id="'+palyerPseudo+'"'+( palyerPseudo == _this.pseudo ? ' class="itsMe"' : '' )+'><span>'+palyerPseudo+'</span><span>'+timeScore+'</span></li>';
        }
        
        rankingList += '</ol>';
        
        $('#ranking').html(rankingList);
        $('#tryAgain').show();
        
        $('#ranking').animate({
            scrollTop : 0
        }, 0, function() {
            
            $('#ranking').animate({
                scrollTop : $('.itsMe').position().top
            }, 1000, 'swing');
            
        });
        
        
        // function to get the format 000510 (0min 5secondes and 10tenth) from 510
        function addZero (str) {
            str = str.toString();
            return str.length < 6 ? addZero("0" + str) : str;
        }
        
        //take a number and put the letter ":" every 2 letter
        function formatTime(s) {
            var i = 2;
            var a = new Array();
            do {
                a.push(s.substring(0, i));
            } while((s = s.substring(i, s.length)) != "");
            return a.join(':');
        }
        
    }
    
    Player.prototype.countingTo = function(until, callback) {
        var _this = this;
        
        until = until*1000;
        var elem = $('#messageArea'), i, accumulateTime;
        
        if(this.interval) clearInterval(this.interval);
        
        i=0;
        accumulateTime = 0;
        var timer = setInterval(function() {
            
            elem.attr('style', 'color : '+_this.avatar.secondaryColor).html(( i-(until/1000) )*-1);
            i++;
            
            if( until <= accumulateTime ) {
                clearInterval( timer );
                callback();
            }
            
            accumulateTime += 1000;
        }, 1000);
        
    }
    
    Player.prototype.startTimer = function() {
        var _this = this;
        var elem = $('#messageArea'), timer = 0, min = 0, sec = 0, tenth = 0;
        
        if( this.interval != null ) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        this.interval = setInterval(function() {
            timer ++;
            
            tenth = timer % 10;
            sec = Math.floor(timer/10) - min*60;
            min = Math.floor(timer/10/60);
            
            elem.html('<p id="timer">'+(min < 10 ? '0'+min : min)+':'+(sec < 10 ? '0'+sec : sec)+':'+tenth+'0</p>');
            
            _this.myScore = +((min < 10 ? '0'+min : min)+(sec < 10 ? '0'+sec : sec)+tenth+'0');
            
        }, 100);
        
    }
   
    return Player;
   
}());






















