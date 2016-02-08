// ==UserScript==
// @name          Sketchfab Model Debug
// @namespace     https://github.com/sketchfab/sketchfab-debug/
// @version       0.5.10
// @updateURL     https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/user.js
// @downloadURL   https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/user.js
// @description   Inserts buttons on model pages to load debug info and other tools
// @include       https://sketchfab.com/*
// @exclude       https://sketchfab.com/models/*/embed*
// @grant         none
// ==/UserScript==

$( document ).ready( function() {

  var pathname = window.location.pathname,
      searchQuery = window.location.search;

  if ( pathname.match( /\/models\// ) ) {
    showModelAdmin();
  }

  else if ( $( '.profile-header' ).length ) {
    var userAdminButton = '<a id="user-admin" href="" class="button btn-medium btn-tertiary" target="_blank"><i class="icon fa fa-cog" style="margin-right: 0;"></i></a>';
    $( '.profile-header .actions' ).append( userAdminButton );
    showUserAdmin( true );
  }

  else if ( pathname === '/models' && !searchQuery.match( 'status=published' ) ) {
    var prefix = '&';
    if ( searchQuery === '' ) {
      prefix = '?';
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

  // Using the date joined timestamp can (almost) guarantee only one result
  function showUserAdmin( isUserProfile ) {
    var path,
        username,
        userUID,
        url,
        joined,
        d1,
        d2,
        timestamp1,
        timestamp2;

    if ( isUserProfile ) {
      Object.keys( prefetchedData ).forEach( function( i ) {
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
      path = '/i' + window.location.pathname;
      username = prefetchedData[ path ].user.username;
      userUID = prefetchedData[ path ].user.uid;
    }

    url = 'https://api.sketchfab.com/i/users/' + userUID;

    // Method to add one second to timestamp because admin search is [gte, lt)
    Date.prototype.addSecond = function( s ) {
      this.setSeconds( this.getSeconds() + s );
      return this;
    };

    // Add leading zero
    function leadingZero( number ) {
      if ( number < 10 ) {
        return '0' + number;
      } else {
        return number;
      }
    }

    // Convert Date to admin search parameter format
    function buildTimestamp( date ) {
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

    function convertDateToUTC( date ) {
      return new Date( date.getUTCFullYear(),
                       date.getUTCMonth(),
                       date.getUTCDate(),
                       date.getUTCHours(),
                       date.getUTCMinutes(),
                       date.getUTCSeconds());
    }

    // Get user API response and build the admin link
    $.get( url, function( data ) {
      joined = data.dateJoined;
      d1 = new Date( joined );
      d1_utc = convertDateToUTC( d1 );
      d2 = ( new Date( joined ) ).addSecond( 1 );
      d2_utc = convertDateToUTC( d2 );
      timestamp1 = buildTimestamp( d1_utc );
      timestamp2 = buildTimestamp( d2_utc );
      adminUrl = 'https://sketchfab.com/admin/skfb_users/skfbuser/?date_joined__gte=' + timestamp1 +'&date_joined__lt=' + timestamp2 + '&q=' + username;
      $( '#user-admin' ).attr( 'href', adminUrl );
    });
  }

  function showModelAdmin() {
    // Get model ID
    var modelPath = window.location.pathname,
        modelId = modelPath.replace( '/models/', '' ),
        modelAdmin = 'https://sketchfab.com/admin/skfb_models/model/' + modelId,
        modelAdminSearch = 'https://sketchfab.com/admin/skfb_models/model/?q=' + modelId,
        modelEdit = modelPath + '/edit?debug3d=1',
        modelInspect = 'http://sketchfab.github.io/experiments/model-inspector/index.html?urlid=' + modelId,
        debugButton = '<a id="debug" class="button btn-medium btn-secondary">Debug</a>',
        propButton = '<a id="prop" class="button btn-medium btn-tertiary" style="margin-right: 10px;"><i class="icon fa fa-cog" style="margin-right: 0;"></i></a>',
        editButton = '<a href="' + modelEdit + '" class="button btn-medium btn-secondary" target="_blank">Edit</a>',
        spButton = '<a id="staffpick-model" class="button btn-medium btn-secondary">' + ( $( 'a.flag-staffpicked' )[ 0 ] ? 'Un-Staffpick': 'Staffpick' ) + '</a>',
        optimizeButton = '<a id="optimize-model" class="button btn-medium btn-secondary">Optimize</a>',
        adminButton = '<a href="' + modelAdmin + '" class="button btn-medium btn-secondary" target="_blank">Admin</a>',
        inspectButton = '<a href="' + modelInspect + '" class="button btn-medium btn-secondary" target="_blank">Inspect</a>',
        userAdminButton = '<a id="user-admin" href="" class="button btn-medium btn-tertiary" target="_blank" style="margin-right: 10px;"><i class="icon fa fa-cog" style="margin-right: 0;"></i></a>';

    $( '[data-action="open-embed-popup"]' ).remove();

    $( 'div.additional' ).after( '<div class="additional" style=""><div class="actions" style="position: relative; width: auto; left: 100%; transform: translateX(-100%)">' + inspectButton + debugButton + editButton + spButton + adminButton + '</div></div>' );
    $( '.informations .sidebar-title:first' ).prepend( propButton );
    $( '.whoami .display-name' ).prepend ( userAdminButton );
    $( '.whoami' ).css( 'margin', '10px 20px 0' );
    showUserAdmin( false );

    $( '#debug' ).on( 'click', openDebug );
    $( '#prop' ).on( 'click', openProps );
    $( '#staffpick-model' ).on( 'click', staffpickModel );
    $( '#optimize-model' ).on( 'click', optimizeModel );

    // Optimize a model
    function optimizeModel() {
        var url = window.document.location.origin + '/i' + window.document.location.pathname + '/optimize';

        if ( !confirm( 'Are you sure?' ) ) {
          return;
        }

        $.ajax({
            type: 'POST',
            url: url,
            success: function( xhr ) {
                location.reload();
            },
            error: function( xhr ) {
                console.error( xhr );
            }
        });
    }

    // Staffpick / Unstaffpick a model
    function staffpickModel() {
        var url = window.document.location.origin + '/i' + window.document.location.pathname + '/staffpick';

        if ( !confirm( 'Are you sure?' ) ) {
          return;
        }

        $.ajax({
            type: 'POST',
            url: url,
            success: function( xhr ) {
                location.reload();
            },
            error: function( xhr ) {
                console.error( xhr );
            }
        });
    }

    // Create properties dialog for editing models that don't belong to me
    function openProps() {

      var payload = {
        name: prefetchedData[ '/i' + modelPath ].name,
        description: prefetchedData[ '/i' + modelPath ].description,
        tags: prefetchedData[ '/i' + modelPath ].tags,
        isPrivate: prefetchedData[ '/i' + modelPath ].isPrivate,
        // isProtected:null,
        // categories:[],
        license:''
        // isPrintable:null
      };

      showProps( payload );
    }

    function showProps( payload ) {

      var content = '<div class="sidebar-box informations">' +
                      '<form id="the-form" action="" enctype="multipart/form-data">' +
                        '<p>API Token:</p>' +
                        '<input name="token" type="text" style="width: 100%; value="">' +
                        '<p>Name:</p>' +
                        '<input name="name" type="text" style="width: 100%;" value="' + payload.name + '">' +
                        '<p>Description:</p>' +
                        '<textarea name="description" style="width: 100%; height: 300px;">' + payload.description + '</textarea>' +
                        '<p>Tags (space separated):</p>' +
                        '<textarea name="tags" style="width: 100%; height: 100px;">' + payload.tags.toString().replace( /,/g, ' ' ) + '</textarea>' +
                        '<p>Private?' +
                          '<input id="isPrivate" class="form-checkbox" type="checkbox" name="isPrivate">' +
                          '<label class="form-checkbox-actor" for="isPrivate" style="margin-left: 10px"></label>' +
                        '</p>' +
                        '<p>License:</p>' +
                        '<select name="license">' +
                          '<option value="">-----</option>' +
                          '<option value="1">CC Attribution</option>' +
                          '<option value="2">CC Attribution-ShareAlike</option>' +
                          '<option value="3">CC Attribution-NoDerivs</option>' +
                          '<option value="4">CC Attribution-NonCommercial</option>' +
                          '<option value="5">CC Attribution-NonCommercial-ShareAlike</option>' +
                          '<option value="6">CC Attribution-NonCommercial-NoDerivs</option>' +
                          /*'<option value="7">CC0 Public Domain</option>' +*/
                        '</select>' +
                        '<input class="button btn-medium btn-secondary" name="Submit" type="submit">' +
                      '</form>' +
                    '</div>';

      function patchModel( token ) {

        $.ajax({
          url: 'https://api.sketchfab.com/v2/models/' + modelId + '?token=' + token,
          data: JSON.stringify( payload ),
          type: 'PATCH',
          contentType: 'application/json',
          traditional: true,

          success: function( response ) {
            console.log( 'Patch success' );
            location.reload();
          },

          error: function( response ) {
            console.error( response );
          }
        });
      }

      $( 'div.owner' ).after( content );
      form = $( '#the-form' )[ 0 ];
      form.onsubmit = function() {
        payload.name = form.name.value;
        payload.description = form.description.value;
        payload.tags = form.tags.value.split( ' ' );
        payload.license = form.license.value;

        if ( form.isPrivate.checked ) {
          payload.isPrivate = true;
        } else {
          payload.isPrivate = false;
        }

        patchModel( form.token.value );
        return false; // Prevent redirect
      };
      $( '.informations .sidebar-title:first a' ).remove();
    }

    // Replace model viewer with debug info
    function openDebug() {

      // Define debug markup and edit existing markup
      var content = '<div class="main" id="debug">' +
                      '<h2>Model Debug</h2>' +
                      '<h2>Mesh</h2>' +
                      '<div class="block">' +
                        '<form>' +
                          '<div>' +
                            '<label>Vertices: </label>' +
                            '<output id="vertices"></output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Faces: </label>' +
                            '<output id="faces"></output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Geometries: </label>' +
                            '<output id="geometries"></output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Source: </label>' +
                            '<output id="source"></output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Source Tool: </label>' +
                            '<output id="source-tool"></output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Matrix Transform: </label>' +
                            '<output id="matrix-trans"></output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Top Node Source: </label>' +
                            '<output id="top-node"></output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Materials: </label>' +
                            '<output id="materials"></output>' +
                          '</div>' +
                          '<div>' +
                            '<label>Textures: </label>' +
                            '<output id="textures"></output>' +
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
                            '<label>Bones: </label>' +
                            '<output id="bones"></output>' +
                          '</div>' +
                        '</form>' +
                      '</div>' +
                      '<h2>Thumbnail</h2>' +
                      '<div class="block">' +
                        '<div id="thumbnail"></div>' +
                      '</div>' +
                      '<h2>Materials (settings)</h2>' +
                      '<div class="block">' +
                        '<h3>Materials</h3>' +
                        '<ul id="settings-materials"></ul>' +
                        '<h3>Textures</h3>' +
                        '<form>' +
                          '<div>' +
                            '<label>Count: </label>' +
                              '<output id="settings-textures-count"></output>' +
                          '</div>' +
                        '</form>' +
                        '<div id="settings-textures"></div>' +
                      '</div>' +
                      '<h2>Materials (default)</h2>' +
                      '<div class="block">' +
                        '<h3>Materials</h3>' +
                        '<ul id="model-materials"></ul>' +
                        '<h3>Textures</h3>' +
                        '<form>' +
                          '<div>' +
                            '<label>Count: </label>' +
                            '<output id="model-textures-count"></output>' +
                          '</div>' +
                        '</form>' +
                        '<div id="model-textures"></div>' +
                      '</div>' +
                    '</div>';

      $( '.left' ).html( content );
      
      $( '.header' ).append(
        '<a class="button btn-medium btn-secondary" href="' + modelPath + '">Back</a>',
        '<a class="button btn-medium btn-secondary" href="' + modelEdit + '" style="margin-left:5px;" target="_blank">Edit</a>',
        '<a class="button btn-medium btn-secondary" href="' + modelAdmin + '" style="margin-left:5px;" target="_blank">Admin</a>'
      );

      // With new markup loaded, get debug info
      $( '#debug' ).ready( function() {
        getModelInfo( modelId );
      }());
    }

    function displayTexture( texture ) {
      var imgs = $( '<div>' );
      imgs.append( $( '<img/>' ).attr( 'src', texture.images[ 0 ].url ) );

      if ( texture.images.length > 0 ) {
        texture.images.forEach( function( image ) {
          var a = $( '<a/>' ).attr({
              'href': image.url,
              'target': '_blank'
            })
            .text( image.width + 'x' + image.height );
          imgs.append( a, '&nbsp;' );
        });
      }

      return imgs;
    }

    function humanSize( size ) {
      var suffixes = [ ' b', ' KiB', ' MiB', ' GiB' ];

      for ( var i = 0; i < suffixes.length; i++, size /= 1024 ) {
        if ( size < 1024 )
          return size + suffixes[ i ];
      }
      return size + suffixes[ suffixes.length - 1 ];
    }

    function getModelInfo( urlid ) {

      // Get and parse polygon osgjs
      function getOsgjs( osgjsUrl ) {
        $.get( osgjsUrl, function( json ) {
          var data = JSON.parse( json ),
              geometryCount = 0,
              uvCount = 0,
              boneCount = 0,
              textures = {};

          // Traverse json to extract model data
          function traverse( children ) {
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
                } else if ( i === 'osg.Material' ) {
                  $( '#model-materials' ).append( $( '<li>' ).text( node.Name ) );
                } else if ( i === 'UserDataContainer' ) {
                  var dataContainer = node.Values;
                  for ( var j = 0; j < dataContainer.length; j++ ) {
                    var dataValue = dataContainer[ j ];
                    if ( dataValue.Name === 'source' ) {
                      $( '#source' ).text( dataValue.Value );
                    } else if ( dataValue.Name === 'source_tool' ) {
                      $( '#source-tool' ).text( dataValue.Value );
                    }
                  }
                } else if ( i === 'osg.MatrixTransform' && node.UniqueID === 0 ) {
                  $( '#matrix-trans' ).text( sourceSplit( node.Name ) );
                } else if ( i === 'osg.Node' && node.UniqueID === 0 ) {
                  $( '#top-node' ).text( sourceSplit( node.Name ) );
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

          // Get the file name from root node path
          function sourceSplit( nameStr ) {
            var separator = "/",
                nameArr = nameStr.split( separator ),
                nameIndex = nameArr.length - 1,
                nameSource = nameArr[ nameIndex ];
            return nameSource;
          }

          traverse( data );

          // Add default textures to markup
          function showTexture( url ) {
            var image = new Image(),
                a = $( '<a/>' ).attr({
                  'href': url,
                  'target': '_blank'
                });

            a.text( '?x?' );
            $( '#model-textures' ).append(
              $( '<div>' ).append(
                $( '<img/>' ).attr({
                  src: url,
                  width: 128,
                  height: 128
                }),
                '<br>',
                a
              )
            );

            // Need to load these textures to get size
            image.onload = function() {
              a.text( image.width + 'x' + image.height );
            };
            image.src = url;
          }

          for ( var url in textures ) {
            if ( textures.hasOwnProperty( url ) ) {
              showTexture( url );
            }
          }

          $( '#model-textures-count' ).text( Object.keys( textures ).length );
          $( '#geometries' ).text( geometryCount );
        });
      }

      // Get model basics
      $.get( 'https://api.sketchfab.com/i/models/' + urlid, function( data ) {

        var osgjsUrl = data.files.osgjsUrl,
            materialCount = 0;

        $( '#faces' ).val( data.faceCount );
        $( '#vertices' ).val( data.vertexCount );
        Object.keys( data.options.materials ).forEach( function( material_id ) {
          if ( material_id != 'updatedAt' ) {
            materialCount++;
            var material = data.options.materials[ material_id ];
            $( '#settings-materials' ).append( $( '<li>' ).text( material.name + ' (uid=' + material_id + ')' ) );
          }
        });
        $( '#materials' ).text( materialCount );

        // Get thumbnail
        $( '#thumbnail' ).append( displayTexture( data.thumbnails ) );

        // Pass and get OSGJS
        getOsgjs( osgjsUrl );
      });

      // Get textures
      // TODO: test for and display the actual 128x128 version instead of maximum
      $.get( 'https://api.sketchfab.com/i/models/' + urlid + '/textures', function( data ) {
        var totalVRAM = 0;
        $( '#settings-textures-count, #textures' ).text( data.results.length );
        data.results.forEach( function( texture ) {
          var imgs = $( '<div>' ),
              isMax = true;

          if ( texture.images.length > 0 ) {
            texture.images.forEach( function( img, index ) {
              var url = img.url,
                  height = img.height,
                  width = img.width,
                  format = img.options.format,
                  size,
                  isVisible = false,
                  a = $( '<a/>' ).attr({
                    'href': url,
                    'target': '_blank'
                  });

              a.text( height + ' x ' + width );

              if ( format ) {
                var channels;

                if ( format === 'RGB' ) {
                  channels = 3;
                } else if ( format.match( /[ANR]{1}/ ) ) {
                  channels = 1;
                }

                size = height * width * channels;

                if ( isMax ) {
                  totalVRAM += size;
                  isMax = false;
                }

                a.text( a.text() + ' (Compressed ' + format + '. ' + humanSize( size ) + ' VRAM)' );
              }

              if ( index === 0 ) {
                imgs.append(
                  '<br>',
                  $( '<img/>' ).attr({
                    src: url,
                    width: 128,
                    height: 128
                  }),
                  '<br>',
                  a
                );
              } else {
                imgs.append(
                  '<br>',
                  a
                );
              }
            });
          } else {
            imgs.append( texture.name + ' has no image' );
          }
          $( '#settings-textures' ).append( imgs );
        });
        $( '#texture-vram' ).text( humanSize( totalVRAM ) );
      });
    }
  }
});
