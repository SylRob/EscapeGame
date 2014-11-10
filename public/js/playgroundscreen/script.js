var socket = io.connect('http://10.0.1.2:8090');
//var socket = io.connect('http://169.254.69.173:8090');

var myGame = new Game(Snap("#gamePlateform"), $('section'));
 
socket.emit('thePlayGroundHasArrive');
 
socket.on( 'newPlayerEnterTheGame', function(Player) {
    myGame.addNewPlayer(Player);
});

socket.on( 'playerLeft', function(id) {
    myGame.removePlayer(id);
});

socket.on( 'updatePlayerPos', function(playerPos) {
    myGame.updatePlayerPos(playerPos);
});