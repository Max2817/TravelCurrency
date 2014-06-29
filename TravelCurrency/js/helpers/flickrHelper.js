/// <reference path="q.js" />
/// <reference path="jQuery.js" />
"use strict";

// Uses jQuery and Q.

var API_KEY = "0052b1217b11719b4e6f503e4b70a258";

function getFlickrResponseAsync(method, responseProperty, params) {
    var deferred = Q.defer();

    $.ajax("http://www.flickr.com/services/rest/", {
        data: $.extend({
            method: method,
            format: "json",
            api_key: API_KEY
        }, params),
        dataType: "jsonp",
        jsonp: "jsoncallback"
    })
    .done(function (result) {
        if (result.stat === "ok") {
            deferred.resolve(result[responseProperty]);
        } else {
            deferred.reject(new Error("Flickr API failure: " + result.message + "(" + result.code + ")."));
        }
    })
    .fail(function (xhr, textStatus, errorThrown) {
        var error = new Error("Ajax request to the Flickr API failed.");
        error.textStatus = textStatus;
        error.errorThrown = errorThrown;
        deferred.reject(error);
    });

    return deferred.promise;
}

function getPhotosetsAsync(userId) {
    return getFlickrResponseAsync("flickr.photosets.getList", "photosets", { user_id: userId }).get("photoset");
}

function getPhotosetPhotosAsync(photosetId) {
    var params = { photoset_id: photosetId, extras: "description" };
    return getFlickrResponseAsync("flickr.photosets.getPhotos", "photoset", params).get("photo");
}

function makePhotoUri(dto, size, idProperty) {
    idProperty = idProperty || "id";
    return "http://farm" + dto.farm + ".staticflickr.com/" + dto.server + "/" +
            dto[idProperty] + "_" + dto.secret + (size ? "_" + size : "") + ".jpg";
}