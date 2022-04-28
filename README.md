<h1 align="center">
  <a href="https://FreeNFTMint.app"><img width="30%" src="https://freenftmint.app/assets/images/cordova-logo.png?" alt="Cordova logo" /></a>
</h1>

<h3 align="center">A Cordova shell App to wrap your Web App into a Native Mobile App</h3>

<h4 align="center">Made With 🧡 By The <a href="https://Bizelop.app">Bizelop</a> Community </h4>
<p align="center">
  <a href="https://discord.gg/bizelop"><img src="https://img.shields.io/badge/chat-discord?style=for-the-badge&logo=discord&label=discord&logoColor=7389D8&color=ff6501" /></a>
  <a href="https://twitter.com/bizelop"><img alt="Twitter Follow" src="https://img.shields.io/twitter/follow/bizelop?color=ff6501&label=twitter&logo=twitter&style=for-the-badge"></a>
  
</p>

# About
This cordova shell App will download your Web App code and run it on the mobile device. Your Web App client code whether Angular, React, Vue or Vanilla JavaScript does not change and stays in its own repository keeping the code separated. 

This means that you are able to update your Web App client code without having to deploy to any App Marketplace and waiting for them to review and approve. This makes deploying Web App updates to your users very easy and seamless. 

- The only time you would need to deploy to an App Marketplace is when you make updates to the shell App like add a new cordova plugin or change the shell App UI.

# General Workflow
- When you compile your Web App zip the folder of the build into a file named "www.zip" (Right click the full folder and not single files)

- Host this zip file that is publicly accessible. If testing host locally

- In the shell App code point to the hosted location and build the App

- The shell App when opened will download the www.zip, extract the code, copy over cordova plugins and inject cordova.js into your index.html 

- shell App launches your index.html and cordova is now accessible from your Web App code

- Next time the shell App launches it will check with your backend server to see if their was a new update that needs to be downloaded. If not then the locally downloaded code will automatically run

# Prerequisites

- Windows PC: Node version 16.13.0 (This version is what we used) 

- macOS: Node version 11.1.0 (This version is what we used) 

Use Node Version Manager (nvm) to install and use different node versions on the same machine

- Android Studio (macOS and Windows PC)
- Xcode (MacOS)

- Cordova version 11.0.0

```
npm install -g cordova@11.0.0
```

- Cordova Resource Generator (To generate App icons)

```
npm install -g cordova-res
```

- Compiled Web App folder zipped into a "www.zip" (zip the full folder and not the files) www.zip file structure
```

|-www.zip
  |-www
    |-index.html
```


- Create a "appVersion.txt" file and host it next to the "www.zip" put the number 1 in it. The shell App starts at 0 and will do a get to the "appVersion.txt" and it the value is greater than what is on the device locally then it will download the update and update the local version to match the server.

- When you push a new www.zip file you need to increment the "appVersion.txt" for the download to happen on the device in production.


# Get Started 

Clone the cordova project

```
git clone https://github.com/bizelop/Cordova-ShellApp.git
```

cd to the folder 

```
cd Cordova-ShellApp
```

## Pre-Installing

- Update the config.xml file with your App information: name, description, The "id" property on the widget tag, The universal links host names and scheme, the host and scheme names under both android and iOS tags
- The shell App contains Google Firebase push notifications plugin. You will need to create a [Firebase application](https://firebase.google.com) and download the Google-Services.json (For Android) and the GoogleServices-Info.plist (For iOS) then put the two files in the root directory (next to config.xml) before adding platforms
- If you are not looking to use this plugin you can remove the reference from the package.json and config.xml or you will see an error about missing Google Services files.
- If you are not familiar with setting up firebase join the [Discord](https://discord.gg/bizelop)

In the resources folder there are two images icon.png and splash.png that you can update. 

- resources/icon.(png|jpg) must be at least 1024×1024px
- resources/splash.(png|jpg) must be at least 2732×2732px

To generate the icons and splash screens run the command 

```
cordova-res
```
The images are generated and your config.xml file will be populated for each platform.

# Project Structure

The shell App structure is as follows:

```
|-config.xml
|-package.json
|-resources
|-www
  |-scripts
    |-index.js
    |-devIndex.js
  |-index.html
  |-css
  |-images  
```

The index.js is the production file. For this file you will just need to update the domain where the www.zip is located. By default this is pointed to [FreeNFTMint.app](https://freenftmint.app)

```
var domain = "https://freeNFTMint.app/";
```

For the devIndex.js this is for testing and developing. This will prompt you to manually enter the URL to where the www.zip exists. 

You can point to your local machine using IP address or to a testing domain site where you can put your www.zip.  Example: 
- http://192.168.1.8/myApp 
- https://test.mydomaing.com

To switch between the index.js and the devIndex.js update the index.html to point to the one you want to run with and comment out the other file

```
<script type="text/javascript" src="scripts/index.js"></script>
<!--<script type="text/javascript" src="scripts/devIndex.js"></script>-->
```
In your index.html you also need to update the Content-Security meta tag to point to your production domain (Not needed if testing locally against IP address) this is by default pointed to [FreeNFTMint.app](https://freenftmint.app) so update that to your production URL

```
<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval';connect-src 'self' REPLACE_ME_WITH_PROD_URL; style-src 'self' 'unsafe-inline'; media-src *">
```
When you have your domain in index.js or devIndex.js ready to go you can now add the platforms and build the App

# Adding Platforms 

## Android 

Make sure you have installed Android Studio

Run the below cordova command to create the Android project

```
cordova platform add android
```

This should install latest cordova-android available and install all the plugins for Android.

When added successfully run Android Studio and open the Android project under
```
platforms/android
```

From here you can connect a physical device or use the simulator to run the App against

## Android Quirks

*** There is a bug in one of the current plugins that throws an error when publishing to Google Play Store. 

You have to update the cordova-plugin-zip code for Android only

```
plugins/cordova-plugin-zip/src/android/Zip.Java
```
At Line 129 add the below code
```
String canonicalDestinationPath = (new File(outputDirectory)).getCanonicalPath();
        String canonicalPath = file.getCanonicalPath();
         if (!canonicalPath.startsWith(canonicalDestinationPath)) {
                String errorMessage = "Zip traversal security error";
                callbackContext.error(errorMessage);
                Log.e(LOG_TAG, errorMessage);
                return;
             }

```
The full code should look like this
```
              File file = new File(outputDirectory + compressedName);
                    //Line 129
              String canonicalDestinationPath = (new File(outputDirectory)).getCanonicalPath();
              String canonicalPath = file.getCanonicalPath();
              if (!canonicalPath.startsWith(canonicalDestinationPath)) {
                String errorMessage = "Zip traversal security error";
                callbackContext.error(errorMessage);
                Log.e(LOG_TAG, errorMessage);
                return;
              }
                    
              file.getParentFile().mkdirs();
```

You would then have to remove and add android again. 

```
cordova platform remove android
cordova platform add android
```
Your App is now ready to publish to Google

## iOS 

Make sure you have installed xCode

Run the below cordova command to create the xCode project

```
cordova platform add ios
```

This should install latest cordova-ios available and install all the plugins for iOS.

When added successfully run xCode project workspace and NOT the .xcodeproj under

```
platforms/ios/YOUR_APP_NAME.xcworkspace
```
Once opened click on your project name from the file view on the left side of xCode and go to "Signing & Capabilities" and set signing to automatic, add any capability like push notification, and set yor team to allow xCode to create your provisioning profile.

From here you can connect a physical device or use the simulator to run the App against
## iOS Quirks

If you are trying to use the Push Notifications plugin then you need to get your APN API Key or APN certificates from [developers.apple.com](developers.apple.com) and then install them onto Firebase

# How to use cordova plugins

When you run your Web App the shell App will inject cordova into your index.html

```
<script src="cordova.js"/>
```
The cordova.js will load all the cordova plugins installed and you will now have a "window.cordova" object that you can now use. 

In your client Web App you will need to add the following code to know that cordova is available.

Make a function loadCordova() that has the "deviceready" event listener. This event is only triggered by cordova once cordova loads all the plugins. If this event is triggered then you are in the cordova shell App and you can use the cordova plugins

```
constructor(){
  .
  .
  this.loadCordova();
  .
  .
}
loadCordova = async () => {
    document.addEventListener("deviceready", () => {    
     //Cordova is available and cordova plugins are ready 
      this.isCordova = true; 
      this.isAndroid = window.cordova.platformId == "android"
      this.isiOS = !this.isAndroid;
      .
      .
      .
     window.cordova.plugins.firebase.messaging.requestPermission(); 
    });
});

```

If you are not familiar with [Cordova](https://cordova.apache.org/) we suggest for you to look at their website for help. They have many [examples and plugins that you can use](https://cordova.apache.org/plugins/) 

If you get stuck or run into any errors please join the [Discord](https://discord.gg/bizelop) for assistance


# License

```
MIT License

Copyright (c) 2022 Bizelop Community Code

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```