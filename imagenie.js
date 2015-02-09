/**
 * Created by Sani Yusuf AKA Toruk Makto on 23/01/15.
 * @saniyusuf on Twitter
 *
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
            name        : 'imagenie_db', // name of the database and prefix for your data, it is "lf" by default
            storeName   : 'image', // name of the table
            description : 'The database to hold base 64 versions of all your images so they are available offline'
        })

        .factory('ImagenieUtil', ImagenieUtil)

        .directive('imagenie', ['ImagenieUtil', '$localForage', 'IMAGENIE_LOCAL_FORAGE_CONFIG', DirectiveFunction]);

    function ImagenieUtil (){
        var ImagenieUtil = {};
        ImagenieUtil.getImageBase64String = function (url, callback, outputFormat){
            var canvas = document.createElement('CANVAS'),
                ctx = canvas.getContext('2d'),
                img = new Image;
            img.crossOrigin = 'Anonymous';
            img.onload = function(){
                var dataURL;
                canvas.height = img.height;
                canvas.width = img.width;
                ctx.drawImage(img, 0, 0);
                dataURL = canvas.toDataURL(outputFormat);
                callback.call(this, dataURL);
                canvas = null;
            };
            img.src = url;
        };

        ImagenieUtil.isUndefined = function (value) {
            return typeof value === 'undefined';
        };

        ImagenieUtil.isEmpty = function (value) {
            return this.isUndefined(value) || value === '' || value === null;
        };

        ImagenieUtil.getImageSrc = function (elementAttributes) {
            if(!this.isEmpty(elementAttributes.imagenie)){
                console.log('Image SRC Gotten From Imagenie : ' + elementAttributes.imagenie);
                return elementAttributes.imagenie;
            }else if(!this.isEmpty(elementAttributes.ngSrc)){
                console.log('Image SRC Gotten From NG-SRC : ' + elementAttributes.ngSrc);
                return elementAttributes.ngSrc;
            }else if (!this.isEmpty(elementAttributes.src)){
                console.log('Image SRC Gotten From SRC : ' + elementAttributes.src);
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

        return ImagenieUtil;
    }

    function DirectiveFunction(ImagenieUtil, $localForage, IMAGENIE_LOCAL_FORAGE_CONFIG) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                attrs.$observe('imagenie', function (value) {
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

                    //Check if URI Is Absolute
                    //
                    //If URI Is Relative, No Need To Cache It Or Attempt To Retrieve It
                    //****************
                    //http://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
                    //****************

                    var uriTypeRegex = new RegExp('^(?:[a-z]+:)?//', 'i');
                    if(uriTypeRegex.test(imageSrc)){

                        attrs.ngSrc = '';
                        imagenieLocalForageInstance.getItem(encodeURIComponent(imageSrc))
                            .then(function (localImageSuccessData) {
                                console.log('This Image Exists In Local Forage: ' + imageSrc);
                                if(!ImagenieUtil.isEmpty(localImageSuccessData)){

                                    ImagenieUtil.setImageToElement(element, localImageSuccessData);

                                }else{
                                    console.log('Image Exist But Is Undefined Or Empty');
                                    var newImage = angular.element('<img />');
                                    newImage.bind('load', function (loadedEvent) {
                                        ImagenieUtil.getImageBase64String(imageSrc, function (imageBase64String) {
                                            console.log('Gotten The Base 64 Image String');

                                            imagenieLocalForageInstance.setItem(encodeURIComponent(imageSrc), imageBase64String);
                                            ImagenieUtil.setImageToElement(element, imageBase64String);

                                        });
                                    });

                                    newImage.bind('error', function (errorEvent) {
                                        ImagenieUtil.setImageToElement(element, imageSrc);
                                    });

                                    newImage.attr('src', imageSrc);
                                }

                            }, function (localImageFailureData) {

                                console.log('Image Does Not Exist In Local Forage');
                                var newImage = angular.element('<img />');
                                newImage.bind('load', function (loadedEvent) {
                                    ImagenieUtil.getImageBase64String(imageSrc, function (imageBase64String) {
                                        console.log('Gotten The Base 64 Image String');

                                        imagenieLocalForageInstance.setItem(encodeURIComponent(imageSrc), imageBase64String);
                                        ImagenieUtil.setImageToElement(element, imageBase64String);

                                    });
                                });

                                newImage.bind('error', function (errorEvent) {
                                    ImagenieUtil.setImageToElement(element, imageSrc);
                                });

                                newImage.attr('src', imageSrc);
                            });
                    }else{
                        console.log(attrs);
                    }
                });

            }
        }
    }
})();
