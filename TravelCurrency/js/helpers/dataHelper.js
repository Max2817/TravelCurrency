/// <reference path="apiHelper.js" />
/// <reference path="flickrHelper.js" />
/// <reference path="formatHelper.js" />

var dataHelper = (function () {
    return {

        /*
        * callXhr do all the webservice XHR thing for the app, it's reusable
        * 
        */
        callXhr: function (/*String */ URI, /*String*/responseType, parameters) {
            var response = Q.defer();
            var request = new XMLHttpRequest();
            if (parameters) {
                var i = 0;
                for (var param in parameters) {
                    if (i == 0)
                        URI += "?";
                    else
                        URI += "&";
                    URI += param + "=" + parameters[param];
                    i++;
                }
            }
            request.open("GET", URI, true);
            request.responseType = responseType;
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        response.resolve(request);
                    } else {
                        response.reject("HTTP " + request.status + " for " + URI);
                        //console.error(httpRequest.status);
                        if (request.status == 0)
                            response.reject("Serveur de synchronisation indisponible - " + URI);
                        else if (request.status == 404)
                            response.reject("Erreur 404 : l'URL demandée sur le serveur est introuvable - " + URI);
                        else if (request.status == 500)
                            response.reject("Erreur 500 : Dysfonctionnement du serveur - " + URI);
                        else if (request.status == 503)
                            response.reject("Erreur 503 : Service indisponible - " + URI);
                        else if (request.status)
                            response.reject("Erreur " + request.status + " détectée, impossible de poursuivre la demande - " + URI);
                        else
                            response.reject(request.responseText + " Vérifiez vos paramètres de connexion -  " + URI);
                    }
                }
            };
            //timeout && setTimeout(response.reject, timeout);
            request.send('');
            return response.promise;
        },
        loadXMLDoc: function (filename)
        {
            if (window.XMLHttpRequest)
            {
              xhttp=new XMLHttpRequest();
            }
            else // code for IE5 and IE6
            {
              xhttp=new ActiveXObject("Microsoft.XMLHTTP");
            }
            xhttp.open("GET",filename,false);
            xhttp.send();
            return xhttp.responseXML;
        },
        downloadNewTaux: function () {
            var url = "http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
            var today = formatHelper.getDateYYYYMMDD();
            var fileName = today.toString();
            var response = Q.defer();
            //console.log("dl new taux" + new Date());
            dataHelper.initializeListeTaux(url, fileName).done(function (result) {
                //console.log("fin dl new taux" + new Date());
                response.resolve(result);
            });
            return response.promise;
        },
        downloadOldTaux: function () {
            var url = "http://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";
            var histoURL = "http://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml";
            var fileName = "old";
            var response = Q.defer();
            //console.log("dl old taux" + new Date());
            dataHelper.initializeListeTaux(url, fileName).done(function (result) {
                //console.log("fin dl old taux" + new Date());
                response.resolve(result);
            });
            return response.promise;
        },
        initializeListeTaux: function (url, fileName) {
            var response = Q.defer();
            //console.log("initialize liste taux" + new Date());
            dataHelper.callXhr(url, "text")
                .fail(function (error) {
                    var error = new Error("Ajax request to the Flickr API failed.");
                    error.textStatus = textStatus;
                    error.errorThrown = errorThrown;
                    deferred.reject(error);
                    }
                )
                .done(
                    function (result) {
                        //console.log("initialize liste taux avant sauvegarde fichier" + new Date());
                        var fileContent = result.responseText;
                        apiHelper.saveFile(
                            fileName,
                            fileContent,
                            function () {
                                //console.log("fin initialize liste taux " + new Date());
                                response.resolve("OK");
                            },
                            function () {
                                response.reject("NOK");
                            }
                        );
                    },
                    function (error) {
                        response.reject("NOK");
                    }
                )
                ;
            return response.promise;
        },

        enregistrementPhotos: function () {
            var tauxInfos = null;
            var promises = [];
            var response = Q.defer();
            //console.log("debut enregistrement photos " + new Date());
            for (var name in Taux.devises) {
                if (Taux.devises.hasOwnProperty(name)) {
                    tauxInfos = Taux.devises[name];
                    promises.push(dataHelper.getPhotoURL(name, tauxInfos.keywords));
                }
            }

           Q.allSettled(promises)
            .then(function (results) {
                var fileContent = '<?xml version="1.0" encoding="utf-8"?>';
                fileContent += '\r<photos>';
                //Ecriture dans un fichier et enregistrement
                var i = 0;
                for (var name in Taux.devises) {
                    if (Taux.devises.hasOwnProperty(name)) {
                        tauxInfos = Taux.devises[name];
                        fileContent += '\r<photo name="' + name + '" url="';
                        if (results[i].value)
                            fileContent += results[i].value;
                        fileContent += '"/>';
                    }
                    i++;
                }
                fileContent += '\r</photos>';
                apiHelper.saveFile(
                    "url_photos",
                    fileContent,
                    function () {
                        //console.log("fin initialize liste taux " + new Date());
                        response.resolve("OK");
                    },
                    function () {
                        response.reject("NOK");
                    }
                );
            },
            function () {
                response.reject("NOK");
            });
           return response.promise;
        },

        //Fonction de téléchargement des photos
        /* récupération de cette adresse pour l'image
        * http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg
        *   or
        * http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
        *   or
        * http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{o-secret}_o.(jpg|gif|png)
        * DOC API : http://www.flickr.com/services/api/flickr.photos.search.html
        *
        * testFlickr 
        * var urlTest = "https://api.flickr.com/services/rest/?method=flickr.test.echo&name=value";
        */
        //Ancienne clé API "0052b1217b11719b4e6f503e4b70a258",
        getPhotoURL: function (fileName, keywords) {
            var response = Q.defer();
            // XML file           
            var url = "https://api.flickr.com/services/rest/";
            var parameters = {
                "method": "flickr.photos.search",
                "api_key": "09ef4729a74762c267179c50215812bd", //Secret 0ac05089771d2ab8
                "tags": keywords,
                "text": keywords,
                "license": "1,2,3,4,5,6,7",
                //"accuracy": "16",
                //"safe_search": "3",
                "content_type": "1",
                "media": "photos",
                //"geo_context": "2",
                "format": "rest",
                "nojsoncallback": "1",
                "per_page":"10"
            };
            //console.log("debut initialize photo " + fileName + new Date());
            dataHelper.callXhr(url, "", parameters).done(
                function (result) {
                    var buildContent = "";
                    var obj = formatHelper.XML2jsobj(result.responseXML.documentElement);
                    if (obj.stat == "fail") {
                        response.reject(obj.err.code + " : " + obj.err.msg);
                    } else {
                        if (obj.photos && obj.photos.photo) {
                            var result = null;
                            if (obj.photos.photo !== null && Array.isArray(obj.photos.photo)) {
                                var rand = Math.floor(Math.random() * obj.photos.photo.length);
                                result = obj.photos.photo[rand];
                            } else {
                                result = obj.photos.photo;
                            }
                            //enregistrer la photo
                            var photoUrl = "http://farm" + result.farm + ".staticflickr.com/" + result.server + "/" + result.id + "_" + result.secret + "_b.jpg";
                            response.resolve(photoUrl);
                            /*s	petit carré 75x75
                            q	large square 150x150
                            t	miniature, côté le plus long de 100
                            m	petit, côté le plus long de 240
                            n	small, 320 on longest side
                            -	moyen, côté le plus long de 500
                            z	Moyen 640, côté le plus long de 640
                            c	moyen 800, 800 sur la longueur†
                            b	grand, côté le plus long de 1 024*
                            o	image d'origine, jpg, gif ou png selon le format source*/
                        }
                        else {
                            response.resolve(null);
                        }
                    }
                },
                function () {
                    response.resolve(null);
                }
            );
            return response.promise;
        },
        downloadPhoto: function () {
            dataHelper.callXhr(photoUrl, "arraybuffer").done(
                function (result) {
                    var uInt8Array = new Uint8Array(result.response);
                    var i = uInt8Array.length;
                    var binaryString = new Array(i);
                    while (i--) {
                        binaryString[i] = String.fromCharCode(uInt8Array[i]);
                    }
                    var data = binaryString.join('');

                    var base64 = window.btoa(data);
                    console.log("recuperation binary photo " + fileName + " " + new Date());
                    apiHelper.saveFile(
                        fileName,
                        base64,
                        function () {
                            console.log("sauvegarde photo " + fileName + " " + new Date());
                            response.resolve("OK " + fileName);
                        },
                        function () {
                            response.reject("NOK " + fileName);
                        }
                    );
                }
            );
        },
        savePreferences: function (referenceCurrency, referenceFileName, currentCountry, successResponse, errorResponse) {
            var content = '<preferences>\n'
            + '<preference currency="' + referenceCurrency + '" name="' + referenceFileName + '" country="' + currentCountry + '" />\n'
            + '</preferences>';
            var fileName = 'pref';
            apiHelper.saveFile(
                fileName,
                content,
                function () {
                    successResponse();
                },
                function () {
                    errorResponse();
                }
            );
        },
        readPreferences: function (successResponse, errorResponse) {
            var content = '<preferences>\n'
            + '<preference currency="' + referenceCurrency + '" name="' + referenceFileName + '" country="' + currentCountry + '" />\n'
            + '</preferences>';
            var fileName = 'pref';
            apiHelper.saveFile(
                fileName,
                content,
                function () {
                    successResponse();
                },
                function () {
                    errorResponse();
                }
            );
        }
    };
})();