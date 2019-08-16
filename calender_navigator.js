// ==UserScript==
// @name         Eventor Calendar quick navigation
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://activity.idrottonline.se/Calendars/View/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function firstDayInPreviousMonth(yourDate) {
        return new Date(yourDate.getFullYear(), yourDate.getMonth() - 1, 1);
    }
  //Create an input type dynamically.
  var element = document.createElement("select");
  element.id = "custom-select-month";

  var months = {};

  var today = new Date();
  var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  for(var idxMonth = 0; idxMonth < 12; idxMonth +=1)
  {
    months[firstDay] = firstDay.toLocaleString('default', { month: 'long' }) + " " + firstDay.getFullYear();
    firstDay = new Date(firstDay.getFullYear(), firstDay.getMonth() - 1, 1);
  }

  for(var oneMonth in months)
  {
    element.options[element.options.length] = new Option(months[oneMonth], oneMonth);
  }

  //Assign different attributes to the element.
//  element.selectedIndex = 0; // Really? You want the default value to be the type string?
//   element.name = type; // And the name too?
  element.onchange = function() { // Note this is a function
    // alert(element.value);
    $('#calendar').fullCalendar('gotoDate', $.fullCalendar.moment(element.value));
    element.selectedIndex = -1;
  };

  var foo = document.getElementsByClassName("fc-left");
  //Append the element in page (in span).
  foo[0].appendChild(element);
})();