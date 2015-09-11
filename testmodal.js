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
	var ARR_KEY = $(this).attr('upstore-arr-key');
	UPSTORE.retrieve(APP_ID, ARR_KEY, this).then(function(response) {

	});

	// only on customization process
	if(UPSTORE.showEditors)
	{
		var selector = this.querySelectorAll('[upstore-bind]'), i;
		for(i = 0;i<selector.length;i++)
		{
			selector[i].addEventListener('keyup', function() {
				window.UPSTORE.updateBinding(APP_ID, ARR_KEY, $(this).attr('upstore-bind'), $(this).html())
			})
		}
		$(selector).attr('contenteditable', true)
	}
})
