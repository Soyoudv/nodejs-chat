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

let user_list = []; // liste des utilisateurs connectés
let user_needed = 2; // nombre d'utilisateurs nécessaires pour démarrer la partie
let user_max = 4; // nombre maximum d'utilisateurs
let game_going = false; // indique si une partie est en cours

function update_all_user_list() {
  console.log("Sending user list update to all clients"); // log
  io.emit('update_user_list', user_list, user_needed, user_max);
}

io.on('connection', (socket) => {

  console.log('A user has connected to the server'); // log
  socket.emit('update_user_list', user_list, user_needed, user_max);
  console.log('Sending him user list'); // log

  socket.on('identification', (new_user) => {

    console.log("Attempting identification with name " + new_user); // log
    
    if (user_list.includes(new_user)) {

      console.log("The name is already taken"); // log
      socket.emit('join_response', new_user, false, 'Name already taken');

    }else{

      user_list.push(new_user);

      console.log("Name available, identification successful"); // log
      socket.emit('join_response', new_user, true, 'Name accepted');

      update_all_user_list();

    }

    socket.on('exit', (name) => { // when a user exits, remove them from the user list and tell to everyone
      user_list = user_list.filter(user => user !== name);
      console.log("User " + name + " has exited"); // log
      update_all_user_list();
    });

  });
  
});

server.listen(8888, () => { // Starting the server on port 8888
  console.log("Server running at http://localhost:8888\n--------------------------------" );
});

