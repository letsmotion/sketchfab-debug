// ==UserScript==
// @name          Sketchfab Custom Keyboard Shortcuts
// @namespace     https://github.com/PadreZippo/sketchfab-debug/
// @description   Adds custom keyboard shortcuts to various Sketchfab pages
// @include       https://sketchfab.com/*
// @version       1
// @grant         none
// @require       http://code.jquery.com/jquery-latest.js
// ==/UserScript==

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
        $('.loadmore').click();
        break;
      case 69:
        // Ctrl+E - Append /edit
        $("a.overlay").each(function() {
          var _href = $(this).attr("href");
          $(this).attr("href", _href + '/edit');
        });
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    }
    
    // Consume the event for suppressing "double action".
    event.preventDefault();
  }
});
