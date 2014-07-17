
var kernelSpecific = (function () {

    return {
        // Affiche la popup standard de gestion d'anomalie
        popupException: function (/*@type(String)*/ erreur) {
            syncAPIHelper.loadApplicationFile({ url: "/js/pages/exception/exception.html" }
                , function (response) {
                    kernel.setContentToTagNameElement(document.getElementById("erreur"), response);
                    kernel.setContentToTagNameElement(document.getElementById("exception_title"), "Oups, il semble que nous soyons tombés sur une erreur !");
                    kernel.setContentToTagNameElement(document.getElementById("exception_content"), erreur);
                    document.getElementById("modal-outer").style.display = "block";
                },
                function (error) {
                    console.log(error);
                }
            );
            
           // setTimeout(kernel.navigate("/pages/erreur/erreur.html", { erreur: erreur, context: currentContext, session: currentSession }), 10);
        },

        popupOneButton: function (/*@type(String)*/ erreur, buttonName, validateCallBack, tempMsg) {
            syncAPIHelper.loadApplicationFile({ url: "/js/pages/popup/popup.html" }
                , function (response) {
                    kernel.setContentToTagNameElement(document.getElementById("erreur"), response);
                    kernel.setContentToTagNameElement(document.getElementById("popup_title"), "Oups, il semble que nous soyons tombés sur une erreur !");
                    kernel.setContentToTagNameElement(document.getElementById("popup_content"), erreur);
                    if (tempMsg)
                        kernel.setContentToTagNameElement(document.getElementById("popup_temp_msg"), tempMsg);
                    document.getElementById("modal-outer").style.display = "block";
                    document.getElementById("validate_button").innerText = buttonName;
                    document.getElementById("validate_button").addEventListener('click',
                        function () {
                            validateCallBack();
                        },
                        false
                    );
                },
                function (error) {
                    kernelSpecific.popupException(error);
                }
            );

            // setTimeout(kernel.navigate("/pages/erreur/erreur.html", { erreur: erreur, context: currentContext, session: currentSession }), 10);
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


