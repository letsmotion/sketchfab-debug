// ==UserScript==
// @name          Sketchfab Customization
// @namespace     https://github.com/sketchfab/sketchfab-debug/
// @description   Adds custom keyboard shortcuts to various Sketchfab pages and other improvements
// @updateURL     https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/sketchfab-customization.user.js
// @downloadURL   https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/sketchfab-customization.user.js
// @include       https://sketchfab.com/*
// @exclude       https://sketchfab.com/models/*/embed*
// @exclude       https://sketchfab.com/admin/*
// @version       1.8
// @grant         none
// ==/UserScript==

var $ = window.publicLibraries.$,
    _ = window.publicLibraries._;

// Custom keyboard shortcuts
$( document ).keydown( function ( event ) {

    if ( event.defaultPrevented ) {
        return; // Should do nothing if the key event was already consumed.
    }

    if ( event.ctrlKey ) {

        var key = event.keyCode;

        switch ( key ) {

            // Ctrl+S - Save model settings
            case 83:
                $( 'a.save-model' ).click();
                break;

            // Ctrl+Q - Exit editor
            case 81:
                window.location = $( '.editor-header .btn-secondary' ).attr( 'href' );
                break;

            // Ctrl+A - Take screenshot
            case 65:
                $( 'div.snapshot a.button' ).click();
                break;

            // Ctrl+L - Load more [models]
            case 76:
                $( '.load-next' ).click();
                $( 'a.overlay' ).attr( 'target', '_blank' );
                break;

            // Ctrl+E - Append /edit
            case 69:
                $( 'a.model-card-filter' ).each(function () {
                    var _href = $( this ).attr( 'href' );
                    if ( _href.indexOf( '/edit?debug3d=1' ) < 0 ) {
                        $( this ).attr( 'href', _href + '/edit?debug3d=1' );
                    }
                });
                break;

            // Quit when this doesn't handle the key event.
            default:
                return;

        }

        // Consume the event for suppressing "double action".
        event.preventDefault();
    }
});

// Page edits
$( document ).ready( function () {

    var location = window.location.pathname;

    switch ( location ) {

        // Newsfeed
        case '/':
            // Change newsfeed widths
            $( '.left-content' ).css( 'width', '350px' );
            $( '.left-content .thumbnail' ).css( 'width', '100%' );
            break;

        // Quit if nothing to do on this page
        default:
            return;

    }
});
