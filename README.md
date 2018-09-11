# BadassRouterOffline

## Requirements

** Necessary** 
* [NodeJS](https://nodejs.org/es/)

** Good to have **
* [Git & Git Bash](https://git-scm.com/downloads)
* [Visual Studio Code](https://code.visualstudio.com/)

### Reference

* How to use git bash in VS Code? 

Open the VS Code preferences with ```F1``` and then write ```open settings (JSON)```, open the file and write ```
    "terminal.integrated.shell.windows": "C:\\Program Files\\Git\\bin\\bash.exe" ```.
    
* How to open the terminal in VS Code?
Use the shortcut  ```ctrl+shift+d ``` and then click on the terminal icon on the superior right of the sidebar.

* How to upload changes to github? 
Add your changes with ```git add -A``` and commit them with ```git commit -m "here you will write a message"```, check if there was changes on the repository with ```git pull``` and then upload with ```git push```.

### Use

After the requirements are installed download the project cloning the repository, it can be done with the zip option or with the terminal command ``` git clone https://github.com/rhonniel/BadassRouterOffline.git ```

Open the project preferably with VS Code, then open a terminal in the directory of the project (this can be done in the same VS Code, clicking in debug and then the terminal icon).

** Install Dependencies ** 
All the dependencies are managed with npm (node package manager) with the exception of ga & ga.plugins which are placed in the src/vendors dir manually. To install the depencies run the command ```npm install``` in the project root directory (the root have a package.json file).

After the dependencies are installed you can use the dev enviroment with the command ```npm run start``` this will start a static web server and open a webpage with the code. All changes that are made in the code while this is running will be automatically compile. 
**You can't access the compiled assets (images, javascript, files) beacause they're created on memory. To get the final assets use the command to build**/

To build the projects with minified javascript you can use the commnad ```npm run build``` that will create a dist folder and a html with the scripts tags injected. 



