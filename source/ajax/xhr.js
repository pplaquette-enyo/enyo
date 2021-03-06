//* @protected
enyo.xhr = {
	/**
		<code>inParams</code> is an Object that may contain these properties:

		- _url_: The URL to request (required).
		- _method_: The HTTP method to use for the request. Defaults to GET.
		- _callback_: Called when request is completed.
		- _body_: Specific contents for the request body for POST method.
		- _headers_: Request headers.
		- _username_: The optional user name to use for authentication purposes.
		- _password_: The optional password to use for authentication purposes.
		- _xhrFields_: Optional object containing name/value pairs to mix directly into the generated xhr object.
		- _mimeType_: Optional string to override the MIME-Type.
	*/
	request: function(inParams) {
		var xhr = this.getXMLHttpRequest(inParams.url);
		//
		var method = inParams.method || "GET";
		var async = ("sync" in inParams) ? !inParams.sync : true;
		//
		if (inParams.username) {
			xhr.open(method, enyo.path.rewrite(inParams.url), async, inParams.username, inParams.password);
		} else {
			xhr.open(method, enyo.path.rewrite(inParams.url), async);
		}
		//
		enyo.mixin(xhr, inParams.xhrFields);
		//
		this.makeReadyStateHandler(xhr, inParams.callback);
		if (inParams.headers) {
			for (var key in inParams.headers) {
				xhr.setRequestHeader(key, inParams.headers[key]);
			}
		}
		//
		if(typeof(xhr.overrideMimeType) == "function" && inParams.mimeType) {
			xhr.overrideMimeType(inParams.mimeType);
		}
		//
		xhr.send(inParams.body || null);
		if (!async) {
			xhr.onreadystatechange(xhr);
		}
		return xhr;
	},
	//* remove any callbacks that might be set from Enyo code for an existing XHR.
	cancel: function(inXhr) {
		if (inXhr.onload) {
			inXhr.onload = null;
		}
		if (inXhr.onreadystatechange) {
			inXhr.onreadystatechange = null;
		}
	},
	//* @protected
	makeReadyStateHandler: function(inXhr, inCallback) {
		if (window.XDomainRequest && inXhr instanceof XDomainRequest) {
			inXhr.onload = function() {
				inCallback && inCallback.apply(null, [inXhr.responseText, inXhr]);
			};
		}
		inXhr.onreadystatechange = function() {
			if (inXhr.readyState == 4) {
				inCallback && inCallback.apply(null, [inXhr.responseText, inXhr]);
			}
		};
	},
	inOrigin: function(inUrl) {
		var a = document.createElement("a"), result = false;
		a.href = inUrl;
		if (a.protocol === ":" ||
				(a.protocol === window.location.protocol &&
					a.hostname === window.location.hostname &&
					a.port === (window.location.port || "80"))) {
			result = true;
		}
		return result;
	},
	getXMLHttpRequest: function(inUrl) {
		try {
			if (window.XDomainRequest && !this.inOrigin(inUrl) && !/^file:\/\//.test(window.location.href)) {
				return new XDomainRequest();
			}
		} catch(e) {}
		try {
			return new XMLHttpRequest();
		} catch(e) {}
		try {
			return new ActiveXObject('Msxml2.XMLHTTP');
		} catch(e) {}
		try {
			return new ActiveXObject('Microsoft.XMLHTTP');
		} catch(e) {}
		return null;
	}
};
