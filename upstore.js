/**
 * UPStore front-end framework
 */

window.UPSTORE = {
	/**
	 * Authentication details
	 */
	details: {},

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
			var xmlHttp = new XMLHttpRequest(), url = UPSTORE.server.base+UPSTORE.server.newUpp.replace("{appId}", appId).replace("{consumerKey}", UPSTORE.details.consumerKey);
			xmlHttp.onreadystatechange = function() {
				if (xmlHttp.readyState == 4) {
					var json = JSON.parse(xmlHttp.responseText);
					if(xmlHttp.status == 200) {
						var i, section = "";
						// for every container of the page..
						for(section in json)
						{
							loaded = 0;
							// for every element in the container
							for(i = 0;i<json[section].length;i++)
							{
								// sync operation insurance
								UPSTORE.prepareElement(json[section][i], i, section).then(function(object) {
									var element = document.createElement(object.element);
									delete object.element; delete (object.src) ? object.src : object.href;
									element.text = object.response;
									// for every attribute of the element, append it.
									for(var attr in object)
									{
										element[attr] = object[attr];
									}
									element.onload = function()
									{
										if(loaded == object.iteration)
										loaded++;
									}
									if(loaded == object.iteration)
									// append the result
										document.querySelector(object.container).appendChild(element);
									else {
										var watcher = setInterval(function () {
											if(loaded >= object.iteration) {
												// append the result
												document.querySelector(object.container).appendChild(element);
												clearInterval(watcher);
											}
										}, 100);
									}
								});
							}
						}
						resolve(xmlHttp.responseText);
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
	 * @param   {object}    object        The object to return
	 * @param   {int}       iteration     Iteration of current script on the total
	 * @param   {string}    section       Section of the container
	 */
	prepareElement: function(object, iteration, section)
	{
		url = object.src||object.href
		return new Promise(function(resolve, error) {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = function() {
				if (xmlHttp.readyState == 4) {
					if(xmlHttp.responseText) {
						object.response = xmlHttp.responseText;
						object.iteration = iteration;
						object.container = section;
						resolve(object)
					}
					else
						error(xmlHttp, object);
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
		var url = UPSTORE.server.base+UPSTORE.server.retrieve.replace("{appId}", appId).replace("{consumerKey}", UPSTORE.details.consumerKey).replace("{arrKey}", arrKey);
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
		element.setAttribute('upstore-init', appId);
		var key = "";
		for(key in properties)
		{
			window.UPSTORE.updateBinding(appId, arrKey, key, properties[key])
		}
		if(!window.UPSTORE.bindings[appId])
			window.UPSTORE.bindings[appId] = {};
		window.UPSTORE.bindings[appId][arrKey] = properties;
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
	},
}
