// ==UserScript==
// @name         Gerrit CFT65 Power Tools
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       CFT65
// @match        https://gerrit.ericsson.se/*
// @grant        none
// ==/UserScript==

function getElementsByClassNameAsArray(className, parent) {
    parent = parent || document;
    return [].filter.call(parent.getElementsByClassName(className), function (div) {
        return true;
    });
}

// save the real open
var oldOpen = XMLHttpRequest.prototype.open;

function onStateChange(event) {
   if(event.target.readyState === 4){
    //only run highlightComments if requested URL contains 'related'
       if(event.target.responseURL.indexOf('related') !== -1){
           highlightComments();
           showCurrentPatchSet();
           commentOrderReverser();
          }
   }
}

XMLHttpRequest.prototype.open = function() {
    // when an XHR object is opened, add a listener for its readystatechange events
    this.addEventListener("readystatechange", onStateChange);

    // run the real `open`
    oldOpen.apply(this, arguments);
};

   function highlightComments() {
       console.log("Gerrit Comment Highlighter is now running!");
        getElementsByClassNameAsArray('com-google-gerrit-client-change-Message_BinderImpl_GenCss_style-messageBox').forEach(function(div) {
            getElementsByClassNameAsArray('com-google-gerrit-client-change-Message_BinderImpl_GenCss_style-name',div)[0].style.color = 'black';
            getElementsByClassNameAsArray('com-google-gerrit-client-change-Message_BinderImpl_GenCss_style-summary',div)[0].style.color = 'black';
            var avatars = getElementsByClassNameAsArray('com-google-gerrit-client-change-Message_BinderImpl_GenCss_style-avatar', div);
            if (avatars.length > 0) {
                avatars[0].style['margin-top'] = '3px';
                avatars[0].style['margin-left'] = '1px';
                avatars[0].style['border-radius'] = '50%';
            }
            if(div.innerText.includes('+2')) {
                div.style.backgroundColor = '#18db00';
            } else if(div.innerText.includes('+1')) {
                div.style.backgroundColor = '#baf4bc';
            } else if (div.innerText.includes('UnitTest SUCCESSFUL')){
                div.style.backgroundColor = '#baf4bc';
            }else if (div.innerText.includes('-1')){
                div.style.backgroundColor = '#f4daba';
            } else if (div.innerText.includes('UnitTest FAILED')){
                div.style.backgroundColor = '#f4baba';
            } else if (div.innerText.includes('comment')){
                div.style.backgroundColor = '#f1f4ba';
            } else if (div.innerText.includes('Uploaded patch set') || div.innerText.includes('was rebased')){
                div.style.backgroundColor = '#bad6f4';
            }
            getElementsByClassNameAsArray('com-google-gerrit-client-change-LineComment_BinderImpl_GenCss_style-location', div).forEach(function(locationDiv) {
                locationDiv.parentNode.style.color = 'red';
                locationDiv.parentNode.style['font-weight'] = 'bold';
            });
            div.style.padding = '5px';
            div.style.margin = '2px';
            div.style.borderRadius = '5px';
            div.style['box-shadow'] = '1px 1px grey';
        });
    }

function commentOrderReverser() {
    var names =[].map.call(document.getElementsByClassName('com-google-gerrit-client-change-Message_BinderImpl_GenCss_style-name'), function (div) {
        return div.innerHTML;
    }).filter(function(value, index, self) {
        return self.indexOf(value) === index;
    });

    function createButton(name) {
        var button = document.createElement('button');
        button.innerHTML = '<div>' + name + '</div>';
        button.type = "button";
        button.title = "Reverse comment order";
        return button;
    }

    function reverseComments() {
        var first = document.getElementsByClassName('com-google-gerrit-client-change-Message_BinderImpl_GenCss_style-messageBox com-google-gerrit-client-change-Message_BinderImpl_GenCss_style-closed')[0];
        if (first) {
            var i = first.parentNode.childNodes.length;
            while (i--) {
                first.parentNode.appendChild(first.parentNode.childNodes[i]);
            }

        }
    }

    var button = createButton('Reverse comments');
    button.onclick = reverseComments;
    document.getElementsByClassName('com-google-gerrit-client-change-ChangeScreen_BinderImpl_GenCss_style-headerButtons')[3].appendChild(button);
    reverseComments();
}

function getElementsByClassNameAsArray(className, parent) {
    parent = parent || document;
    return [].filter.call(parent.getElementsByClassName(className), function (div) {
        return true;
    });
}

function showCurrentPatchSet() {
    var names =[].map.call(document.getElementsByClassName('com-google-gerrit-client-change-Message_BinderImpl_GenCss_style-name'), function (div) {
        return div.innerHTML;
    }).filter(function(value, index, self) {
        return self.indexOf(value) === index;
    });

    function createNewDiv(dropdown) {
        var parentDiv = document.getElementsByClassName('com-google-gerrit-client-change-ChangeScreen_BinderImpl_GenCss_style-sectionHeader')[1];
        var newDiv = parentDiv.appendChild(document.createElement('div'));
        newDiv.className = 'com-google-gerrit-client-change-ChangeScreen_BinderImpl_GenCss_style-diffBase';
        newDiv.style.marginLeft = '450px';
        newDiv.appendChild(document.createTextNode('Filter comments:'));
        newDiv.appendChild(dropdown);
    }

    function createDropdown(items) {
        var dropdown = document.createElement('select'),
            optionAll = document.createElement('option');
        optionAll.value = '';
        optionAll.innerHTML = 'All';
        dropdown.appendChild(optionAll);

        items.forEach(function(item) {
            var option = document.createElement('option');
            option.value = item;
            option.innerHTML = item;
            dropdown.appendChild(option);
        });
        return dropdown;
    }

    function createCheckBox(description, onclick) {
        var label = document.createElement('label'),
            checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.onclick = onclick;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(description));
        return label;
    }

    function showAllComments() {
        [].forEach.call(document.getElementsByClassName('com-google-gerrit-client-change-Message_BinderImpl_GenCss_style-name'), function (div) {
            div.parentNode.parentNode.parentNode.style.display = 'block';
        });
    }

    function hideDifferentComments(user) {
        [].filter.call(document.getElementsByClassName('com-google-gerrit-client-change-Message_BinderImpl_GenCss_style-name'), function (div) {
            return div.innerHTML !== user;
        }).forEach(function(div) {
            div.parentNode.parentNode.parentNode.style.display = 'none';
        });
    }

    function getCurrentPatchSet() {
        var patchSetRegex = /Patch Sets \(([0-9]+)\/[0-9]+\)/;
        return getElementsByClassNameAsArray('com-google-gerrit-client-change-ChangeScreen_BinderImpl_GenCss_style-popdown')[0].innerHTML.match(patchSetRegex)[1];
    }

    function hideNotCurrentPatchSet(patchSet) {
        getElementsByClassNameAsArray('com-google-gerrit-client-change-Message_BinderImpl_GenCss_style-messageBox').filter(function (div) {
            return div.innerHTML.toLowerCase().indexOf('patch set '+patchSet+':') === -1;
        }).forEach(function(div) {
            div.style.display = 'none';
        });
    }

    var dropdown = createDropdown(names);
    createNewDiv(dropdown);
    createNewDiv(createCheckBox('Show current patch set only', function() {
        if (this.checked) {
            hideNotCurrentPatchSet(getCurrentPatchSet());
        } else {
            showAllComments();
        }
    }));
    dropdown.onchange = function() {
        var filter = dropdown.options[dropdown.selectedIndex].value;
        showAllComments();
        if (filter) {
            hideDifferentComments(filter);
        }
    };
}