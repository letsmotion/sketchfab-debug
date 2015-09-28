sketchfab-debug
===============

###Info

A userscript to add admin/debug tools to Sketchfab with injected JS/markup.

###Installation

####Chrome
1) Install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)  

2) Go to the Tampermonkey Dashboard  
![Tampermonky Icon Menu](http://puu.sh/krnXW/d16a439260.png)  

3) Add a new script  
![Tampermonkey Add Script](http://puu.sh/kroat/ca418db992.png)  

4) Copy-paste the [user.js](https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/user.js) script into the new script, and also put the URL ( https://raw.githubusercontent.com/sketchfab/sketchfab-debug/master/user.js ) in Update URL  
![Tampermonkey Script](http://puu.sh/krnog/71a4d2d585.png)  


####Firefox
Use [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/)

###Usage  

![screenshot](http://puu.sh/krtmC/1dbffd6bcd.png)

####User Admin
Open user admin results for this user
![user admin](http://puu.sh/krtwu/4163a45fd0.png)

####Model Properties
Open properties dialog. Use a Staff API token and edit fields as needed. Be careful with Private and License.
![model props](http://puu.sh/krtHk/246a4c1cf5.png)

####Inspect
Open the model in the Inspector

####Debug
Open debug info like source, geometries, textures, etc

####Edit
Open 3D Settings with debug3d enabled.

####Staffpick
Staffpick (or un-staffpick) the model.

####Admin
Open admin page for model
