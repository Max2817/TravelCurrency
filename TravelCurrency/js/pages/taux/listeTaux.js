/// <reference path="../../helpers/uiHelper.js" />
/// <reference path="../../kernel/kernel.js" />
/// <reference path="../../helpers/dataHelper.js" />
/// <reference path="listeTauxTemplates.js" />
/// <reference path="../../helpers/highcharts.js" />
/// <reference path="../../helpers/highstock.js" />

var taux = (function () {
    var _referenceCurrency = "EUR";
    var _referenceFileName = "Euro";
    var _currentCountry = "USD";
    var _currentFileName = "US Dollar";
    var _currentSymbol = "Kč";
    var _nouveauxTaux = {};
    var _referenceCurrencyData, _currencyList = {};
    var _photoURL, _listePhotosURL = null;
    var _chart = null;
    var _multiplicator = 1;

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
        uiHelper.pushContent("header", listeTauxTemplates.getBaseCurrencyHeader(_referenceCurrencyData, _nouveauxTaux[_referenceCurrency], _multiplicator));
        refreshListeTaux();
        refreshPhotoOldList();
    }

    function refreshListeTaux() {
        uiHelper.pushContent("currencies", listeTauxTemplates.getListeNouveauxTauxTemplate(_referenceCurrencyData, _nouveauxTaux[_referenceCurrency], _multiplicator));
        if (document.getElementById("li_" + _currentCountry)) {
            document.getElementById("li_" + _currentCountry).classList.add("selected");
            document.getElementById("li_" + _currentCountry).scrollIntoView();
        }
    }

    function refreshPhotoOldList() {
        getPhotoURLFromListe();
        uiHelper.pushContent("photo", listeTauxTemplates.getPhotoTemplate(_photoURL, _currentFileName));
        var anciensTaux = _nouveauxTaux[_referenceCurrency][_currentCountry].old;
        setChart(anciensTaux.values);
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
        initializeCurrencyListNavigation();
        initializeBaseCurrencyListNavigation(); 
    }

    function initializeCurrencyListNavigation() {
        var listeTaux = _nouveauxTaux[_referenceCurrency];
        for (var index in listeTaux) {
            if (document.getElementById("currency_" + listeTaux[index].currency)) {
                document.getElementById("currency_" + listeTaux[index].currency).addEventListener("click",
                function () {
                    var clickedCountry = this.getAttribute("data-currency");
                    var clickedCurrencyName = this.getAttribute("data-currency-name");
                    if (clickedCountry !== _currentCountry) {
                        document.getElementById("li_" + _currentCountry).classList.remove("selected");
                        _currentCountry = clickedCountry;
                        _currentFileName = clickedCurrencyName;

                        //Sauvegarde des préférences
                        dataHelper.savePreferences(_referenceCurrency, _referenceFileName, _currentCountry, _currentFileName,
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
    }

    function initializeBaseCurrencyListNavigation() {
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
                    if (_referenceCurrency == _currentCountry) {
                        for (var index in _nouveauxTaux[_referenceCurrency]) {
                            _currentCountry = index;
                            _currentFileName = _nouveauxTaux[_referenceCurrency][index].filename;
                            break;
                        }
                    }
                    //Sauvegarde des préférences
                    dataHelper.savePreferences(_referenceCurrency, _referenceFileName, _currentCountry, _currentFileName,
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
                "symbol": Taux.devises[nouveauxTaux[rate].currency].symbol,
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
                            "symbol": Taux.devises["EUR"].symbol,
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
                            "symbol": Taux.devises[listeEUR[rate].currency].symbol,
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
        if (preference.currency && preference.name && preference.country && preference.currentCurrencyName) {
            _referenceCurrency = preference.currency;
            _referenceFileName = preference.name;
            _currentCountry = preference.country;
            _currentFileName = preference.currentCurrencyName;
        }
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

    var setChart = function (listeOldTaux) {
        var taux = JSON.parse(JSON.stringify(listeOldTaux)).reverse();
        //update the chart if exists
        if (_chart) {
            _chart.series[0].setData(taux);
            //_chart.setTitle({ text: _currentFileName });
        }//else create it
        else {
            var widthContainer = document.getElementById("container").offsetWidth;
            var nouvTab = [];
            for (var i = 0; i < 3; i++) {
                nouvTab.push(listeOldTaux[i]);
            }
            Highcharts.setOptions(
                {
                    lang: {
                        months: [_i18n.lblJanuary, _i18n.lblFebruary, _i18n.lblMarch, _i18n.lblApril, _i18n.lblMay, _i18n.lblJune, _i18n.lblJuly, _i18n.lblAugust, _i18n.lblSeptember, _i18n.lblOctober, _i18n.lblNovember, _i18n.lblDecember],
                        shortMonths: [_i18n.lblJan, _i18n.lblFeb, _i18n.lblMar, _i18n.lblApr, _i18n.lblMay, _i18n.lblJun, _i18n.lblJul, _i18n.lblAug, _i18n.lblSep, _i18n.lblOct, _i18n.lblNov, _i18n.lblDec],
                        weekdays: [_i18n.lblSunday, _i18n.lblMonday, _i18n.lblTuesday, _i18n.lblWednesday, _i18n.lblThursday, _i18n.lblFriday, _i18n.lblSaturday]
                    }
                }
            );
            _chart = new Highcharts.StockChart({
                chart: {
                    renderTo: 'container'
                },
                rangeSelector: {
                    inputEnabled: false,
                    selected: 0
                },
                /*title: {
                    text: _currentFileName
                },*/
                series: [{
                    data: taux,
                    shadow: true,
                    tooltip: {
                        valueDecimals: 5
                    },
                    name: _currentCountry
                }]

            });
        }
    }

    /*function setupUpdater() {
        var input = null;
        if(document.getElementById('convertedNumber'))
            input = document.getElementById('convertedNumber'),
            oldValue = input.value,
            timeout = null;

        // handleChange is called 50ms after the user stops 
        //   typing. 
        function handleChange() {
            var newValue = input.value;

            if (newValue == oldValue || newValue == "") return; else oldValue = newValue;
            _multiplicator = newValue;
            refreshListeTaux();
        }

        // eventHandler is called on keyboard and mouse events.
        // If there is a pending timeout, it cancels it.
        // It sets a timeout to call handleChange in 50ms. 
        function eventHandler() {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(handleChange, 50);
        }
        if (document.getElementById('convertedNumber'))
            input.onkeydown = input.onkeyup = input.onclick = eventHandler;
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
        },
        handleChange: function () {
            var newValue = document.getElementById('convertedNumber').value;
            if (newValue == "") {
                //document.getElementById('convertedNumber').value = 1;
                newValue = 1;
            }
            var reContenuValide = /^[0-9]*\.?[0-9]+$/; //Only numbers
            
            if (parseInt(newValue) != NaN && parseFloat(newValue) != NaN && reContenuValide.test(newValue)) {
                _multiplicator = newValue;
                refreshListeTaux();
                initializeCurrencyListNavigation();
            }
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
