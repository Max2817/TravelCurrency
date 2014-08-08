/// <reference path="../../helpers/formatHelper.js" />
var listeTauxTemplates = (function () {
    return {
        //template on top of the new rates list
        getBaseCurrencyHeader: function (referenceCurrency, listNouveauxTaux, multiplicator) {
            var buildContent = '<div id="entete">';
            buildContent += '<div id="baseCurrencyTitle">' + _i18n.lblBaseCurrency + '</div>';
            buildContent += '<div id="choosenCurrency">';
            buildContent += '<img src="../../../images/flags/64/' + referenceCurrency.flag + '" alt="' + referenceCurrency.currency + '" class="thumbnail"/>';
            buildContent += '</div>';
            buildContent += '<div id="currencyList">';
            buildContent += '<div id="fields">';
            buildContent += '<select id="changeCurrency">';
            buildContent += '<option value="">' + _i18n.lblChangeCurrency + '</option>';
            for (var taux in listNouveauxTaux) {
                buildContent += '<option value="' + listNouveauxTaux[taux].currency + '" data-convertion-rate="' + 1 / listNouveauxTaux[taux].rate + '" >' + listNouveauxTaux[taux].filename + '</option>';
            }
            buildContent += '</select>';
            buildContent += '</div>';
            buildContent += '<div id="curName"><input type="number" placeholder="1" value="' + multiplicator + '" id="convertedNumber" maxlength="5" onKeyPress="return uiHelper.scanTouche(event);" onKeyUp="uiHelper.scanToucheSpe(event, taux.handleChange);" onChange="uiHelper.scanChamp(this)"></input><h2>' + referenceCurrency.filename + '</h2></div>';
            buildContent += '</div>';
            buildContent += '</div>';
            return buildContent;
        },
        //template of the new rates list
        getListeNouveauxTauxTemplate: function (referenceCurrency, listNouveauxTaux, multiplicator) {
            var buildContent = '';
            buildContent += '<ul id="nouveauxTaux">';
            for (var index in listNouveauxTaux) {
                var nouveauTaux = listNouveauxTaux[index];
                buildContent += '<a href="#" id="currency_' + nouveauTaux.currency + '" data-currency="' + nouveauTaux.currency + '" data-currency-name="' + nouveauTaux.filename + '" >';
                buildContent += '<li id="li_' + nouveauTaux.currency + '">';
                buildContent += '<img src="../../../images/flags/64/' + nouveauTaux.flag + '" alt="' + nouveauTaux.currency + '" class="thumbnail"/>';
                buildContent += '<div class="newTauxValue"><h2>' + nouveauTaux.filename + '</h2>';
                buildContent += '<p class="taux"><span class="price">';
                buildContent += ' = ' + formatHelper.formatFloat(nouveauTaux.rate * multiplicator) + ' ' + nouveauTaux.symbol + ' (' + nouveauTaux.currency + ')</span></p></div>';
                buildContent += '</li></a>';
            }
            buildContent += '</ul>';
            return buildContent;
        },
        //Photo template
        getPhotoTemplate: function (photoURL, currencyExtendedName) {

            var buildContent = '<div class="focal-point down-5"><div class="img_wrapper">';
            buildContent += '<img id="imgCountry" src="';
            if (kernel.is_cached(photoURL) || kernel.doesConnectionExists())
                buildContent += photoURL;
            else
                buildContent += '../../../images/default-image.png';
            buildContent += '" draggable="false" onload="imgLoaded(this)" />';
            buildContent += '</div></div>';
            buildContent += '<div class="black">';
            buildContent += '<p>' + currencyExtendedName + '</p>';
            buildContent += '</div>';
            return buildContent;
        }
    };
})();