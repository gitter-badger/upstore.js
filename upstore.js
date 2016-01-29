/**
 * UPStore front-end framework
 */

window.UPSTORE = {

	/**
	 * Authentication details
	 */
	consumerKey: document.querySelector("[upstore-framework]").getAttribute("consumer-key"),

	/**
	 * Show editors of UPP
	 */
	showEditors: false,

	/**
	 * Apps on current website
	 */
	upps: [],

	/**
	 * Landscape mode (STAGING/PRODUCTION)
	 **/
	landscape: window.location.href.indexOf("stagingapi.upstore.io") > -1 || document.querySelector("[upstore-framework]").getAttribute('src') == 'http://staging.upstore.io/upstore.js' ? 'STAGING' : 'PRODUCTION',

	/**
	 * URL of the server
	 */
	server: {
		base: UPSTORE.landscape == 'STAGING' ? "http://stagingapi.upstore.io" : 'http://api.upstore.io',
		azure: UPSTORE.landscape == 'STAGING' ? "https://stagingupstore.blob.core.windows.net" : "https://upstore.blob.core.windows.net",
		newUpp: "/upps/{appId}/{consumerKey}?arrKey={arrKey}",
		retrieve: "/upps/{appId}?consumerKey={consumerKey}&arrKey={arrKey}",
		sendMail: "/emails/upp",
		upload: "/users/upload",
	},

	/**
	 * Get new app for current website
	 */
	newUpp: function(appId, arrKey)
	{
		// promise of new app when ready
		return new Promise(function(resolve, error) {
			var xmlHttp = new XMLHttpRequest(), url = UPSTORE.server.base+UPSTORE.server.newUpp.replace("{appId}", appId).replace("{arrKey}", arrKey).replace("{consumerKey}", UPSTORE.consumerKey);
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
		if(UPSTORE.showEditors && document.querySelector("[upstore-loader]")) {
			document.body.removeChild(document.querySelector("[upstore-loader]"));
		}
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

		// then bind the remove from display
		var main = '[upstore-init="'+appId+'"][upstore-arr-key="'+arrKey+'"]';
		var i, search = document.querySelectorAll(main+'[upstore-if*="'+key+'"], '+main+' [upstore-if*="'+key+'"]'), json = {}, condition = "", passed = false;
		for(i = 0;i<search.length;i++)
		{
			condition = search[i].getAttribute("upstore-if").replace(key, "");
			passed = eval("value"+condition);
			search[i].style.display = (passed ? 'block' : 'none');
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

		// bind the attributes
		search = document.querySelectorAll(main+'[upstore-attr*="'+key+'"], '+main+' [upstore-attr*="'+key+'"]');
		for(i = 0;i<search.length;i++)
		{
			json = window.UPSTORE.dirtyJSON(search[i].getAttribute('upstore-attr'))
			if(typeof(json[key]) != 'undefined')
			{
				if(typeof(json[key]) == 'string')
				{
					search[i].setAttribute(json[key], value);
				}
				else {
					var b;
					for(b = 0;b<json[key].length;b++)
					{
						search[i].setAttribute(json[key][b], value);
					}
				}
			}
		}

		if(window.UPSTORE.registeredWatchers.length > 0)
		{
			for(i = 0;i<window.UPSTORE.registeredWatchers.length;i++) {
				watcher = window.UPSTORE.registeredWatchers[i];
				if(watcher.appId == appId && watcher.arrKey == arrKey && (watcher.key == key || watcher.key == '*')) {
					if(watcher.key == '*')
						watcher.callback({
							key: key,
							value: value,
						});
					else
						watcher.callback(value);
				}
			}
		}
	},

	/**
	 * Watch for binding updates
	 * @param   {string}    appId
	 * @param   {string}    arrKey
	 * @param   {string}    key         Name of property
	 * @param   {function}  callback    Function to be called
	 */
	watch: function(appId, arrKey, key, callback)
	{
		window.UPSTORE.registeredWatchers.push({
			appId: appId,
			arrKey: arrKey,
			key: key,
			callback: callback,
		})
	},

	/**
	 * Registered watchers
	 */
	registeredWatchers: [],


	/**
	 * Send an email on behalf of the UPP
	 * @param   {string}    appId
	 * @param   {string}    arrKey
	 * @param   {string}    data        Data to be sent to the user
	 * @returns	{object}	Promise
	 */
	sendMail: function(appId, arrKey, body) {
		var url = UPSTORE.server.base+UPSTORE.server.sendMail;
		return new Promise(function(resolve, error) {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = function() {
				if (xmlHttp.readyState == 4) {
					if(xmlHttp.responseText) {
						resolve()
					}
					else
						error(xmlHttp);
				}
			};

			xmlHttp.open("PUT", url, true); // true for asynchronous
			xmlHttp.setRequestHeader("Content-type", "application/json");
			xmlHttp.send(JSON.stringify({
				consumerKey: UPSTORE.consumerKey,
				arrKey: arrKey,
				appId: appId,
				data: body
			}));
		})
	}
}

setTimeout(function () {
	if(!window.UPSTORE.loaded) {
		window.UPSTORE.loaded = true;
		if(UPSTORE.consumerKey.length > 0) {
			var toInit = document.querySelectorAll("[upstore-init]:not([upstore-init-called])"), i;
			for(i = 0;i<toInit.length;++i)
			{
				UPSTORE.newUpp(toInit[i].getAttribute("upstore-init"), toInit[i].getAttribute("upstore-arr-key"));
			}
		}
		else {
			console.warn("[UPSTORE] PLEASE SPECIFY YOUR CONSUMER-KEY")
		}
	}
}, 0);
