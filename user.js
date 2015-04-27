// ==UserScript==
// @name          Sketchfab Model Debug
// @namespace     https://github.com/sketchfab/sketchfab-debug/
// @version       0.3.9
// @updateURL     https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/user.js
// @downloadURL   https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/user.js
// @description   inserts button on model pages to load debug info
// @include       https://sketchfab.com/models/*
// @grant         none
// ==/UserScript==

// Get model ID
var modelPath = window.location.pathname,
    modelId = modelPath.replace( '/models/', '' ),
    modelAdmin = 'https://sketchfab.com/admin/skfb_models/model/' + modelId,
    modelEdit = modelPath + '/edit?debug3d=1',
    modelInspect = 'http://sketchfab.github.io/experiments/model-inspector/index.html?urlid=' + modelId;

// Add debug button on page load
$( document ).ready( function() {
  var debugButton = $( '<a class="button btn-medium btn-secondary">Debug</a>' ),
      propButton = $( '<a class="button btn-medium btn-secondary">Props</a>' ),
      editButton = $( '<a href="' + modelEdit + '" class="button btn-medium btn-secondary" target="_blank" >Edit</a>' ),
      adminButton = $( '<a href="' + modelAdmin + '" class="button btn-medium btn-secondary" target="_blank" >Admin</a>' ),
      inspectButton = $( '<a href="' + modelInspect + '" class="button btn-medium btn-secondary" target="_blank" >Inspect</a>' );
  $( '[data-action="open-embed-popup"]' ).remove();
  $( 'div.additional div.actions' ).prepend( inspectButton, debugButton, propButton, editButton, adminButton );
  debugButton.on( 'click', openDebug );
  propButton.on( 'click', openProps );
}());

// Create properties dialog for editing models that don't belong to me
function openProps() {

  var payload = {
    name:"",
    description:"",
    tags:[],
    isPrivate:'',
    // isProtected:null,
    // categories:[],
    license:'',
    // isPrintable:null
  },

  // Get current info
      modelGet = $.get( 'https://api.sketchfab.com/i/models/' + modelId, function( data ) {
        console.log( 'got data' );
        payload.name = data.name;
        payload.description = data.description;
        payload.tags = data.tags;
        showProps( payload );
      });
  }

  function showProps( payload ) {

    var content = '<div class="sidebar-box informations"><form id="the-form" action="" enctype="multipart/form-data"><p>API Token:</p><input name="token" type="text"><p>Name:</p><input name="name" type="text" value="' + payload.name + '"><p>Description:</p><input name="description" type="text" value="' + payload.description + '"><p>Tags (space separated):</p><input name="tags" type="text" value="' + payload.tags.toString().replace( /,/g, ' ') + '"><p>Private?<input name="isPrivate" type="checkbox" value="1"></p><p>License:</p><input name="license" type="text" value="' + payload.license + '"><input name="Submit" type="submit"></form></div>';

    function patchModel( token ) {

      console.log( 'patch model function ran' );

      $.ajax({
        url: 'https://api.sketchfab.com/v2/models/' + modelId + '?token=' + token,
        data: JSON.stringify( payload ),
        type: 'PATCH',
        contentType: 'application/json',
        traditional: true,

        success: function( response ) {
          console.log( 'Patch success' );
        },

        error: function( response ) {
          console.log( 'Patch error' );
        }
      });

    }
    
    $( 'div.owner' ).after( content );
    form = $( '#the-form' )[ 0 ];
    form.onsubmit = function() {
      payload.name = form.name.value;
      payload.description = form.description.value;
      payload.tags = form.tags.value.split(' ');

      if ( form.isPrivate.checked ) {
        payload.isPrivate = true;
      } else {
        payload.isPrivate = false;
      }

      payload.license = parseInt( form.license.value );
      patchModel( form.token.value );
      return false; // Prevent redirect
    };

  }


// Replace model viewer with debug info
function openDebug() {

  // Define debug markup and edit existing markup
  var content = '<h2>  Model Debug</h2><h2>  Mesh</h2><div class="block">  <form>    <div>      <label>        Vertices:      </label>      <output id="vertices"></output>    </div>    <div>      <label>        Faces:      </label>      <output id="faces"></output>    </div>    <div>      <label>        Geometries:      </label>      <output id="geometries"></output>    </div><div>      <label>        Source:      </label>      <output id="source"></output>    </div><div>      <label>        Source Tool:      </label>      <output id="source-tool"></output>    </div><div>      <label>        Matrix Transform:      </label>      <output id="matrix-trans"></output>    </div><div>      <label>        Top Node Source:      </label>      <output id="top-node"></output>    </div>    <div>      <label>        UV Maps:      </label>      <output id="uvmaps"></output>    </div>  </form></div><h2>  Thumbnail</h2><div class="block">  <div id="thumbnail"></div></div><h2>  Material Settings</h2><div class="block">  <h3>    Materials (settings)  </h3>  <ul id="settings-materials"></ul>    <h3>    Textures  </h3>    <form>    <div>      <label>        Count      </label>      <output id="settings-textures-count"></output>    </div>  </form>    <div id="settings-textures"></div>  </div><h2>  Materials (default)</h2><div class="block">  <h3>    Materials  </h3>    <ul id="model-materials"></ul>  <h3>    Textures  </h3>    <form>    <div>      <label>        Count      </label>      <output id="model-textures-count"></output>    </div>  </form>    <div id="model-textures"></div>  </div>';
  $( '.left' ).empty();
  $( '.left' ).prepend( '<div class="main" id="debug">' + content + '</div>' );
  $( '.header' ).append( '<a class="model-name" href="' + modelPath + '">Back</a>' );
  $( '.header' ).append( '<a class="model-name" href="' + modelEdit + '" style="margin-left:5px;">Edit</a>' );
  $( '.header' ).append( '<a class="model-name" href="' + modelAdmin + '" style="margin-left:5px;">Admin</a>' );

  // With new markup loaded, get debug info
  $( '#debug' ).ready( function() {
    getModelInfo( modelId );
  }());
}

function displayTexture( texture ) {
  var imgs = $( '<div>' );
  imgs.append( $( '<img/>' ).attr( 'src', texture.images[ 0 ].url ) );

  if ( texture.images.length > 0 ) {
    texture.images.forEach( function(image) {
      var a = $( '<a/>' ).attr( 'href', image.url ).attr( 'target', '_blank' ).text( image.width + 'x' + image.height );
      imgs.append( a );
      imgs.append( '&nbsp;' );
    });
  }

  return imgs;
}

function humanSize( size ) {
  var suffixes = [ 'b', 'KiB', 'MiB', 'GiB' ];

  for ( var i = 0; i < suffixes.length; i++, size /= 1024 ) {
    if ( size < 1024 )
      return size + suffixes[ i ];
  }
  return size + suffixes[ suffixes.length - 1 ];
}

function getModelInfo( urlid ) {
  // Empty model info fields
  $( '#thumbnail, #settings-materials, #settings-textures, #model-materials, #model-textures' ).empty();
  
  var texturesSize = 0,
      now = Date.now(); // Get date
  
  // Get model basics
  $.get( 'https://api.sketchfab.com/i/models/' + urlid + '?' + now, function( data ) {
    $( '#faces' ).val( data.faceCount );
    $( '#vertices' ).val( data.vertexCount );
    Object.keys( data.options.materials ).forEach( function( material_id ) {
      var material = data.options.materials[ material_id ];
      $( '#settings-materials' ).append( $( '<li>' ).text( material.name + ' (uid=' + material_id + ')' ) );
    });
    
    // Get thumbnail
    $( '#thumbnail' ).append( displayTexture( data.thumbnails ) );
  });

  // Get textures
  $.get( 'https://api.sketchfab.com/i/models/' + urlid + '/textures' + '?' + now, function( data ) {
    $( '#settings-textures-count' ).text( data.results.length );
    data.results.forEach( function( texture ) {
      console.log( texture );

      var imgs = $( '<div>' );
      if ( texture.images.length > 0 ) {
        texture.images.forEach( function( img ) {
          var url = img.url,
              image = new Image(),
              a = $( '<a/>' ).attr( 'href', url ).attr( 'target', '_blank' );
          
          a.text( '?x?' );
          imgs.append(
            $( '<img/>' ).attr({
              src: url,
              width: 64,
              height: 64
            }),
            a
          );

          image.onload = function() {
            var size = image.width * image.height * 4;
            a.text( image.width + 'x' + image.height + ' (' + humanSize( size ) + ')' );
          };
          image.src = url;
        });
      } else {
        imgs.append( texture.name + ' has no image' );
      }
      $( '#settings-textures' ).append( imgs );
    });
  });

  // Get and parse polygon osgjs
  $.get( 'https://media.sketchfab.com/urls/' + urlid + '/file.osgjs.gz' + '?' + now, function( json ) {
    var data = JSON.parse( json ),
        geometryCount = 0,
        uvCount = 0,
        textures = {};

    // Traverse polygon json to extract model data
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
              var dataValue = dataContainer[j];
              if (dataValue.Name === 'source') {
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
    var texturesSize = 0;
    for ( var url in textures ) {
      ( function() {
        var image = new Image(),
            a = $( '<a/>' ).attr( 'href', url ).attr( 'target', '_blank' );
        
          a.text( '?x?' );
        $( '#model-textures' ).append(
          $( '<div>' ).append(
            $( '<img/>' ).attr({
              src: url,
              width: 64,
              height: 64
            }),
            a
          )
        );

        image.onload = function() {
          var size = image.width * image.height * 4;
          a.text( image.width + 'x' + image.height + ' (' + humanSize( size ) + ')' );
        };
        image.src = url;
      })();
    }
    $( '#model-textures-count' ).text( Object.keys( textures ).length );
    $( '#geometries' ).text( geometryCount );
  });
}
