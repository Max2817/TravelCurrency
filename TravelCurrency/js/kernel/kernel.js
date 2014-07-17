/// <reference path="kernelSpecific.js" />

// Structure contenant les informations de la session utilisateur
var session;

// Gestion des erreurs non interceptées
window.onerror = function (msg, url, num) {
    kernel.manageException({ message: kernelSpecific.getPageFromUrl(url) + " " + i18n["lblLigne"] + " " + num + " : " + msg });
    return true;
}

// Namespace kernel
var kernel = (function () {

    var busy = false;
    var busyFrom;
    var busyDefaultTimeout = 5000; // Le verrou est supprimé si l'application n'a pas répondu au bout de 2 secondes

    function replaceParamsInErrorMsg(/*@type(String)*/message, /*@type(Array)*/parameters) {
        for (var i = 0; i < parameters.length; i++) {
            var param = parameters[i];
            message = message.replace('[' + i + ']', param)
        }
        return message;
    }

    function getErrorsFiltre(/*@type(Datas.ServiceError[])*/ errors, /*@type(int)*/ filtre) {
        var array = new Array();
        for (var item in errors) {
            if (filtre == 0 && errors[item].attributeKey == Datas.ServiceError_MESSAGE_GLOBAL) {
                array.push(errors[item]);
            } else if (filtre == 1 && errors[item].attributeKey != Datas.ServiceError_MESSAGE_GLOBAL && errors[item].attributeKey != Datas.ServiceError_MESSAGE_GRAVE) {
                array.push(errors[item]);
            } else if (filtre == 2 && errors[item].attributeKey == Datas.ServiceError_MESSAGE_GRAVE) {
                array.push(errors[item]);
            }
        }
        return array;
    }

    function anim(el) {
        setTimeout(function () {
            el.style.display = "block";
            el.className = "scrollall enterPage_animElem";
        }, 5);
    }

    var arrayErrors = new Array();
    return {
        // Gère une exception bloquante inattendue 
        manageException: function (/*@exception*/ exception) {
            var now = new Date();
            var erreur = now.toLocaleString() + " : ";
            if (exception.stack)
                erreur += exception.stack;
            else
                erreur += exception.message;
            console.error(erreur);
            // On récupère l'état courant de la session
            // TODO tracer l'erreur dans un dump ou dans une table ou les deux
            kernelSpecific.popupException(erreur);
        },

        // Gère une exception bloquante inattendue 
        manageErrorWithPopUpOneButton: function (erreur, buttonName, validateCallBack, tempMsg) {
            //console.error(erreur);
            // On récupère l'état courant de la session
            // TODO tracer l'erreur dans un dump ou dans une table ou les deux
            kernelSpecific.popupOneButton(erreur, buttonName, validateCallBack, tempMsg);
        },

        // Anime une liste d'élément du DOM à l'affiche de la page
        enterPageAnimation: function (/*@String[]*/ DOMElementsId) {
            //var toAnimate=["section","navigation","header","precedent","baraction"];
            for (var i = 0; i < DOMElementsId.length; i++) {
                if (DOMElementsId[i] == "body") {
                    document.getElementsByTagName(DOMElementsId[i])[0].className = "enterPage_animElem";
                }
                else {
                    document.getElementById(DOMElementsId[i]).className = "scrollall enterPage_animElem";
                }
            }
        },

        // Anime une liste d'élément du DOM à l'update de la page
        updatePageAnimation: function (/*@String[]*/ DOMElementsId) {
            for (var i = 0; i < DOMElementsId.length; i++) {
                if (DOMElementsId[i] == "body") {
                    document.getElementsByTagName(DOMElementsId[i])[0].className = "";
                    setTimeout(function () { document.getElementsByTagName("body")[0].className = "enterPage_animElem"; }, 50);
                }
                else {
                    document.getElementById(DOMElementsId[i]).className = "scrollall";
                    document.getElementById(DOMElementsId[i]).style.display = "none";
                    anim(document.getElementById(DOMElementsId[i]));
                }
            }
        },
        doesConnectionExists: function() {
            var xhr = new XMLHttpRequest();
            var file = "http://www.kirupa.com/blank.png?rand=6544";
            var randomNum = Math.round(Math.random() * 10000);

            xhr.open('HEAD', file + "?rand=" + randomNum, false);

            try {
                xhr.send();

                if (xhr.status >= 200 && xhr.status < 304) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                return false;
            }
        },
        is_cached: function(img_url){
            var imgEle = document.createElement("img");
            imgEle.src = img_url;
            return imgEle.complete || (imgEle.width+imgEle.height) > 0;
        },
        // Gestion de la navigation
        navigate: function (/*@type(String)*/ url, /*@type(Variant)*/ params) {
            if (logLevel == logLevels.DEBUG) console.warn("navigate " + url);
            if (!kernel.isBusy()) {
                if (logLevel == logLevels.DEBUG) console.warn("navigate OK");
                kernel.setItBusy();

                if (kernelSpecific.getSpecificBaseFilePath() != null) {
                    url = kernelSpecific.getSpecificBaseFilePath() + url;
                }
                session.url = url;
                session.urlParams = params;

                window.sessionStorage.setItem("session", JSON.stringify(session));

                window.location = url;
            }
            else {
                console.warn("Application is busy - navigate bloqué : " + url);
            }
        },

        // Initialisation de la transaction
        initialize: function () {

            // On récupère la session dans le sessionStorage
            if (window.sessionStorage.getItem("session")) {
                session = JSON.parse(window.sessionStorage.getItem("session"));
            }
            else {
                session = {
                    "url": "",
                    "urlParams": "",
                    "sessionUser": "",
                    "AppExecutionState": ""
                };
            }

            if (logLevel == logLevels.DEBUG) console.warn("initialize" + session.url);

            // Lorsqu'on revient sur la page d'accueil, on nettoie la session
            if (session.url == "/pages/accueil/accueil.html") {
                session.EDL = null;
            }

            // On applique l'internationnalisation de la page sur l'ensemble des conteneurs exposant l'attribut data-label-id
            var conteneurs = ["title", "div", "span", "p", "button", "option", "label", "h3"];
            for (var c = 0; c < conteneurs.length; c++) {
                var elements = document.getElementsByTagName(conteneurs[c]);
                for (var e = 0; e < elements.length; e++) {
                    var labelId = elements[e].getAttribute("data-label-id");
                    if (labelId) {
                        if (_i18n[labelId])
                            elements[e].innerHTML = _i18n[labelId];
                        else if (i18n[labelId])
                            elements[e].innerHTML = i18n[labelId];
                        else
                            console.error("I18N - La ressource " + labelId + " n'a pas été définie sur la page " + session.url);
                    }
                }
            }

            // On appelle l'initialisation spécifique de la page
            try {
                initialize(session.urlParams, function () {
                    // On gère une restauration de contexte sur cette page
                    if (session.AppExecutionState == "restore") {
                        // On restaure l'état sauvegardé lors du déchargement de l'application
                        try {
                            restoreContext(JSON.parse(window.localStorage.getItem("context")));
                        } catch (exception) {
                            kernel.manageException(exception);
                        } finally {
                            session.AppExecutionState = "init";
                            window.localStorage.setItem("session", JSON.stringify(session));
                        }
                    }
                });
            } catch (exception) {
                kernel.manageException(exception);
            }

            // On gère automatiquement l'animation en entrée de page
            if (document.getElementById("navigation")) {
                kernel.enterPageAnimation(["section"]);
            }
            else if (document.getElementsByTagName("body")[0]) {
                kernel.enterPageAnimation(["body"]);
            }
        },

        navigateSinglePage: function (pageTemplate, pageControleur, params, endInitializeCallBack) {
            syncAPIHelper.loadApplicationFile({ url: pageTemplate }
                , function (response) {
                    var body = document.getElementsByTagName("body");
                    kernel.setContentToTagNameElement(body[0], response);
                    pageControleur.initialize(params, endInitializeCallBack);
                },
                function (error) {
                    kernel.error(error);
                }
            );
        },
        setContentToTagNameElement: function (element, content) {
            kernelSpecific.execUnsafeLocalFunction(
                function () {
                    element.innerHTML = content;
                }
                );
        }

    };
})();

