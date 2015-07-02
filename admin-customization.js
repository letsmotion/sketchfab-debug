// ==UserScript==
// @name          Sketchfab Admin Customization
// @namespace     https://github.com/sketchfab/sketchfab-debug/
// @description   Adds links to admin pages
// @updateURL     https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/
// @downloadURL   https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/
// @include       https://sketchfab.com/admin/*
// @version       0.2
// @grant         none
// @require       http://code.jquery.com/jquery-2.1.4.min.js
// ==/UserScript==

// Admin page links
$( document ).ready( function () {
    
    var path = window.location.pathname,
        rows = $( 'tr.row1, tr.row2' ),
        favicons = {
            'U': 'http://puu.sh/hTFDG/8299a6f127.png',
            'S': 'http://puu.sh/hTFDD/9ec80e6294.png',
            'M': 'http://puu.sh/hTFDw/b3bef83e34.png',
            'F': 'http://puu.sh/hTFDj/3968d97e19.png',
            'C': 'http://puu.sh/iKLHJ/c027fd2d4a.png'
        };

    function setFavicon( favicon ) {
        var link = document.createElement( 'link' );
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = favicon;
        document.getElementsByTagName( 'head' )[ 0 ].appendChild( link );
    }
    
    switch ( path.split( '/' )[ 2 ] ) {

        // Comments
        case 'skfb_comments':

            setFavicon( favicons.C );

            rows.each( function () {

                // User URLs
                var userCell = $( this ).children( 'td:nth-child(3)' ),
                    username = userCell.text(),
                    userUrl = '<a href="/' + username + '" target="_blank">' + username + '</a>';
                
                userCell.html(userUrl);

                // Model URLs
                var modelCell = $( this ).children( 'td:nth-child(4)' ),
                    modelId = modelCell.text(),
                    modelUrl = '<a href="/models/' + modelId + '" target="_blank">' + modelId + '</a>';
                
                modelCell.html( modelUrl );
            })

        // Models
        case 'skfb_models':

            setFavicon( favicons.M );

            rows.each( function () {

                // Model URLs
                var modelCell = $( this ).children( 'td:nth-child(3)' ),
                    modelId = modelCell.text(),
                    modelUrl = '<a href="/models/' + modelId + '" target="_blank">' + modelId + '</a>';
                
                modelCell.html( modelUrl );

                // User URLs
                var userCell = $( this ).children( 'td:nth-child(6)' ),
                    username = userCell.text(),
                    userUrl = '<a href="/' + username + '" target="_blank">' + username + '</a>';
                
                userCell.html( userUrl );

            });

            break;

        // Users
        case 'skfb_users':

            setFavicon( favicons.U );
            
            rows.each( function () {

                // User URLs
                var userCell = $( this ).children( 'td:nth-child(3)' ),
                    username = userCell.text(),
                    userUrl = '<a href="/' + username + '" target="_blank">' + username + '</a>';
                
                userCell.html( userUrl );

                // Email URLs
                var emailCell = $( this ).children( 'td:nth-child(4)' ),
                    email = emailCell.text(),
                    emailUrl = '<a href="mailto:' + email + '" target="_blank">' + email + '</a>';
                
                emailCell.html( emailUrl );

            });

            break;

        // Folders
        case 'skfb_folders':

            setFavicon( favicons.F );
            
            rows.each( function () {
                var usernameCell = $( this ).children( 'td:nth-child(6)' ),
                    username = usernameCell.text(),
                    usernameUrl = '<a href="/' + username + '" target="_blank">' + username + '</a>';

                var folderCell = $( this ).children( 'td:nth-child(3)' ),
                    folder = folderCell.text(),
                    folderUrl = '<a href="/' + username + '/folders/' + folder + '" target="_blank">' + folder + '</a>';

                
                usernameCell.html( usernameUrl );
                folderCell.html( folderUrl );
            });

            break;

        // Schools
        case 'skfb_portfolio':
            
            setFavicon( favicons.S );

            break;

        default:
            return;
    }
});
