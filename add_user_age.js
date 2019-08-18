// ==UserScript==
// @name         Print user age
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  prints user age in the list of event participants
// @author       You
// @match        https://activity.idrottonline.se/Activities/Edit/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function calcAge() {
        var tds = Array.from(document.getElementsByTagName("td"));
        var bdReg = /^(\d{4})-(\d{2})-(\d{2})$/;
        var currentYear = new Date().getFullYear();
        tds.forEach(td => {
            if (td.getAttribute("data-title") === "Född" && td.getAttribute("role") === "gridcell") {
                var tdVal = td.innerText;
                var matches = tdVal.match(bdReg);
                if (null !== matches) {
                    var age = currentYear - parseInt(matches[1]);
                    td.innerText = tdVal + " (" + age + ")";
                }
            }
        });
    }

    setInterval(calcAge, 500);
})();