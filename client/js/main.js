/*
  Main chat functions,
  message handling and other such things
*/
const socket = io();

// Submits on enter
$('textarea').addEventListener("keypress", (event) => {
	if(event.which === 13 && !event.shiftKey){      
		event.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
		event.preventDefault();
	}
});

// Chat messages
$("#chatinput").addEventListener("submit", (e) => {
	e.preventDefault();
	const val = $('textarea');
   	if (val.value) {
		if (val.value.startsWith("/ignore")) {
			try {
				ignore.push(val.value.match(/\/ignore{.+}/)[0].slice(8, -1));
			}
			catch {popup("You have to specify a user to ignore!")};
		}
		else if (val.value === "/clear") {messages.innerHTML = "";}
		else if (val.value.length >= 1000) popup("Your message is too long!");
		else {socket.emit('chat', val.value);}
		val.value = "";
	}
});

// Handle login
$("#login").addEventListener("submit", (e) => {
	e.preventDefault();
	if (username.value.length >= 50) {
		popup("Username is too long!");
		return;
	}
	self = username.value;
 	socket.emit('login', {
		name: self,
		room: $("#room").value
	});
});


// Broadcasted chat messages
socket.on('message', (msg) => {
	if (msg.text === "" || ignore.includes(msg.name)) return;

	let cl;
	if (self === msg.name) {cl = "c_self";}
	else {cl = "c_user";}

	const item = document.createElement('div');

	const txt = bbcode(msg.text);
	if (txt.length !== 0) {
		item.innerHTML = `<span class="c_username">${msg.name}:</span> ${txt}`;
		item.classList.add(cl);
		item.addEventListener("dblclick", (event) => dblclick(event));
   		messages.appendChild(item);

		renderMath();
		messages.scrollTop = messages.scrollHeight;
		// Show notification now
		if (Notification.permission === "granted" && document.hidden && settings.notify) {
            let notification = new Notification(msg.name, {body: msg.text});
        }
	}
	else popup("Your message has no content.");
});

// Errors
socket.on('error', err => {$('#error').innerHTML = err;});

// Join and exit
socket.on('join', data => {
	$("#enterscreen").style.display = "none";
	$("#chatscreen").style.display = "flex";
	localStorage.setItem("username", data.name);
	if (data.history && data.name === self) {
		for (let i = 0; i < data.history.length; i++) {
			const item = document.createElement('div');
			item.innerHTML = `<span class="c_username">${data.history[i][0]}:</span> ${bbcode(data.history[i][1])}`;
			item.classList.add("c_user");
			item.addEventListener("dblclick", (event) => dblclick(event));
			messages.appendChild(item);
		}
	}
	updateUsers(data.users,`${data.name} just joined`);
	renderMath();
	messages.scrollTop = messages.scrollHeight;
});

socket.on('exit', data => {
	updateUsers(data.users, `${data.name} just left`);
});
