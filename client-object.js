/*******************************************************************
 * Implemntation of multi-user X3DOM - client side.
 * author: Matthew Bock
 * This version focuses on minimizing data transfer, but it still
 * sends and receives updates as soon as they happen with no regard
 * to time since the last update.
 *
 * edited by: Karsten Dees, Nick Hu {09/16/2016}
 ******************************************************************/
 
//-----------------------------
// Data Fields
//-----------------------------
 
var name;
var socket;
var spawnPosition = {"x": 2, "y": 1.5, "z": 1};
var spawnOrientation = [{"x": 0, "y": 1, "z": 0}, 0];
var x3d;
var bundleObj;
var myPos;
var myRot;
var sendButton;
var formDiv;

//Use for localhost testing. Run node server 
socket = new io.connect('http://metagrid2.sv.vt.edu:9999');

/*
 * Initialized by client.js to get the user's name
 * and set up the scene
 */
function x3domWebsocketClient()
{
	name = prompt("Enter your name:");

	x3d = document.getElementsByTagName("X3D")[0];
	
	configureScene();
}

/*
 * Sets up the X3D scene
 */
function configureScene()
{
	console.log("Scene Configured");
	bundleObj = [name, spawnPosition, spawnOrientation];
	var camera = x3d.runtime.getActiveBindable("Viewpoint");
	var cPos = "" + spawnPosition.x + " " + spawnPosition.y + " " + spawnPosition.z;
	var cRot = "" + spawnOrientation[0].x + " " + spawnOrientation[0].y + " " + spawnOrientation[0].z + " " + spawnOrientation[1];
	camera.setAttribute("position", cPos);
	camera.setAttribute("orientation", cRot);
	var scene = document.getElementsByTagName("Scene")[0];
	var g = document.createElement('Group');
	g.setAttribute("id", "avatarGroup");
	scene.appendChild(g);
	var cams = document.getElementsByTagName('Viewpoint');
	for (var i = 0; i < cams.length; i++)
	{
		cams[i].addEventListener('viewpointChanged', positionUpdated, false);
	};
}

/*
 * Sends position data to server
 */
function positionUpdated(e)
{	
    var pos = e.position;
    var rot = e.orientation;
    
    //Tell the server that this client has moved and send its new location data
	socket.emit('updateposition', name, pos, rot);
}

/*
 * Sends the specified message to all connected users
 */
function sendMessage(memo) {
	
	var message = memo;
	
	if (message == null) {
		
		message = document.getElementById('inputField').value;
		document.getElementById('inputField').value = "";
		
	}
	
	console.log("Sending a Message!");
	socket.emit('chatmessage', name, message);
	
}

//-----------------------------
// Listeners
//-----------------------------

/*
 * Minimize/Maximize Chat Widget
 */
window.onload = function (e) {
	sendButton = document.getElementById("sendButton");
	sendButton.addEventListener('click', sendMessage);
	
	smallForm = document.getElementById("smallForm");
	formDiv = document.getElementById("chatWindow");
    
	formDiv.addEventListener('keypress', function(e) {
		
		if(e.keyCode == 13) {
		
			sendMessage();
		
		}
	});
	
	var minButton = document.getElementById("minButton");
    var maxButton = document.getElementById("maxButton");
	
	minButton.addEventListener('click', function(e) {
		
        if (formDiv.style.visibility != "hidden") {
                               
			formDiv.style.visibility = "hidden";
			smallForm.style.visibility = "visible";
			
		}
    });
    
    maxButton.addEventListener('click', function(e) {
        
        if (smallForm.style.visibility != 'hidden') {
                               
            smallForm.style.visibility = "hidden";
            formDiv.style.visibility = "visible";
                               
        }
    });
}


/*
 * Change Camera View
 */
window.addEventListener('keypress', function(e) {
	
	var avatar = document.getElementById(name + "Avatar");
	
	//pressed 1
	if(e.keyCode === 49) {
		
		console.log("Change to First Person View");
		avatar.setAttribute("translation", "" + 0 + " " + 0 + " " + 5);
	}
	//pressed 3
	if(e.keyCode === 51) {
		
		console.log("Change to Third Person View");
		var zPosition = -5;
		
		avatar.setAttribute("translation", "" + 0 + " " + 0 + " " + zPosition);
	}
});

/*
 * Tell the server the user has successfully connected and 
 *to add this client to the list of all clients
 */
socket.on('connect', function()
{
	socket.emit('newconnection');
});

/*
 * Received the first time this client connects to the server -- gets 
 * the client up to speed with all of the current data
 *
 * @param fullListOfUsers - the list of connected users
 */
socket.on('firstupdate', function(fullListOfUsers)
{
	//Add your own Name and information to fullListOfUsers
	if(fullListOfUsers[0] === undefined) {
		
		fullListOfUsers[name] = bundleObj;
	
	}
          
	// Adds Avatar to X3D scene for new user
	var avatarGroup = document.getElementById("avatarGroup");
	avatarGroup.innerHTML = "";
	
	var scene = document.getElementsByTagName("Scene")[0];
	for (var key in fullListOfUsers)
	{
		var current = fullListOfUsers[key];
		//Adding yourself to the Scene
	
		var userAvatar = document.createElement('Transform');
			
		userAvatar.setAttribute("translation", "" + 0 + " " + 0 + " " + 5);
		userAvatar.setAttribute("rotation", "" + 0 + " " + 0 + " " + 0 + " " + 0);
		userAvatar.setAttribute("id", key + "Avatar"); 
		console.log("created Node: " + userAvatar.getAttribute("id"));
		var characterOfAvatar = document.createElement('inline');
		characterOfAvatar.setAttribute("url", "avatars/pumbaPTrans1.x3d");
			
		userAvatar.appendChild(characterOfAvatar);

		console.log("Name Actual: ", current[0]);
		console.log("Name Expected: ", current[0]);
		
		if(current[0] == name) {
			console.log("Creating my own UserBundle");
			var userBundle = document.createElement('Transform');
			userBundle.setAttribute("id", key + "Bundle");
			userBundle.setAttribute("translation", current[1].x + " " + current[1].y + " " + current[1].z);
			userBundle.setAttribute("rotation", current[2][0].x + " " + current[2][0].y + " " + current[2][0].z + " " + current[2][1]);
			myPos = current[1];
			myRot = current[2];
			
			var scene = document.getElementsByTagName("Scene")[0];
			
			scene.appendChild(userBundle);
			userBundle.appendChild(userAvatar);

			//Add a message to the chat window that someone is joining
			var welcomeMessage = "" + name + " is joining the scene.";
			sendMessage(welcomeMessage);
			
		} else {
			avatarGroup.appendChild(userAvatar)
		}
	}
    
	//Build the list of connected users
	buildList(fullListOfUsers);
	
	//Tell the server the user's spawn location data
	socket.emit('login', name, spawnPosition, spawnOrientation);
    
});

/*
 * Triggered whenever the user changes location 
 * to update the X3D scene and the HTML tags
 *
 * @param updateUser - the updated user
 */
socket.on('update', function(updatedUser)
{
	//Get User Bundle Data
	var userBundle = document.getElementById(updatedUser[0] + "Bundle");
	
	// Get Avatar Data
	var userAvatar = document.getElementById(updatedUser[0] + "Avatar");
	
	if(userBundle != null)
	{
		//Update Bundle Data
		userBundle.setAttribute("translation", updatedUser[1].x + " " + updatedUser[1].y + " " + updatedUser[1].z);
		userBundle.setAttribute("rotation", updatedUser[2][0].x + " " + updatedUser[2][0].y + " " + updatedUser[2][0].z + " " + updatedUser[2][1]);
				
        //Update HTML
        updateList(updatedUser);
    
        //Update Server Location Information
        socket.emit('updatePosition', updatedUser[0], updatedUser[1], updatedUser[2]);
	} else if(userAvatar != null)
	{
	
		//Update Avatar Data
		userAvatar.setAttribute("translation", updatedUser[1].x + " " + updatedUser[1].y + " " + updatedUser[1].z);
		userAvatar.setAttribute("rotation", updatedUser[2][0].x + " " + updatedUser[2][0].y + " " + updatedUser[2][0].z + " " + updatedUser[2][1]);
		
        //Update HTML
        updateList(updatedUser);
    
        //Update Server Location Information
        socket.emit('updatePosition', updatedUser[0], updatedUser[1], updatedUser[2]);
	}
});

/*
 * Triggered whenever a new user connects -- updates 
 * all users with the added user's information
 *
 * @param newestUser - the updated user
 * @param fullListOfUsers - all of the connected users
 */
socket.on('newuser', function(newestUser)
{	
	var duplicateNames = document.getElementById(newestUser[0]);
	
	if(newestUser[0] != null && name != newestUser[0] && duplicateNames == null)
	{	
		//Add Users Avatar
        var avatarGroup = document.getElementById("avatarGroup");

		var userAvatar = document.createElement('Transform');

		userAvatar.setAttribute("translation", newestUser[1].x + " " + newestUser[1].y + " " + newestUser[1].z);
		userAvatar.setAttribute("rotation", newestUser[2][0].x + " " + newestUser[2][0].y + " " + newestUser[2][0].z + " " + newestUser[2][1]);
		userAvatar.setAttribute("id", newestUser[0] + "Avatar");

		console.log("Created node: " + userAvatar.getAttribute("id"));

		var inlineElement = document.createElement('inline');
		inlineElement.setAttribute("url", "avatars/pumbaPTrans1.x3d");
		
		userAvatar.appendChild(inlineElement);
		avatarGroup.appendChild(userAvatar);
        
		//Update HTML
		addUser(newestUser);
	}
});

/*
 * Triggered whenever a user disconnects -- removes
 * the deleted user from everyone else's list
 *
 * @param removableUser - the user to be deleted
 */
socket.on('deleteuser', function(removableUser) 
{
	// Remove the avatar from the scene.
	var removeAvatar = document.getElementById(removableUser[0] + "Avatar");

	if(removeAvatar != null)
	{
		var avatars = document.getElementById("avatarGroup");
		avatars.removeChild(removeAvatar);
	}
    
    //Remove User's HTML Content
    removeUser(removableUser);
	
	//Add a message to the chat window that someone is leaving
    var goodbyeNote = "" + removableUser[0] + " is leaving the scene.";
    sendMessage(goodbyeNote);
});

/*
 * Triggered when a message has been posted to the chatroom
 *
 */
socket.on('newmessage', function(userName, message)
{
	var newMessage = document.createElement('li');
	
	var nameTag = document.createElement('span');
	nameTag.innerHTML = "<em>" + userName + "</em>";
	
	newMessage.appendChild(nameTag);
	newMessage.appendChild(document.createElement("br"));
	newMessage.appendChild(document.createTextNode(message));
	
	document.getElementById("messages").appendChild(newMessage);
});


/*
 * Triggered when a notification has been posted to the chatroom
 *

socket.on('notification', function(userName, message) {
	
	var note = document.createElement('li');
	
	var noteText = document.createElement('span');
	noteText.innerHTML = "<em>" + message + "</em>";
	
	document.getElementById("messages").appendChild(note);
});
 */
