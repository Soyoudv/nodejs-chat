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
  console.log("envoi de la nouvelle liste des utilisateurs à tous les clients");
  io.emit('update_user_list', user_list, user_needed, user_max);
}

io.on('connection', (socket) => {

  console.log('Un utilisateur est connecté au serveur'); // log
  socket.emit('update_user_list', user_list, user_needed, user_max);

  socket.on('identification', (new_user) => {

    console.log("essai d'indentification avec le nom " + new_user); // log
    
    if (user_list.includes(new_user)) {

      console.log("le nom est déjà pris"); // log
      socket.emit('join_response', new_user, false, 'Nom déjà pris');

    }else{

      user_list.push(new_user);

      console.log("nom disponible, identification réussie"); // log
      socket.emit('join_response', new_user, true, 'Nom accepté');

      update_all_user_list();

    }

  });
  
});

server.listen(8888, () => { // Démarrage du serveur sur le port 8888
  console.log('Serveur lancé sur http://localhost:8888');
});

