const { on, once } = require('events'); // Importation des fonctions on et once du module events
const express = require('express'); // Importation du framework Express
const http = require('http'); // Importation du module HTTP
const { exit } = require('process');
const socketIo = require('socket.io'); // Importation de Socket.IO

const app = express(); // Création de l'application Express
const server = http.createServer(app); // Création du serveur HTTP
const io = socketIo(server); // Initialisation de Socket.IO avec le serveur HTTP

app.get('/', (req, res) => { // Envoie au client le fichier client.html
    res.sendFile(__dirname + '/client.html');
});

const user_needed = 2; // nombre d'utilisateurs nécessaires pour démarrer la partie
const user_max = 4; // nombre maximum d'utilisateurs
const game_going = false; // indique si une partie est en cours

var user_list = []; // tableau des noms des joueurs connectés
var userid_list = []; // tableau des ids des joueurs connectés

function update_all_user_list() {
  console.log("Sending user list update to all clients"); // log
  io.emit('update_user_list', user_list, userid_list, user_needed, user_max); // envoi de la liste
}

function exit_user(userid, socket) {
      var name = user_list[userid_list.indexOf(userid)]; // on recup le nom pour le log
      user_list = user_list.filter(user => user !== name); // remove the user from the array
      userid_list = userid_list.filter(id => id !== userid); // remove the id from the array
      console.log("User " + userid + " has logged out from " + name); // log
      update_all_user_list(); // on renvoie à tout le monde
      socket.emit('exit_response', name, true, 'User exited successfully');
}

io.on('connection', (socket) => {


  console.log("A user has connected to the server (" + socket.id + ")"); // log
  socket.emit('update_user_list', user_list, userid_list, user_needed, user_max);
  console.log("Sending him user list"); // log


  socket.on('identification', (new_user) => {


    console.log("Attempting identification with name " + new_user); // log

    if (user_list.includes(new_user)) { // if the name is already taken

      console.log("The name is already taken"); // log
      socket.emit('join_response', new_user, false, 'Name already taken');

    } else if (user_list[new_user] != null) { // if the user is already logged in

      socket.emit('join_response', new_user, false, 'Already logged in');

    }else{

      user_list.push(new_user); // ajoute le new_user à la liste
      userid_list.push(socket.id); // ajoute l'id à la liste

      console.log("Name available, identification successful"); // log
      socket.emit('join_response', new_user, true, 'Name accepted');

      update_all_user_list();

    }


    socket.on('exit', (id) => { // when a user exits, remove them from the user list and tell to everyone

      if (!userid_list.includes(id)) {

        socket.emit('exit_response', id, false, 'User not found');
        return;

      } else {
        exit_user(id, socket);
      }

    });


    socket.on('request_id',() => { // envoi de l'id à l'utilisateur
      socket.emit('receive_id', socket.id);
    });
  

    socket.on('ask_update_user_list', () => { // envoi de la liste des utilisateurs à la demande
      console.log("User " + socket.id + " requested user list update"); // log
      socket.emit('update_user_list', user_list, userid_list, user_needed, user_max);
    });


    socket.on('send_message', (id, message) => { // when a user sends a message, broadcast it to all users
      var name = user_list[user_list.indexOf(id)];
      console.log("User " + socket.id + "(" + name + ") sent message: " + message);
      console.log(user_list)
      io.emit('receive_message', id, name, message);
    });


    socket.on('disconnect', () => { // when a user disconnects, remove them from the user list and tell to everyone
      exit_user(socket.id, socket);
    });


  });


  

  
});

server.listen(8888, () => { // Starting the server on port 8888
  console.log("Server running at http://localhost:8888\n--------------------------------" );
});

