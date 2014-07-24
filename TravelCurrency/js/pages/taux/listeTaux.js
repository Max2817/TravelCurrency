/// <reference path="../../helpers/uiHelper.js" />
/// <reference path="../../kernel/kernel.js" />
/// <reference path="../../helpers/dataHelper.js" />
/// <reference path="listeTauxTemplates.js" />

var dataTest = /* AAPL historical OHLC data from the Google Finance API */
/* AAPL historical OHLC data from the Google Finance API */
[
[1406066400000, 67.79],
[1405980000000, 64.98],
[1405893600000, 65.26],
];

var taux = (function () {
    var _referenceCurrency = "EUR";
    var _referenceFileName = "Euro";
    var _currentCountry = "USD";
    var _nouveauxTaux = {};
    var _referenceCurrencyData, _currencyList = {};
    var _photoURL, _listePhotosURL = null;

    function initializeData(listeNouveauxTaux, listeAnciensTaux, listePhotosURL, preferences) {
        if (preferences) {
            getPreferences(preferences);
        }
        getNewData(listeNouveauxTaux, listeAnciensTaux);
        _listePhotosURL = listePhotosURL;
        refresh();
        //on enlève la wheel et on met le contenu
        if (document.getElementById("content"))
            document.getElementById("content").style.visibility = 'visible';
        
    }
    
    function refresh() {
        setCurrencyList();
        uiHelper.pushContent("listeTaux", listeTauxTemplates.getListeNouveauxTauxTemplate(_referenceCurrencyData, _nouveauxTaux[_referenceCurrency]));
        if (document.getElementById("li_" + _currentCountry)) {
            document.getElementById("li_" + _currentCountry).classList.add("selected");
            document.getElementById("li_" + _currentCountry).scrollIntoView();
        }
        refreshPhotoOldList()
    }

    function refreshPhotoOldList() {
        getPhotoURLFromListe();
        uiHelper.pushContent("photo", listeTauxTemplates.getPhotoTemplate(_photoURL, _currentCountry));
        var anciensTaux = _nouveauxTaux[_referenceCurrency][_currentCountry].old;
        //uiHelper.pushContent("navcontainer", listeTauxTemplates.getListeAnciensTauxTemplate(anciensTaux));
        VanillaRunOnDomReady(anciensTaux.values);
        setTimeout(function () {
            for (var i = 0; i < anciensTaux.values.length; i++) {
                var gap = anciensTaux.max - anciensTaux.min;
                if (document.getElementById("old_" + i))
                    document.getElementById("old_" + i).style.height = ((100 - Math.floor(((anciensTaux.values[i].rate - anciensTaux.min) * (80/gap))))-10) + "%";
            }
        }, 500);
    }

    function setCurrencyList() {
        var i = 0;
        for (var name in Taux.devises) {
            if (Taux.devises.hasOwnProperty(name) && Taux.devises[name].fileName != _referenceFileName) {
                _currencyList[i] = {};
                _currencyList[i].fileName = Taux.devises[name].fileName;
                _currencyList[i].currency = name;
                i++;
            }
        }
    }

    function initializeNavigation() {
        var listeTaux = _nouveauxTaux[_referenceCurrency];
        for (var index in listeTaux) {
            if (document.getElementById("currency_" + listeTaux[index].currency)) {
                document.getElementById("currency_" + listeTaux[index].currency).addEventListener("click",
                function () {
                    var clickedCountry = this.getAttribute("data-currency");
                    if (clickedCountry !== _currentCountry) {
                        document.getElementById("li_" + _currentCountry).classList.remove("selected");
                        _currentCountry = clickedCountry;

                        //Sauvegarde des préférences
                        dataHelper.savePreferences(_referenceCurrency, _referenceFileName, _currentCountry,
                            function () {
                                refreshPhotoOldList();
                                document.getElementById("li_" + _currentCountry).classList.add("selected");
                            },
                            function (error) {
                                kernel.manageException(error);
                            }
                        );
                    }
                }, false);
            }
        }
        if (document.getElementById("changeCurrency")) {
            document.getElementById("changeCurrency").addEventListener("change",
                function () {
                    var el = document.getElementById("changeCurrency");
                    var currency = el.options[el.selectedIndex].value;
                    var filename = el.options[el.selectedIndex].text;
                    var nouveauTaux = el.options[el.selectedIndex].getAttribute("data-convertion-rate");
                    if (currency !== "") {
                        //Remplacement des données de la lise
                        _referenceCurrency = currency;
                        _referenceFileName = filename;
                        setReferenceCurrencyData();
                        for (var index in _nouveauxTaux[_referenceCurrency]) {
                            _currentCountry = index;
                            break;
                        }
                        //Sauvegarde des préférences
                        dataHelper.savePreferences(_referenceCurrency, _referenceFileName, _currentCountry,
                            function () {
                                refresh();
                                //Sauvegarde des préférences
                                initializeNavigation();
                            },
                            function (error) {
                                kernel.manageException(error);
                            });
                        
                    }
                });
        }
        
    }

    function getNewData(listeNouveauxTaux, listeAnciensTaux) {
        //Lecture de la liste des nouveaux taux
        var parser = new DOMParser();
        var xmldom = parser.parseFromString(listeNouveauxTaux, "text/xml");
        var obj = formatHelper.XML2jsobj(xmldom.documentElement);
        var nouveauxTaux = obj.Cube.Cube.Cube;
        //Lecture de la liste des anciens taux
        xmldom = parser.parseFromString(listeAnciensTaux, "text/xml");
        obj = formatHelper.XML2jsobj(xmldom.documentElement);
        var datesAnciensTaux = obj.Cube.Cube;
        var listeTaux = {};
        for (var rate in nouveauxTaux) {
            if (_referenceCurrency == "EUR" || nouveauxTaux[rate].currency == _referenceCurrency) {
                setReferenceCurrencyData();
            }
            listeTaux[nouveauxTaux[rate].currency] = {
                "flag": Taux.devises[nouveauxTaux[rate].currency].flag,
                "currency": nouveauxTaux[rate].currency,
                "filename": Taux.devises[nouveauxTaux[rate].currency].fileName,
                "rate": nouveauxTaux[rate].rate,
                "old": getOldData(nouveauxTaux[rate].currency, datesAnciensTaux)
            };
        }
        _nouveauxTaux["EUR"] = listeTaux;
        var listeEUR = _nouveauxTaux["EUR"];
        //Calculs des autres taux 
        var devises = Taux.devises;
        //Pour chacune des devises excepté la première que nous avons déjà calculé
        var refCur = _referenceCurrency;
        for (var index in devises) {
            if (index !== "EUR" && listeEUR[index]) {
                refCur = index;
                //On parcours la liste des devises et on saute la courante
                var listeTaux = {};
                var convertionRate = 1 / listeEUR[index].rate;
                var first = true;
                for (var rate in listeEUR) {
                    if (refCur !== "EUR" && first) {
                        listeTaux["EUR"] = {
                            "flag": Taux.devises["EUR"].flag,
                            "currency": "EUR",
                            "filename": Taux.devises["EUR"].fileName,
                            "rate": convertionRate,
                            "old": getOldData(refCur, datesAnciensTaux, convertionRate, true)
                        };
                        first = false;
                    }
                    if (refCur === "EUR" && rate !== "EUR" && index !== rate
                        || refCur !== "EUR" && rate !== "EUR" && index !== rate) {

                        listeTaux[listeEUR[rate].currency] = {
                            "flag": Taux.devises[listeEUR[rate].currency].flag,
                            "currency": listeEUR[rate].currency,
                            "filename": Taux.devises[listeEUR[rate].currency].fileName,
                            "rate": listeEUR[rate].rate * convertionRate,
                            "old": getOldData(listeEUR[rate].currency, datesAnciensTaux, convertionRate)
                        };
                    }

                }
                _nouveauxTaux[index] = listeTaux;
            }
        }
        //_referenceCurrency = "EUR";

    }

    function getPreferences(preferences) {
        //Lecture des preferences
        var parser = new DOMParser();
        var xmldom = parser.parseFromString(preferences, "text/xml");
        var obj = formatHelper.XML2jsobj(xmldom.documentElement);
        var preference = obj.preference;
        _referenceCurrency = preference.currency;
        _referenceFileName = preference.name;
        _currentCountry = preference.country;
    }

    function setReferenceCurrencyData() {
        _referenceCurrencyData = {
            "flag": Taux.devises[_referenceCurrency].flag,
            "currency": _referenceCurrency,
            "filename": Taux.devises[_referenceCurrency].fileName
        }
    }

    function getOldData(currency, datesAnciensTaux, rateConvertion, euro) {  
        var currentDate = null;
        var currencyList = null;
        var old = new Object();
        var values = new Array();
        var rate = null;
        var min = null;
        var max = null;
        for (var index in datesAnciensTaux) {
            currentDate = datesAnciensTaux[index].time;
            currencyList = datesAnciensTaux[index].Cube;
            for (var count in currencyList) {
                if (currencyList[count].currency === currency) {
                    if (rateConvertion) {
                        if(euro)
                            rate = 1/currencyList[count].rate;
                        else
                            rate = currencyList[count].rate * rateConvertion;
                    } else {
                        rate = currencyList[count].rate;
                    }
                    if (index == 0) {
                        min = max = rate;
                    } else {
                        if (rate < min)
                            min = rate;
                        if (rate > max)
                            max = rate;
                    }
                    var dateArray = currentDate.split("-");
                    var timestamp = new Date(parseInt(dateArray[0]), parseInt(dateArray[1])-1, parseInt(dateArray[2])).getTime();
                    values.push(
                        /*{
                            "currentDate": currentDate,
                            "rate": rate
                        }*/
                        [parseInt(timestamp), parseFloat(rate)]
                    );
                    break;
                }
            }
        }
        old.values = values;
        old.min = min;
        old.max = max;
        return old;
    }

    function getOldTauxFromList() {
        for(var index in _nouveauxTaux){
            if (_nouveauxTaux[index].currency === _currentCountry)
                return _nouveauxTaux[index].old;
        }
    }

    /*
    * listePhotosURL : fileContent
    * country : les 3 lettres du pays ex : USD
    */
    function getPhotoURLFromListe(){
        var parser = new DOMParser();
        var xmldom = parser.parseFromString(_listePhotosURL, "text/xml");
        var obj = formatHelper.XML2jsobj(xmldom.documentElement);
        _photoURL = null;
        for (var index in obj.photo) {
            if (obj.photo[index].name === _currentCountry) {
                _photoURL = obj.photo[index].url;
                break;
            }
        }
    }

    var VanillaRunOnDomReady = function (listeOldTaux) {
        var widthContainer = document.getElementById("container").offsetWidth;
        var nouvTab = [];
        for( var i=0; i<3; i++){
            nouvTab.push(listeOldTaux[i]);
        }
        var chart = new Highcharts.StockChart({

            chart: {
                renderTo: 'container'
            },
            rangeSelector: {
                inputEnabled: widthContainer > 480,
                selected: 0
            },
            title: {
                text: 'AAPL Stock Price'
            },
            series: [{
                data: listeOldTaux.reverse(),
                shadow: true,
                tooltip: {
                    valueDecimals: 5
                }
            }]

        });
    }

    /*var alreadyrunflag = 0;

    if (document.addEventListener)
        document.addEventListener("DOMContentLoaded", function () {
            alreadyrunflag = 1;
            VanillaRunOnDomReady();
        }, false);
    else if (document.all && !window.opera) {
        document.write('<script type="text/javascript" id="contentloadtag" defer="defer" src="javascript:void(0)"><\/script>');
        var contentloadtag = document.getElementById("contentloadtag")
        contentloadtag.onreadystatechange = function () {
            if (this.readyState == "complete") {
                alreadyrunflag = 1;
                VanillaRunOnDomReady();
            }
        }
    }*/

    "use strict";
    return {
        initialize: function (params, endInitializeCallBack) {
            //Initialisation de la liste des taux
            //Récupération des données de taux courant (si nécessaire)
            //Ouverture du taux courant
            apiHelper.getAppFileByName(formatHelper.getDateYYYYMMDD().toString(),
                function (filePath) {
                    apiHelper.readTextFile(filePath.path,
                        function (listeNouveauxTaux) {
                            apiHelper.getAppFileByName("old",
                                function (filePath) {
                                    apiHelper.readTextFile(filePath.path,
                                        function (listeAnciensTaux) {
                                            apiHelper.getAppFileByName("url_photos",
                                                function (filePath) {
                                                    apiHelper.readTextFile(filePath.path,
                                                        function (listePhotosURL) {
                                                            apiHelper.getAppFileByName("pref",
                                                                function (filePath) {
                                                                    apiHelper.readTextFile(filePath.path,
                                                                        function (preferences) {
                                                                            //Récupération des préférences si des préférences existent
                                                                            initializeData(listeNouveauxTaux, listeAnciensTaux, listePhotosURL, preferences);
                                                                            initializeNavigation();  
                                                                        },
                                                                        function (error) {
                                                                            kernel.manageException(error);
                                                                        }
                                                                    );
                                                                },
                                                                function () {
                                                                    //Récupération des préférences si des préférences existent
                                                                    initializeData(listeNouveauxTaux, listeAnciensTaux, listePhotosURL);
                                                                    initializeNavigation();
                                                                }
                                                            );
                                                        },
                                                        function (error) {
                                                            kernel.manageException(error);
                                                        }
                                                    );
                                                },
                                                function (error) {
                                                    kernel.manageException(error);
                                                }
                                            );
                                        },
                                        function (error) {
                                            kernel.manageException(error);
                                        }
                                    );
                                },
                                function (error) {
                                    kernel.manageException(error);
                                }
                            );
                        },
                        function (error) {
                            kernel.manageException(error);
                        }
                    );
                },
                function (error) {
                    kernel.manageException(error);
                }
            );
        }
    };
    
})();

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
//Affichage de la photo
function imgLoaded(img) {
    var imgWrapper = img.parentNode;

    imgWrapper.className += imgWrapper.className ? ' loaded' : 'loaded';
};
