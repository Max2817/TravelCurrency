// Pour obtenir une présentation du modèle Fractionner, consultez la documentation suivante :
// http://go.microsoft.com/fwlink/?LinkID=232447
(function () {
    //"use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    WinJS.strictProcessing();
    Windows.UI.WebUI.WebUIApplication.addEventListener("activated", function activatedHandler(args) {
        Windows.UI.WebUI.WebUIApplication.removeEventListener("activated", arguments.callee, false);

        if (args.kind == activation.ActivationKind.launch) {
            if (args.previousExecutionState !== Windows.ApplicationModel.Activation.ApplicationExecutionState.terminated) {
                // cette application vient d'être lancée. 
                console.info("Init de l'application");
                session.AppExecutionState = "init";
                kernel.setItFree();
                setTimeout(function () { window.location = "/js/pages/taux/liste_taux.html"; }, 100)
                //kernel.navigate("/js/pages/game/game.html", {}), 100);*/
                
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

//Initialisation des données avan
function initialize(urlParams) {
    if (urlParams.initBDD == "O") {
        if (!kernel.isBusy()) {
            kernel.setItBusy(30000); // On ne retire pas le verrou après les 2 secondes par défaut
            uiHelper.pushContent(waitMessage.id, _i18n.lblVeuillezPatienterConstructionDonnees);
            kernel.callTransactionalService(DbOpenHelper.populateDatas, { forcePopulate: "O" },
                function () {
                    kernel.setItFree();
                    kernel.navigate("/pages/connexion/connexion.html", {});
                },
                function (error) {
                    kernel.manageServiceError(error);
                    kernel.setItFree();
                }
            );
        }
    }
}

