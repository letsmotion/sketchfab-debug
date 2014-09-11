// ==UserScript==
// @name          Sketchfab Customization
// @namespace     https://github.com/PadreZippo/sketchfab-debug/
// @description   Adds custom keyboard shortcuts to various Sketchfab pages and other improvements
// @updateURL     https://raw.githubusercontent.com/PadreZippo/sketchfab-debug/master/sketchfab-customization.user.js
// @downloadURL   https://raw.githubusercontent.com/PadreZippo/sketchfab-debug/master/sketchfab-customization.user.js
// @include       https://sketchfab.com/*
// @version       1.2
// @grant         none
// @require       http://code.jquery.com/jquery-latest.js
// ==/UserScript==

// Custom keyboard shortcuts
$(document).keydown(function (event) {
  if (event.defaultPrevented) {
    return; // Should do nothing if the key event was already consumed.
  }

  if (event.ctrlKey) {

    var key = event.keyCode;

    switch (key) {
      case 83:
        // Ctrl+S - Save model settings
        $('a.save-model').click();
        break;
      case 81:
        // Ctrl+Q - Exit editor
        window.location = $('.editor-header .btn-secondary').attr('href');
        break;
      case 65:
        // Ctrl+A - Take screenshot
        $('div.snapshot a.button').click();
        break;
      case 76:
        // Ctrl+L - Load more [models]
        $('.load-next').click();
        break;
      case 69:
        // Ctrl+E - Append /edit
        $('a.overlay').each(function () {
          var _href = $(this).attr('href');
          $(this).attr('href', _href + '/edit');
        });
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    }

    // Consume the event for suppressing "double action".
    event.preventDefault();
  }
});

// URL creation and editing
$(document).ready(function () {
    
    var path = window.location.pathname;
    
    // Change URLID to URL link in admin
    if (path.match(/skfb_models/g).length >= 0) {
        $('tr.row1 td:nth-child(3), tr.row2 td:nth-child(3)').each(function () {
          var urlid = $(this).text();
          var url = '<a href="/models/' + urlid + '" target="_blank">' + urlid + '</a>';
          $(this).html(url);
        });
    }
    
    // Make model links target _blank
    else if (path.match(/models/g).length >= 0) {
        $('a.overlay').attr('target', '_blank');
    };
});
