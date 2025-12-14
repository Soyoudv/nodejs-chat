var socket = io();

var registered_name = "";
var joined = false;
var my_id = "";


function display_for(where, message, n) {
    document.getElementById(where).innerText = message;

    setTimeout(function () { // Efface le message après n secondes
        document.getElementById(where).innerText = "";
    }, 1000 * n);
}


onload = function () {
    document.getElementById("name_box").value = "";
    document.getElementById("message_box").value = "";
    // on vide les boites à l'entrée d'une personne dans le site
    socket.emit('request_id');
}


socket.on('receive_id', (id) => {
    my_id = id;
    console.log("Id given to newly connected user: " + my_id); // log
});


function join() {
    var name = document.getElementById("name_box").value;
    document.getElementById("name_box").value = "";

    if (name == "") {
        display_for("join_status", "Your name can't be empty", 3);
        return;
    }

    console.log("Sending join request as " + name);
    socket.emit("identification", name);
}


socket.on("join_response", (name, success, message) => {
    if (success) {
        joined = true;
        registered_name = name;
        display_for("join_status", message + ": " + registered_name, 3);

        document.getElementById("profile_status").innerHTML = "(Logged in as " + registered_name + ")";
        console.log("Join successful as " + registered_name); // log
    } else {
        display_for("join_status", "Join failed: " + message, 3);
    }
});


socket.on('exit_response', (name, success, message) => {
    if (success) {
        display_for("join_status", "User " + name + " has exited", 3);
        console.log("Exit successful for " + name); // log
    } else {
        display_for("join_status", "Exit failed: " + message, 3);
        console.log("Exit failed for " + name); // log
    }
});


socket.on('update_user_list', (user_list, userid_list, user_needed, user_max) => {

    document.getElementById("names").innerHTML = ""; // vide la boîte

    // on affiche tous les éléments de la hashmap en la parcourant en tant que un tableau
    for (let i = 0; i < user_list.length; i++) {
        document.getElementById("names").innerHTML += "<li><b>" + user_list[i] + "</b><b class='id'>#" + (i + 1) + "</b></li>";
    }

    if (user_list.length >= 1) {
        document.getElementById("game_status").innerHTML = user_list.length + " user connected. (" + user_needed + " needed to start, max " + user_max + ")";
        return;
    } else {
        document.getElementById("game_status").innerHTML = "no users connected. (" + user_needed + " needed to start, max " + user_max + ")";
        return;
    }
});


function exit() {
    if (joined) {
        document.getElementById("profile_status").innerText = "";
        console.log(my_id + "Sending exit request as " + registered_name); // log
        socket.emit("exit");

        joined = false;
        registered_name = "";
    } else {
        display_for("join_status", "You are not connected, you cant exit", 3);
    }
}

function send_message() {
    var message = document.getElementById("message_box").value;
    document.getElementById("message_box").value = "";

    if (!joined) {

        display_for("chat_status", "You must be connected to send messages", 3);

    }

    else if (message == "") {

        display_for("chat_status", "You can't send empty messages", 3);

    } else {

        console.log("Sending message: " + message); // log
        socket.emit("send_message", my_id, message);
    }
}

socket.on('receive_message', (id, name, message) => {
    console.log("Received message from " + name + ": " + message); // log
    document.getElementById("messages").innerHTML += "<li><b>" + name + "</b><b class='id'>#" + id + "</b>: " + message + "</li>";
});