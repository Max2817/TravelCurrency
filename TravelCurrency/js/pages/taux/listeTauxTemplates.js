/// <reference path="../../helpers/formatHelper.js" />
var listeTauxTemplates = (function () {
    return {

        getListeNouveauxTauxTemplate: function (referenceCurrency, listNouveauxTaux) {
            var buildContent = '<div id="entete">';
            buildContent += '<div id="choosenCurrency">';
            buildContent += '<img src="../../../images/flags/64/' + referenceCurrency.flag + '" alt="' + referenceCurrency.currency + '" class="thumbnail"/>';
            buildContent += '<h2>' + referenceCurrency.filename + '</h2>';
            buildContent += '</div>';
            buildContent += '<div id="currencyList">';
            buildContent += '<select id="changeCurrency">';
            buildContent += '<option value="">Changer de devise de référence</option>';
            for (var taux in listNouveauxTaux) {
                buildContent += '<option value="' + listNouveauxTaux[taux].currency + '" data-convertion-rate="' + 1 / listNouveauxTaux[taux].rate + '" >' + listNouveauxTaux[taux].filename + '</option>';
            }
            buildContent += '</select>';
            buildContent += '</div>';
            buildContent += '</div>';
            buildContent += '<ul>';
            for (var index in listNouveauxTaux) {
                var nouveauTaux = listNouveauxTaux[index];
                buildContent += '<a href="#" id="currency_' + nouveauTaux.currency + '" data-currency="' + nouveauTaux.currency + '" >';
                buildContent += '<li id="li_' + nouveauTaux.currency + '">';
                buildContent += '<img src="../../../images/flags/64/' + nouveauTaux.flag + '" alt="' + nouveauTaux.currency + '" class="thumbnail"/>';
                buildContent += '<h2>' + nouveauTaux.filename + '</h2>';
                buildContent += '<p class="taux">Taux :  <span class="price">' + formatHelper.formatFloat(nouveauTaux.rate) + '</span></p>';
                buildContent += '</li></a>';
            }
            buildContent += '</ul>';
            return buildContent;
        },
        getListeAnciensTauxTemplate: function (anciensTaux) {
            var buildContent = '<ul class="barchart">';
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
        getPhotoTemplate: function (photoURL, currencyName) {
            var buildContent = '';
            buildContent += '<img id="imgCountry" src="';
            if (kernel.is_cached(photoURL) || kernel.doesConnectionExists())
                buildContent += photoURL;
            else
                buildContent += '../../../images/default-image.png';
            buildContent += '" />';
            buildContent += '<div class="black">';
            buildContent += '<p>' + currencyName + '</p>';
            buildContent += '</div>';
            return buildContent;
        }
    };
})();