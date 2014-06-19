function start() {
  function displayTexture(texture) {
    var imgs = $('<div>');
    imgs.append($('<img/>').attr('src', texture.images[0].url));
    
    if(texture.images.length > 0) {
      //imgs.append($('<img/>').attr('src', texture.images[0].url));
    
      texture.images.forEach(function(image) {
        var a = $('<a/>').attr('href', image.url).attr('target', '_blank').text(image.width + 'x' + image.height);
        imgs.append(a);
        imgs.append('&nbsp;');
      });
    }
    
    return imgs;
  }

  function humanSize(size) {
    var suffixes = ['b', 'KiB', 'MiB', 'GiB'];
    
    for(var i = 0; i < suffixes.length; i++, size /= 1024) {
      if(size < 1024)
        return size + suffixes[i];
    }
    return size + suffixes[suffixes.length - 1];
  }

  function getModelInfo(urlid) {
    $('#thumbnail, #settings-materials, #settings-textures, #model-materials, #model-textures').empty();
    
    var texturesSize = 0;
    var now = Date.now();
    $.get('https://sketchfab.com/v2/models/' + urlid + '?' + now, function(data) {
      $('#faces').val(data.faceCount);
      $('#vertices').val(data.vertexCount);
      Object.keys(data.options.materials).forEach(function(material_id) {
        var material = data.options.materials[material_id];
        $('#settings-materials').append($('<li>').text(material.name + ' (uid=' + material_id + ')'));
      });
      
      $('#thumbnail').append(displayTexture(data.thumbnails));
    });
    
    $.get('https://sketchfab.com/v2/models/' + urlid + '/textures' + '?' + now, function(data) {
      $('#settings-textures-count').text(data.results.length);
      data.results.forEach(function(texture) {
        console.log(texture);
            

        var imgs = $('<div>');
        if(texture.images.length > 0) {
          texture.images.forEach(function(img) {
            var url = img.url;
            var image = new Image();

            var a = $('<a/>').attr('href', url).attr('target', '_blank');
            a.text('?x?');
            imgs.append(
              $('<img/>').attr({
                src: url,
                width: 64,
                height: 64
              }),
              a
            );

            image.onload = function() {
              var size = image.width * image.height * 4;
              a.text(image.width + 'x' + image.height + ' (' + humanSize(size) + ')');
            };
            image.src = url;
          });
        } else {
          imgs.append(texture.name + ' has no image');
        }
        $('#settings-textures').append(imgs);
      });
    });
    
    $.get('https://media.sketchfab.com/urls/' + urlid + '/file.osgjs.gz' + '?' + now, function(json) {
      var data = JSON.parse(json);
      var geometryCount = 0;

      var textures = {};

      function traverse(children) {
        for(var i in children) {
          if(children.hasOwnProperty(i)) {
            var node = children[i];

            if(typeof(node) === 'object')
              traverse(node);
            if(i === 'osg.Geometry') {
              geometryCount++;
              $('#geometries').text(geometryCount);
            } else if(i === 'osg.Texture' && node.File) {
              var url = 'https://media.sketchfab.com/urls/' + urlid + '/' + node.File;
              if(!textures[url]) {
                textures[url] = true;
              }
            } else if(i === 'osg.Material') {
              $('#model-materials').append($('<li>').text(node.Name));
            }
          }
        }
      }
      
      traverse(data);
      
      var texturesSize = 0;
      for(var url in textures) {
        (function() {
          var image = new Image();

          var a = $('<a/>').attr('href', url).attr('target', '_blank');
          a.text('?x?');
          $('#model-textures').append(
            $('<div>').append(
              $('<img/>').attr({
                src: url,
                width: 64,
                height: 64
              }),
              a
            )
          );

          image.onload = function() {
            var size = image.width * image.height * 4;
            a.text(image.width + 'x' + image.height + ' (' + humanSize(size) + ')');
          };
          image.src = url;
        })();
      }
      $('#model-textures-count').text(Object.keys(textures).length);

      $('#geometries').text(geometryCount);
    });
  }

  $('#form-model').submit(function(e) {
    e.preventDefault();
   
    var m = $('#model').val().match(/([a-zA-Z0-9]{32})/);
    if(m)
      getModelInfo(m[1]);
  });
};
