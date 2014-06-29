var syncAPIHelper = (function () {
    var _requestTimeOut = 30000;
    return {

        loadApplicationFile: function (parameters, successResponse, errorResponse) {

            var URL = parameters.url;
            var httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = function () {
                if (httpRequest.readyState === 4) {
                    if (httpRequest.status == 200) {
                        if (httpRequest.responseText && httpRequest.responseText.length > 0) {
                            var response = httpRequest.responseText;
                            successResponse(response);
                        }
                    } else {
                        //console.error(httpRequest.status);
                        if (httpRequest.status == 0)
                            errorResponse("Serveur de synchronisation indisponible - " + URL);
                        else if (httpRequest.status == 404)
                            errorResponse("Erreur 404 : l'URL demandée sur le serveur est introuvable - " + URL);
                        else if (httpRequest.status == 500)
                            errorResponse("Erreur 500 : Dysfonctionnement du serveur - " + URL);
                        else if (httpRequest.status == 503)
                            errorResponse("Erreur 503 : Service indisponible - " + URL);
                        else if (httpRequest.status)
                            errorResponse("Erreur " + httpRequest.status + " détectée, impossible de poursuivre la demande - " + URL);
                        else
                            errorResponse(httpRequest.responseText + " Vérifiez vos paramètres de connexion -  " + URL);
                    }
                }
            }; 

            httpRequest.open("GET", URL, false);
            httpRequest.setRequestHeader("Content-type", "text/html; charset=utf-8");
            httpRequest.timeout = _requestTimeOut;
            httpRequest.send();
        }
    };
})();