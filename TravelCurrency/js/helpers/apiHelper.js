//This bridge call all the WinJS Windows 8 functions
var apiHelper = (function () {
    var MAP_WIN_8_FRAME_URI = "ms-appx-web:///";
    var MAP_WIN_8_PAGE_URI = "ms-appx://";



    function _recursiveDeleteFile(index, listFile, successResponse, errorResponse) {
        if (index < listFile.length) {
            var fichier = listFile[index];

            apiHelper.deleteFile(fichier,
                function () {
                    index++;
                    _recursiveDeleteFile(index, listFile, successResponse, errorResponse);
                },
                errorResponse
            );
        } else {
            successResponse();
        }
    }

    return {

        openDocument: function (documentName) {
            Windows.Storage.ApplicationData.current.localFolder.getFileAsync(documentName).then(
        function (file) {
            // Set the show picker option
            var options = new Windows.System.LauncherOptions();
            options.displayApplicationPicker = true;
            // Launch the retrieved file using the selected app
            Windows.System.Launcher.launchFileAsync(file, options).then(
            function (success) {
                if (success) {
                    // File launched
                } else {
                    // File launch failed
                }
            });
        },
        function (error) {
            kernel.logError(error);
        });
        },


        getFileLink: function (/*@type(String)*/filePath, /*@type(function)*/ successResponse, /*@type(function)*/ errorResponse) {
            Windows.Storage.StorageFile.getFileFromPathAsync(filePath).done(
                function (file) {
                    successResponse(URL.createObjectURL(file, { oneTimeOnly: true }));
                },
                function (error) {
                    errorResponse(error);
                }
            );
        },

        getFile: function (/*@type(String)*/filePath, /*@type(function)*/ successResponse, /*@type(function)*/ errorResponse) {
            Windows.Storage.StorageFile.getFileFromPathAsync(filePath).done(
                function (file) {
                    successResponse(file);
                },
                errorResponse
            );
        },
        getAppFileByName: function (/*@type(String)*/fileName, /*@type(function)*/successResponse, /*@type(function)*/ errorResponse) {
            var localFolder = Windows.Storage.ApplicationData.current.localFolder;
            localFolder.getFileAsync(fileName).done(
                function (file) {
                    successResponse(file);
                },
                function (error) {
                    errorResponse();
                }
            );
        },

        deleteFile: function (/*@type(String)*/filePath, /*@type(function)*/ successResponse, /*@type(function)*/ errorResponse) {
            Windows.Storage.StorageFile.getFileFromPathAsync(filePath).done(
                function (file) {
                    file.deleteAsync().done(
                        function () {
                            successResponse();
                        },
                        errorResponse
                    );
                },
                errorResponse
            );

        },

        deleteListFile: function (listFile, /*@type(function)*/ successResponse, /*@type(function)*/ errorResponse) {
            _recursiveDeleteFile(0, listFile, successResponse, errorResponse);
        },

        //Display a pop-up : messagePoPUp, titrePopUp, lblFirstChoice, firstChoice (function), lblSecondChoice, secondChoice (function)
        startPopUpWithTwoChoice: function (parameters) {
            var msg = new Windows.UI.Popups.MessageDialog(parameters.messagePopUp, parameters.titrePopUp);
            var successCallback = function () { };
            msg.commands.append(new Windows.UI.Popups.UICommand(parameters.lblFirstChoice, function () { successCallback = parameters.firstChoice; }));
            msg.commands.append(new Windows.UI.Popups.UICommand(parameters.lblSecondChoice, function () { successCallback = parameters.secondChoice; }));
            msg.showAsync().done(function () {
                successCallback();
            });
        },

        encodeB64FromFilePath: function (filePath, successResponse, errorResponse) {
            apiHelper.getFile(
                filePath,
                function (file) {
                    file.openAsync(Windows.Storage.FileAccessMode.read).then(function (stream) {
                        var inputStream = stream.getInputStreamAt(0);
                        var reader = new Windows.Storage.Streams.DataReader(inputStream);
                        var size = stream.size;
                        var s = null;
                        if (size > 0) {
                            reader.loadAsync(size).then(function () {
                                var b = reader.readBuffer(size);
                                s = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(b);
                                successResponse(s);
                            });
                        }
                    });
                },
                errorResponse
            );
        },
        saveBase64File: function (fileName, fileContent, successResponse, errorResponse) {
            var decode = Windows.Security.Cryptography.CryptographicBuffer.decodeFromBase64String(fileContent);
            Windows.Storage.ApplicationData.current.localFolder.createFileAsync(fileName,
                Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                    var buffer = apiHelper.getBufferFromString(decode);
                    Windows.Storage.FileIO.writeBufferAsync(file, buffer).done(function () {
                        successResponse(file.path);
                    },
                    function (error) {
                        errorResponse(error)
                    });
                }
            );
        },
        //Save text file, return computer filepath
        saveTextFile: function (fileContent, successResponse, errorResponse) {
            Windows.Storage.ApplicationData.current.localFolder.createFileAsync(formatHelper.getUniqueId() + ".txt",
                Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                    var buffer = apiHelper.getBufferFromString(fileContent);
                    Windows.Storage.FileIO.writeBufferAsync(file, buffer).done(function () {
                        successResponse(file.path);
                    },
                    function (error) {
                        errorResponse(error)
                    });
                }
            );
        },
        saveFile: function (fileName, fileContent, successResponse, errorResponse) {
            Windows.Storage.ApplicationData.current.localFolder.createFileAsync(fileName,
                Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                    var buffer = apiHelper.getBufferFromString(fileContent);
                    Windows.Storage.FileIO.writeBufferAsync(file, buffer).done(function () {
                        successResponse();
                    },
                    function (error) {
                        errorResponse(error)
                    });
                }
            );
        },
        updateTextFile: function (filePath, fileContent, successResponse, errorResponse) {
            apiHelper.getFile(
                filePath,
                function (file) {
                    var buffer = apiHelper.getBufferFromString(fileContent);
                    Windows.Storage.FileIO.writeBufferAsync(file, buffer).done(function () {
                        successResponse();
                    },
                    function (error) {
                        errorResponse(error)
                    });
                }
            );
        },
        getBufferFromString: function (str) {
            var memoryStream = new Windows.Storage.Streams.InMemoryRandomAccessStream();
            var dataWriter = new Windows.Storage.Streams.DataWriter(memoryStream);
            dataWriter.writeString(str);
            var buffer = dataWriter.detachBuffer();
            dataWriter.close();
            return buffer;
        },
        
        readTextFile: function (filePath, successResponse, errorResponse) {
            apiHelper.getFile(
                filePath,
                function (file) {
                    Windows.Storage.FileIO.readBufferAsync(file).done(function (buffer) {
                        var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(buffer);
                        var fileContent = dataReader.readString(buffer.length);
                        dataReader.close();
                        successResponse(fileContent);
                    },
                    errorResponse);
                },
                errorResponse
            );
        },

        deleteLocalFolderItems: function () {
            var localFolder = Windows.Storage.ApplicationData.current.localFolder;
            localFolder.getItemsAsync().then(function (items) {
                items.forEach(function (item) {
                    //Suppress old files different from today, old, pref and url_photos
                    if (item.name != "old" && item.name != "url_photos" && item.name != "pref" && item.name != formatHelper.getDateYYYYMMDD().toString()) {
                        item.deleteAsync();
                    }
                });
            });
        },
        //Récup des infos réseau
        getNetworkInformation: function () {
            return Windows.Networking.Connectivity.NetworkInformation;
        },
        //récupère le type de connection (Ethernet, 3G, etc...)
        getInternetConnectionProfileInfo: function (networkInfo) {

            //Switch pour récup d'autres infos plus tard
            if (networkInfo == null)
                return _i18n.lblAucun;
            switch (networkInfo.getInternetConnectionProfile().networkAdapter.ianaInterfaceType) {
                case 6:
                    return _i18n.lblEthernet;
                case 71:
                    return _i18n.lblWifi;
                case 243:
                case 244:
                    return _i18n.Mobile;
            }

            return _i18n.Inconnue;
        },
        //permet d'être notifié si le réseau change (ex: 3G -> WiFi...)
        registerForNetworkStatusChangeNotif: function (netWorkInfo, onNetworkStatusChange) {
            netWorkInfo.addEventListener("networkstatuschanged", onNetworkStatusChange);
            return netWorkInfo;
        },
        //A appeler quand on ne souhaite plus utiliser la notification de changement de statut
        unRegisterForNetworkStatusChangeNotif: function (netWorkInfo, onNetworkStatusChange) {
            netWorkInfo.removeEventListener("networkstatuschanged", onNetworkStatusChange);
        }
    };
})();