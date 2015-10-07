/**
 * UPStore Modal app
 */

(function() {
	var APP_ID = "561546ad9fb5ba090f01daa3";
	$("modal").each(function() {
		$(this).css("display", "none").html(' \
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

		if(!UPSTORE.showEditors) {
			$(this).find(".modal-background").css("opacity", ".7");
		}

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
		hexToRGB = function(color){
		    var r = parseInt(color.substring(0,2),16);
		    var g = parseInt(color.substring(2,4),16);
		    var b = parseInt(color.substring(4,6),16);
		    return [r,g,b];
		}

		function processColor(newVal)
		{
			$(modal).find(".modal-container .modal-title, .modal-container .modal-content").css("color", "rgb("+(255 - newVal[0])+", "+(255 - newVal[0])+", "+(255 - newVal[0])+")")
		}
		var ARR_KEY = $(this).attr('upstore-arr-key'), modal = this;
		UPSTORE.retrieve(APP_ID, ARR_KEY, this).then(function(response) {
			var time = window.localStorage.getItem("_modal_time");
			var currentTime = new Date();
			currentTime = currentTime.getDate()+"/"+(currentTime.getMonth()+1)+"/"+currentTime.getFullYear();
			if(UPSTORE.showEditors)
			{
				$(modal).css("display", "block")
				localStorage.setItem("_modal_time", currentTime)
			}
			else {
				if(response.hold == 1) {
					if(!time || time != currentTime) {
						$(modal).css("display", "block")
						localStorage.setItem("_modal_time", currentTime)
					}
				}
				else if(response.hold == 2) {
					var secondCheck = (currentTime.getDate()+1)+"/"+(currentTime.getMonth()+1)+"/"+currentTime.getFullYear();
					if(!time || time != currentTime || time != secondCheck) {
						$(modal).css("display", "block")
						localStorage.setItem("_modal_time", currentTime)
					}
				}
				else if(response.hold == 7) {
					var explode = time.slice("/");
					if(!time || explode[1] != (new Date().getMonth()+1)) {
						$(modal).css("display", "block")
						localStorage.setItem("_modal_time", currentTime)
					}
				}
				else if(response.hold == 0 && !time) {
					$(modal).css("display", "block")
					localStorage.setItem("_modal_time", currentTime)
				}
			}
			var newVal;
			UPSTORE.watch(APP_ID, ARR_KEY, "*", function(changes) {
				if(changes.key == 'bgColor') {
					newVal = hexToRGB(changes.value.replace("#", ""));
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
			window.tinymceUpload.init(APP_ID, ARR_KEY, this);
			var script = document.createElement("script");
			script.src = "https://tinymce.cachefly.net/4.2/tinymce.min.js"
			script.onload = function() {
				tinymce.init({
				    selector: '.modal-content',
				    inline: true,
				    toolbar: [
						"undo redo | styleselect | bold italic | link image alignleft aligncenter alignright | ltr rtl",
					],
					images_upload_url: "postAcceptor.php",
					images_upload_base_path: "/some/basepath",
					plugins: 'directionality image link',
				    menubar: true,
					setup: function(editor) {
				        editor.on('blur', function(e) {
				            window.UPSTORE.updateBinding(APP_ID, ARR_KEY, "content", tinyMCE.activeEditor.getContent());
				        });
				    },
					file_browser_callback: function(field_name, url, type, win) {
				        if(type=='image') window.tinymceUpload.trigger();
				    }
				});
			};
			document.body.appendChild(script);
			$(this).find("button, .modal-close").attr("disabled", true).css("cursor", "not-allowed")
		}
	})
})();
