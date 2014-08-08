
/// <reference path="//Microsoft.WinJS.2.0/js/ui.js" />
var _LANGUAGES = ["fr", "en"];
// Retourne la localisation du device
function UI_GetLocale() {
    var language = null;
    if (window.navigator.userLanguage )
        language = window.navigator.userLanguage.substring(0, 2);
    else if (window.navigator.browserLanguage)
        language = window.navigator.browserLanguage.substring(0, 2);
    else if (window.navigator.systemLanguage)
        language = window.navigator.systemLanguage.substring(0, 2);
    else if (window.navigator.language)
        language = window.navigator.language.substring(0, 2);
    if (language != null && _LANGUAGES.indexOf(language) > -1)
        return language;
    else
        return "en";
}
//includes all HTML inclusions
MSApp.execUnsafeLocalFunction(function () {
    try {


        document.write(
            '<!-- CSS -->\n'
            + '<link href="/css/focal-point.css" rel="stylesheet" />\n'
            + '<link href="/css/normalize.css" rel="stylesheet" />\n'
            + '<!-- Microsoft -->\n'
            + '<script type="text/javascript" src="//Microsoft.WinJS.1.0/js/base.js"></script>\n'
            + '<script type="text/javascript" src="//Microsoft.WinJS.1.0/js/ui.js"></script>\n'

            + '<!-- i18n -->\n'
            + '<script type="text/javascript" src="/js/lang/' + UI_GetLocale() + '/i18n.js"></script>\n'
            + '<script type="text/javascript" src="/js/lang/' + UI_GetLocale() + '/global.js"></script>\n'
            + '<!-- Kernel -->\n'
            + '<script type="text/javascript" src="/js/kernel/kernel.js"></script>\n'
            + '<script type="text/javascript" src="/js/kernel/kernelSpecific.js"></script>\n'

            + '<!-- helpers -->\n'
            + '<script type="text/javascript" src="/js/helpers/q.js"></script>\n'
            + '<script type="text/javascript" src="/js/helpers/highcharts.js"></script>\n'
            + '<script type="text/javascript" src="/js/helpers/highstock.js"></script>\n'
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