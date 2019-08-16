// ==UserScript==
// @name         Add users list
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://activity.idrottonline.se/Activities/Edit/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function addPushBtn()
    {
        if (null === document.getElementById("customPersonsBtn"))
        {
            if (null !== document.getElementById("addPerson"))
            {
                var newBtn = document.createElement("input");
                newBtn.type = "button";
                newBtn.id = "customPersonsBtn";
                newBtn.value = "Parse";
                newBtn.className = "btn btn-primary span3 ladda-button";
                newBtn.style.marginLeft = "10px";
                newBtn.onclick = function () {
                    var result;
                    var rawText = $("#customRawTextField").val();
                    if (rawText.length > 0) {
                        result = findUsersInRawText(rawText, document.orgUsers);
                        result;
                        addUsersToSelect(result.usersFound);
                        $("#customRawTextField").val(result.invalidLines);
                    }
                    else {
                        alert("Add the text with participants to parse");
                    }
                }
                document.getElementById("addPerson").parentNode.appendChild(newBtn);
            }
        }
    }

    function addTextArea()
    {
        var targetDIV = document.getElementById("s2id_selectPerson");
        console.log("document.getElementById(\"s2id_selectPerson\") was found: " + (null !== targetDIV));
        if(null !== targetDIV)
        {
            console.log("Found parent. Adding text area");
            var field = document.createElement("textarea");
            field.id = "customRawTextField";
            field.cols = 40;
            field.rows = 40;
            field.placeholder = "Participans separated by new new line";
            field.style.width = "100%";
            field.style.height = "100px";
            targetDIV.parentNode.appendChild(field);
        }
    }

    function addUsersToSelect(users)
    {
        var data = $('#s2id_selectPerson').select2('val');
        for (const userIdx in users)
        {
            data.push(users[userIdx].personId);
        }
        $('#s2id_selectPerson').select2('val', data);
    }

    function parseUsersFromJson(usersArray) {
        function stringsArrayToPersons(strArray) {
            for (var personsArray = [], i = 0; i < strArray.length; i += 7) {
                var persId = strArray[i];
                var firstName = strArray[i + 1];
                var lastName = strArray[i + 2];
                var id = strArray[i];
                var birthDate = strArray[i + 3];
                var prefix = strArray[i + 4];
                personsArray.push(
                    {
                        id: id,
                        personId: id,
                        firstName: firstName,
                        lastName: lastName,
                        birthDate: birthDate,
                        displayName: firstName + " " + lastName + " (" + birthDate + ") ",
                        matcherText: ((null === prefix) ? "" : prefix) + " " + firstName + " " + lastName + "(" + birthDate + ")IID" + persId,
                        gender: strArray[i + 5],
                        trialMember: strArray[i + 6]
                    }
                );
            }
            return personsArray;
        }
        return stringsArrayToPersons(usersArray);
    }

    function findUsersInRawText(rawText, usersArray) {
        var usersFound = [];
        var invalidLines = [];

        // converting raw text to array of token arrays for each line
        var tokenizedLines = tokenizeTextLines(rawText);

        // filter tokens array to remove tokens, not present in some user from users array fields
        var validTokenLines = tokenizedLines;
        // tokenizedLines.forEach(oneLineTokens => {
        //     validTokenLines.push(filterTokens(oneLineTokens, usersArray));
        // });

        // look for users, matched for next tokens array.
        for (const idxLine in validTokenLines)
        {
            var usersForLine = findUsersForTokens(validTokenLines[idxLine], usersArray);
            if(usersForLine.length == 1){
                usersFound.push(usersForLine[0]);
            }
            else{
                invalidLines.push(validTokenLines[idxLine]);
            }
        }

        // returns users found and array of lines, was not matched to any user
        var result = {
            usersFound:usersFound,
            invalidLines:invalidLines
        };
        return result;
    }

    function findUsersForTokens(tokensLine, usersArray)
    {
        var matchedUsers = [];
        for (const idxUser in usersArray) {
            if(matchTokensToUser(tokensLine, usersArray[idxUser])){
                matchedUsers.push(usersArray[idxUser]);
            }
        }

        return matchedUsers;
    }

    function matchTokensToUser(tokens, user)
    {
        var foundFirstName = false;
        var foundLastName = false;
        for (const idxToken in tokens) {
            if(tokens[idxToken].toUpperCase() == user.firstName.toUpperCase()){
                foundFirstName = true;
            }
            else if(tokens[idxToken].toUpperCase() == user.lastName.toUpperCase()){
                foundLastName = true;
            }
        }

        return foundFirstName && foundLastName;
    }

    function filterTokens(tokens, usersArray)
    {
        var validTokens = [];
        for (const idxToken in tokens)
        {
            var ucToken = tokens[idxToken].toUpperCase();
            for (const idxUser in usersArray)
            {
            if (usersArray[idxUser].firstName.toUpperCase() == ucToken
                || usersArray[idxUser].lastName.toUpperCase() == ucToken
                || usersArray[idxUser].id == ucToken
                || usersArray[idxUser].birthDate == ucToken)
                {
                    // valid token found for one of users. continue with next token
                    validTokens.push(tokens[idxToken]);
                    break;
                }
            }
        }

        return validTokens;
    }

    function tokenizeTextLines(text) {
        var separatorRe = /\s*[,.;\s]+\s*/;
        var lines = text.split("\n");
        var tokenizedLines = [];
        for (const idxLine in lines) {
            var lineTokens = lines[idxLine].split(separatorRe);
            tokenizedLines.push(lineTokens);
        }

        return tokenizedLines;
    }

    addPushBtn();
    addTextArea();

    // request organization users and store the array in global
    $.post("https://activity.idrottonline.se/Persons/GetPersons?organisationId=34967&array=true", "", function (data, status) {
        document.orgUsers = parseUsersFromJson(data);
    });

})();
