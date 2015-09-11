/**
 * UPStore Modal app
 */

var APP_ID = "55eabf3f9fb5ba02465c90a2";
$("modal").each(function() {
	$(this).attr('upstore-style', '{ bg: "background-color" }');
	$(this).html(" \
		<div upstore-bind='title'></div> \
		<div upstore-bind='div'></div> \
	")
	UPSTORE.retrieve(APP_ID, $(this).attr('upstore-arr-key'), this).then(function(response) {
		// console.info(response)
	});
})
