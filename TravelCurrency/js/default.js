/// <reference path="helpers/dataHelper.js" />
/// <reference path="helpers/uiHelper.js" />
/// <reference path="helpers/q.js" />
/// <reference path="helpers/formatHelper.js" />
/// <reference path="helpers/apiHelper.js" />
/// <reference path="kernel/kernel.js" />

(function () {
    //"use strict";
    var onlineConnect = navigator.onLine;
    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    WinJS.strictProcessing();
    Windows.UI.WebUI.WebUIApplication.addEventListener("activated", function activatedHandler(args) {
        Windows.UI.WebUI.WebUIApplication.removeEventListener("activated", arguments.callee, false);

        if (args.kind == activation.ActivationKind.launch) {
            if (args.previousExecutionState !== Windows.ApplicationModel.Activation.ApplicationExecutionState.terminated) {
                setTimeout(function () {
                    //Suppress old files
                    apiHelper.deleteLocalFolderItems();
                    checkDownloadedData(
                        function () {
                            kernel.navigateSinglePage("/js/pages/taux/listeTaux.html", taux); //template, page controler
                        },
                        function () {
                            downloadData(function () {
                                kernel.navigateSinglePage("/js/pages/taux/listeTaux.html", taux); //template, page controler
                            },
                            function () {
                                kernel.manageException(_i18n.lblConnectionProblem);
                            });
                        }
                    );
                }, 1000);
                
                
            }
        } else {
            kernel.navigate("/pages/connexion/connexion.html", UserService.isUsers());
        }
    });
    app.onsettings = function (args) {
        args.detail.applicationcommands = {
            "privid": {
                title: "Privacy Policy", href: "js/pages/settings/privacy.html"
            }
        };
        WinJS.UI.SettingsFlyout.populateSettings(args);
    };
    app.start();
})();



function downloadData(successCallBack, errorCallBack) {
    var online = navigator.onLine;
    if (kernel.doesConnectionExists()) {
        //getting all data with promises
        Q.all([
            dataHelper.downloadNewTaux(),
            dataHelper.downloadOldTaux(),
            dataHelper.enregistrementPhotos()
        ]).spread(function (result1, result2, result3) {
            if (result1 == "OK" && result2 == "OK" && result3 == "OK") {
                successCallBack();
            } else {
                //TODO : launch downloading again
                errorCallBack();
            }
        },
        function (rep1, rep2) {
            if (rep1)
                console.log(rep1);
            if (rep2) {
                console.log(rep2);
            }
        }
        );
    } else {
        kernel.manageErrorWithPopUpOneButton(
            _i18n.lblConnectInternet,
            _i18n.lblRetry,
            //En cas de validation rappeler le downloadData
            function () {
                if (document.getElementById("popup_temp_msg"))
                    document.getElementById("popup_temp_msg").innerText = _i18n.lblNewAttempt;
                setTimeout(function () { downloadData(); }, 3000);
            },
            _i18n.lblConnectionFailed
        );
    }
}
//check if files are already downloaded, if true no need to download again
function checkDownloadedData(successCallBack, errorCallBack) {
    var params = new Object();
    apiHelper.getAppFileByName(formatHelper.getDateYYYYMMDD().toString(),
        function () {
            apiHelper.getAppFileByName("old",
                function () {
                    apiHelper.getAppFileByName("url_photos",
                        function () {
                            successCallBack();
                        },
                        function (error) {
                            errorCallBack();
                        }
                    );
                },
                function (error) {
                    errorCallBack();
                }
            );
        },
        function (error) {
            errorCallBack();
        }
    );
    return true;
}