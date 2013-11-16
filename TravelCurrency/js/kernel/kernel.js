/**
* Framework mobilité
*
* Nom du fichier : $Archive:   O:/Windows8/Elipso/archives/Elipso/kernel/kernel.jsv  $
* Version        : $Revision:   1.47  $
* Auteur         : SOPRA Group - $Author:   lgardon  $
* Modifié le     : $Date:   Feb 06 2013 15:39:24  $
*/

// Structure contenant les informations de la session utilisateur
var session;
var logLevels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
var logLevel = logLevels.INFO;

// Appel de l'initialisation spécifique de chaque page
document.addEventListener("DOMContentLoaded", function () {
    //        document.removeEventListener("DOMContentLoaded", arguments.callee, false);
    kernel.initialize();
}, false);

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
            // On supprime un éventuel verrou de traitement qui ne sera jamais retiré
            kernel.setItFree();
            var now = new Date();
            var erreur = now.toLocaleString() + " " + session.url + " : ";
            if (exception.stack)
                erreur += exception.stack;
            else
                erreur += exception.message;
            console.error(erreur);
            // On récupère l'état courant de la session
            // On copie la session puis on la filtre les éléments de la session que ne souhaite pas tracer en cas d'erreur
            var currentSession = JSON.parse(JSON.stringify(session));;
            var filtre = ["snappedEDL", "snappedPlanning"];
            for (var i = 0; i < filtre.length; i++)
                if (currentSession[filtre[i]])
                    delete currentSession[filtre[i]];
            // On tente une récupération des informations saisies sur la page
            var currentContext = "";
            try { currentContext = JSON.stringify(saveContext()); } catch (e) { }

            // TODO tracer l'erreur dans un dump ou dans une table ou les deux
            kernelSpecific.popupError(erreur, currentContext, JSON.stringify(currentSession));
        },

        // Indique si l'application est en train de gérer une action
        isBusy: function () {
            if (logLevel == logLevels.DEBUG) console.warn("isBusy " + busy);
            return busy;
        },

        // Indique si l'application est en train de gérer une action
        setItBusy: function (/*@int*/ timeout) {
            // Si l'application est déjà occupée on ne fait car c'est l'appel englobant qui supprimera le verrou
            if (logLevel == logLevels.DEBUG) console.warn("setItBusy");
            if (!busy) {
                busy = true;
                busyFrom = new Date().getTime();
                if (logLevel == logLevels.DEBUG) { try { throw new Error(""); } catch (exception) { console.warn("setItBusy with id  " + busyFrom + "\n" + exception.stack); } }
                // On conserve l'heure de début afin de savoir si c'est bien toujours le même verrou qui est positionné
                var currentBusyFrom = busyFrom;
                // On affiche la busy ring
                if (document.getElementById("busyRing")) {
                    document.getElementById("busyRing").style.display = "";
                }
                else {
                    var busyRing = document.createElement("progress");
                    busyRing.id = "busyRing";
                    busyRing.className = "win-ring";
                    document.body.appendChild(busyRing);
                }

                // On planifie un retrait automatique du verrou afin de ne pas bloquer l'application si un cas non prévu survient
                // Une durée d'attente spéciale peut être passée en paramètre
                if (timeout)
                    setTimeout(function () {
                        if (busy && currentBusyFrom == busyFrom) {
                            console.error("Release busy state " + currentBusyFrom);
                            kernel.setItFree();
                        }
                    }, timeout);
                else
                    setTimeout(function () {
                        if (busy && currentBusyFrom == busyFrom) {
                            console.error("Release busy state " + currentBusyFrom);
                            kernel.setItFree();
                        }
                    }, busyDefaultTimeout);

                // On retourne l'heure de début d'action afin de pouvoir en controler la fin 
                return busyFrom;
            }
            else {
                try {
                    throw new Error("Page " + session.url + ". L'appel au kernel.setItBusy() a été réalisé alors que kernel.isBusy() (Cf kernel.isBusy() / kernel.setItBusy() / kernel.setItFree()) : ");
                } catch (ex) { console.error(ex.stack); }
            }
        },

        // Indique si l'application est en train de gérer une action
        setItFree: function (/*@DateTime*/ id) {
            if (logLevel == logLevels.DEBUG) console.warn("setItFree");
            if (document.getElementById("busyRing")) // On masque la busy ring
                document.getElementById("busyRing").style.display = "none";
            if (id) {
                // On retire le verrou uniquement si le token est bien le dernier en place
                if (id == busyFrom)
                    busy = false;
            }
            else // Si on ne précise pas le token du verrou à retirer on le retire de force
                busy = false;
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

        callService: function (serviceCall, parameters, successResponse, errorResponse) {
            if (logLevel == logLevels.DEBUG) console.warn("callService");
            // L'appel d'un service doit toujours être réalisé après avoir posé un verrou.
            if (!kernel.isBusy()) {
                try {
                    throw new Error("Page " + session.url + ". L'appel au service suivant devrait être réalisé en mode protégé (Cf kernel.isBusy() / kernel.setItBusy() / kernel.setItFree()) : ");
                } catch (ex) { console.error(ex.stack); }
            }
            if (dbHelper.isBusyCnx() == false) {
                if (logLevel == logLevels.DEBUG) console.warn("callService OK");
                dbHelper.opendatabase(
                    function (db) {
                        var cnx = dbHelper.cnx(db);
                        try {
                            serviceCall(cnx, parameters,
                                function (datas) {
                                    dbHelper.closedatabase(db);
                                    try {
                                        successResponse(datas);
                                    } catch (exception) {
                                        kernel.manageException(exception);
                                    }
                                },
                                function (errors) {
                                    dbHelper.closedatabase(db);
                                    try {
                                        errorResponse(errors);
                                    } catch (exception) {
                                        kernel.manageException(exception);
                                    }
                                }
                            );
                        } catch (exception) {
                            kernel.manageException(exception);
                        }
                    }
                );
            }
        },

        callTransactionalService: function (serviceCall, parameters, successResponse, errorResponse) {
            if (logLevel == logLevels.DEBUG) console.warn("callTransactionalService");
            // L'appel d'un service doit toujours être réalisé après avoir posé un verrou.
            if (!kernel.isBusy()) {
                try {
                    throw new Error("Page " + session.url + ". L'appel transactionnel au service suivant devrait être réalisé en mode protégé (Cf kernel.isBusy() / kernel.setItBusy() / kernel.setItFree()) : ");
                } catch (ex) { console.error(ex.stack); }
            }
            if (dbHelper.isBusyCnx() == false) {
                if (logLevel == logLevels.DEBUG) console.warn("callTransactionalService OK");
                // On prépare la pile d'appel en cas d'erreur car il sera trop tard pour la retrouver après l'exécution asynchrone de la transaction
                var currentStack;
                try { throw new Error(""); } catch (exception) { currentStack = exception.stack; }

                dbHelper.opendatabase(
                    function (db) {
                        var cnx = dbHelper.cnx(db);
                        cnx.openTransaction(
                            function () {
                                try {
                                    serviceCall(cnx, parameters,
                                        function (datas) {
                                            cnx.closeTransaction(
                                                function () {
                                                    dbHelper.closedatabase(db);
                                                    try {
                                                        successResponse(datas);
                                                    } catch (exception) {
                                                        kernel.manageException(exception);
                                                    }
                                                },
                                                function (errors) {
                                                    dbHelper.closedatabase(db);
                                                    try {
                                                        errorResponse(errors);
                                                    } catch (exception) {
                                                        kernel.manageException(exception);
                                                    }
                                                }
                                            );
                                        },
                                        function (errors) {
                                            dbHelper.closedatabase(db);
                                            try {
                                                errorResponse(errors);
                                            } catch (exception) {
                                                kernel.manageException(exception);
                                            }
                                        }
                                    );
                                } catch (exception) {
                                    var message = exception.message + " sur la page " + session.url + " sur l'appel de service avec les paramètres " + JSON.stringify(parameters);
                                    kernel.manageException({ message: message, stack: message + "\n" + exception.stack + "\n" + currentStack });
                                }
                            },
                            function (errors) {
                                dbHelper.closedatabase(db);
                                try {
                                    errorResponse(errors);
                                } catch (exception) {
                                    kernel.manageException(exception);
                                }
                            }
                        );
                    },
                    function (errors) {
                        dbHelper.closedatabase(db);
                        try {
                            errorResponse(errors);
                        } catch (exception) {
                            kernel.manageException(exception);
                        }
                    }
                );
            }
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

        // Gestion des erreurs de services
        manageServiceError: function (/*@type(Datas.ServiceError[])*/ error) {
            try {
                //-------------- On efface les anciennes erreurs potentielles
                if (arrayErrors != null && arrayErrors.length > 0) {
                    //globale
                    uiHelper.pushContent("kernel_errorGlobal", "");
                    //cible
                    for (var index in arrayErrors) {
                        var item = arrayErrors[index];
                        var element = document.getElementById(item.attributeKey);
                        if (element) {
                            uiHelper.pushContent(item.attributeKey, "");
                            element.className = "error";
                        }
                    }

                    arrayErrors = [];
                }

                //------------------------------------------
                if (error) {
                    //------------ passage sous forme de tableau ----

                    if (error instanceof Array) {
                        for (var item in error) {
                            var temp = error[item];
                            arrayErrors.push(temp);
                        }
                    } else {
                        arrayErrors.push(error);
                    }

                    //--------- recuperation des message i18n
                    for (var item in arrayErrors) {
                        var error = arrayErrors[item];
                        if (error.messageKeyI18n) {
                            var message = error.messageKeyI18n;
                            if (_i18n[error.messageKeyI18n]) {
                                message = _i18n[error.messageKeyI18n];
                            } else if (i18n[error.messageKeyI18n]) {
                                message = i18n[error.messageKeyI18n];
                            }
                            arrayErrors[item].message = replaceParamsInErrorMsg(message, arrayErrors[item].arrayParameters);
                        }
                    }

                    //--------- filtre erreurs globale et erreur cible --
                    var arrayErrorsGlobal = getErrorsFiltre(arrayErrors, 0);
                    var arrayErrorsCible = getErrorsFiltre(arrayErrors, 1);
                    var arrayErrorsGrave = getErrorsFiltre(arrayErrors, 2);

                    //----------- generation des erreurs graves ----
                    if (arrayErrorsGrave.length > 0) {
                        kernelSpecific.popupError(" Des erreurs graves ont été détectées : " + JSON.stringify(arrayErrorsGrave));
                        return;
                    }

                    //----------- generation du template d'error global ----
                    var element = document.getElementById("kernel_errorGlobal");
                    if (element)
                        element.innerHTML = kernel_template.getErrorGlobalTemplate(arrayErrorsGlobal);
                    else
                        console.error("l'element nommé 'kernel_errorGlobal' n'est pas présent dans la page. Veuillez le positionner dans votre page .html");

                    //---------- positionnement des erreurs cibles
                    for (var item in arrayErrorsCible) {
                        var error = arrayErrorsCible[item];
                        var element = document.getElementById(error.attributeKey);
                        if (element) {
                            element.className = "error show";
                            element.innerHTML = error.message;

                        } else {
                            console.error("l'element nommé '" + error.attributeKey + "' n'est pas présent dans la page. Veuillez le positionner dans votre page .html");
                        }
                    }
                }
            } catch (exception) {
                //kernelSpecific.popupError("Le traitement des messages utilisateur a levé une exception de type : " + exception + " avec l'erreur initiale ci-jointe : " + JSON.stringify(error));
                kernel.manageException(exception);
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

            // TOTO Isoler le spécifique Elispo dans un appHelper.preinitialise() et appHelper.postinitialise()

            // On prépare l'affichage snapped de manière global
            var snappedDiv = document.createElement("div");
            snappedDiv.id = "snappedDiv";
            document.body.appendChild(snappedDiv);
           
            // On gère automatiquement le bouton back
            if (document.getElementById("precedent")) {
                document.getElementById("precedent").addEventListener("click", function () {
                    try {
                        // Si une action spécifique a été définie sur la page alors on l'appelle avant de naviguer
                        beforeNavigate(goBackURL);
                    }
                    catch (e) {
                        // On navigue directement car la fonction beforeNavigate n'a pas été définie sur la page
                        goBackURL();
                    }
                });
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
                    // Si l'EDL est cloturé ou annulé alors on adapte les champs de saisie et les boutons de manière générale
                    if (elipsoHelper)
                        elipsoHelper.desactiveEDLClotured();
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

    };
})();

