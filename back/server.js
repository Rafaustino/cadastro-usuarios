const express = require ('express');

const mysql = require('mysql');

const path = require('path');

const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server);

const db = "idosos";
const table_db = "users";



//BANCO DE DADOS

//CREATE DB
var conexao = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
  });

conexao.connect((err)=> {
    if (err) throw err;
    console.log("Connected!");

    conexao.query(`CREATE DATABASE ${db}`,  (err, result) => {

      if (!err) 
        console.log("Database created");
      else
        console.log("DB já existe");
    });
    
    
  });  


  //CREATE TABLE 
    conexao = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: db, 
    });


    var sqlCreateTable = `CREATE TABLE ${table_db} (name VARCHAR(255), email VARCHAR(100), niver DATE, telefone VARCHAR(15))`;
    conexao.query(sqlCreateTable, (err, result) => {
        if (!err) 
            console.log("Table created");
        else
        console.log("Table já existe");    
  });



let usuariosDB =[];


//SOCKET
io.on('connection', socket =>
{
    //EMITIR OS DADOS DO DB ASSIM QUE O SOCKET FOR CONECTADO
    conexao.query(`SELECT * FROM ${table_db}`, (err, result, fields) => 
    {
        if (err) throw err;
        
        usuariosDB = [...result];
        socket.emit("recebaMessage", usuariosDB);
        console.log(usuariosDB);
    }); 
    console.log(`Socket conectado ${socket.id}`);

    //RECEBENDO UM NOVO USUÁRIO e LISTANDO ASSIM QUE TEMOS UM NOVO USER
    socket.on("message", (data) => {
        console.log( data);
        var sqlInsert = `INSERT INTO users (name, telefone , email, niver) VALUES ('${data.nome}', '${data.celular}', '${data.email}', '${data.aniversario}' )`;
        conexao.query(sqlInsert, (err, result) =>
        {
        if (!err) 
            console.log("1 record inserted");
        else
            console.log("DEU RUIM< MANOOOO", err);
        });
        conexao.query(`SELECT * FROM ${table_db}`, (err, result, fields) => 
        {
            if (err) throw err;
            
            usuariosDB = [...result];
            socket.emit("recebaMessage", usuariosDB);
            console.log(usuariosDB);
        });      
      });

  //DELETAR USUARIO    
  socket.on("deleteMessageSocket", (data) => 
  {
    var sqlDelete = `DELETE FROM users WHERE email = '${data.email}' `;
      conexao.query(sqlDelete, (err, result) => {
        if (err) throw err;
          console.log("Number of records deleted: " + result.affectedRows);
    });
  });
});

server.listen(3000);
console.log("SERVIDOR RODANDO")
