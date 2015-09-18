/**
 * UPStore Modal app
 */

var APP_ID = "55eabf3f9fb5ba02465c90a2";
$("modal").each(function() {
	$(this).html(' \
		<div class="modal-background" upstore-style=\'{ bgColor: "background-color" }\'></div>\
		<div class="modal-container" upstore-style=\'{ bgColor: "background-color", borderWidth: "border-width", borderStyle: "border-style", borderColor: "border-color" }\'>\
			<div class="modal-title" upstore-bind="title" upstore-style=\'{ headerBg: "background-color" }\'></div> \
			<div class="modal-close" upstore-style=\'{ headerBg: "color" }\' onclick="closeModal(this, false)">&#10006;</div> \
			<div class="modal-content" upstore-bind="content"></div> \
			<div style="width: 100%;text-align: center;">\
				<button class="md-close" upstore-bind="actionText" onclick="closeModal(this)"></button>\
			</div>\
		</div>\
	')

	window.closeModal = function(button, openAction)
	{
		if(UPSTORE.showEditors)
			return ;
		openAction = (typeof(openAction) == 'undefined') ? true : openAction;
		var modalToClose = $(button).parentsUntil('modal').parent();
		modalToClose.css("opacity", "0")
		setTimeout(function () {
			modalToClose.css("display", "none")
			if(openAction)
			{
				location.replace(window.UPSTORE.bindings[APP_ID][ARR_KEY].actionUrl);
			}
		}, 550);
	}

	// convert a hexidecimal color string to 0..255 R,G,B
	hexToRGB = function(hex){
	    var r = hex >> 16;
	    var g = hex >> 8 & 0xFF;
	    var b = hex & 0xFF;
	    return [r,g,b];
	}

	function processColor(newVal)
	{
		if(newVal[0] == 0 && newVal[1] == 0 && newVal[2] == 0) {
			$(modal).find(".modal-container .modal-title, .modal-container .modal-content").css("color", "#3d3d3d")
		}
		else {
			$(modal).find(".modal-container .modal-title, .modal-container .modal-content").css("color", "#fff")
		}
	}
	var ARR_KEY = $(this).attr('upstore-arr-key'), modal = this;
	UPSTORE.retrieve(APP_ID, ARR_KEY, this).then(function(response) {
		var newVal;
		Object.observe(UPSTORE.bindings[APP_ID][ARR_KEY], function(changes) {
			if(changes[0].name == 'bgColor') {
				newVal = hexToRGB(parseInt(changes[0].object.bgColor.replace("#", "")));
				processColor(newVal);
			}
		});
	});

	// only on customization process
	if(UPSTORE.showEditors)
	{
		this.querySelector(".modal-title").setAttribute("contenteditable", true);
		this.querySelector(".modal-title").addEventListener('keyup', function() {
			window.UPSTORE.updateBinding(APP_ID, ARR_KEY, $(this).attr('upstore-bind'), $(this).html())
		})
		var script = document.createElement("script");
		script.src = "https://tinymce.cachefly.net/4.2/tinymce.min.js"
		script.onload = function() {
			tinymce.init({
			    selector: '.modal-content',
			    inline: true,
			    // toolbar: "undo redo",
			    menubar: true,
				setup: function(editor) {
			        editor.on('blur', function(e) {
			            window.UPSTORE.updateBinding(APP_ID, ARR_KEY, "content", tinyMCE.activeEditor.getContent());
			        });
			    },
			});
		};
		document.body.appendChild(script);
		$(this).find("button, .modal-close").attr("disabled", true).css("cursor", "not-allowed")
	}
})
