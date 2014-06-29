/// <reference path="../../helpers/uiHelper.js" />
/// <reference path="../../kernel/kernel.js" />
/// <reference path="listeTauxTemplates.js" />
var taux = (function () {
    var _referenceCurrency = "EUR";
    var _referenceFileName = "Euro";
    var _currentCountry = "USD";
    var _nouveauxTaux = {};
    var _referenceCurrencyData, _currencyList = {};
    var _photoURL, _listePhotosURL = null;

    function initializeData(listeNouveauxTaux, listeAnciensTaux, listePhotosURL) {
        getNewData(listeNouveauxTaux, listeAnciensTaux);
        _listePhotosURL = listePhotosURL; 
        refresh();
    }
    
    function refresh() {
        setCurrencyList();
        uiHelper.pushContent("listeTaux", listeTauxTemplates.getListeNouveauxTauxTemplate(_referenceCurrencyData, _nouveauxTaux[_referenceCurrency]));
        if (document.getElementById("li_" + _currentCountry))
            document.getElementById("li_" + _currentCountry).classList.add("selected");
        refreshPhotoOldList()
    }

    function refreshPhotoOldList() {
        getPhotoURLFromListe();
        uiHelper.pushContent("photo", listeTauxTemplates.getPhotoTemplate(_photoURL, _currentCountry));
        var anciensTaux = _nouveauxTaux[_referenceCurrency][_currentCountry].old;
        uiHelper.pushContent("navcontainer", listeTauxTemplates.getListeAnciensTauxTemplate(anciensTaux));



        setTimeout(function () {
            for (var i = 0; i < anciensTaux.values.length; i++) {
                var gap = anciensTaux.max - anciensTaux.min;

                document.getElementById("old_" + i).style.height = ((100 - Math.floor(((anciensTaux.values[i].rate - anciensTaux.min) * (80/gap))))-10) + "%";
            }
        }, 500);
        //document.getElementById("toto").style.width = '300px';
       //document.getElementById("toto").classList.remove("horizTranslate");
       // document.getElementById("toto").classList.add("horizTranslate");
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
                    document.getElementById("li_" + _currentCountry).classList.remove("selected");
                    _currentCountry = this.getAttribute("data-currency");
                    refreshPhotoOldList();
                    document.getElementById("li_" + _currentCountry).classList.add("selected");
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
                        refresh();

                        initializeNavigation();
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

        for (var index in devises) {
            if (index !== "EUR" && listeEUR[index]) {
                _referenceCurrency = index;
                //On parcours la liste des devises et on saute la courante
                var listeTaux = {};
                var convertionRate = 1 / listeEUR[index].rate;
                var first = true;
                for (var rate in listeEUR) {
                    if (_referenceCurrency !== "EUR" && first) {
                        listeTaux["EUR"] = {
                            "flag": Taux.devises["EUR"].flag,
                            "currency": "EUR",
                            "filename": Taux.devises["EUR"].fileName,
                            "rate": convertionRate,
                            "old": getOldData(_referenceCurrency, datesAnciensTaux, convertionRate, true)
                        };
                        first = false;
                    }
                    if (_referenceCurrency === "EUR" && rate !== "EUR" && index !== rate
                        || _referenceCurrency !== "EUR" && rate !== "EUR" && index !== rate ) {

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
        _referenceCurrency = "EUR";

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
                    values.push(
                        {
                            "currentDate": currentDate,
                            "rate": rate
                        }
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
                                                            initializeData(listeNouveauxTaux, listeAnciensTaux, listePhotosURL);
                                                            initializeNavigation();
                                                            
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
