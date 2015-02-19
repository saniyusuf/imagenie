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
            name        : 'imagenie_db',
            storeName   : 'image',
            description : 'The database to hold base 64 versions of all your images so they are available offline'
        })

        .factory('ImagenieUtil', ['$q', ImagenieUtil])

        .directive('imagenie', ['ImagenieUtil', '$localForage', 'IMAGENIE_LOCAL_FORAGE_CONFIG', DirectiveFunction]);

    function ImagenieUtil ($q){
        var ImagenieUtil = {};

        ImagenieUtil.getImageBase64String = function (url, outputFormat) {
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
                dataURL = canvas.toDataURL(outputFormat);
                imageBase64StringPromise.resolve(dataURL);
                canvas = null;
                //callback.call(this, dataURL);
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
                //console.log('Image SRC Gotten From Imagenie : ' + elementAttributes.imagenie);
                return elementAttributes.imagenie;
            }else if(!this.isEmpty(elementAttributes.ngSrc)){
                //console.log('Image SRC Gotten From NG-SRC : ' + elementAttributes.ngSrc);
                return elementAttributes.ngSrc;
            }else if (!this.isEmpty(elementAttributes.src)){
                //console.log('Image SRC Gotten From SRC : ' + elementAttributes.src);
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
                                //console.log('This Image Exists In Local Forage: ' + imageSrc);
                                if(!ImagenieUtil.isEmpty(localImageSuccessData)){

                                    ImagenieUtil.setImageToElement(element, localImageSuccessData);

                                }else{
                                    //console.log('Image Exist But Is Undefined Or Empty');
                                    var newImage = angular.element('<img />');
                                    newImage.bind('load', function (loadedEvent) {
                                        ImagenieUtil.getImageBase64String(imageSrc)
                                            .then(function (imageBase64String) {
                                                //console.log('Gotten The Base 64 Image String');
                                                imagenieLocalForageInstance.setItem(encodeURIComponent(imageSrc), imageBase64String);
                                                ImagenieUtil.setImageToElement(element, imageBase64String);

                                            });
                                    });

                                    newImage.attr('src', imageSrc);
                                }

                            }, function (localImageFailureData) {

                                //console.log('Image Does Not Exist In Local Forage');
                                var newImage = angular.element('<img />');
                                newImage.bind('load', function (loadedEvent) {
                                    ImagenieUtil.getImageBase64String(imageSrc)
                                        .then(function (imageBase64String) {
                                            //console.log('Gotten The Base 64 Image String');
                                            imagenieLocalForageInstance.setItem(encodeURIComponent(imageSrc), imageBase64String);
                                            ImagenieUtil.setImageToElement(element, imageBase64String);
                                        });
                                });

                                newImage.attr('src', imageSrc);
                            });
                    }else{
                        //console.log(attrs);
                    }
                });

            }
        }
    }
})();
