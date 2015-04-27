// ==UserScript==
// @name          Sketchfab Customization
// @namespace     https://github.com/sketchfab/sketchfab-debug/
// @description   Adds custom keyboard shortcuts to various Sketchfab pages and other improvements
// @updateURL     https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/sketchfab-customization.user.js
// @downloadURL   https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/sketchfab-customization.user.js
// @include       https://sketchfab.com/*
// @version       1.6
// @grant         none
// ==/UserScript==

// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js

// Custom keyboard shortcuts
$( document ).keydown( function ( event ) {
    if ( event.defaultPrevented ) {
        return; // Should do nothing if the key event was already consumed.
    }

    if ( event.ctrlKey ) {

        var key = event.keyCode;

        switch ( key ) {
            case 83:
                // Ctrl+S - Save model settings
                $( 'a.save-model' ).click();
                break;
            case 81:
                // Ctrl+Q - Exit editor
                window.location = $( '.editor-header .btn-secondary' ).attr( 'href' );
                break;
            case 65:
                // Ctrl+A - Take screenshot
                $( 'div.snapshot a.button' ).click();
                break;
            case 76:
                // Ctrl+L - Load more [models]
                $( '.load-next' ).click();
                $( 'a.overlay' ).attr( 'target', '_blank' );
                break;
            case 69:
                // Ctrl+E - Append /edit
                $( 'a.model-card-filter' ).each(function () {
                    var _href = $( this ).attr( 'href' );
                    if ( _href.indexOf( '/edit?debug3d=1' ) < 0 ) {
                        $( this ).attr( 'href', _href + '/edit?debug3d=1' );
                    }
                });
                break;
            default:
                return; // Quit when this doesn't handle the key event.
        }

        // Consume the event for suppressing "double action".
        event.preventDefault();
    }
});
