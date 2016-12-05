/*******************************************************************
 * Implemntation of multi-user X3DOM - server side.
 * author: Matthew Bock
 * This version focuses on minimizing data transfer, but it still
 * sends and receives updates as soon as they happen with no regard
 * to time since the last update.
 *
 * edited by: Karsten Dees, Nick Hu {11/14/2016}
 *******************************************************************/

//-----------------------------
// Data Fields
//-----------------------------
 
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , url = require('url')

var users = {}; //List of Connected Users

/*var environmentEvents = {}; //List of enviromental objects and their states
environmentEvents.lamp1 = "true";
environmentEvents.lamp2 = "true";*/

var LampObject = require('./EnviroObject');

var environmentEvents = {};
environmentEvents.lamp1 = new LampObject("lamp1", true);
environmentEvents.lamp2 = new LampObject("lamp2", true);

app.listen(9999);

/*
 * Handle incorrect Path Names for the server connection
 *
 * @param req - Data included in request (IP Address, HTTP headers, url, etc.)
 * @param res - Data sent back to browser from server
 */
function handler (req, res) 
{
  var pathname = url.parse(req.url).pathname;
  fs.readFile(__dirname + pathname,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading' + pathname);
    }

    res.writeHead(200);
    res.end(data);
  });
}

/*
 * Socket Connection and defined socket events
 *
 * @param socket - the connected socket
 */
io.on('connection', function (socket)
{ 

 /*
  * Recieved when a new client opens a websocket connection succesfully
  */
  socket.on('newconnection', function()
  {
	// Add the new client to the list of all clients
	console.log("New user is connecting...");
	try {
		io.emit('firstupdate', users, environmentEvents);
    } catch (e) {
		console.log(e);
	}
  });
 
 /*
  * Recieved when a new client has successfully updated
  * for the first time
  *
  * @param name - client's username
  * @param pos - client's start position in the scene
  * @param rot - client's start rotation in the scene
  */
  socket.on('login', function(name, pos, rot, avatar)
  {
    console.log("New user '" + name + "' has connected.");
    
    socket.username = name;
    
    users[name] = [name, pos, rot, avatar];

    // Inform all clients to update and account for the new user.
	try {
		io.emit('newuser', users[name], users);
	} catch (e) {
		console.log(e);
	}
  });

 /*
  * Recieved when the client has changed the position
  * of their avatar
  *
  * @param name - client's username
  * @param pos - client's start position in the scene
  * @param rot - client's start rotation in the scene
  */
  socket.on('updateposition', function(name, pos, rot, avatar)
  {   
      // Update the master list with the client's new location.
      users[name] = [name, pos, rot, avatar];
      
      // Inform all clients to update their scenes
      try {
          io.emit('update', users[name]);
      } catch (e) {
          console.log(e);
      }
  });

 /*
  * Recieved when a client sends a chat message
  */
  socket.on('chatmessage', function(name, message)
  {
	  io.emit('newmessage', name, message);
	  
  });
  
 /*
  * Recieved when a client sends out a notification 
  */
  socket.on('newnote', function(message)
  {
	  io.emit('notification', message, users);
	  
  });
    
 /*
  * Recieved when a client changes their avatar
  */
  socket.on('newavatar', function(name, avatar) {
      console.log(name + "has changed their avatar.");
      
      //Preserve location data
      var userPos = users[name][1];
      console.log("Position: ", userPos);
      var userRot = users[name][2];
      console.log("Rotation: ", userRot);
      
      //Save avatar selection
      users[name] = [name, userPos, userRot, avatar];
      
      //Tell clients about the avatar change
      io.emit('changeAvatar', name, avatar);
  });

  /*
  * Recieved when a client toggles the lamp
  */  
  socket.on('environmentChange', function(eObject) {
      
      environmentEvents[eObject] = !environmentEvents[eObject];
      
      //environmentEvents[eObject].updateServer();
      
      console.log(environmentEvents);
      
      io.emit('updateEnvironment', eObject);
  });
  
 /*
  * Recieved when a client disconnects (closes their browser window/tab).
  */
  socket.on('disconnect', function()
  {
      if (users[socket.username] != null) {
      
          var goodbyeNote = "" + users[socket.username][0] + " is leaving the scene.";
          io.emit('notification', goodbyeNote, users);

          // Inform all clients to update and account for the removed user.
          io.emit('deleteuser', users[socket.username]);

          // Remove the client from the master list
          delete users[socket.username];
      }
  });
});