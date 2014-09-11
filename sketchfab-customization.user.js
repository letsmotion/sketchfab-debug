// ==UserScript==
// @name          Sketchfab Customization
// @namespace     https://github.com/PadreZippo/sketchfab-debug/
// @description   Adds custom keyboard shortcuts to various Sketchfab pages and other improvements
// @updateURL     https://raw.githubusercontent.com/PadreZippo/sketchfab-debug/master/sketchfab-customization.user.js
// @downloadURL   https://raw.githubusercontent.com/PadreZippo/sketchfab-debug/master/sketchfab-customization.user.js
// @include       https://sketchfab.com/*
// @version       1.4
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
                $('a.overlay').attr('target', '_blank');
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

// Admin page links
$(document).ready(function () {
    
    var path = window.location.pathname;
    
    switch (path) {
        case '/admin/skfb_models/model/':
            
            // Model links
            $('tr.row1 td:nth-child(3), tr.row2 td:nth-child(3)').each(function () {
                var urlid = $(this).text();
                var url = '<a href="/models/' + urlid + '" target="_blank">' + urlid + '</a>';
                $(this).html(url);
            });

            // Username links
            $('tr.row1 td:nth-child(6), tr.row2 td:nth-child(6)').each(function () {
                var username = $(this).text();
                var url = '<a href="/' + username + '" target="_blank">' + username + '</a>';
                $(this).html(url);
            });

            break;

        case '/admin/skfb_users/skfbuser/':
            // Username links
            $('tr.row1 td:nth-child(3), tr.row2 td:nth-child(3)').each(function () {
                var username = $(this).text();
                var url = '<a href="/' + username + '" target="_blank">' + username + '</a>';
                $(this).html(url);
            });

            break;

        case '/admin/skfb_folders/folder/':
            $('tr.row1, tr.row2').each(function () {
                var usernameCell = $(this).children('td:nth-child(6)');
                var username = usernameCell.text();
                var usernameUrl = '<a href="/' + username + '" target="_blank">' + username + '</a>';

                var folderCell = $(this).children('td:nth-child(3)');
                var folder = folderCell.text();
                var folderUrl = '<a href="/' + username + '/folders/' + folder + '" target="_blank">' + folder + '</a>';

                usernameCell.html(usernameUrl);
                folderCell.html(folderUrl);
            });

            break;

        default:
            return;
    }
});
