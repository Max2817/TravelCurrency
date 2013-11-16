/**
* SPECIFIQUE WINDOWS 8
* Framework mobilité
*
* Nom du fichier : $Archive:   O:/Windows8/Elipso/archives/kernel_windows8/Elipso/kernel/kernel-specific.jsv  $
* Version        : $Revision:   1.6  $
* Auteur         : SOPRA Group - $Author:   lgardon  $
* Modifié le     : $Date:   Jan 14 2013 18:03:00  $
*/

//Register for the Suspending event and call suspendingHandler when received
Windows.UI.WebUI.WebUIApplication.addEventListener("suspending", suspendingHandler);
//Handle the suspending event and save the current user session using WinJS sessionState
function suspendingHandler(eventArgs) {
    //We are getting suspended
    console.info("L'application a été suspendue");
    window.localStorage.setItem("session", JSON.stringify(session));
    window.localStorage.setItem("context", JSON.stringify(saveContext()));
}

//Register for the Resuming event and call resumingHandler when received
Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", resumingHandler);
function resumingHandler() {
    //We are getting resumed, in general do nothing
    console.info("L'application a été réactivée");
}

var kernelSpecific = (function () {

    var isPopupErrorShown = false;

    return {
        // Affiche la popup standard de gestion d'anomalie
        popupError: function (/*@type(String)*/ erreur, /*@type(String)*/ currentContext, /*@type(String)*/ currentSession) {
            if (!isPopupErrorShown) {
                isPopupErrorShown = true;
                var msg = new Windows.UI.Popups.MessageDialog(i18n["msgErreurMessage"], i18n["msgErreur"]);
                // S'il n'y a pas de session active on se redirige vers l'écran de connexion
                if (!session.sessionUser || session.sessionUser == "")
                    msg.commands.append(new Windows.UI.Popups.UICommand(i18n["lblRetourAccueil"], function () { setTimeout(kernel.navigate("/pages/connexion/connexion.html", {}), 10); }));
                else
                    msg.commands.append(new Windows.UI.Popups.UICommand(i18n["lblRetourAccueil"], function () { setTimeout(kernel.navigate("/pages/accueil/accueil.html", {}), 10); }));
                msg.commands.append(new Windows.UI.Popups.UICommand(i18n["lblContinuer"], function () {
                    setTimeout(isPopupErrorShown = false, 10);
                }));
                msg.commands.append(new Windows.UI.Popups.UICommand(i18n["lblDetailErreur"], function () {
                    setTimeout(kernel.navigate("/pages/erreur/erreur.html", { erreur: erreur, context: currentContext, session: currentSession }), 10);
                }));
                msg.showAsync();
            }
            else {
                console.warn("L'erreur suivante n'a pas été affichée en popup : " + erreur);
            }
        },

        // Retourne le chemin racine de l'application
        getSpecificBaseFilePath: function () {
            return null;    //no use for windows 8
        },

        // Exécute la fonction sans les contraintes de sécurité liées à Windows 8
        execUnsafeLocalFunction: function (/*@type(function)*/ fonction) {
            MSApp.execUnsafeLocalFunction(function () {
                return fonction();
            });
        },

        // Extrait le chemin de la page sans racine spécifique
        getPageFromUrl: function (/*@type(String)*/ url) {
            // On cherche le premier / après ms-appx://xxx
            if (url.indexOf("/", 11) > 0)
                return url.substring(url.indexOf("/", 11));
            return url;
        },

    };
})();


