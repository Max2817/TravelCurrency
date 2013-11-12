var uiHelper = (function () {

    return {

        // Permet d'intégrer du contenu HTML dans un conteneur HTML
        pushContent: function (/*@type(String)*/ id, /*@type(String)*/ content) {
            if (document.getElementById(id)) {
                kernelSpecific.execUnsafeLocalFunction(function () {
                    document.getElementById(id).innerHTML = content;
                });
            }
        },

        // Permet d'intégrer du contenu HTML dans un conteneur HTML
        pushContentToTagNameElement: function (/*@type(DOMElement)*/ element, /*@type(String)*/ content) {
            if (element) {
                kernelSpecific.execUnsafeLocalFunction(function () {
                    element.innerHTML = content;
                });
            }
        }
        
    };
})();