var socket = io.connect('http://10.0.1.2:8090');
//var socket = io.connect('http://169.254.69.173:8090');
        
var player;
        
socket.on('timeToStart', function() {
    window.location.href = window.location.href;
});
        
jQuery(document).ready(function() {
    var player;
    var gamepad;
    
    $('#colorChoice a').click(function(e) {
        
        if($('#input_nickName').val() == '') {
            alert('You forgot to choose a nickname');
            return false;
        }
        
        player = new Player($('#input_nickName').val());

        player.myAvatar($(this).attr('id'));

        socket.emit( 'newPlayer', player );

        e.preventDefault();
        return false;

    });
    
    socket.on('readyToPlay', function() {
        
        player.initGamePad($('#gamePad'));
        
        $('#whatIsYourNickname').fadeOut('fast');
        
        if(!gamepad) gamepad = new GamePad($('#tactilBlock'), player);

        player.countingTo(3, function(){
            
            player.startTimer();
            
        });
        
        
        $('#tryAgain button').off('click').on('click', function(e) {
            
            socket.emit( 'newPlayer', player );
            $('#tryAgain').hide();

            player.countingTo(3, function(){

                player.startTimer();

            });
  
            e.preventDefault();
            return false;
        });
        
    });
    
    socket.on('youNeedABeer', function(playerId) {
        
        if(player.id == playerId) {
            player.iNeedABeer();
        }
    });
    
    
    $('#youWonABeer button').click(function() {
        
        $('#youWonABeer').hide();
        $('#freeBeerThx').css('display', 'table-cell');
        
    });
    
    
    socket.on('iAmDead', function(playerId) {

        if(player.id == playerId) {
            player.iAmDead();
        }
    });
    
    socket.on('youCannotPlay', function() {
        alert('sorry you cannot play yet : \r\n the game is not ready or there are already maximum player playing');
        
    });
    
    socket.on('ranking', function(ranking) {
        player.endOfTheGame(ranking);
        
    });
    
    
    
    
    
    
    
    
    
    
});