// Ask for notifications
if (!Notification) {
    alert("Your browser does not support notifications.");
}
else if (Notification.permission !== "denied") {
    Notification.requestPermission()
}

// "JQuery"
function $(query) {return document.querySelector(query);}

function removePopup() {
	$("#screen-mask").style.display = "none";
    $("#popup-modal").style.display = "none";

}

function popup(html) {
    $("#screen-mask").style.display = "block";
    $("#popup-modal").style.display = "block";
	$("#popup-modal p").innerHTML = html;
    $("#popup-modal button").addEventListener("click", () => {
        removePopup();
	});
    $("#screen-mask").addEventListener("click", () => {
		removePopup();
    });
}

let self;
let ignore = [];
const socket = io();

// Submits on enter
$('textarea').addEventListener("keypress", (event) => {
	if(event.which === 13 && !event.shiftKey){      
		event.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
		event.preventDefault();
	}
});

const messages = $('#messages');

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

// Update user list
function updateUsers(users, text) {
	$("#users").innerHTML = "";
	$("#userList strong").innerHTML = `Users (${users.length})`;
	for (let i = 0; i < users.length; i++) {
		const user = document.createElement('div');

		user.textContent = users[i].name;
		$("#users").appendChild(user);
	}

	const notif = document.createElement('div');
	notif.textContent = text;
	notif.classList.add("notification");

	messages.appendChild(notif);
}

// Double click
function dblclick(event) {
	let elem = event.target;

	while (true) {
		if (elem.classList.contains("c_user") || elem.classList.contains("c_self")) {
			break;
		}
		elem = elem.parentElement;
	}
	$("#sticky").innerHTML = elem.innerHTML;
}

function renderMath() {
	renderMathInElement(messages, {
		delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\(', right: '\\)', display: false},
            {left: '\\[', right: '\\]', display: true}
        ],
        throwOnError : false
    });
}

function bbcode(text) {
	text = text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
	text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
	const s_tags = ["b", "u", "i", "s"]

	for (let tag = 0; tag < s_tags.length; tag++) {
		// Empty tags are not allowed
		text = text.replaceAll(`[${s_tags[tag]}][/${s_tags[tag]}]`, "");
		text = text.replaceAll(`[${s_tags[tag]}]`, `<${s_tags[tag]}>`).replaceAll(`[/${s_tags[tag]}]`, `</${s_tags[tag]}>`)
	}

	// img
	text = text.replace(/\[img\](.+?)\[\/img\]/g, '<img src="$1" alt="$1">');

	// url
	text = text.replace(/\[url\](.+?)\[\/url\]/g, '<a href="$1" target="_blank">$1</a>');

	return text;
}

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
		if (Notification.permission === "granted" && document.hidden) {
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

socket.on('exit', data => {updateUsers(data.users, `${data.name} just left`);});
