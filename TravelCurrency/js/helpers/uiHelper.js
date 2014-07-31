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
        },

        codeTouche: function (evenement) {
            for (prop in evenement) {
                if (prop == 'which') return (evenement.which);
            }
            return (evenement.keyCode);
        },

        pressePapierNS6: function (evenement, touche) {
            var rePressePapierNS = /[cvxz]/i;
            var isModifiers = false

            for (prop in evenement) if (prop == 'ctrlKey') isModifiers = true;
            if (isModifiers) return evenement.ctrlKey && rePressePapierNS.test(touche);
            else return false;
        },
        //Check user input in an input field
        scanToucheSpe: function (evenement, finishCallback) {
            var reCarSpeciaux = /[\x00\x08\x0D\x03\x16\x18\x1A\.]/;
            var reCarValides = /\d/;

            var codeDecimal = uiHelper.codeTouche(evenement);
            var car = String.fromCharCode(codeDecimal);
            var autorisation = reCarValides.test(car) || reCarSpeciaux.test(car) || uiHelper.pressePapierNS6(evenement, car);

            if (autorisation)
                finishCallback();
        },
        scanTouche: function (evenement) {
            var reCarSpeciaux = /[\x00\x08\x0D\x03\x16\x18\x1A\.]/;
            var reCarValides = /\d/;

            var codeDecimal = uiHelper.codeTouche(evenement);
            var car = String.fromCharCode(codeDecimal);
            var autorisation = reCarValides.test(car) || reCarSpeciaux.test(car) || uiHelper.pressePapierNS6(evenement, car);

            return autorisation;
        },
        //Check an input field content
        scanChamp: function (objChamp) {
            var reContenuValide = /^[0-9]*\.?[0-9]+$/; //Only numbers
            if (!reContenuValide.test(objChamp.value)) {
                objChamp.value = '';
                objChamp.focus();
            }
        }
        
    };
})();