const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const Filter = require('bad-words');

filter = new Filter();

const HISTORY = {};
const users = [];

const adduser = (id, name, room) => {
    if (users.find(user => user.name.trim().toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '') === name.trim().toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, ''))) {
		return {error: "Username is already taken"};
	}
    else if (!name || !room || name === "" || room === '') {
		return {error: "Username and room are required!"};
	}

	else if (!["test"].includes(room)) {
		return {error: "That is not an available room."}
	}

	else if (users.length >= 50) {
		return {error: "Sorry, but the maximum number of users was bypassed. Please check back later."}
	}
    users.push({name, room, id});
    return {name, room, id};
}

const clean = (string) => {
	try {
		return filter.clean(string);
	}
	catch {
		return string;
	}
}

const getusers = (room) => users.filter(user => user.room === room)


// Static file serving
app.use("/", express.static(__dirname + "/"));

app.get("/", (req, res) => {
	res.sendFile('chat.html', {root:__dirname});
});

io.on('connection', (socket) => {
    socket.on('chat', (msg) => {
		msg = clean(msg);
        const user = users.find(uname => uname.id === socket.id);

		if (user) {
			if (!HISTORY[user.room]) {
				HISTORY[user.room] = [[user.name, msg]];
			}
			else {
				HISTORY[user.room].push([user.name, msg]);
				if (HISTORY[user.room].length > 20) {
					HISTORY[user.room].shift();
				}
			}
        	io.to(user.room).emit('message', {name: clean(user.name), text: msg});
		}
  	});

	socket.on('login', data => {
		const user = adduser(socket.id, clean(data.name), data.room);
        if (user.error) {
			socket.emit("error", user.error);
		}
		else {
        	socket.join(data.room);
        	io.to(data.room).emit('join', {name: clean(data.name), users: getusers(data.room), history: HISTORY[data.room]});
		}
   	});

    socket.on("disconnect", () => {
        const index = users.findIndex(user => user.id === socket.id);
    	if (index !== -1) {
			const data =  users.splice(index, 1)[0];
			socket.leave(data.room);
            io.to(data.room).emit('exit', {name: data.name, users: getusers(data.room)});
		}
    });
});

http.listen(process.env.PORT || 3000);
