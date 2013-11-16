
function initialize(urlParams, endInitializeCallBack) {
    //Initialisation de la liste des taux
    initializeListeTaux();
    initializePhoto();
}

function createRequest() {
    var result = null;
    if (window.XMLHttpRequest) {
        // FireFox, Safari, etc.
        result = new XMLHttpRequest();
        if (typeof result.overrideMimeType != 'undefined') {
            result.overrideMimeType('text/xml'); // Or anything else
        }
    }
    else if (window.ActiveXObject) {
        // MSIE
        result = new ActiveXObject("Microsoft.XMLHTTP");
    }
    else {
        // No known mechanism -- consider aborting the application
    }
    return result;
}

function initializeListeTaux() {
    var url = "http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

    // AJAX request
    var xhrListe = createRequest();
    xhrListe.onreadystatechange = XHRListeHandler;
    xhrListe.open("GET", url, true);
    xhrListe.send();

    // handle response
    function XHRListeHandler() {

        if (xhrListe.readyState == 4) {
            var buildContent = "<ul>";
            var obj = formatHelper.XML2jsobj(xhrListe.responseXML.documentElement);
            var result = obj.Cube.Cube.Cube;
            for (var rate in result) {
                buildContent += '<a href="#">';
                buildContent += '<li>';
                buildContent += '<img src="../../../images/flags/64/' + Taux.devises[result[rate].currency].flag + '" alt="' + result[rate].currency + '" class="thumbnail"/>';
                buildContent += '<h2>' + Taux.devises[result[rate].currency].fileName + '</h2>';
                buildContent += '<p class="taux">Taux :  <span class="price">' + result[rate].rate + '</span></p>';
                buildContent += '</li></a>';
            }
            uiHelper.pushContent("listeTaux", buildContent);
            xhrListe = null;

        }

    }
}

function initializeListeTaux() {
    var url = "http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

    // AJAX request
    var xhrListe = createRequest();
    xhrListe.onreadystatechange = XHRListeHandler;
    xhrListe.open("GET", url, true);
    xhrListe.send();

    // handle response
    function XHRListeHandler() {

        if (xhrListe.readyState == 4) {
            var buildContent = "<ul>";
            var obj = formatHelper.XML2jsobj(xhrListe.responseXML.documentElement);
            var result = obj.Cube.Cube.Cube;
            for (var rate in result) {
                buildContent += '<a href="#">';
                buildContent += '<li>';
                buildContent += '<img src="../../../images/flags/64/' + Taux.devises[result[rate].currency].flag + '" alt="' + result[rate].currency + '" class="thumbnail"/>';
                buildContent += '<h2>' + Taux.devises[result[rate].currency].fileName + '</h2>';
                buildContent += '<p class="taux">Taux :  <span class="price">' + result[rate].rate + '</span></p>';
                buildContent += '</li></a>';
            }
            uiHelper.pushContent("listeTaux", buildContent);
            xhrListe = null;

        } else {
            //TODO : Afficher un message de remplacement
        }

    }
}

function initializePhoto() {

    // XML file
    var keywords = "paris";
    //DOC API : http://www.flickr.com/services/api/flickr.photos.search.html
    var url = "http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=0052b1217b11719b4e6f503e4b70a258&tags=" + keywords + "&text=" + keywords + "&license=4&accuracy=3&safe_search=3&content_type=1&media=photos&geo_context=2&format=rest&nojsoncallback=1 ";
    //testFlickr
    // AJAX request
    var xhrPhoto = createRequest();
    xhrPhoto.onreadystatechange = XHRPhotoHandler;
    xhrPhoto.open("GET", url, true);
    xhrPhoto.send();

    // handle response
    function XHRPhotoHandler() {

        if (xhrPhoto.readyState == 4) {
            var buildContent = "";
            //var obj = xhrPhoto.responseText;
            var obj = formatHelper.XML2jsobj(xhrPhoto.responseXML.documentElement);
            if (obj.photos && obj.photos.photo) {
                var rand = Math.floor(Math.random() * obj.photos.photo.length);
                var result = obj.photos.photo[rand];
                /*http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg
                    or
                http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
                    or
                http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{o-secret}_o.(jpg|gif|png)*/

                document.getElementById("imgCountry").src = "http://farm" + result.farm + ".staticflickr.com/" + result.server + "/" + result.id + "_" + result.secret + "_b.jpg";
                document.getElementById("imgCountry").onload = function () {
                document.getElementById("photo").style.height = document.getElementById("imgCountry").height + "px";

                    
                }
            }
            xhrPhoto = null;
            //appel au webservice pour récupérer les anciens taux
            initializeOldTaux();

        } else {
            //TODO : Afficher une image de remplacement
        }

    }

    function initializeOldTaux() {
        var url = "http://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";

        // AJAX request
        var xhrListe = createRequest();
        xhrListe.onreadystatechange = XHRListeHandler;
        xhrListe.open("GET", url, true);
        xhrListe.send();

        // handle response
        function XHRListeHandler() {

            if (xhrListe.readyState == 4) {
                var buildContent = '<ul id="navlist">';
                var obj = formatHelper.XML2jsobj(xhrListe.responseXML.documentElement);
                var result = obj.Cube.Cube.Cube;
                for (var rate in result) {
                    buildContent += '<li><a href="#">' + + '</a></li>';

                    
                    
                    buildContent += '<a href="#">';
                    buildContent += '<li>';
                    buildContent += '<img src="../../../images/flags/64/' + Taux.devises[result[rate].currency].flag + '" alt="' + result[rate].currency + '" class="thumbnail"/>';
                    buildContent += '<h2>' + Taux.devises[result[rate].currency].fileName + '</h2>';
                    buildContent += '<p class="taux">Taux :  <span class="price">' + result[rate].rate + '</span></p>';
                    buildContent += '</li></a>';
                }
                buildContent += '</ul>';
                uiHelper.pushContent("navcontainer", buildContent);
                xhrListe = null;

            } else {
                //TODO : Afficher un message de remplacement
            }

        }
    }

    /* <licenses>
    <license id="0" name="All Rights Reserved" url="" />
    <license id="1" name="Attribution-NonCommercial-ShareAlike License" url="http://creativecommons.org/licenses/by-nc-sa/2.0/" />
    <license id="2" name="Attribution-NonCommercial License" url="http://creativecommons.org/licenses/by-nc/2.0/" />
    <license id="3" name="Attribution-NonCommercial-NoDerivs License" url="http://creativecommons.org/licenses/by-nc-nd/2.0/" />
    <license id="4" name="Attribution License" url="http://creativecommons.org/licenses/by/2.0/" />
    <license id="5" name="Attribution-ShareAlike License" url="http://creativecommons.org/licenses/by-sa/2.0/" />
    <license id="6" name="Attribution-NoDerivs License" url="http://creativecommons.org/licenses/by-nd/2.0/" />
    <license id="7" name="No known copyright restrictions" url="http://flickr.com/commons/usage/" />
    <license id="8" name="United States Government Work" url="http://www.usa.gov/copyright.shtml" />
  </licenses> */

}