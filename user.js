// ==UserScript==
// @name          Sketchfab Model Debug
// @namespace     https://github.com/sketchfab/sketchfab-debug/
// @version       0.6.1
// @updateURL     https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/user.js
// @downloadURL   https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/user.js
// @description   Inserts buttons on model pages to load debug info and other tools
// @include       https://sketchfab.com/*
// @exclude       https://sketchfab.com/models/*/embed*
// @exclude       https://sketchfab.com/models/*/edit*
// @exclude       https://sketchfab.com/models/staffpicks
// @exclude       https://sketchfab.com/models/popular
// @exclude       https://sketchfab.com/admin/*
// @grant         none
// @require       https://rawgit.com/jsoma/tabletop/master/src/tabletop.js
// ==/UserScript==

$( document ).ready( function () {

  // Global URLs
  var origin = window.location.origin,
      pathname = window.location.pathname,
      apiPublic = origin + '/v2',
      apiInternal = origin + '/i';

  // If we're on model search results, show published warning
  if ( pathname === '/models' || pathname.match( 'models/categories' ) ) {

    var searchQuery = window.location.search;

    if ( !searchQuery.match( 'status=published' ) ) {

      var prefix = '?';

      if ( searchQuery !== '' ) {
        prefix = '&';
      }

      $( '.page-title' ).before(
        '<div class="actionmessage">' +
          '<div class="actionmessage-inner">' +
            '<h2 class="actionmessage-title">Friendly Reminder:</h2>' +
            '<div>Staff can see all models in this view. Did you mean to see <a href="' + pathname + searchQuery + prefix + 'status=published" style="text-decoration: underline;">Only Published Models</a>?</div>' +
          '</div>' +
        '</div>'
      );

    }
  }

  // If we're on a model page, define the model ID and run the main model function
  else if ( pathname.match( /\/models\// ) ) {
    showModelAdmin( pathname.replace( '/models/', '' ) );
  }

  // If we're on a user profile, add the user admin button
  else if ( $( '.profile-header' ).length ) {
    showUserAdmin( true );
  }

  // Create user admin button
  function showUserAdmin ( isUserProfile ) {

    var username,
        userUID,
        url,
        joined,
        d1,
        d2,
        d1_utc,
        d2_utc,
        timestamp1,
        timestamp2,
        userAdminButton = '<a id="user-admin" href="" class="button btn-medium btn-tertiary" target="_blank"><i class="icon fa fa-cog" style="margin-right: 0;"></i></a>',
        adminUrl;

    // Method to add one second to timestamp because admin search is [gte, lt)
    // Using the date joined timestamp can (almost) guarantee only one user search result
    Date.prototype.addSecond = function ( s ) {
      this.setSeconds( this.getSeconds() + s );
      return this;
    };

    // Add leading zero
    function leadingZero ( n ) {
      return n < 10 ? '0' + n : n;
    }

    // Convert Date to admin search parameter format
    function buildTimestamp ( date ) {
      return date.getFullYear() +
              '-' +
              leadingZero( date.getMonth() + 1 ) +
              '-' +
              leadingZero( date.getDate() ) +
              '+' +
              leadingZero( date.getHours() ) +
              '%3A' +
              leadingZero( date.getMinutes() ) +
              '%3A' +
              leadingZero( date.getSeconds() );
    }

    // Handle timezones
    function convertDateToUTC ( date ) {
      return new Date( date.getUTCFullYear(),
                       date.getUTCMonth(),
                       date.getUTCDate(),
                       date.getUTCHours(),
                       date.getUTCMinutes(),
                       date.getUTCSeconds());
    }

    // Add the button to the profile page or model page
    if ( isUserProfile ) {

      $( '.profile-header .actions' ).append( userAdminButton );

      Object.keys( prefetchedData ).forEach( function ( i ) {
        if ( prefetchedData.hasOwnProperty( i ) ) {
          if ( prefetchedData[ i ].displayName ) {
            if ( prefetchedData[ i ].displayName == $( '.profile-header .username-wrapper' ).text() ) {
              username = prefetchedData[ i ].username;
              userUID = prefetchedData[ i ].uid;
            }
          }
        }
      });

    } else {

      $( '.whoami .display-name' ).prepend( userAdminButton );
      $( '.whoami' ).css( 'margin', '10px 20px 0' );
      $( '#user-admin' ).css( 'margin-right', '10px' );

      username = prefetchedData[ '/i' + pathname ].user.username;
      userUID = prefetchedData[ '/i' + pathname ].user.uid;

    }

    url = apiInternal + '/users/' + userUID;

    // Get user API response and build the admin link
    $.get( url, function ( data ) {
      joined = data.dateJoined;
      d1 = new Date( joined );
      d1_utc = convertDateToUTC( d1 );
      d2 = ( new Date( joined ) ).addSecond( 1 );
      d2_utc = convertDateToUTC( d2 );
      timestamp1 = buildTimestamp( d1_utc );
      timestamp2 = buildTimestamp( d2_utc );
      adminUrl = origin + '/admin/skfb_users/skfbuser/?date_joined__gte=' + timestamp1 + '&date_joined__lt=' + timestamp2 + '&q=' + username;
      $( '#user-admin' ).attr( 'href', adminUrl );
    });
  }

  // Main model function
  function showModelAdmin ( modelId ) {

    var modelData = prefetchedData[ '/i' + pathname ],

        // URLs
        modelAdmin = '/admin/skfb_models/model/' + modelId,
        modelEdit = '/models/' + modelId + '/edit?debug3d=1',
        modelInspect = 'http://sketchfab.github.io/experiments/model-inspector/index.html?urlid=' + modelId,

        // Main model buttons
        debugButton = '<a id="debug">Debug</a>',
        editButton = '<a href="' + modelEdit + '">Edit</a>',
        spButton = '<a id="staffpick-model"><i class="loading-light" style="margin-top: 5px"></i></a>',
        optimizeButton = '<a id="optimize-model">Optimize</a>',
        adminButton = '<a href="' + modelAdmin + '">Admin</a>',
        rsyncButton = '<a id="rsync">Rsync</a>',
        inspectButton = '<a href="' + modelInspect + '">Inspect</a>',

        // Properties button
        propButton = '<a id="prop" class="button btn-medium btn-tertiary" style="margin-right: 10px;"><i class="icon fa fa-cog" style="margin-right: 0;"></i></a>',

        // Staffpick status
        isStaffpicked = $( 'a.flag-staffpicked' )[ 0 ] ? true : false,
        staffpickButtonText = isStaffpicked ? 'Un-Staffpick' : 'Staffpick',

        // Texture VRAM vars
        VRAMTotalMin = 0,
        VRAMTotalMax = 0,

        // Page status
        debugOpen = false;

    // Add buttons to markup
    $( 'div.additional' ).after(
        '<div class="additional">' +
            '<div id="model-admin-actions" class="actions" style="position: relative; width: auto; left: 100%; transform: translateX(-100%)">' +
                inspectButton +
                debugButton +
                editButton +
                spButton +
                optimizeButton +
                adminButton +
                rsyncButton +
            '</div>' +
        '</div>'
    );

    // Add the properties button to the side bar
    $( '.informations .sidebar-title:first' ).prepend( propButton );

    // Style the buttons
    $( '#model-admin-actions a' )
      .addClass( 'button btn-medium btn-secondary' )
      .attr( 'target', '_blank' );

    // Staffpick status
    if ( isStaffpicked ) {
      var spDisagreeButton = '<a target="_blank" href="mailto:community+staffpicks@sketchfab.com?subject=Bad+Staffpick&body=Someone%20staffpicked%20this%20model%3A%20' + origin + pathname + '%0A%0AI%20don%27t%20think%20it%20should%20be%20staffpicked%20because..." class="button btn-danger" style="font-size: 15px; margin-left: 10px;">I AM NOT AGREE!!</a>';
      $( 'span.model-name' ).append( spDisagreeButton );
      updateStaffpickStatus( true );
    } else {
      staffpickBlacklist();
    }

    // Events
    $( '#debug' ).on( 'click', openDebug );
    $( '#prop' ).on( 'click', openProps );
    $( '#optimize-model' ).on( 'click', optimizeModel );
    $( '#rsync' ).on( 'click', rsyncModel );

    // Add the user admin button to the sidebar
    showUserAdmin( false );

    // Staff Pick Blacklisting
    function staffpickBlacklist () {

      var public_spreadsheet_url = '1l3vuw5va5t64_bXFLmYiLAXZLLPqPKwg9cAEyIKnnks';

      function parseSheet ( blacklist, tabletop ) {

        console.log( 'Successfully got Staff Pick Blacklist' );

        var modelId = pathname.replace( '/models/', '' ),
            modelObj = prefetchedData[ '/i/models/' + modelId ],
            modelUser = modelObj.user.username,
            modelTags = modelObj.tags,
            blacklistTags = [],
            blacklistTagsStrings = [],
            isStaffpickable = true;

        blacklist.Models.elements.forEach( function ( model ) {
          if ( model.Model === modelId ) {
            var reason = 'Model ' + modelId + ' blacklisted by ' + model.Owner + ' because "' + model.Reason + '"';
            isStaffpickable = false;
            updateStaffpickStatus( false, reason );
            return;
          }
        });

        blacklist.Users.elements.forEach( function ( user ) {
          if ( user.User === modelUser ) {
            var reason = 'User ' + modelUser + ' blacklisted by ' + user.Owner + ' because "' + user.Reason + '"';
            isStaffpickable = false;
            updateStaffpickStatus( false, reason );
            return;
          }
        });

        blacklist.Tags.elements.forEach( function ( tag ) {
          blacklistTags.push( tag );
          blacklistTagsStrings.push( tag.Tag );
        });

        if ( blacklistTags ) {
          var badTags = _.intersection( blacklistTagsStrings, modelTags );

          if ( badTags.length > 0 ) {
            var badTag = blacklistTags[ blacklistTagsStrings.indexOf( badTags[ 0 ] ) ],
                reason = 'Tag ' + badTag.Tag + ' blacklisted by ' + badTag.Owner + ' because "' + badTag.Reason + '"';
            isStaffpickable = false;
            updateStaffpickStatus( false, reason );
            return;
          }
        }

        if ( isStaffpickable ) {
          updateStaffpickStatus( true );
        }

      }

      Tabletop.init( { key: public_spreadsheet_url, callback: parseSheet, simpleSheet: false } );

    }

    function updateStaffpickStatus ( isStaffpickable, reason ) {

      if ( isStaffpickable ) {

        $( '#staffpick-model' )
          .html( staffpickButtonText )
          .unbind( 'click' )
          .on( 'click', staffpickModel );

      } else {

        $( '#staffpick-model' )
          .html( '<strike>' + staffpickButtonText + '</strike>' )
          .toggleClass( 'btn-secondary btn-tertiary' )
          .unbind( 'click' )
          .on( 'click', function () {
            window.alert( reason + '\n\n' + 'https://docs.google.com/spreadsheets/d/1l3vuw5va5t64_bXFLmYiLAXZLLPqPKwg9cAEyIKnnks/edit' );
          }
        );
      }
    }

    // Optimize a model
    function optimizeModel () {

      var url = apiInternal + pathname + '/optimize';

      if ( !confirm( 'Are you sure?' ) ) {
        return;
      }

      $.ajax({
        type: 'POST',
        url: url,
        success: function ( xhr ) {
          if ( debugOpen ) {
            openDebug();
          } else {
            location.reload();
          }
        },
        error: function ( xhr ) {
          console.error( xhr );
        }
      });
    }

    // Staffpick / Unstaffpick a model
    function staffpickModel () {

      var url = apiInternal + pathname + '/staffpick',
          likeButton = $( '.button[data-action="like-model"]' )[ 0 ],
          isLiked = $( likeButton ).hasClass( 'liked' );

      if ( !confirm( 'Are you sure?' ) ) {
        return;
      }

      if ( ( !isLiked && !isStaffpicked ) ) {
        likeButton.click();
      }

      $.ajax({
        type: 'POST',
        url: url,
        success: function ( xhr ) {
          location.reload();
        },
        error: function ( xhr ) {
          console.error( xhr );
        }
      });
    }

    // Rsync a model
    function rsyncModel () {

      var url = apiInternal + pathname + '/rsync?domain=thor.fatvertex.com';

      $.ajax({
        type: 'GET',
        url: url,
        success: function ( xhr ) {
          window.alert( 'Synced to Thor' );
        },
        error: function ( xhr ) {
          console.error( xhr );
          window.alert( 'Failed :(' );
        }
      });
    }

    // Create properties dialog for editing models that don't belong to me
    function openProps () {

      var form,
          payload = {
            name: modelData.name,
            description: modelData.description,
            tags: modelData.tags,
            isPrivate: modelData.isPrivate,
            license: modelData.license ? modelData.license.uid : null
          },
          content = '<div class="sidebar-box informations">' +
                      '<form id="prop-form" action="" enctype="multipart/form-data">' +
                        '<p>API Token:</p>' +
                        '<input name="token" type="text" style="width: 100%; value="">' +
                        '<p>Name:</p>' +
                        '<input name="name" type="text" style="width: 100%;" value="' + payload.name + '">' +
                        '<p>Description:</p>' +
                        '<textarea name="description" style="width: 100%; height: 300px;">' + payload.description + '</textarea>' +
                        '<p>Tags (space separated):</p>' +
                        '<textarea name="tags" style="width: 100%; height: 100px;">' + payload.tags.toString().replace( /,/g, ' ' ) + '</textarea>' +
                        '<p>Private?' +
                          '<input id="isPrivate" class="form-checkbox" type="checkbox" name="isPrivate"' + ( payload.isPrivate ? ' checked' : '' ) + '>' +
                          '<label class="form-checkbox-actor" for="isPrivate" style="margin-left: 10px"></label>' +
                        '</p>' +
                        '<p>License:</p>' +
                        '<select name="license">' +
                          '<option value="">-----</option>' +
                          '<option value="322a749bcfa841b29dff1e8a1bb74b0b">CC Attribution</option>' +
                          '<option value="b9ddc40b93e34cdca1fc152f39b9f375">CC Attribution-ShareAlike</option>' +
                          '<option value="72360ff1740d419791934298b8b6d270">CC Attribution-NoDerivs</option>' +
                          '<option value="bbfe3f7dbcdd4122b966b85b9786a989">CC Attribution-NonCommercial</option>' +
                          '<option value="2628dbe5140a4e9592126c8df566c0b7">CC Attribution-NonCommercial-ShareAlike</option>' +
                          '<option value="34b725081a6a4184957efaec2cb84ed3">CC Attribution-NonCommercial-NoDerivs</option>' +
                          /*'<option value="7c23a1ba438d4306920229c12afcb5f9">CC0 Public Domain</option>' +*/
                        '</select>' +
                        '<input class="button btn-medium btn-secondary" name="Submit" type="submit">' +
                      '</form>' +
                    '</div>';

      function patchModel ( token ) {

        $.ajax({
          url: apiPublic + pathname + '?token=' + token,
          data: JSON.stringify( payload ),
          type: 'PATCH',
          contentType: 'application/json',
          traditional: true,

          success: function ( response ) {
            location.reload();
          },

          error: function ( response ) {
            console.error( response );
          }
        });
      }

      // Remove the button to prevent opening multiple forms
      $( 'a#prop' ).remove();

      // Add the new content
      $( 'div.owner' ).after( content );
      form = $( '#prop-form' )[ 0 ];
      $( '#prop-form select[name="license"]' ).val( payload.license );

      form.onsubmit = function () {
        payload.name = form.name.value;
        payload.description = form.description.value;
        payload.tags = form.tags.value.split( ' ' );
        payload.license = form.license.value;
        payload.isPrivate = form.isPrivate.checked ? true : false;

        patchModel( form.token.value );

        return false; // Prevent redirect
      };
    }

    // Replace model viewer with debug info
    function openDebug () {

      // Define debug markup and edit existing markup
      var content = '<div class="main" id="debug-markup">' +
                      '<h2>Info</h2>' +
                      '<div class="block">' +
                        '<form>' +
                          '<div>' +
                            '<label>Vertices: </label>' +
                            '<output id="vertices">' + modelData.vertexCount + '</output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Faces: </label>' +
                            '<output id="faces">' + modelData.faceCount + '</output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Geometries: </label>' +
                            '<output id="geometries"></output>' +
                          '</div>' +
                          '<div>' +
                            '<label>File Extension: </label>' +
                            '<output id="extension">' + modelData.ext + '</output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Data Source: </label>' +
                            '<output id="data-source"></output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Data Source Tool: </label>' +
                            '<output id="data-source-tool"></output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Materials: </label>' +
                            '<output id="materials-count"></output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Textures: </label>' +
                            '<output id="textures-count"></output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Total Texture VRAM: </label>' +
                            '<output id="texture-vram"></output>' +
                          '</div>' +
                          '<div>' +
                            '<label>UV Maps: </label>' +
                            '<output id="uvmaps"></output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Max Bones: </label>' +
                            '<output id="bones"></output>' +
                          '</div>' +
                        '</form>' +
                      '</div>' +
                      '<h2>Thumbnail</h2>' +
                      '<div class="block">' +
                        '<div id="thumbnail"></div>' +
                      '</div>' +
                      '<h2>Materials</h2>' +
                      '<div class="block">' +
                        '<ul id="materials"></ul>' +
                      '</div>' +
                      '<h2>Textures</h2>' +
                      '<div class="block">' +
                        '<div id="textures" class="staticGridRow"></div>' +
                      '</div>' +
                    '</div>';

      if ( !debugOpen ) {
        $( '.right, .comments, .footer' ).remove();
        debugOpen = true;
      } else {
        $( '#debug-markup' ).remove();
      }

      // Theater mode + debug3d
      $( 'main.viewer' ).html( '<iframe class="viewer-object" src="' + pathname + '/embed?internal=1&watermark=0&ui_infos=1&debug3d=1&autostart=0"></iframe>' );

      // Add markup
      $( '.left' ).append( content );

      // With new markup loaded, get debug info
      $( '#debug' ).ready( function () {
        getModelInfo( modelId );
      }());
    }

    function humanSize ( size ) {

      var suffixes = [ ' b', ' KiB', ' MiB', ' GiB' ];

      for ( var i = 0; i < suffixes.length; i++, size /= 1024 ) {
        if ( size < 1024 )
          return Math.floor( size ) + suffixes[ i ];
      }
      return Math.floor( size ) + suffixes[ suffixes.length - 1 ];
    }

    function displayImage ( image, isTexture ) {

      var imgs = $( '<div>' ).addClass( 'col-4' ),
          visibleImage,
          visibleImageObj;

      if ( !isTexture ) {

        // Show the biggest thumbnail
        visibleImageObj = image.images[ image.images.length - 1 ];
        visibleImage = $( '<img/>' ).attr('src', visibleImageObj.url )
          .css({
            'max-width': '600px',
            'height': 'auto'
          });

      } else {

        // Show the 128 texture if it exists
        visibleImageObj = _.select( image.images, function ( img ) {
          return img.height === 128 && img.width === 128;
        })[ 0 ];

        // Fallback to the 32
        if ( !visibleImageObj ) {
          visibleImageObj = _.select( image.images, function ( img ) {
            return img.height === 32 && img.width === 32;
          })[ 0 ];
        }

        // Fallback to the last texture
        if ( !visibleImageObj ) {
          visibleImageObj = image.images[ image.images.length - 1 ];
        }

        visibleImage = $( '<img/>' ).attr({
            'src': visibleImageObj.url,
            'height': 128,
            'width': 128
          });
      }

      imgs.append( visibleImage, '<br>' );

      if ( image.images.length > 0 ) {
        image.images.forEach( function ( img ) {
          var a = $( '<a/>' ).attr({
                'href': img.url,
                'target': '_blank'
              })
              .text( img.width + 'x' + img.height + ' | ' + humanSize( img.size ) + ' | ' );

          if ( isTexture && img.options.format ) {

            var format = img.options.format,
                isMax = true,
                channels,
                VRAMMin = 0,
                VRAMMax = img.height * img.width * 4;

            if ( format === 'RGB' ) {
              channels = 3;
            } else if ( format.match( /[ANR]{1}/ ) ) {
              channels = 1;
            }

            VRAMMin = img.height * img.width * channels;

            if ( isMax ) {
              VRAMTotalMax += VRAMMax;
              VRAMTotalMin += VRAMMin;
              isMax = false;
            }

            a.text( a.text() + ' | ' + format + ' | ' + humanSize( VRAMMin ) + ' - ' + humanSize( VRAMMax ) + ' VRAM)' );
          }

          imgs.append( a, '<br>' );
        });
      }

      return imgs;
    }

    function getModelInfo ( urlid ) {

      // Get osg data (geometries, source tool, UVs, bones...)
      function getOsgjs ( osgjsUrl ) {

        $.get( osgjsUrl, function ( json ) {

          var data = JSON.parse( json ),
              geometryCount = 0,
              uvCount = 0,
              boneCount = 0,
              textures = {};

          // Traverse json to extract model data
          function traverse ( children ) {
            for ( var i in children ) {
              if ( children.hasOwnProperty( i ) ) {
                var node = children[ i ];

                if ( typeof ( node ) === 'object' ) {
                  traverse( node );
                }

                if ( i === 'osg.Geometry' ) {
                  geometryCount++;
                  $( '#geometries' ).text( geometryCount );
                } else if ( i === 'osg.Texture' && node.File ) {
                  var url = 'https://media.sketchfab.com/urls/' + urlid + '/' + node.File;
                  if ( !textures[ url ] ) {
                    textures[ url ] = true;
                  }
                } else if ( i === 'UserDataContainer' ) {
                  var dataValues = node.Values;
                  for ( var j = 0; j < dataValues.length; j++ ) {
                    var dataValue = dataValues[ j ];
                    if ( dataValue.Name === 'source' ) {
                      $( '#data-source' ).text( dataValue.Value );
                    } else if ( dataValue.Name === 'source_tool' || dataValue.Name === 'authoring_tool' ) {
                      $( '#data-source-tool' ).text( dataValue.Value );
                    }
                  }
                } else if ( i.indexOf( 'TexCoor' ) >= 0 ) {
                  uvCount++;
                  $( '#uvmaps' ).text( uvCount );
                } else if ( i === 'BoneMap' ) {
                  if ( Object.keys( node ).length > boneCount ) {
                    boneCount = Object.keys( node ).length;
                    $( '#bones' ).text( boneCount );
                  }
                }
              }
            }
          }

          traverse( data );

        });
      }

      // Get materials and thumbnails
      $.get( apiInternal + pathname, function ( data ) {

        var osgjsUrl = data.files.osgjsUrl,
            materialCount = 0;

        // Materials
        Object.keys( data.options.materials ).forEach( function ( material_id ) {
          if ( material_id != 'updatedAt' ) {
            materialCount++;
            $( '#materials' ).append( $( '<li>' ).text( data.options.materials[ material_id ].name ) );
          }
        });

        $( '#materials-count' ).text( materialCount );

        // Thumbnails
        $( '#thumbnail' ).append( displayImage( data.thumbnails, false ) );

        // Get OSGJS
        getOsgjs( osgjsUrl );
      });

      // Textures
      $.get( apiInternal + pathname + '/textures', function ( data ) {

        $( '#textures-count' ).text( data.results.length );

        data.results.forEach( function ( texture ) {
          $( '#textures' ).append( displayImage( texture, true ) );
        });

        $( '#texture-vram' ).text( humanSize( VRAMTotalMin ) + ' - ' + humanSize( VRAMTotalMax ) );
      });
    }
  }

});
