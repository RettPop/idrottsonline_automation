// ==UserScript==
// @name         TR counter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://mhweb.ericsson.se/mhweb/faces/dashboard/MHWeb.xhtml
// @grant        none
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==

$(document).ready((function() {
    //'use strict';

    // Your code here...
    var framez = document.getElementsByTagName("iframe")
//console.log(framez.length);
for (var idx = 0; idx < framez.length; idx++)
{
    //console.log(idx);
    var col = framez[idx].contentWindow.document.getElementById("frm_srt_dt_column1Sort");
    var tableName = "frm_srt_dt:tb";
    if(col == null)
    {
        col = framez[idx].contentWindow.document.getElementById("frm_wl_sortId");
        tableName = "frm_wl:tb"
    }

	if ( col != null )
    {
    	var text = col.text
    	col.text = text + ":" + framez[idx].contentWindow.document.getElementById(tableName).getElementsByTagName("tr").length;
    	//console.log(text);
    }
}
}));