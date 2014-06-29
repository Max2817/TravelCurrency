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
                    checkDownloadedData(
                        function () {
                            kernel.navigateSinglePage("/js/pages/taux/listeTaux.html", taux); //template, controleur de ta page
                        },
                        function () {
                            downloadData(function () {
                                kernel.navigateSinglePage("/js/pages/taux/listeTaux.html", taux); //template, controleur de ta page
                            },
                            function () {
                                kernel.manageException("Problème de connexion");
                            });
                        }
                    );
                }, 1000);
                
                
            } else {
                // cette application a été réactivée après avoir été suspendue.
                console.info("restauration de l'application");
                session = JSON.parse(window.localStorage.getItem("session"));
                session.AppExecutionState = "restore";
                setTimeout(function () { kernel.navigate(session.url, session.urlParams); }, 500);
            }
        } else {
            kernel.navigate("/pages/connexion/connexion.html", UserService.isUsers());
        }
    });
    app.start();
})();



function downloadData(successCallBack, errorCallBack) {
    // console.log("Avant QAll" + new Date());
    var online = navigator.onLine;
    if (kernel.doesConnectionExists()) {

        Q.all([
            dataHelper.downloadNewTaux(),
            dataHelper.downloadOldTaux(),
            dataHelper.enregistrementPhotos()
        ]).spread(function (result1, result2, result3) {
            if (result1 == "OK" && result2 == "OK" && result3 == "OK") {
                //console.log("FIN récup de tout " + new Date());
                successCallBack();
            } else {
                //TODO : relancer les téléchargements
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
            "Pas de connexion. Veuillez connecter votre appareil à Internet",
            "Réessayer",
            //En cas de validation rappeler le downloadData
            function () {
                if (document.getElementById("popup_temp_msg"))
                    document.getElementById("popup_temp_msg").innerText = "Nouvelle tentative de connexion...";
                setTimeout(function () { downloadData(); }, 3000);
            },
            "Tentative de connexion échouée !"
        );
    }
}

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