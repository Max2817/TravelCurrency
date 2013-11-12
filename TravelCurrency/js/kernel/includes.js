/// <reference path="//Microsoft.WinJS.2.0/js/ui.js" />
// Retourne la localisation du device
function UI_GetLocale() {
    if (window.navigator.userLanguage)
        return window.navigator.userLanguage.substring(0, 2);
    if (window.navigator.browserLanguage)
        return window.navigator.browserLanguage.substring(0, 2);
    if (window.navigator.systemLanguage)
        return window.navigator.systemLanguage.substring(0, 2);
    if (window.navigator.language)
        return window.navigator.language.substring(0, 2);
    return "fr";
}

// Retourne la localisation appliquée pour l'internationnalisation en fonction des localisation supportées
function UI_GetI18NLocale() {
    // Seule la localisation Fr est disponible
    return "fr";
}

MSApp.execUnsafeLocalFunction(function () {
    try {


        document.write(
            '<!-- CSS -->\n'
            + '<link href="/css/focal-point.css" rel="stylesheet" />\n'

            + '<!-- Microsoft -->\n'
            + '<script type="text/javascript" src="//Microsoft.WinJS.1.0/js/base.js"></script>\n'
            + '<script type="text/javascript" src="//Microsoft.WinJS.1.0/js/ui.js"></script>\n'

            + '<!-- i18n -->\n'
            + '<script type="text/javascript" src="/js/lang/' + UI_GetI18NLocale() + '/i18n.js"></script>\n'
            + '<script type="text/javascript" src="/js/lang/' + UI_GetI18NLocale() + '/global.js"></script>\n'
            + '<!-- Kernel -->\n'
            + '<script type="text/javascript" src="/js/kernel/kernel.js"></script>\n'
            + '<script type="text/javascript" src="/js/kernel/kernelSpecific.js"></script>\n'

            + '<!-- helpers -->\n'
            + '<script type="text/javascript" src="/js/helpers/q.js"></script>\n'
            + '<script type="text/javascript" src="/js/helpers/syncAPIHelper.js"></script>\n'
            + '<script type="text/javascript" src="/js/helpers/apiHelper.js"></script>\n'
            + '<script type="text/javascript" src="/js/helpers/uiHelper.js"></script>\n'
            + '<script type="text/javascript" src="/js/helpers/formatHelper.js"></script>\n'
            + '<script type="text/javascript" src="/js/helpers/dataHelper.js"></script>\n'
            + '<script type="text/javascript" src="/js/helpers/flickrHelper.js"></script>\n'
            + '<!-- data -->\n'
            + '<script type="text/javascript" src="/js/data/devises.js"></script>\n'
            + '<!-- pages -->\n'
            + '<script type="text/javascript" src="/js/pages/taux/listeTaux.js"></script>\n'
            + '<!-- templates -->\n'
            + '<script type="text/javascript" src="/js/pages/taux/listeTauxTemplates.js"></script>\n'
        );
      } catch (exception) {
       console.error(exception);
   }
});

/*var Taux = (function () {

    return {

        devises: {
            "USD": {
                fileName: "US dollar",
                flag: "us.png",
                keywords: "Washington, D.C."
            },
            "JPY": {
                fileName: "Japanese yen",
                flag: "jp.png",
                keywords: "Tokyo"
            },
            "BGN": {
                fileName: "Bulgarian lev",
                flag: "bg.png",
                keywords: "Sofia"
            },
            "CZK": {
                fileName: "Czech koruna",
                flag: "cz.png",
                keywords: "Prague"
            },
            "DKK": {
                fileName: "Danish krone",
                flag: "dk.png",
                keywords: "Copenhague"
            },
            "GBP": {
                fileName: "Pound sterling",
                flag: "gb.png",
                keywords: "Londres"
            },
            "HUF": {
                fileName: "Hungarian forint",
                flag: "hu.png",
                keywords: "Budapest"
            },
            "LTL": {
                fileName: "Lithuanian litas",
                flag: "lt.png",
                keywords: "Vilnius"
            },
            "LVL": {
                fileName: "Latvian lats",
                flag: "lv.png",
                keywords: "Riga"
            },
            "PLN": {
                fileName: "Polish zloty",
                flag: "pl.png",
                keywords: "Varsovie"
            },
            "RON": {
                fileName: "New Romanian leu",
                flag: "ro.png",
                keywords: "Bucarest"
            },
            "SEK": {
                fileName: "Swedish krona",
                flag: "se.png",
                keywords: "Stockholm"
            },
            "CHF": {
                fileName: "Swiss franc",
                flag: "ch.png",
                keywords: "Berne"
            },
            "NOK": {
                fileName: "Norwegian krone",
                flag: "no.png",
                keywords: "Oslo"
            },
            "HRK": {
                fileName: "Croatian kuna",
                flag: "hr.png",
                keywords: "Zagreb"
            },
            "RUB": {
                fileName: "Russian rouble",
                flag: "ru.png",
                keywords: "Moscou"
            },
            "TRY": {
                fileName: "Turkish lira",
                flag: "tr.png",
                keywords: "Ankara"
            },
            "AUD": {
                fileName: "Australian dollar",
                flag: "au.png",
                keywords: "Canberra"
            },
            "BRL": {
                fileName: "Brasilian real",
                flag: "br.png",
                keywords: "Brasilia"
            },
            "CAD": {
                fileName: "Canadian dollar",
                flag: "ca.png",
                keywords: "Ottawa"
            },
            "CNY": {
                fileName: "Chinese yuan renminbi",
                flag: "cn.png",
                keywords: "Pékin"
            },
            "HKD": {
                fileName: "Hong Kong dollar",
                flag: "hk.png",
                keywords: "Hong Kong"
            },
            "IDR": {
                fileName: "Indonesian rupiah",
                flag: "id.png",
                keywords: "Jakarta"
            },
            "ILS": {
                fileName: "Israeli shekel",
                flag: "il.png",
                keywords: "Jérusalem"
            },
            "INR": {
                fileName: "Indian rupee",
                flag: "in.png",
                keywords: "New Delhi"
            },
            "KRW": {
                fileName: "South Korean won",
                flag: "kr.png",
                keywords: "Séoul"
            },
            "MXN": {
                fileName: "Mexican peso",
                flag: "mx.png",
                keywords: "Mexico"
            },
            "MYR": {
                fileName: "Malaysian ringgit",
                flag: "my.png",
                keywords: "Lumpur"
            },
            "NZD": {
                fileName: "New Zealand dollar",
                flag: "nz.png",
                keywords: "Wellington"
            },
            "PHP": {
                fileName: "Philippine peso",
                flag: "ph.png",
                keywords: "Manille"
            },
            "SGD": {
                fileName: "Singapore dollar",
                flag: "sg.png",
                keywords: "Singapour"
            },
            "THB": {
                fileName: "Thai baht",
                flag: "th.png",
                keywords: "Bangkok"
            },
            "ZAR": {
                fileName: "South African rand",
                flag: "za.png",
                keywords: "Le cap"
            }
        }
    };
})();*/


