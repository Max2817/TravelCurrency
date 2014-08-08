
var kernelSpecific = (function () {

    return {
        // display the standard error pop-up
        popupException: function (/*@type(String)*/ erreur) {
            syncAPIHelper.loadApplicationFile({ url: "/js/pages/exception/exception.html" }
                , function (response) {
                    kernel.setContentToTagNameElement(document.getElementById("erreur"), response);
                    kernel.setContentToTagNameElement(document.getElementById("exception_title"), "Oups, il semble que nous soyons tombés sur une erreur !");
                    kernel.setContentToTagNameElement(document.getElementById("exception_content"), erreur);
                    document.getElementById("modal-outer").style.display = "block";
                },
                function (error) {
                    console.log(error);
                }
            );
        },

        popupOneButton: function (/*@type(String)*/ erreur, buttonName, validateCallBack, tempMsg) {
            syncAPIHelper.loadApplicationFile({ url: "/js/pages/popup/popup.html" }
                , function (response) {
                    kernel.setContentToTagNameElement(document.getElementById("erreur"), response);
                    kernel.setContentToTagNameElement(document.getElementById("popup_title"), "Oups, il semble que nous soyons tombés sur une erreur !");
                    kernel.setContentToTagNameElement(document.getElementById("popup_content"), erreur);
                    if (tempMsg)
                        kernel.setContentToTagNameElement(document.getElementById("popup_temp_msg"), tempMsg);
                    document.getElementById("modal-outer").style.display = "block";
                    document.getElementById("validate_button").innerText = buttonName;
                    document.getElementById("validate_button").addEventListener('click',
                        function () {
                            validateCallBack();
                        },
                        false
                    );
                },
                function (error) {
                    kernelSpecific.popupException(error);
                }
            );

        },

        // execute function with the windows 8 security
        execUnsafeLocalFunction: function (/*@type(function)*/ fonction) {
            MSApp.execUnsafeLocalFunction(function () {
                return fonction();
            });
        },

        // extract page url without specific root
        getPageFromUrl: function (/*@type(String)*/ url) {
            // searchin the first slash / after ms-appx://xxx
            if (url.indexOf("/", 11) > 0)
                return url.substring(url.indexOf("/", 11));
            return url;
        },

    };
})();


