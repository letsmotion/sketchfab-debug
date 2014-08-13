var content = '
<h2>
  Model Debug
</h2>

<h2>
  Mesh
</h2>

<div class="block">
  <form>

    <div>
      <label>
        Vertices:
      </label>
      <output id="vertices"></output>
    </div>

    <div>
      <label>
        Faces:
      </label>
      <output id="faces"></output>
    </div>

    <div>
      <label>
        Geometries:
      </label>
      <output id="geometries"></output>
    </div>
    
    <div>
      <label>
        Source:
      </label>
      <output id="source"></output>
    </div>
    
    <div>
      <label>
        Source Tool:
      </label>
      <output id="source-tool"></output>
    </div>
    
    <div>
      <label>
        Matrix Transform:
      </label>
      <output id="matrix-trans"></output>
    </div>
    
    <div>
      <label>
        Top Node Source:
      </label>
      <output id="top-node"></output>
    </div>
    
    <div>
      <label>
        UV Maps:
      </label>
      <output id="uvmaps"></output>
    </div>


  </form>
</div>

<h2>
  Thumbnail
</h2>

<div class="block">
  <div id="thumbnail"></div>
</div>

<h2>
  Material Settings
</h2>

<div class="block">

  <h3>
    Materials (settings)
  </h3>

  <ul id="settings-materials"></ul>
  
  <h3>
    Textures
  </h3>
  
  <form>
    <div>
      <label>
        Count
      </label>
      <output id="settings-textures-count"></output>
    </div>
  </form>
  
  <div id="settings-textures"></div>
  
</div>

<h2>
  Materials (default)
</h2>

<div class="block">

  <h3>
    Materials
  </h3>
  
  <ul id="model-materials"></ul>

  <h3>
    Textures
  </h3>
  
  <form>
    <div>
      <label>
        Count
      </label>
      <output id="model-textures-count"></output>
    </div>
  </form>
  
  <div id="model-textures"></div>
  
</div>
';
