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
            //'<!-- CSS -->\n'
            /*+ '<link href="/css/global.css" rel="stylesheet" />\n'*/

             '<!-- Microsoft -->\n'
            + '<script type="text/javascript" src="//Microsoft.WinJS.1.0/js/base.js"></script>\n'
            + '<script type="text/javascript" src="//Microsoft.WinJS.1.0/js/ui.js"></script>\n'

            + '<!-- i18n -->\n'
            + '<script type="text/javascript" src="/js/lang/' + UI_GetI18NLocale() + '/i18n.js"></script>\n'
            + '<script type="text/javascript" src="/js/lang/' + UI_GetI18NLocale() + '/global.js"></script>\n'
            + '<!-- Kernel -->\n'
            + '<script type="text/javascript" src="/js/kernel/kernel.js"></script>\n'
            + '<script type="text/javascript" src="/js/kernel/kernelSpecific.js"></script>\n'

            + '<!-- helpers -->\n'
            + '<script type="text/javascript" src="/js/helpers/uiHelper.js"></script>\n'
            + '<script type="text/javascript" src="/js/helpers/formatHelper.js"></script>\n'
            + '<script type="text/javascript" src="/js/helpers/heartcode-canvasloader.js"></script>\n'
            + '<!-- data -->\n'
            + '<script type="text/javascript" src="/js/data/devises.js"></script>\n'
        );
      } catch (exception) {
       console.error(exception);
   }
});