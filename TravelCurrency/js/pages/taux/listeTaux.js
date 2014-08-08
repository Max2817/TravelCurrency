/// <reference path="../../helpers/uiHelper.js" />
/// <reference path="../../kernel/kernel.js" />
/// <reference path="../../helpers/dataHelper.js" />
/// <reference path="listeTauxTemplates.js" />
/// <reference path="../../helpers/highcharts.js" />
/// <reference path="../../helpers/highstock.js" />

var taux = (function () {
    //If preferences are not set use this defined data
    var _referenceCurrency = "EUR";
    var _referenceFileName = "Euro";
    var _currentCountry = "USD";
    var _currentFileName = "US Dollar";
    var _nouveauxTaux = {};
    var _referenceCurrencyData = {};
    var _photoURL, _listePhotosURL = null;
    var _chart = null;
    //init converted value
    var _multiplicator = 1;

    //initialize data into template
    function initializeData(listeNouveauxTaux, listeAnciensTaux, listePhotosURL, preferences) {
        //if user choose a base and a comparison currency we load it here
        if (preferences) {
            getPreferences(preferences);
        }
        //return big object containing the currencies, the new and the old data
        getNewData(listeNouveauxTaux, listeAnciensTaux);
        //list of photos URL
        _listePhotosURL = listePhotosURL;
        //Display data in templates
        refresh();
        //show off the wheel and show content
        if (document.getElementById("content"))
            document.getElementById("content").style.visibility = 'visible';
    }
    
    //display data in template
    function refresh() {
        //set header data on top of the comparison list
        uiHelper.pushContent("header", listeTauxTemplates.getBaseCurrencyHeader(_referenceCurrencyData, _nouveauxTaux[_referenceCurrency], _multiplicator));
        //set comparison list template
        refreshListeTaux();
        //set photo and old data templates
        refreshPhotoOldList();
    }
    //refresh new currency list template
    function refreshListeTaux() {
        uiHelper.pushContent("currencies", listeTauxTemplates.getListeNouveauxTauxTemplate(_referenceCurrencyData, _nouveauxTaux[_referenceCurrency], _multiplicator));
        if (document.getElementById("li_" + _currentCountry)) {
            document.getElementById("li_" + _currentCountry).classList.add("selected");
            document.getElementById("li_" + _currentCountry).scrollIntoView();
        }
    }
    //refresh photo and chart
    function refreshPhotoOldList() {
        getPhotoURLFromListe();
        uiHelper.pushContent("photo", listeTauxTemplates.getPhotoTemplate(_photoURL, _currentFileName));
        var anciensTaux = _nouveauxTaux[_referenceCurrency][_currentCountry].old;
        setChart(anciensTaux.values);
    }

    //initialize events
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

                        //saving preferences
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
                    //Replacing new currency list
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
                    //Saving preferences
                    dataHelper.savePreferences(_referenceCurrency, _referenceFileName, _currentCountry, _currentFileName,
                        function () {
                            //refreshing data and templates
                            refresh();
                            initializeNavigation();
                        },
                        function (error) {
                            kernel.manageException(error);
                        });

                }
            });
        }
    }
    //Parsing files containing XML data of new and old currencies
    function getNewData(listeNouveauxTaux, listeAnciensTaux) {
        //for each currency of the European Central Bank given we calculate each 
        //comparison with the other datas for the old currencies
        //Reading the new currency list
        var parser = new DOMParser();
        var xmldom = parser.parseFromString(listeNouveauxTaux, "text/xml");
        var obj = formatHelper.XML2jsobj(xmldom.documentElement);
        var nouveauxTaux = obj.Cube.Cube.Cube;
        //Reading the old data
        xmldom = parser.parseFromString(listeAnciensTaux, "text/xml");
        obj = formatHelper.XML2jsobj(xmldom.documentElement);
        var datesAnciensTaux = obj.Cube.Cube;
        var listeTaux = {};
        //building the object
        //The Euro part not given by the euro central bank must be calculated apart
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
        //calculation of the other currencies
        var devises = Taux.devises;
        //For each currency except Euro
        var refCur = _referenceCurrency;
        for (var index in devises) {
            if (index !== "EUR" && listeEUR[index]) {
                refCur = index;
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
    }

    //get the user saved preferences 
    function getPreferences(preferences) {
        //Reading
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
    //set the data for the header
    function setReferenceCurrencyData() {
        _referenceCurrencyData = {
            "flag": Taux.devises[_referenceCurrency].flag,
            "currency": _referenceCurrency,
            "filename": Taux.devises[_referenceCurrency].fileName
        }
    }
    //extract the old rates for the chart
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

    "use strict";
    return {
        initialize: function (params, endInitializeCallBack) {
            //Init currencies lists, put datas in objects
            //By reading the files of imported datas
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
                                                                            //getting preferences if they exist
                                                                            initializeData(listeNouveauxTaux, listeAnciensTaux, listePhotosURL, preferences);
                                                                            initializeNavigation();  
                                                                        },
                                                                        function (error) {
                                                                            kernel.manageException(error);
                                                                        }
                                                                    );
                                                                },
                                                                function () {
                                                                    //If no preferences exist
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
        //Handle the user changes on the convert input
        handleChange: function () {
            var newValue = document.getElementById('convertedNumber').value;
            newValue = newValue.replace(",", ".");
            var reContenuValide = /^[0-9]*\.?[0-9]+$/; //Only numbers
            if (newValue == "")
                newValue = 1;
            if (parseInt(newValue) != NaN && parseFloat(newValue) != NaN && reContenuValide.test(newValue)) {
                _multiplicator = newValue;
                refreshListeTaux();
                initializeCurrencyListNavigation();
            }
        }
    };
    
})();

//Display image after loading
function imgLoaded(img) {
    var imgWrapper = img.parentNode;

    imgWrapper.className += imgWrapper.className ? ' loaded' : 'loaded';
};
