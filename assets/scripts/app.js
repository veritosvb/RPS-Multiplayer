  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyApXnD6I0oRZwcnKSbnZbTl1Ubk6O6EJ-o",
    authDomain: "rockpaperscissors-4a31b.firebaseapp.com",
    databaseURL: "https://rockpaperscissors-4a31b.firebaseio.com",
    projectId: "rockpaperscissors-4a31b",
    storageBucket: "",
    messagingSenderId: "901060609949"
  };
  firebase.initializeApp(config);

  var database = firebase.database();
  var chat = database.ref("/chat");

  chat.remove();
  var game = database.ref("/games");
  var players = {
    creator: { displayName: "Player 1", uid: "whatever" },
    joiner: { displayName: "Player 2", uid: "whatever2" },
    state: 1 //open
};
 var displayN = "Player 1";
  var state = {
      open:1, 
      joined:2
    }


//create account
function submitCreateAccount(){
    var displayName = document.querySelector("#entry-displayname");
    var email = document.querySelector("#entry-email");
    var password = document.querySelector("#entry-password");
    firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
    .then(function(user){
    user.updateProfile({
        displayName: displayName.value});   
    }).catch(function(error) {
        $("#error").text(error.message);
         $('#errorh').modal('show'); 
        console.log(error.message);



    });       
}
 
//signout account

firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    // An error happened.
  });


//sign in account
function signIn(){
    
    var email = $("#email").val();
    var password = $("#password").val();

    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    $("#error").text(errorMessage);
    console.log(errorMessage);
    $('#errorh').modal('show'); 

    });
}


firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    name = user.displayName;
    email = user.email;
    uid = user.uid;  
    $("#uid").text("Sign in as: " + email);
    displayN = firebase.auth().currentUser.displayName;

  }
  else{
      displayN = "Player 1";
  }
});


//Chat
function sendChatMessage(){
    var messageField = $("#chatmessage").val();
    $("#chatmessage").text(" ");
    chat.push().set({
        name: displayN,
        message: messageField
    });
}


firebase.database().ref("/chat").on("child_added", function(snapshot){
    
    var message = snapshot.val();
    console.log(message.message);
    addChatMessage(message.name, message.message);
})    


function addChatMessage(name, message){
    $("#chat").append( "<p><strong>" + name + ":</strong> " + message + "</p>");
}

//match

function createGame(){
    var user = firebase.auth().currentUser;
    players.creator.uid =  user.uid;
    players.creator.displayName = user.displayName;
    players.state = state.open
    game.push().set(players);
}

function joinGame(key){
    var user = firebase.auth().currentUser;
    //just works in one single game
    var gameRef = game.child(key);

    //just 1 at the time its allowed in the transaction
    gameRef.transaction(function(current) {
        if(!current.joiner){
            current.state = state.joined;
            current.joiner = {
                uid: user.uid,
                displayName: user.displayName
            }
        return current;
        }    
    })
}


$(document).ready(function()
{
    $("#click-register").on('click', function() { 
        $('#register').modal('show'); 
    });

    $("#click-signin").on('click', function() { 
        $('#signIn').modal('show'); 
    });

    $("#button-register").on('click', function() { 
        submitCreateAccount();
        cleanModal() 
    }); 

    $("#button-signIn").on('click', function() { 
        cleanModal(); 
        signIn();
    }); 

    $(".modal .delete").on('click', function() { 
        cleanModal();
    }); 

    $(".modal .cancel").on('click', function() { 
        cleanModal();
    }); 

    $(".modal-background").on('click', function() { 
        cleanModal();
    }); 

    $('#chatmessage').keypress(function (e) {
        if (e.which == 13) {
            sendChatMessage();
        }
    }); 
});


function cleanModal(){
    $('#entry-displayname').text("");
    $('#entry-email').text("");
    $('#entry-password').text("");
    $('#email').text("");
    $('#password').text("");
    $('#register').modal('hide'); 
    $('#signIn').modal('hide'); 
    $('#errorh').modal('hide'); 
}