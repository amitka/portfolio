/*******************************/
/* Amitka Product Designer */
/*******************************/

// v8.0
//
/* globals $, document, console, picsObj */
/* jshint strict: true */


var Site = Site || {};

Site = (function(){

	'use strict';

	var $openMenuButton = $('.open-menu-button'),
			$chevronIcon = $('.chevron-icon'),
			$closeMenuButton = $('.close-menu-button'),
			$menuContainer = $('.menu-container'),
			$galleryImages = $('.gallery-images'), // Container of current pics
			$galleryContainer = $('.gallery-container'),
			$menuButtons = $('.menu-list li:not(:first-child)'),
			$showAllButton = $('.show-all-button'),
			$loadingContainer = $('.loading-container'),
			$loadingProgress = $('.loading-progress'),
			$loadingFrom = $('.loading-from'),
			$loadingTo = $('.loading-to'),
			$views = $('.counter'),
			$topButton = $('.scroll-top-button'),
			$picPopupContainer = $('.pic-popup-container'),
			$closePopupButton = $picPopupContainer.find('.close-popup-button');

	var maxPicsPerPage = 10, // Maximum loaded pics per page
			menuIsOpen = false, // Flag to toggle menu drawer open / close
			selectedCategory = 'all', // Sorts Pics by selected category
			sortedPicsArr = []; // Current pics array

	var init = function (){
		//
		//getViews();
		setGalleryHeight();
		//
		$openMenuButton
			.on("click", toggleMenu);
		$closeMenuButton
			.on("click", toggleMenu);
		//
		$menuButtons
		 		.on("click", onMenuButtonsClick);
		$showAllButton
			.on('click', showAllPics);
		//
		$galleryContainer
			.on('scroll', onGalleryScroll);
		//
		$(window)
			.on('resize', onWindowResize);
		//
		// Check for pics obj(in pics.js), then start
		if (typeof picsObj === 'undefined' || picsObj === null)
		{
			//console.log('error with pics.js');
			location.reload();
		}
		else
		{
			sortPics();
		}
	};

	var onWindowResize = function(){
		setGalleryHeight();
	};

	var scrollToPageTop = function(){
		var timeToTop = $galleryImages.children().length * 100;
		$galleryContainer
			.animate({scrollTop: 0}, timeToTop);
	};

	var onGalleryScroll = function(){
		//console.clear();
		if ($(this).scrollTop() > 600){
			$topButton
				.css('opacity', '.35')
				.off('click', scrollToPageTop)
				.on('click', scrollToPageTop);
		}
		else {
			$topButton
				.css('opacity', '0')
				.off('click', scrollToPageTop);
		}
		var scrollPos = $(this).scrollTop() + $(this).outerHeight();
		if (scrollPos > $galleryImages.height() &&
					sortedPicsArr.length > $galleryImages.children().length){
			// Remove Scroll Listener
			$galleryContainer
				.off('scroll', onGalleryScroll);
			// Load More Pics
			loadPics();
			console.log('load Pics...');
		}
	};

	var closePicPopup = function (){
		PopupGallery.resetGallery();
		//
		$picPopupContainer
			.find('.img-container > img')
			.attr('src', '');
		//
		$picPopupContainer
			.css('visibility', 'hidden');
	};

	var openPicPopup = function(e){
		if ($picPopupContainer.css('visibility')==='hidden')
		{
			$picPopupContainer
				.css('visibility', 'visible');
			//
			$closePopupButton
				.off('click', closePicPopup)
				.on('click', closePicPopup);
			//
			if (PopupGallery !== undefined ){
				PopupGallery.loadGallery(e.data.param);
			}
			else{
				console.log('openPicPopup: popupGallery undefined.');
			}
		}
	};

	var newPic = function (obj){
		var deferred = $.Deferred();
		//
		var $picContainer = $('<div>', {class:'pic-item'});
		$picContainer.css('order', obj.index); // flex sort items by order
		//
		var $img = $('<img>', {src: 'pics/' + obj.poster});
		$picContainer.prepend($img);
		$img
			.on('load', function(){
				deferred.resolve($picContainer);
			});
		$img
			.on('error', function(){
				deferred.resolve();
			});
		$img
			.on('click', {param:obj}, openPicPopup);
		//
		// TODO: On image error
		//
		var $picSubTitle = $('<h4>', {class: 'desc-title', html:obj.project + ', ' + obj.category});
		$picSubTitle.appendTo($picContainer);
		var $picTitle = $('<h2>', {class: 'main-title', html:obj.desc});
		$picTitle.appendTo($picContainer);

		//
		if (obj.url !== undefined)
		{
			var $picURL = $('<a>', {class: 'pic-link', href:'http://' + obj.url, target:'_blank'});
			var $picURLTitle = $('<h4>', {html:obj.url});
			$picURLTitle.appendTo($picURL);
			$picURL.appendTo($picContainer);
		}
		//
		return deferred.promise();
	};

	var addItemToLoader = function (currentPos){
		var $loaderItem = $('<div>', {class:'loading-progress-item load-flag'});
		$loaderItem
			.appendTo($loadingProgress);
		//
		$loadingFrom.text(currentPos);
		$loadingTo.text(currentPos + $loadingProgress.children().length);
	};

	var removeItemFromLoader = function(){
			for (var i = 0 ; i < $loadingProgress.children().length ; i++)
			{
				var item = $($loadingProgress.children()[i]);
				if (item.hasClass('load-flag'))
				{
					item
						.removeClass('load-flag')
						.addClass('item-loaded');
					//
					$loadingFrom.text(parseInt($loadingFrom.text())+1);
					break;
				}
			}
	};

	var loadPics = function (){
		var minPos = $galleryImages.children().length,
				maxPos = minPos + maxPicsPerPage,
				promiseArr = [];
		//
		$loadingProgress.empty();
		$loadingContainer.show();
		//
		for(var i = minPos ; i < maxPos; i++ )
		{
			if ( typeof sortedPicsArr[i] === 'undefined' || sortedPicsArr[i] === null)
			{
				break;
			}

			var promise = newPic(sortedPicsArr[i]);
			promiseArr.push(promise);
			//
			addItemToLoader(minPos);
			//
			promise.done(function(){
				removeItemFromLoader();
			});
		}

		$.when.all(promiseArr)
			.then(function(results) {
				console.log("All Loading Done.");
				$loadingContainer.hide();
				$.each(results, function(index){
					var pic = results[index];
					if (pic !== undefined)
					{
						pic
							.hide()
							.appendTo($galleryImages)
							.fadeIn(250);
					}
				});
				//
				//if (maxPos < sortedPicsArr.length)
				//{
					$galleryContainer
						.off('scroll', onGalleryScroll)
						.on('scroll', onGalleryScroll);
				//}

			}, function() {
				console.log("Loading failed.");
			});

	};

	var sortPics = function (){
		// Reset All
		$galleryImages.empty();
		sortedPicsArr = [];
		//
		if (selectedCategory === 'all')
		{
			sortedPicsArr = picsObj.catalog; // All Pics available
		}
		else
		{
			$.each(picsObj.catalog, function (index){
				var picObj = picsObj.catalog[index];
				for (var key in picObj)
				{
					if (formatTextHelper(picObj[key]) === selectedCategory)
					{
						sortedPicsArr.push(picObj);
					}
				}
			});
		}

		if (sortedPicsArr.length > 0)
		{
			loadPics();
		}
		else
		{
			console.log('No pics found.');
			$galleryImages
				.css('height', '100%');
			var errMessage = $('<h2>', {html: 'Sorry, No Pics Found.', class:'err-msg'});
			errMessage.appendTo($galleryImages);
		}
	};

	var showAllPics = function(){
		selectedCategory = 'all';
		resetAllMenuButtons();
		sortPics();
		if (menuIsOpen)
		{
			closeMenu();
		}
	};

	var resetAllMenuButtons = function (){
		$.each($menuButtons, function (index){
			var $button = $($menuButtons[index]);
			if ($button.hasClass('selected'))
			{
				$button
					.removeClass('selected');
			}
		});
	};

	var onMenuButtonsClick = function(){
		var buttonClicked = formatTextHelper($(this).text());
		if (buttonClicked !== "" && buttonClicked !== selectedCategory)
		{
			resetAllMenuButtons();
			$(this)
				.addClass('selected');
			$galleryImages
				.css('height', 'auto');
			//
			selectedCategory = buttonClicked;
			sortPics();
			//
			if (menuIsOpen)
			{
				closeMenu();
			}
		}
	};

	var setGalleryHeight = function (){
		var gHeight;
		if (menuIsOpen)
		{
			gHeight = $(window).outerHeight() - ($(".header-container").outerHeight() + getMenuCurrentHeight());
		}
		else
		{
			gHeight = $(window).outerHeight() - ($(".header-container").outerHeight());
		}
		//console.log("gallery Height = " + gHeight);
		$galleryContainer
			.css("height", gHeight);
	};

	var getMenuCurrentHeight = function(){
		return $menuContainer.find(".menu-inside").outerHeight();
	};

	var openMenu = function(){
		//var currentMenuHeight = $menuContainer.find(".menu-inside").outerHeight();
		//console.log("currentMenuHeight = " + currentMenuHeight);
		$menuContainer
			.css("height", getMenuCurrentHeight());
		$chevronIcon
			.css("transform", "rotate(-180deg)");
		//
		menuIsOpen = true;
		setGalleryHeight();
	};

	var closeMenu = function(){
		$menuContainer
			.css("height", 0);
			$chevronIcon
				.css("transform", "rotate(0deg)");
		//
		menuIsOpen = false;
		setGalleryHeight();
	};

	var toggleMenu = function(){
		if (!menuIsOpen)
		{
			openMenu();
		}
		else
		{
			closeMenu();
		}
	};

	// Format to lower case No white space
	var formatTextHelper = function (str){
		if (typeof str === 'string')
		{
			return str.replace(/ /g,'').toLowerCase();
		}
	};
	//
	// cookie for views counter
	//
	function setCookie(cname, cvalue, exdays) {
	    var d = new Date();
	    d.setTime(d.getTime() + (exdays*24*60*60*1000));
	    var expires = "expires="+d.toUTCString();
	    document.cookie = cname + "=" + cvalue + "; " + expires;
	}

	function getCookie() {
		var cFlag = false;
	    var cArray = document.cookie.split(';');
	    $.each(cArray, function (index){
	    	var cTemp = cArray[index].split('=')[0].trim();
	    	if (cTemp === 'amitka.net')
	    	{
	    		cFlag = true;
	    	}

	    });
	    return cFlag;
	}

	function checkCookie() {
	    var visited = getCookie();
	    if (visited)
	    {
	        console.log("Welcome again...");
	    }
	    else
	    {
	    	try
	    	{
	    		console.log("Hello New User ");
	    		setCookie("amitka.net", 'visited', 60);
	    		var viewsPlusOne = parseInt($views.text(), 10) +1;
	    		updateViewsOnPage(viewsPlusOne);
	    		// Update DB
	    		updateViewsDB(viewsPlusOne);
	    	}
	    	catch (error)
	    	{
	    		console.log('Cookie Error');
	    		console.log(error);
	    	}
	    }
	}

	var updateViewsOnPage = function(num){
		$views.text(num);
	};

	var updateViewsDB = function (num){
		$.post('php/updateVisits.php', {Visits: num}, function (response){
			if (response === '1')
			{
				console.log('Visitors DB Updated = ' + num);
			}
			else
			{
				console.log('Visitors DB NOT Updated.');
			}
		});
	};

	var getViews = function (){
		$.get('php/getVisits.php', function (data){
			if (data)
			{
				updateViewsOnPage(data);
				checkCookie();
			}
			else
			{
				updateViewsOnPage('404');
			}
		});
	};



	return {init: init};

}());

//
// Put somewhere in your scripting environment
if (jQuery.when.all===undefined) {
    jQuery.when.all = function(deferreds) {
			'use strict';
        var deferred = new jQuery.Deferred();
        $.when.apply(jQuery, deferreds).then(
            function() {
                deferred.resolve(Array.prototype.slice.call(arguments));
            },
            function() {
                deferred.fail(Array.prototype.slice.call(arguments));
            });

        return deferred;
    };
}



$(document).ready(function (){
	'use strict';
	//console.log('Ready.');
	Site.init();
});
