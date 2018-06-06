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

/*
* All reference to the childs in the database
*
*/
var chat = firebase.database().ref("chat");
var player = firebase.database().ref("/player");
var turn = firebase.database().ref("/turn");
var startgame = false;
chat.remove();
turn.remove();

var userRef; // will be used  to reference the object where we will store this player info
/*
* Local copy of the variables in firebase
*/
var wins1, wins2, losses1, losses2, choise1, choise2;
var displayName; //local player name
var otherName;// remote player name
var userNumber =0 ;// my player name

//listener that a game is going on. Whenever we start a game turn goes to 1 and we add the players game
 database.ref().on("value", function(snapshot) {
    var turnVal = snapshot.child('turn').val();
    if (turnVal !== null && player == undefined) {
        $("#error").text('Please wait until other players finish, then refresh screen.');
        $('#errorh').modal('show'); 
    }
    });


// Listen for the increment in turn. The increment is done after selecting rps
//In this function you will classify them 1 for player 1, 2 for 2 and 3 for printing results
turn.on('value', function(snapshot) {

    var turnNum = snapshot.val();
    if (turnNum	== 1) {
        $("#gameMessages").text("Player 1 turn");

    } else if (turnNum == 2) {
        $("#gameMessages").text("Player 2 turn");

    } else if (turnNum == 3){
        $(".game").removeClass("choise"); 
        setRPS();
        
    }
});
/*
* Inicialize all the variables
*/
  function setRPS() {
    console.log("getting winner");
    firebase.database().ref("player").once('value', function(snapshot) {
       var ch1 = snapshot.val()[1].choice;
       var wins1 = snapshot.val()[1].wins;
       var losses1 = snapshot.val()[1].losses;
       var ch2 = snapshot.val()[2].choice;
       var wins2 = snapshot.val()[2].wins;
       var losses2 = snapshot.val()[2].losses;

       console.log("entering the game with " +ch1 + " " + ch2);

        var result = rps(ch1,ch2);
        console.log(result);
        
        if(result == "win"){
            $("#gameMessages").text(ch1 + " beats " + ch2 + " "+snapshot.val()[1].name + " you won");
            ++wins1;
            losses2++;
            
        }if(result == "lose"){
            $("#gameMessages").text(ch2 + " beats " + ch1 + " "+snapshot.val()[2].name + " you won");
            wins2++;
            losses1++;
            
        }else if(result == "draw"){
            $("#gameMessages").text(ch1 + " same " + ch2 + " "+"Draw")
        }
        $("#tdWinsp1").text(wins1);
        $("#tdWinsp2").text(wins2);
        $("#tdLossesp2").text(losses2);
        $("#tdLossesp1").text(losses1);
  
        firebase.database().ref("player/1").update({
            wins: wins1,
            losses: losses1
        });

        firebase.database().ref("player/2").update({
            wins: wins2,
            losses: losses2
        });

        $("#join_text").text("Try again");
        $("#join").show();
     


    });

    }

    player.on('child_removed', function(snapshot) {
        // Find player that was removed
        var key = snapshot.key;
        $("#join_text").text("Join Game");
        // Show 'player has disconnected' on chat
        $("#gameMessages").text("Player" + key + " has left");
        $("#gameMessages").append(' Waiting for another player to join...');
    
        // Display beginning message
        // Empty score
        $('#tdWinsp1').text("");
        $('#tdWinsp2').text("");
        $('#tdLossesp1').text("");
        $('#tdLossesp2').text("");
        resetColors();
    });

//once only license once for data
 function setPlayer() {
    console.log("Defining if Player 1 or Player 2");
    database.ref().once('value', function(snapshot) {
        var playerObj = snapshot.child('player');
        var num = playerObj.numChildren();
        // Add player 1
      if (num == 0) {
          player = 1;
          addPlayer(player);
          $("#gameMessages").text("Wait for another player to join...");
      } else if (num == 1 && playerObj.val()[2] !== undefined) {
            // Sets player to 1
          player = 1;
         
          addPlayer(player);
          // Start turn by setting turn to 1
          turn.set(1);
      // Add player 2
      } else if (num == 1) {
            // Sets player to 2
          player = 2;
          addPlayer(player);
          // Start turn by setting turn to 1
            turn.set(1);
      } else if(playerObj.val()[1] !== undefined && playerObj.val()[2] !== undefined){
          turn.set(1);
      }

    });
}

/*
* Activate all buttons and add player to firebase
*/
function addPlayer(count) {
    var ocount;
    console.log( 'You are Player ' + count);
   
    // Create new child with player number
        if(count ==1)
            ocount =2;
            else
            ocount =1;

    $("#rock"+ocount).hide("slow");
    $("#paper"+ocount).hide("slow");
    $("#scissors"+ocount).hide("slow");
    if(displayName =="Player")
        displayName = "Player "+ count;
    userNumber = count;
    otherName = ocount;
    userRef = firebase.database().ref("player/"+count);
    $("#player"+count).text(displayName);
    // Allows for disconnect
    userRef.onDisconnect().remove();
    // Sets children of player number
    userRef.set({
        'name': displayName,
        'wins': 0,
        'losses': 0
    });
}


/*
* Starts auth methods
*/

///create account
function submitCreateAccount(){
    displayName = document.querySelector("#entry-displayname");
    var email = document.querySelector("#entry-email");
    var password = document.querySelector("#entry-password");
    firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
    .then(function(user){
    user.updateProfile({
        displayName: displayName.value
    });
        
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
        email = user.email;
        name = user.name;
        $("#uid").text("Sign in as: " + user.displayName);
        displayName = user.displayName;
       // line that connects auth with game start
    }
    else{
        displayName = "Player";
    }
    });

    //Chat
    function sendChatMessage(){
        var messageField = $("#chatmessage").val();
        $("#chatmessage").val("");
        chat.push().set({
            name: displayName,
            message: messageField
        });
    }


    firebase.database().ref("chat").on("child_added", function(snapshot){
        var message = snapshot.val();
        console.log(message.message);
        addChatMessage(message.name, message.message);
    })    


    function addChatMessage(name, message){
        $("#chat").append( "<p><strong>" + name + ":</strong> " + message + "</p>");
      
        $('#chat').scrollTop($('#chat')[0].scrollHeight); 
    
    }

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

    $('#join').on("click", function () {
        //you can join this app after auth or with default name... later I could change it
        resetColors();
        var para = $(this).attr("key");
        console.log(para);
        $(this).hide("slow");
        
        setPlayer();
        
    });
    $('.game').on("click", function () {
        if(userNumber !==0){
        resetColors();
        var q = $(this).attr("data");
        console.log("this is the selection from the button: " + q);


        var turnNum;

        turn.once('value', function(snapshot) {
            turnNum = snapshot.val();
        });

        if(turnNum == userNumber){
            console.log("Player " + turnNum + " turn");
            $(this).removeClass("is-info");
            $(this).addClass("is-primary");
            userRef.update({
                choice: q
            }); 
				turnNum++;
                turn.set(turnNum);
           
        } else {
            $("#error").text("Wait for your turn!!!!");
            $('#errorh').modal('show');
        }
    }else{
        $("#error").text("Press <Join Game> to continue!!!!");
        $('#errorh').modal('show');

    }



    });  


function resetColors(){
    $(".game").removeClass("is-primary");
    $(".game").addClass("is-info");
}
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

function rps(yourRPS, opponentRPS) {
    // Run traditional rock, paper, scissors logic and return whether you won, lost, or had a draw.
        switch(yourRPS) {
        case 'rock':
          switch(opponentRPS) {
                case 'rock':
                    return 'draw';
                case 'paper':
                    return 'lose';
                case 'scissors':
                    return 'win';
            }
          break;
        case 'paper':
            switch(opponentRPS) {
                case 'rock':
                    return 'win';
                case 'paper':
                    return 'draw';
                case 'scissors':
                    return 'lose';
            }
          break;
        case 'scissors':
            switch(opponentRPS) {
                case 'rock':
                    return 'lose';
                case 'paper':
                    return 'win';
                case 'scissors':
                    return 'draw';
            }
            break;
        }
     }
    // _Called after player assignment completes._
    