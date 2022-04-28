var appDir = "";
(function () {
    "use strict";
    var localVersion = 0;
    //default version tracking locally starts at 0. AapVersion.txt on server should be greater than 0 for shell app to download

    var domain = "https://freeNFTMint.app/";
    //set domain to test with using 'download' which checks app version.txt from server is received and downloads new www.zip if first time or if an update is available 

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);
    function onDeviceReady() {

        appDir = cordova.file.dataDirectory;
        StatusBar.hide();
        swal({
            title: "type url to www.zip",
            text: "type url to www.zip",
            type: "input",
            showCancelButton: true,
            closeOnConfirm: false,
            inputPlaceholder: ""
        }, function (inputValue) {
            if (inputValue === false) return false;
            if (inputValue === "") {
                swal.showInputError("You need to write something!");
                return false
            }
            if (inputValue == 'prod') {
                //force gets production from url and loads it into dev shell app
                deleteLocalAndGetLatest();
            }
            else if (inputValue != 'download') {
                //loads from testing domain or run ip address if local server http://192.168.1.168/dapp
                inputValue = inputValue.endsWith('/') ? inputValue : inputValue + "/";
                domain = inputValue;
                deleteLocalAndGetLatest();
            }
            else {
                //test getting app version and downloading if an update is available
                $('#app').css('display', 'flex');
                try {
                    window.resolveLocalFileSystemURL(appDir + "www.zip", onSuccess, deleteLocalAndGetLatest);
                }
                catch (e) {
                    swal({
                        title: "Sorry, something went wrong",
                        text: "Please check your internet connection and try again later.",
                        type: "warning",
                        confirmButtonText: "Okay",
                        closeOnConfirm: true
                    },
                        function () {
                            if (navigator.app) {
                                navigator.app.exitApp();
                            } else if (navigator.device) {
                                navigator.device.exitApp();
                            } else {
                                window.close();
                            }
                        });
                }
            }
        });

        setTimeout(function () {
            $(".sweet-alert input").val("http://");
        }, 500);
    }




    function gotFile(fileEntry) {

        fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function (e) {
                localVersion = this.result;
                console.log(localVersion);

            };
            reader.readAsText(file);
        });
    }

    function fail(e) {
        console.log("FileSystem Error");
        console.dir(e);
    }

    function CopyCordovaJS(callback) {
        window.resolveLocalFileSystemURL(appDir + "www",
            function onSuccess(dirEntry) {
                var appData = cordova.file.applicationDirectory;
                window.resolveLocalFileSystemURL(appData + "www/cordova.js", function (dir) { //copy cordova.js
                    console.log(dir)
                    dir.copyTo(dirEntry, "cordova.js", function (good) {
                        console.log("GOOD");
                        //inject cordova.js script tag into the index.html 
                        window.resolveLocalFileSystemURL(appDir + "www/index.html", function (fileEntry) {
                            console.log(fileEntry)
                            fileEntry.file(function (file) {
                                var reader = new FileReader();
                                reader.onloadend = function (e) {
                                    var htmlCode = this.result;
                                    htmlCode = htmlCode.replace("</body>", "<script src='cordova.js'></script></body>")
                                    fileEntry.createWriter(function (fileWriter) {
                                        fileWriter.onwriteend = function () {
                                            console.log("Successful file write...");
                                            callback();
                                        };
                                        fileWriter.onerror = function (e) {
                                            console.log("Failed file write: " + e.toString());
                                            fail();
                                        };
                                        fileWriter.write(htmlCode);
                                    });
                                };
                                reader.readAsText(file);
                            });
                        }, fail);
                    }, fail)
                }, fail);

            }, fail);
    }

    function CopyCordovaPluginsJS(callback) {
        window.resolveLocalFileSystemURL(appDir + "www",
            function onSuccess(dirEntry) {
                var appData = cordova.file.applicationDirectory;
                window.resolveLocalFileSystemURL(appData + "www/cordova_plugins.js", function (dir) { //copy cordova_plugins.js
                    console.log(dir)
                    dir.copyTo(dirEntry, "cordova_plugins.js", function (good) {
                        console.log("GOOD");
                        callback();
                    }, function (bad) {
                        console.log("BAD");
                    })
                }, function (er) {
                    console.log(er);
                });

            }, fail);
    }

    function CopyCordovaPluginsDir(callback) {
        window.resolveLocalFileSystemURL(appDir + "www",
            function onSuccess(dirEntry) {
                var appData = cordova.file.applicationDirectory;
                window.resolveLocalFileSystemURL(appData + "www/plugins", function (dir) { //copy cordova.js
                    console.log(dir)
                    dir.copyTo(dirEntry, "plugins", function (good) {
                        console.log("GOOD");
                        callback();
                    }, function (bad) {
                        console.log("BAD");
                        callback();
                    })
                }, function (er) {
                    console.log(er);
                });

            }, fail);
    }

    function CopyPluginsThenLoadIndex() {
        CopyCordovaJS(function () {
            CopyCordovaPluginsJS(function () {
                CopyCordovaPluginsDir(function () {
                    var indexURL = appDir + "www/index.html";
                    window.resolveLocalFileSystemURL(indexURL, function () {
                        //if index is available then inject cordova.js script tag into it

                        window.location.href = window.Ionic.WebView.convertFileSrc(indexURL)
                    }, deleteLocalAndGetLatest);
                });
            });
        });
    }

    function onSuccess() {
        //check if there is an update and if so download new zip and load index else load the index from storage.
        var localFile = appDir + "appVersion.txt";

        window.resolveLocalFileSystemURL(localFile, gotFile, fail);
        var uri = domain + 'appVersion.txt?' + new Date().getTime();

        try {
            $.get(uri, function (res) {
                console.log(res);
                if (parseInt(res.toString()) > parseInt(localVersion.toString())) {
                    deleteLocalAndGetLatest(); // this will call and install new www folder
                }
                else {
                    try {
                        var indexURL = appDir + "www/index.html";
                        window.location.href = window.Ionic.WebView.convertFileSrc(indexURL)
                    }
                    catch (e) {
                        deleteLocalAndGetLatest(); // this will call and install new www folder
                    }
                }
            }).error(function (ex) {
                console.log(ex);
                tryLoadAppOffline();
            });
        }
        catch (ex) {
            console.log(ex);
            tryLoadAppOffline();
        }
    }

    function deleteLocalAndGetLatest() {
        window.resolveLocalFileSystemURL(appDir, function (dir) { //delete local zip file before downloading new one to ensure we get latest
            dir.getFile("www.zip", { create: false }, function (fileEntry) {
                fileEntry.remove(function () {
                    window.resolveLocalFileSystemURL(appDir + "www", function (dir) { //delete www files
                        dir.removeRecursively(function () {
                            console.log("Remove Recursively Succeeded");
                            DownloadApp();
                        }, DownloadApp);
                    }, DownloadApp);

                }, function (error) {
                    DownloadApp();
                }, function () {
                    DownloadApp();
                });
            }, function () {
                window.resolveLocalFileSystemURL(appDir + "www", function (dir) { //delete www files
                    dir.removeRecursively(function () {
                        console.log("Remove Recursively Succeeded");
                        DownloadApp();
                    }, DownloadApp);
                }, DownloadApp);
            });
        });

    }

    function DownloadApp() {
        $("#txtReady").fadeIn();
        swal.close();

        var fileTransfer = new FileTransfer();
        var wwwZipDownload = encodeURI(domain + "www.zip?" + new Date().getTime());
        var appVersionTxt = encodeURI(domain + "appVersion.txt?" + new Date().getTime());
        var appVersionLoc = appDir + "appVersion.txt";
        var wwwZipLocal = appDir + "www.zip";
        console.log(appDir);
        console.log('downloading');


        fileTransfer.onprogress = function (progressEvent) {
            var percent = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100) / 2);

            // Display progress in the console : 8% ...
            document.getElementById('progress').innerHTML = percent + "%";
            $(".received").css('width', percent + "%");
        };

        console.log('downloading');

        fileTransfer.download(
            appVersionTxt,
            appVersionLoc,
            function (entry) {
                console.log("downloaded txt file: " + entry.toURL());

                console.log(entry.toURL());
                // Path to the file

            },
            function (error) {
                swal({
                    title: "Sorry, something went wrong",
                    text: "Please check your internet connection and try again later.",
                    type: "warning",
                    confirmButtonText: "Okay",
                    closeOnConfirm: true
                },
                    function () {
                        if (navigator.app) {
                            navigator.app.exitApp();
                        } else if (navigator.device) {
                            navigator.device.exitApp();
                        } else {
                            window.close();
                        }
                    });
            },
            false,
            {
                headers: {
                }
            }
        );

        fileTransfer.download(
            wwwZipDownload,
            wwwZipLocal,
            function (entry) {
                console.log("download complete: " + entry.toURL());
                document.getElementById("txtReady").innerHTML = "Almost there";

                console.log(entry.toURL());
                // Path to the file
                var ZipPath = entry.toURL();
                // Path of the destination folder
                var ZipExtractDirectory = appDir;

                // Handle the result of the process
                var StatusCallback = function (status) {
                    if (status == 0) {
                        // Everything OK
                        CopyPluginsThenLoadIndex();

                    } else if (status == -1) {
                        // Everything is wrong ...
                        deleteLocalAndGetLatest();
                    }
                };

                // Handle the progress of the decompression
                var ProgressCallback = function (progressEvent) {

                    var percent = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100) / 2) + 50;

                    // Display progress in the console : 8% ...
                    document.getElementById('progress').innerHTML = percent + "%";
                    $(".received").css('width', percent + "%");
                };

                // Unzip it !
                window.zip.unzip(ZipPath, ZipExtractDirectory, StatusCallback, ProgressCallback);
            },
            function (error) {
                swal({
                    title: "Sorry, something went wrong",
                    text: "Please check your internet connection and try again later.",
                    type: "warning",
                    confirmButtonText: "Okay",
                    closeOnConfirm: true
                },
                    function () {
                        if (navigator.app) {
                            navigator.app.exitApp();
                        } else if (navigator.device) {
                            navigator.device.exitApp();
                        } else {
                            window.close();
                        }
                    });
            },
            false,
            {
                headers: {
                }
            }
        );



    }
})();
