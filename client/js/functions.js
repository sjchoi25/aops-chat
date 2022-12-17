/*
  Functionality and features of the chat
  are implemented here
*/

// "JQuery"
function $(query) {return document.querySelector(query);}

// fetch item from local storage with fallback value
// if the requested value does not exist
function sfetch(key, fallback) {
	return localStorage.getItem(key) ? localStorage.getItem(key) : fallback;
}

// Remember last used username
const name = sfetch("username", "")
$("#username").value = name;

// Variables
let self;
let ignore = [];
const messages = $('#messages');
const info = `
<h1>Instructions</h1>
Hit enter to send a message and shift-enter to create a new line.
<h2>Commands</h2>
<ol>
	<li>/clear - Clears the chat</li>
	<li>/ignore{user} - Stop recieving messages from <i>user</i></li>
</ol>`;

$("#info").onclick = () => {popup(info);}

// Ask for notifications
if (!Notification) {
    alert("Your browser does not support notifications.");
}
else if (Notification.permission !== "denied") {
    Notification.requestPermission()
}


// Really bad bbcode parser
function bbcode(text) {
	text = text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
	text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
	const s_tags = ["b", "u", "i", "s"]

	for (let tag = 0; tag < s_tags.length; tag++) {
		// Empty tags are not allowed
		text = text.replaceAll(`[${s_tags[tag]}][/${s_tags[tag]}]`, "");
		text = text.replaceAll(`[${s_tags[tag]}]`, `<${s_tags[tag]}>`).replaceAll(`[/${s_tags[tag]}]`, `</${s_tags[tag]}>`)
	}

	/*
	  Urls - basically:
	  https://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript

	  Only raw urls are allowed here.
	*/
	const urlreg = /((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi;
	text = text.replace(urlreg, (url) => {
		return '<a href="' + url + '" target="_blank">' + url + '</a>';
	});

	return text;
}

/*
  Math rendering

  Basically we need to check for all delimeters which is a pain
*/
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

// Sticky message
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