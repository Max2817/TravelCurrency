/// <reference path="../../helpers/formatHelper.js" />
var listeTauxTemplates = (function () {
    return {
        getBaseCurrencyHeader: function (referenceCurrency, listNouveauxTaux, multiplicator) {
            var buildContent = '<div id="entete">';
            buildContent += '<div id="choosenCurrency">';
            buildContent += '<img src="../../../images/flags/64/' + referenceCurrency.flag + '" alt="' + referenceCurrency.currency + '" class="thumbnail"/>';
            buildContent += '</div>';
            buildContent += '<div id="currencyList">';
            buildContent += '<div id="curName"><input type="number" value="' + multiplicator + '" id="convertedNumber" maxlength="5" onKeyPress="return uiHelper.scanTouche(event);" onKeyUp="uiHelper.scanToucheSpe(event, taux.handleChange);" onChange="uiHelper.scanChamp(this)"></input><h2>' + referenceCurrency.filename + '</h2></div>';
            buildContent += '<div id="fields">';
            buildContent += '<select id="changeCurrency">';
            buildContent += '<option value="">' + _i18n.lblChangeCurrency + '</option>';
            for (var taux in listNouveauxTaux) {
                buildContent += '<option value="' + listNouveauxTaux[taux].currency + '" data-convertion-rate="' + 1 / listNouveauxTaux[taux].rate + '" >' + listNouveauxTaux[taux].filename + '</option>';
            }
            buildContent += '</select>';
            buildContent += '</div>';
            buildContent += '</div>';
            buildContent += '</div>';
            return buildContent;
        },

        getListeNouveauxTauxTemplate: function (referenceCurrency, listNouveauxTaux, multiplicator) {
            var buildContent = '';
            buildContent += '<ul id="nouveauxTaux">';
            for (var index in listNouveauxTaux) {
                var nouveauTaux = listNouveauxTaux[index];
                buildContent += '<a href="#" id="currency_' + nouveauTaux.currency + '" data-currency="' + nouveauTaux.currency + '" data-currency-name="' + nouveauTaux.filename + '" >';
                buildContent += '<li id="li_' + nouveauTaux.currency + '">';
                buildContent += '<img src="../../../images/flags/64/' + nouveauTaux.flag + '" alt="' + nouveauTaux.currency + '" class="thumbnail"/>';
                buildContent += '<div class="newTauxValue"><h2>' + nouveauTaux.filename + '</h2>';
                //buildContent += '<p class="taux">' + multiplicator + ' ' + referenceCurrency.currency + '<span class="price">';
                buildContent += '<p class="taux"><span class="price">';
                buildContent += ' = '+ formatHelper.formatFloat(nouveauTaux.rate*multiplicator) + ' ' + nouveauTaux.currency + '</span></p></div>';
                buildContent += '</li></a>';
            }
            buildContent += '</ul>';
            return buildContent;
        },
        getListeAnciensTauxTemplate: function (anciensTaux) {
            var buildContent = '<div id="scale">'
                + '<div id="limit-top">'
                + '</div>'
                + '<div id="scale-top">'
                    + '<span>'
                        + 'Max.\n';
            buildContent += formatHelper.formatFloat(anciensTaux.max);
            buildContent += '</span>'
                + '</div>'
                + '<div id="scale-middle">'
                + '</div>'
                + '<div id="scale-bottom">'
                    + '<span>'
                        + 'Min.\n';
            buildContent += formatHelper.formatFloat(anciensTaux.min);
            buildContent += '</span>'
                + '</div>'
                + '<div id="limit-bottom">'
                + '</div>'
                + '</div>';
                buildContent += '<ul class="barchart">';
            var taux = null;
            var listeAnciensTaux = anciensTaux.values;
            var dateTaux = null;
            var year = null;
            var month = null;
            var day = null;
            var currentMonth = null;
            var currentYear = null;
            for (var index in listeAnciensTaux) {
                taux = listeAnciensTaux[index];
                dateTaux = taux.currentDate.split("-");
                year = dateTaux[0];
                month = dateTaux[1];
                day = dateTaux[2];
                if (index == 0) {
                    currentMonth = month;
                    currentYear = year;
                    buildContent += '<li class="year">' + formatHelper.getMonthString(month) + '</li>';
                } else {
                    if (parseInt(currentYear) == parseInt(year) && parseInt(month) < parseInt(currentMonth) || parseInt(currentYear) > parseInt(year)) {
                        currentMonth = month;
                        currentYear = year;
                        buildContent += '<li class="year">' + formatHelper.getMonthString(month) + '</li>';
                    }
                }

                buildContent += '<li id="old_' + index + '">';
                //buildContent += '<span></span>';
                buildContent += day + '<br />';
                //buildContent += '<p class="taux">Taux :  <span class="price">' + formatHelper.formatFloat(taux.rate) + '</span></p>';
                buildContent += '</li></a>';  
            }
            buildContent += '</ul>';
            return buildContent;
        },
        getPhotoTemplate: function (photoURL, currencyExtendedName) {

            var buildContent = '<div class="focal-point down-5"><div>';
            buildContent += '<img id="imgCountry" src="';
            if (kernel.is_cached(photoURL) || kernel.doesConnectionExists())
                buildContent += photoURL;
            else
                buildContent += '../../../images/default-image.png';
            buildContent += '" draggable="false" />';
            buildContent += '</div></div>';
            buildContent += '<div class="black">';
            buildContent += '<p>' + currencyExtendedName + '</p>';
            buildContent += '</div>';
            return buildContent;
        }
    };
})();