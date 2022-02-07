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