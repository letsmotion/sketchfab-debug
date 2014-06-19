// ==UserScript==
// @name          Sketchfab Model Debug
// @namespace     https://github.com/PadreZippo/sketchfab-debug/
// @version       0.1.2
// @updateURL     https://raw.githubusercontent.com/PadreZippo/sketchfab-debug/master/user.js
// @downloadURL   https://raw.githubusercontent.com/PadreZippo/sketchfab-debug/master/user.js
// @description   inserts button on model pages to load debug info
// @include       https://sketchfab.com/models/*
// @require       http://code.jquery.com/jquery-latest.js
// @require       https://raw.githubusercontent.com/PadreZippo/sketchfab-debug/master/debug.js
// ==/UserScript==

$(document).ready(function() {
    $('div.additional div.actions').prepend('<a class="button btn-medium btn-secondary" id="debug">Debug</a>');
}());

var modelId = window.location.pathname;

function openDebug() {
    
    var content = '<h2>Sketchfab model debug info    </h2>    <form id="form-model">      <div>        <label for="model">Model        </label>        <input type="text" id="model" value=window.location.pathname>        <input type="submit" id="submit" value="Go">      </div>    </form>    <h2>Mesh    </h2>    <div class="block">      <form>        <div>          <label>Vertices          </label>          <output id="vertices">          </output>        </div>        <div>          <label>Faces          </label>          <output id="faces">          </output>        </div>        <div>          <label>Geometries          </label>          <output id="geometries">          </output>        </div>      </form>    </div>    <h2>Thumbnail    </h2>    <div class="block">      <div id="thumbnail">      </div>    </div>    <h2>Settings (material editor)    </h2>    <div class="block">      <h3>Materials      </h3>      <ul id="settings-materials">      </ul>      <h3>Textures      </h3>      <form>        <div>          <label>Count          </label>          <output id="settings-textures-count">          </output>        </div>      </form>      <div id="settings-textures">      </div>    </div>    <h2>Default materials    </h2>    <div class="block">      <h3>Materials      </h3>      <ul id="model-materials">      </ul>      <h3>Textures      </h3>      <form>        <div>          <label>Count          </label>          <output id="model-textures-count">          </output>        </div>      </form>      <div id="model-textures">      </div>    </div>';
    $('div.main').remove();
    $('div.sections').prepend('<div class="main" id="debug">' + content + '</div>');
    $('header').append('<a class="model-name" href="https://sketchfab.com' + modelId + '">Back</a>');
    $('#debug').ready(function() {
        $('#model').val(modelId);
        start();
        $('#submit').click();
    }());
}  

var button = document.getElementById("debug");
button.addEventListener("click", openDebug, false);
