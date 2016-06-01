sketchfab-debug
===============

###Info

A userscript to add admin/debug tools to Sketchfab with injected JS/markup.

###Installation

####Chrome
1) Install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)  

2) Go to the Tampermonkey Dashboard  
![Tampermonky Icon Menu](https://help.sketchfab.com/hc/en-us/article_attachments/204123866/tampermonkey-menu.png)  

3) Add a new script  
![Tampermonkey Add Script](https://help.sketchfab.com/hc/en-us/article_attachments/204330743/tampermonkey-new-script.png)  

4) Copy-paste the [user.js](https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/user.js) script into the new script, and also put the URL ( https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/user.js ) in Update URL  
![Tampermonkey Script](https://help.sketchfab.com/hc/en-us/article_attachments/204330763/tampermonkey-script.png)  


####Firefox
Use [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/)

###Usage  

Extra stats are added to model pages:

![screenshot](https://help.sketchfab.com/hc/en-us/article_attachments/204123886/screenshot1.png)
![screenshot](https://help.sketchfab.com/hc/en-us/article_attachments/204123846/screenshot2.png)

Click *X textures* to toggle the texture view:

![textures](https://help.sketchfab.com/hc/en-us/article_attachments/204330783/textures.png)

####Staffpick
Staffpick (or un-staffpick) the model.

![staffpick](https://help.sketchfab.com/hc/en-us/article_attachments/204123806/menu-bar.png)

####Drop-down menu

![dropdown-menu](https://help.sketchfab.com/hc/en-us/article_attachments/204123826/menu-dropdown.png)

#####Edit
Open 3D Settings with debug3d enabled

####Admin
Open admin page for model

#####Inspect
Open the model in the Inspector

#####Debug
Open theater mode with debug3d enabled

#####User Admin
Open user admin results for this user
![user admin](https://help.sketchfab.com/hc/en-us/article_attachments/204123966/user-admin-button.png)

####Model Properties
Open properties dialog. Use a Staff API token and edit fields as needed. Be careful with Private and License.
![model props button](https://help.sketchfab.com/hc/en-us/article_attachments/204330883/model-props-button.png)

![model props button](https://help.sketchfab.com/hc/en-us/article_attachments/204123946/model-props.png)
