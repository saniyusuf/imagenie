/**
 * Created by Sani Yusuf on 28/02/2015.
 */

describe('Imagenie Util', function () {
    beforeEach(function () {
        module('imagenie');
    });

    describe('isUriAbsolute()', function () {
        var relativeFilePath = '/relative/file/path/file.jpg';
        var absoluteFilePath = 'http://abosolute/file/path/file.png';

        it('Should Return False When Passed A Relative File Path', inject(function (ImagenieUtil) {
            expect(ImagenieUtil.isUriAbsolute(relativeFilePath)).toBeFalsy();
        }));

        it('Should Return True When Passed An Absolute File Path', inject(function (ImagenieUtil) {
            expect(ImagenieUtil.isUriAbsolute(absoluteFilePath)).toBeTruthy();
        }))
    });
    
    describe('getImageSrc()', function () {
        var attr = {
            "imagenie": "imagenie",
            "ngSrc": "ngSrc",
            "src": "src"
        };

        var ngSrcAttr = {
            "ngSrc": "ngSrc",
            "src": "src"
        };

        var srcAttr = {
            "src": "src"
        };

        it('Should Resolve To Imagenie Attr As Priority', inject(function (ImagenieUtil) {
            expect(ImagenieUtil.getImageSrc(attr)).toBe('imagenie');
        }));

        it('Should Resolve To ngSrc Attr As 2nd Choice', inject(function (ImagenieUtil) {
            expect(ImagenieUtil.getImageSrc(ngSrcAttr)).toBe('ngSrc');
        }));

        it('Should Resolve To src Attr As 3nd Choice', inject(function (ImagenieUtil) {
            expect(ImagenieUtil.getImageSrc(srcAttr)).toBe('src');
        }));

        it('Should Resolve To Null When Nothing is Passed', inject(function (ImagenieUtil) {
            var emptyAttr = {};
            expect(ImagenieUtil.getImageSrc(emptyAttr)).toBeNull();
        }));
    });

});