/**
 * Created by Sani Yusuf AKA Toruk Makto on 23/01/15.
 * @saniyusuf on Twitter
 *
 * Modified by jlsuarezs on 26/10/2015
 *
 *
 * Description
 * ***********
 *The aim of this library is to provide Ionic developers an easy way of having images cache locally without worrying about the specifics.
 * You simply hook it into any element DIV, IMG or whatever and anytime that element tries to resolve an Image magic happens
 */
(function () {

    angular.module('imagenie', ['LocalForageModule'])

        .constant('IMAGENIE_LOCAL_FORAGE_CONFIG', {
            name        : 'imagenie_db',
            storeName   : 'image',
            description : 'The database to hold base 64 versions of all your images so they are available offline'
        })

        .factory('ImagenieUtil', ['$q', ImagenieUtil])

        .directive('imagenie', ['ImagenieUtil', '$localForage', 'IMAGENIE_LOCAL_FORAGE_CONFIG', DirectiveFunction]);

    function ImagenieUtil ($q){
        var ImagenieUtil = {};

        ImagenieUtil.getImageBase64String = function (url, outputFormat, imageQuality) {

            // set default quality
            imageQuality = typeof imageQuality !== 'undefined' ? imageQuality : 0.8;

            // set format to jpeg
            outputFormat = typeof outputFormat !== 'undefined' ? outputFormat : "image/jpeg";

            var imageBase64StringPromise = $q.defer();

            var canvas = document.createElement('CANVAS'),
                ctx = canvas.getContext('2d'),
                img = new Image;
            img.crossOrigin = 'Anonymous';
            img.onload = function(){
                var dataURL;
                canvas.height = img.height;
                canvas.width = img.width;
                ctx.drawImage(img, 0, 0);

                // set image quality to medium
                dataURL = canvas.toDataURL(outputFormat, imageQuality);

                canvas = null;
                imageBase64StringPromise.resolve(dataURL);
            };
            img.onerror = function () {
              imageBase64StringPromise.reject(url);
            };
            img.src = url;
            return imageBase64StringPromise.promise;
        };

        ImagenieUtil.isUndefined = function (value) {
            return typeof value === 'undefined';
        };

        ImagenieUtil.isEmpty = function (value) {
            return this.isUndefined(value) || value === '' || value === null;
        };

        ImagenieUtil.getImageSrc = function (elementAttributes) {
            if(!this.isEmpty(elementAttributes.imagenie)){
                return elementAttributes.imagenie;
            }else if(!this.isEmpty(elementAttributes.ngSrc)){
                return elementAttributes.ngSrc;
            }else if (!this.isEmpty(elementAttributes.src)){
                return elementAttributes.src;
            }else{
                console.warn('Image Src Undefined');
                return null;
            }
        };

        ImagenieUtil.setImageToElement = function (element, imageBase64String) {
            if(element[0].nodeName === 'IMG'){
                element.attr('src', imageBase64String);
            }else{
                element.css('background-image', 'url(' + imageBase64String + ')');
            }
        };

        ImagenieUtil.isUriAbsolute = function (uri) {
            //****************
            //http://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
            //****************
            var uriTypeRegex = new RegExp('^(?:[a-z]+:)?//', 'i');
            return uriTypeRegex.test(uri);
        };

        return ImagenieUtil;
    }

    function DirectiveFunction(ImagenieUtil, $localForage, IMAGENIE_LOCAL_FORAGE_CONFIG) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                attrs.$observe('imagenie', function () {
                    var imageSrc = ImagenieUtil.getImageSrc(attrs);
                    var imagenieLocalForageInstance = {};

                    try {
                        imagenieLocalForageInstance = $localForage.instance(IMAGENIE_LOCAL_FORAGE_CONFIG.name);
                    }catch (error) {
                        if(ionic.Platform.isIOS()){
                            //Force WebSQL on IOS as IndexedDB is not stable on IOS
                            var iosConfig = angular.extend(IMAGENIE_LOCAL_FORAGE_CONFIG, {driver : 'webSQLStorage'});
                            imagenieLocalForageInstance = $localForage.createInstance(iosConfig);
                        }else{
                            imagenieLocalForageInstance = $localForage.createInstance(IMAGENIE_LOCAL_FORAGE_CONFIG);
                        }
                    }

                    if(ImagenieUtil.isUriAbsolute((imageSrc))){

                        attrs.ngSrc = '';
                        imagenieLocalForageInstance.getItem(encodeURIComponent(imageSrc))
                            .then(function (localImageSuccessData) {
                                if(!ImagenieUtil.isEmpty(localImageSuccessData)){

                                    ImagenieUtil.setImageToElement(element, localImageSuccessData);

                                }else{
                                    
                                    // No need to create a new img element, just set the image
                                    ImagenieUtil.getImageBase64String(imageSrc, attrs.outputFormat, scope.$eval(attrs.imageQuality))
                                        .then(function (imageBase64String) {
                                            imagenieLocalForageInstance.setItem(encodeURIComponent(imageSrc), imageBase64String);
                                            ImagenieUtil.setImageToElement(element, imageBase64String);

                                        });
                                   
                                }

                            }, function () {

                                ImagenieUtil.getImageBase64String(imageSrc, attrs.outputFormat, scope.$eval(attrs.imageQuality))
                                    .then(function (imageBase64String) {
                                        imagenieLocalForageInstance.setItem(encodeURIComponent(imageSrc), imageBase64String);
                                        ImagenieUtil.setImageToElement(element, imageBase64String);
                                    });
                                
                            });
                    }
                });

            }
        }
    }
})();
