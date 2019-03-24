/*******************************/
/* Amitka Product Designer */
/*******************************/

// v8.0
//
/* globals $, document, console, picsObj */
/* jshint strict: true */

var PopupGallery = PopupGallery || {};

PopupGallery = (function(){

  'use strict';

  var picObj = {},
      images = [],
      theDots = [],
      imgCounter = 0,
      transitionDuration = 200;

  var $leftButton = $('.gallery-button.left'),
      $rightButton = $('.gallery-button.right'),
      $imageFrame = $('.img-frame'),
      $dotsContainer = $('.dots-container'),
      $subTitle = $('.sub-title'),
      $mainTitle = $('.main-title');

      var resetGallery = function(){
        $imageFrame.empty();
        $dotsContainer.empty();
        //
        $leftButton
          .off('click', setImgCounter)
          .fadeTo(0,1);
        $rightButton
          .off('click', setImgCounter)
          .fadeTo(0,1);
      };

      var loadGallery = function (obj){
        picObj = obj;
        var promises = [];
        $.each(picObj.images, function(index){
          var promise = loadImage(picObj.images[index].fileName);
          promises.push(promise);
        });
        //
        $.when.all(promises)
    			.then(function(results){
            console.log('All gallery promises resolved.');
            if (results !== undefined){
              initGallery(results);
            }
            else{
              console.log('LoadGallery: No images found.');
            }
        });
      };

      var loadImage = function(src){
        var deferredObj = $.Deferred();
        //
        var $newImg = $('<img>', {src:'pics/' + src, class:'img-it-self'});
        //
        $newImg
        .on('load', function(){
          deferredObj.resolve($newImg);
        });
        $newImg
        .on('error', function(){
          deferredObj.resolve();
        });
        //
        return deferredObj.promise();
      };

      var initGallery = function (arr){
        images = arr;
        imgCounter = 0;
        //
        if (images.length === 1){
          //Hide Buttons, No Dots --> Todo: One Image Mode
          $leftButton
            .fadeTo(0,0);
          $rightButton
            .fadeTo(0,0);
        }
        else {
          addDots();
          //
          //
          $leftButton
            .on('click', {param:  -1}, setImgCounter);
          //
          $rightButton
            .on('click', {param: 1}, setImgCounter);
            //
          $(theDots)
            .on('click', function(e){
              console.log('click');
              e.data = {param: theDots.index(this)};
              setImgCounter(e);
          });
        }
        //
        addImage();
        addTitles();
      };

      var setImgCounter = function (e){
        //console.log($(e.target).closest('div'));
        if (Math.abs(e.data.param) !== 1){
          imgCounter = e.data.param;
        }
        else {
          imgCounter = imgCounter + e.data.param;
        }
        //
        if (imgCounter > images.length -1){
          imgCounter = 0;
        }
        else if (imgCounter < 0) {
          imgCounter = images.length -1;
        }
        //
        addImage();
      };

      var addImage = function (){
        $(images[imgCounter])
          .appendTo($imageFrame)
          .fadeTo(transitionDuration, 1, fadePrevImage);
        //
        updateDots();
      };

      var fadePrevImage = function (){
        if ($imageFrame.children().length > 1)
        {
          var imgToRemove = $($imageFrame.children()[0]);
          imgToRemove
            .fadeTo(transitionDuration, 0, removePrevImage);
        }
      };

      var removePrevImage = function (){
        if ($imageFrame.children().length > 1){
          $imageFrame
            .children()[0]
            .remove();
        }
      };

      var addDots = function(){
        $dotsContainer.empty();
        //
        for (var i=0; i < images.length; i++){
          //console.log(i);
          var newDot = $('<div>');
          if (i === 0){
            newDot
              .addClass('dot active');
          }
          else {
            newDot
              .addClass('dot');
          }
          //
          newDot
            .appendTo($dotsContainer);
        }
        //
        theDots = $dotsContainer.children();
      };

      var updateDots = function (){
        for (var i=0; i < theDots.length; i++){
          $(theDots[i])
            .removeClass('active');
        }
        $(theDots[imgCounter])
          .addClass('active');
      };

      var addTitles = function(){
        $subTitle
          .text(picObj.project + ", " + picObj.category);
        $mainTitle
          .text(picObj.desc);
      };

  return {loadGallery: loadGallery,
          resetGallery: resetGallery};


}());



$(document).ready(function (){
	'use strict';
	//console.log('Ready.');
	//PopupGallery.init();
});
