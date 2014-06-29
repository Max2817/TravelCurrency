/**
* Librairie liée aux API
* Nom du fichier : $Archive:   O:/Windows8/Elipso/archives/kernel_windows8/Elipso/helpers/apiHelper.jsv  $
* Version        : $Revision:   1.34  $
* Auteur         : SOPRA Group - $Author:   nMartino  $
* Modifié le     : $Date:   Jul 17 2013 16:47:24  $
*/
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

        // Lance la carte Google Map
        initMapAPI: function (/*@type(String)*/ id, /*@type(String)*/ frameURI) {
            document.getElementById(id).setAttribute("src", MAP_WIN_8_FRAME_URI + frameURI);
        },

        // Ouvre l'écran de prise de photo et transmet le chemin vers la photo au callback
        getPicture: function (/*@type(function)*/ successResponse, cancelResponse) {
            // Documentation de l'API sous http://msdn.microsoft.com/en-us/library/windows/apps/br241030.aspx
            var camera = new Windows.Media.Capture.CameraCaptureUI();
            camera.photoSettings.allowCropping = false;
            camera.photoSettings.maxResolution = Windows.Media.Capture.CameraCaptureUIMaxPhotoResolution.smallVga;
            camera.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo).then(function (storageFile) {
                if (storageFile)
                    successResponse(storageFile.path);
                else
                    cancelResponse();
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

        setDatePicker: function (/*@type(DOM Element)*/ datePickerElement, /*@type(function)*/ onChangeFunction, /*@type(String)*/ specifiedDate) {
            //Si une date a été spécifiée on l'affiche sinon ce sera la date du jour
            //specifiedDate est sous la forme 'JJ/MM/AAAA'
            var datePickerControl = null;
            if (elipsoHelper.isEmpty(specifiedDate)) {
                datePickerControl = new WinJS.UI.DatePicker(datePickerElement);
            } else {
                //Passage au format anglais
                specifiedDate = specifiedDate.split("/")[1] + "/" + specifiedDate.split("/")[0] + "/" + specifiedDate.split("/")[2];
                datePickerControl = new WinJS.UI.DatePicker(datePickerElement, { current: specifiedDate });
            }
            datePickerControl.datePattern = "{day.integer(2)}";
            datePickerControl.monthPattern = "{month.integer(2)}";
            // Connect event listener
            datePickerControl.element.addEventListener(
                "change",
                function () {
                    var jour = datePickerControl.current.getDate();
                    if (jour < 10) {
                        jour = "0" + jour;
                    }
                    var mois = (datePickerControl.current.getMonth() + 1);
                    if (mois < 10) {
                        mois = "0" + mois;
                    }
                    onChangeFunction(jour + "/" + mois + "/" + datePickerControl.current.getFullYear(), datePickerElement);
                }
            );
        },
        disableDatePicker: function (/*@type(DOM Element)*/ datePickerElement) {
            var datePickerControl = new WinJS.UI.DatePicker(datePickerElement);
            datePickerControl.datePattern = "{day.integer(2)}";
            datePickerControl.monthPattern = "{month.integer(2)}";
            datePickerControl.disabled = true;
        },
        enableDatePicker: function (/*@type(DOM Element)*/ datePickerElement) {
            var datePickerControl = new WinJS.UI.DatePicker(datePickerElement);
            datePickerControl.datePattern = "{day.integer(2)}";
            datePickerControl.monthPattern = "{month.integer(2)}";
            datePickerControl.disabled = false;
        },
        setTimePicker: function (/*@type(DOM Element)*/ timePickerElement, /*@type(function)*/ onChangeFunction, /*@type(String)*/ specifiedTime) {
            var timePickerControl = null;
            if (elipsoHelper.isEmpty(specifiedTime)) {
                timePickerControl = new WinJS.UI.TimePicker(timePickerElement);
            } else {
                specifiedTime = specifiedTime.split("h")[0] + ":" + specifiedTime.split("h")[1] + ":00";
                timePickerControl = new WinJS.UI.TimePicker(timePickerElement, { current: specifiedTime });
            }
            timePickerControl.minuteIncrement = 5;
            timePickerControl.hourPattern = "{hour.integer(2)}";
            // Connect event listener
            timePickerControl.element.addEventListener(
                "change",
                function () {
                    var heure = timePickerControl.current.getHours();
                    if (heure < 10) {
                        heure = "0" + heure;
                    }
                    var minute = timePickerControl.current.getMinutes();
                    if (minute < 10) {
                        minute = "0" + minute;
                    }
                    onChangeFunction(heure + "h" + minute);
                }
            );
        },

        //Affiche une pop up et prend en parametre : messagePoPUp, titrePopUp, lblFirstChoice, firstChoice (function), lblSecondChoice, secondChoice (function)
        startPopUpWithTwoChoice: function (parameters) {
            var msg = new Windows.UI.Popups.MessageDialog(parameters.messagePopUp, parameters.titrePopUp);
            var successCallback = function () { };
            msg.commands.append(new Windows.UI.Popups.UICommand(parameters.lblFirstChoice, function () { successCallback = parameters.firstChoice; }));
            msg.commands.append(new Windows.UI.Popups.UICommand(parameters.lblSecondChoice, function () { successCallback = parameters.secondChoice; }));
            msg.showAsync().done(function () {
                successCallback();
            });
        },

        initPrint: function (fileName) {
            var printManager = Windows.Graphics.Printing.PrintManager.getForCurrentView();
            printManager.onprinttaskrequested = onPrintTaskRequested;
            function onPrintTaskRequested(printEvent) {
                printEvent.request.createPrintTask(fileName, function (args) {
                    args.setSource(MSApp.getHtmlPrintDocumentSource(document));
                });
            }
        },
        printHandler: function () {
            window.document.body.onbeforeprint = function () { };
            window.document.body.onafterprint = function () { };

            Windows.Graphics.Printing.PrintManager.showPrintUIAsync();
        },
        
        addUserAccountInPasswordVault: function (username, password) {
            var resource = "DEFAULT";
            var vault = new Windows.Security.Credentials.PasswordVault();
            var cred = new Windows.Security.Credentials.PasswordCredential(resource, username, password);
            vault.add(cred);
        },
        //renvoi une liste d'objets (resource, username)
        getUserAccountListFromPasswordVault: function () {
            var vault = new Windows.Security.Credentials.PasswordVault();
            var creds = vault.retrieveAll();
            var userList = new Array();
            for (var j = 0; j < creds.size; j++) {
                creds.getAt(j).retrievePassword();
                var usr = new Datas.User(creds.getAt(j).userName, creds.getAt(j).userName, creds.getAt(j).password, creds.getAt(j).resource, "", "", "", "O");
                userList.push(usr);
            }
            return userList;
        },

        //renvoi le user stocké en passwordVault
        getUserAccount: function (userName) {
            var resource = "DEFAULT";
            var vault = new Windows.Security.Credentials.PasswordVault();
            var cred = vault.retrieve(resource, userName);
            cred.retrievePassword();
            return cred;
        },

        deleteAllUserAccountList: function () {
            var vault = new Windows.Security.Credentials.PasswordVault();
            var creds = vault.retrieveAll();
            for (var i = 0; i < creds.size; i++) {
                try {
                    vault.remove(creds.getAt(i));
                }
                catch (e) { // Remove is best effort
                }
            }
        },

        changeUserAccount: function (userName, newPassword) {
            var resource = "DEFAULT";
            var vault = new Windows.Security.Credentials.PasswordVault();
            var cred = vault.retrieve(resource, userName);
            vault.remove(cred);
            var newCred = new Windows.Security.Credentials.PasswordCredential(resource, userName, newPassword);
            vault.add(newCred);
        },
        //return true or false
        verifyUserAccount: function (userName, password) {
            var resource = "DEFAULT";
            var vault = new Windows.Security.Credentials.PasswordVault();
            var cred = vault.retrieve(resource, userName);
            if (cred) {
                cred.retrievePassword();
                if (cred.resource === resource && cred.userName === userName && cred.password === password)
                    return true;
                else
                    return false;
            } else {
                return false;
            }
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
        //Sauvegarde un fichier texte et retourne son emplacement sur la machine
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
                    Windows.Storage.FileIO. writeBufferAsync(file, buffer).done(function () {
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
        //lecture d'un fichier texte
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

        // Ecrit un buffer de log dans le fichier de log courant
        logToFile: function (/*@String*/ logBuffer, /*@function*/ successResponse, /*@function*/ errorResponse) {
            if (logBuffer) {
                var now = new Date();
                Windows.Storage.ApplicationData.current.localFolder.createFileAsync('' + now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2) + '.log',
                    Windows.Storage.CreationCollisionOption.openIfExists).then(function (file) {
                        Windows.Storage.FileIO.appendTextAsync(file, session.logBuffer).done(function () {
                            if (successResponse)
                                successResponse();
                        },
                        function (error) {
                            kernel.logWarn("Erreur lors de l'écriture du buffer de log");
                            if (errorResponse)
                                errorResponse(error);
                        });
                    }
                );
            }
            else {
                if (successResponse)
                    successResponse();
            }
        },

        getListLogFileItems: function (localFolder, successResponse, errorResponse) {
            var fileItems = new Array();

            if(localFolder == null)
                localFolder = Windows.Storage.ApplicationData.current.localFolder;

            var count = 0;
            localFolder.getItemsAsync().then(function (items) {
                count = items.length;
                items.forEach(function (item) {
                    if (item.fileType == ".log") {
                        apiHelper.readBytesFile(item.path,
                            function (bytes) {
                                fileItems.push({
                                    "path": item.path,
                                    "fileName": item.name,
                                    "datas": bytes
                                });

                                count--;
                                if (count == 0)
                                    successResponse(fileItems);

                            },
                            function (error) {
                                kernel.logError("Récupération du fichier de log impossible : " + item.path + " avec : " + error);
                            }
                        );
                    } else {
                        count--;
                        if (count == 0)
                            successResponse(fileItems);

                    }
                });
            });
        },

        readBytesFile: function (filePath, successResponse, errorResponse) {
            apiHelper.getFile(
                filePath,
                function (file) {
                    Windows.Storage.FileIO.readBufferAsync(file).done(function (buffer) {
                        var bytes = new Array(buffer.length);
                        var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(buffer);
                        dataReader.readBytes(bytes);
                        dataReader.close();

                        successResponse(bytes);
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
                    //Suppression des editions,
                    if (item.fileType == ".txt" || item.isOfType(Windows.Storage.StorageItemTypes.folder) || item.fileType == ".gif") {
                        item.deleteAsync();
                    }
                });
            });
        },
        //Récup des infos réseau
        getNetworkInformation: function(){
            return Windows.Networking.Connectivity.NetworkInformation;
        },
        //récupère le type de connection (Ethernet, 3G, etc...)
        getInternetConnectionProfileInfo: function (networkInfo) {

            //Switch pour récup d'autres infos plus tard
            if (networkInfo == null)
                return _i18n.lblAucun;
            switch (networkInfo.getInternetConnectionProfile().networkAdapter.ianaInterfaceType)
            {
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