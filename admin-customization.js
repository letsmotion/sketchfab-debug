// ==UserScript==
// @name          Sketchfab Admin Customization
// @namespace     https://github.com/sketchfab/sketchfab-debug/
// @description   Adds links to admin pages
// @updateURL     https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/
// @downloadURL   https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/
// @include       https://sketchfab.com/admin/*
// @version       0.1
// @grant         none
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js
// ==/UserScript==

// Admin page links
$(document).ready(function () {
    
    var path = window.location.pathname;
    var rows = $('tr.row1, tr.row2');
    
    switch (path) {

        // Comments
        case '/admin/skfb_comments/skfbcomment/':

            rows.each(function () {

                // User URLs
                var userCell = $(this).children('td:nth-child(3)');
                var username = userCell.text();
                var userUrl = '<a href="/' + username + '" target="_blank">' + username + '</a>';
                userCell.html(userUrl);

                // Model URLs
                var modelCell = $(this).children('td:nth-child(4)');
                var modelId = modelCell.text();
                var modelUrl = '<a href="/models/' + modelId + '" target="_blank">' + modelId + '</a>';
                modelCell.html(modelUrl);
            })

        // Models
        case '/admin/skfb_models/model/':

            rows.each(function () {

                // Model URLs
                var modelCell = $(this).children('td:nth-child(3)');
                var modelId = modelCell.text();
                var modelUrl = '<a href="/models/' + modelId + '" target="_blank">' + modelId + '</a>';
                modelCell.html(modelUrl);

                // User URLs
                var userCell = $(this).children('td:nth-child(6)');
                var username = userCell.text();
                var userUrl = '<a href="/' + username + '" target="_blank">' + username + '</a>';
                userCell.html(userUrl);

            });

            break;

        // Users
        case '/admin/skfb_users/skfbuser/':
            
            rows.each(function () {

                // User URLs
                var userCell = $(this).children('td:nth-child(3)');
                var username = userCell.text();
                var userUrl = '<a href="/' + username + '" target="_blank">' + username + '</a>';
                userCell.html(userUrl);

                // Email URLs
                var emailCell = $(this).children('td:nth-child(4)');
                var email = emailCell.text();
                var emailUrl = '<a href="mailto:' + email + '" target="_blank">' + email + '</a>';
                emailCell.html(emailUrl);

            });

            break;

        // Folders
        case '/admin/skfb_folders/folder/':
            
            rows.each(function () {
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
