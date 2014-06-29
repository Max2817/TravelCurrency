
var formatHelper = (function () {
    return {
        XML2jsobj: function (node) {

            var data = {};

            // append a value
            function Add(name, value) {
                if (data[name]) {
                    if (data[name].constructor != Array) {
                        data[name] = [data[name]];
                    }
                    data[name][data[name].length] = value;
                }
                else {
                    data[name] = value;
                }
            };

            // element attributes
            var c, cn;
            for (c = 0; cn = node.attributes[c]; c++) {
                Add(cn.name, cn.value);
            }

            // child elements
            for (c = 0; cn = node.childNodes[c]; c++) {
                if (cn.nodeType == 1) {
                    if (cn.childNodes.length == 1 && cn.firstChild.nodeType == 3) {
                        // text value
                        Add(cn.nodeName, cn.firstChild.nodeValue);
                    }
                    else {
                        // sub-object
                        Add(cn.nodeName, formatHelper.XML2jsobj(cn));
                    }
                }
            }

            return data;

        },
        /*
        * Return a Date (DDMMYYYY format)
        */
        getDateYYYYMMDD: function () {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //Janvier est 0 en JS!
            var yyyy = today.getFullYear();
            if (dd < 10) { dd = '0' + dd } if (mm < 10) { mm = '0' + mm } today = yyyy + mm + dd;
            return today;
        },
        formatFloat: function (floatNumber) {
            var array = floatNumber.toString().split(".");
            if (array.length > 1 && array[1].length > 6) {
                floatNumber = floatNumber.toFixed(6);
            }
            return floatNumber;
        },
        getMonthString: function (monthNum) {
            var monthString = null;
            switch (parseInt(monthNum)) {
                case 1:  monthString = _i18n.lblJan;
                    break;
                case 2:  monthString = _i18n.lblFev;
                    break;
                case 3:  monthString = _i18n.lblMar;
                    break;
                case 4:  monthString = _i18n.lblAvr;
                    break;
                case 5:  monthString = _i18n.lblMai;
                    break;
                case 6:  monthString = _i18n.lblJuin;
                    break;
                case 7:  monthString = _i18n.lblJuil;
                    break;
                case 8:  monthString = _i18n.lblAou;
                    break;
                case 9:  monthString = _i18n.lblSep;
                    break;
                case 10: monthString = _i18n.lblOct;
                    break;
                case 11: monthString = _i18n.lblNov;
                    break;
                case 12: monthString = _i18n.lblDec;
                    break;
                default: monthString = _i18n.lblInvalidMonth;
                    break;      
            }
            return monthString;
        }
    };
})();