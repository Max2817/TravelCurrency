/// <reference path="kernelSpecific.js" />

// Gestion des erreurs non interceptées
window.onerror = function (msg, url, num) {
    kernel.manageException({ message: kernelSpecific.getPageFromUrl(url) + " " + i18n["lblLigne"] + " " + num + " : " + msg });
    return true;
}

// Namespace kernel
var kernel = (function () {

    var busy = false;
    var busyFrom;
    var busyDefaultTimeout = 5000; // Locker is suppressed if not responding by this time

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
        
        manageException: function (/*@exception*/ exception) {
            var now = new Date();
            var erreur = now.toLocaleString() + " : ";
            if (exception.stack)
                erreur += exception.stack;
            else
                erreur += exception.message;
            console.error(erreur);
            kernelSpecific.popupException(erreur);
        },

        // Manage unexpected blocking error 
        manageErrorWithPopUpOneButton: function (erreur, buttonName, validateCallBack, tempMsg) {
            kernelSpecific.popupOneButton(erreur, buttonName, validateCallBack, tempMsg);
        },
        //check connection
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
        // Managing navigation
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

            // calling internationalization on data-label-id attributes of HTML elements
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

            // calling initialize function
            try {
                initialize(session.urlParams, function () {
                    // context restauration
                    if (session.AppExecutionState == "restore") {
                        // restore what was saved
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

