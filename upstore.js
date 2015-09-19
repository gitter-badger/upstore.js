/**
 * UPStore front-end framework
 */

window.UPSTORE = {

	/**
	 * Authentication details
	 */
	consumerKey: "",

	/**
	 * Show editors of UPP
	 */
	showEditors: false,

	/**
	 * Apps on current website
	 */
	upps: [],

	/**
	 * URL of the server
	 */
	server: {
		base: "http://localhost/UPStore/server",
		newUpp: "/upps/{appId}/{consumerKey}",
		retrieve: "/upps/{appId}?consumerKey={consumerKey}&arrKey={arrKey}"
	},

	/**
	 * Get new app for current website
	 */
	newUpp: function(appId)
	{
		// promise of new app when ready
		return new Promise(function(resolve, error) {
			var xmlHttp = new XMLHttpRequest(), url = UPSTORE.server.base+UPSTORE.server.newUpp.replace("{appId}", appId).replace("{consumerKey}", UPSTORE.consumerKey);
			xmlHttp.onreadystatechange = function() {
				if (xmlHttp.readyState == 4) {
					var json = JSON.parse(xmlHttp.responseText);
					if(xmlHttp.status == 200) {
						var element = document.createElement('script');
						element.text = json.scripts;
						document.body.appendChild(element);

						var element = document.createElement('style');
						element.type = 'text/css';
						if (element.styleSheet){
						  element.styleSheet.cssText = json.styles;
						} else {
						  element.appendChild(document.createTextNode(json.styles));
						}
						document.head.appendChild(element);

						resolve(json);
					}
					else
					{
						console.error('[UPSTORE] '+json.error)
						error(xmlHttp.status, json);
					}
				}
			};
			xmlHttp.open("GET", url, true); // true for asynchronous
			xmlHttp.send(null);
		});
	},

	/**
	 * Get content from URL, and append it as script
	 * @param   {string}    source       URL
	 * @param   {string}    section
	 * @param   {object}    object
	 */
	getContent: function(source, object, section)
	{
		url = source
		return new Promise(function(resolve, error) {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = function() {
				if (xmlHttp.readyState == 4) {
					if(xmlHttp.responseText) {
						resolve({object: object, response: xmlHttp.responseText, section: section})
					}
					else
						error(xmlHttp);
				}
			};
			xmlHttp.open("GET", url, true); // true for asynchronous
			xmlHttp.send(null);
		})
	},

	/**
	 * Retrieve properties of an app (that belongs to a user)
	 */
	retrieve: function(appId, arrKey, element)
	{
		arrKey = arrKey||"customize";
		var url = UPSTORE.server.base+UPSTORE.server.retrieve.replace("{appId}", appId).replace("{consumerKey}", UPSTORE.consumerKey).replace("{arrKey}", arrKey);
		return new Promise(function(resolve, error) {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = function() {
				if (xmlHttp.readyState == 4) {
					if(xmlHttp.responseText) {
						var json = JSON.parse(xmlHttp.responseText);
						if(element)
							UPSTORE.process(appId, arrKey, element, json)
						resolve(json)
					}
					else
						error(xmlHttp);
				}
			};
			xmlHttp.open("GET", url, true); // true for asynchronous
			xmlHttp.send(null);
		})
	},

	/**
	 * Process the element's binding and options
	 */
	process: function(appId, arrKey, element, properties)
	{
		if(!window.UPSTORE.bindings[appId])
	 		window.UPSTORE.bindings[appId] = {};
		window.UPSTORE.bindings[appId][arrKey] = properties;
		var key = "";
		for(key in properties)
		{
			window.UPSTORE.updateBinding(appId, arrKey, key, properties[key])
		}
	},

	/**
	 * Keep track of different UPSTORE key values
	 */
	bindings: {},

	/**
	 * Clean and organize dirty JSON
	 */
	dirtyJSON: function(text)
	{
		return JSON.parse(text.replace(/(['"])?([a-zA-Z0-9]+)(['"])?:/g, '"$2":'));
	},

	/**
	 * Update a binding value
	 * @param   {string}    appId
	 * @param   {string}    arrKey
	 * @param   {string}    key         Name of property
	 * @param   {string}    value       New value of property
	 */
	updateBinding: function(appId, arrKey, key, value)
	{
		arrKey = arrKey||"customize";
		// update the binding setting
		window.UPSTORE.bindings[appId][arrKey][key] = value;

		// first bind the text
		var main = '[upstore-init="'+appId+'"][upstore-arr-key="'+arrKey+'"]';
		var i, search = document.querySelectorAll(main+'[upstore-bind="'+key+'"], '+main+' [upstore-bind="'+key+'"]'), json = {};
		for(i = 0;i<search.length;i++)
		{
			search[i].innerHTML = value;
		}

		// bind the styles
		search = document.querySelectorAll(main+'[upstore-style*="'+key+'"], '+main+' [upstore-style*="'+key+'"]');
		for(i = 0;i<search.length;i++)
		{
			json = window.UPSTORE.dirtyJSON(search[i].getAttribute('upstore-style'))
			if(typeof(json[key]) != 'undefined')
			{
				if(typeof(json[key]) == 'string')
				{
					search[i].style[json[key]] = value;
				}
				else {
					var b;
					for(b = 0;b<json[key].length;b++)
					{
						search[i].style[json[key][b]] = value;
					}
				}
			}
		}

		// bind the classes
		search = document.querySelectorAll(main+'[upstore-bind-class="'+key+'"], '+main+' [upstore-bind-class="'+key+'"]');
		for(i = 0;i<search.length;i++)
		{
			var property = search[i].getAttribute('upstore-bind-class-old-value');
			if(property != key)
				search[i].className = search[i].className.replace(property, "");
			// console.info(arguments)
			search[i].className += " "+value;
			search[i].setAttribute('upstore-bind-class-old-value', " "+value);
		}
	},
}
