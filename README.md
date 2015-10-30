[![Build Status](https://travis-ci.org/saniyusuf/imagenie.svg?branch=master)](https://travis-ci.org/saniyusuf/imagenie)

# imagenie
A repository for Angular JS component designed to used with Ionic mobile applications to automatically handle the offline caching of images.

    bower install https://github.com/jlsuarezs/imagenie.git --save

You simply put the imagenie attribute on your DIV or IMG and the component will do the rest. If a locally stored version exisit, it will be resolved if not it will query the serve and store it for next time. 

##You Must Have LocalForage And AngularLocalForage Installed As It Is Dependant On This Great Tool##

##E.G Of Use 
    <div imagenie="http://myImagePath/subPath/myImage.jpg"> </div>
    <img ng-src="http://myImagePath/subPath/myImage.jpg">
    <img imagenie="http://myImagePath/subPath/myImage.jpg">


##Roadmap
* ~~Unit Testing~~
* ~~Contnous Int With Travis~~
* Integrate expiry option
* Integrate feature that clears expired images per launch
* Integrate Web Worker Support


