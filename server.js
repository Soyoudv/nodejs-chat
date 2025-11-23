const { on, once } = require('events'); // Importation des fonctions on et once du module events
const express = require('express'); // Importation du framework Express
const http = require('http'); // Importation du module HTTP
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

var user_list = new Map(); // dictionnaire pour les joueurs et leurs id
var user_list_array = []; // tableau des noms des joueurs connectés

function update_all_user_list() {
  console.log("Sending user list update to all clients"); // log
  io.emit('update_user_list', user_list_array, user_needed, user_max); // envoi de la liste
}


io.on('connection', (socket) => {


  console.log("A user has connected to the server (" + socket.id + ")"); // log
  socket.emit('update_user_list', user_list, user_needed, user_max);
  console.log("Sending him user list"); // log


  socket.on('identification', (new_user) => {


    console.log("Attempting identification with name " + new_user); // log

    if (user_list.has(new_user)) { // if the name is already taken

      console.log("The name is already taken"); // log
      socket.emit('join_response', new_user, false, 'Name already taken');

    } else if (user_list[new_user] != null) { // if the user is already logged in

      socket.emit('join_response', new_user, false, 'Already logged in');

    }else{

      user_list.set(new_user, socket.id);
      user_list_array.push(new_user);

      console.log("Name available, identification successful"); // log
      socket.emit('join_response', new_user, true, 'Name accepted');

      update_all_user_list();

    }


    socket.on('exit', (id) => { // when a user exits, remove them from the user list and tell to everyone
      
      if (!user_list.has(id)) {

        socket.emit('exit_response', id, false, 'User not found');
        return;

      } else {

      var name = user_list_array[id]; // on recup le nom pour le log
      user_list.delete(id); // on enleve l'utilisateur de la liste
      user_list_array = user_list_array.filter(user => user !== id); // remove the user from the array
      console.log("User " + id + " has logged out from " + name); // log
      update_all_user_list(); // on renvoie à tout le monde
      socket.emit('exit_response', id, true, 'User exited successfully');

      }

    });


  });

  socket.on('request_id',() => { // envoi de l'id à l'utilisateur
    socket.emit('receive_id', socket.id);
  });

  socket.on('ask_update_user_list', () => { // envoi de la liste des utilisateurs à la demande
    console.log("User " + socket.id + " requested user list update"); // log
    socket.emit('update_user_list', user_list_array, user_needed, user_max);
  });

  
});

server.listen(8888, () => { // Starting the server on port 8888
  console.log("Server running at http://localhost:8888\n--------------------------------" );
});

