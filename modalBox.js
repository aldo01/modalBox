

ModalBox = function()
{
	this.overrideAlert= false;
	this.focusableElements= new Array;
	this.currFocused= 0;
	this.initialized= false;
	this.active= true;
	this._options= new options();    
    this.lastModal = true;
   if(this.overrideAlert) window.alert = this.alert;

    return this;
};
$JQ.extend(ModalBox.prototype,{_init :function(options) {
    // Setting up original options with default options
    

	$JQ.extend(this._options,options);
    this._options.setOptions(options);
    var elements= $JQ("div[class='MB_window']");
    var lastIndex = parseInt( -1, 10 );
    var currentIndex = parseInt( 0, 10 );

    for ( i = 0; i < elements.length; i++ )
    {
        currentIndex = elements[i].id.substr( 9, elements[i].id.length );
        if( parseInt( currentIndex, 10 ) > lastIndex )
            lastIndex = parseInt( currentIndex, 10 );
        else if( lastIndex == -1 )
            lastIndex = parseInt( 0, 10 );
    }

    var zIndexOverlay = '1900';
    var zIndexWindow = '1901';

    if( lastIndex > -1 )
    {
        var zIndex = parseInt( zIndexOverlay, 10 );
        var newIndex = lastIndex + 1;

        var newZIndex = zIndex + ( newIndex * 10 ); //Increment by 10 the old Zindex
        zIndexOverlay = String( newZIndex );
        zIndexWindow = String( newZIndex + 1 );
    }

    //Create the overlay
        	
  
    this.MBoverlay=   $JQ('<div>',{id:"MB_overlay" + ( lastIndex > -1 ? (lastIndex + 1) : "" ), 'class': "MB_overlay", opacity: "0", style:"z-index:" + zIndexOverlay + "; width:100%; height:" + MfgWindow.getRealWindowSize()[1] + "px;"});
    
    //Create DOm for the window
    
    
        this.MBwindow = $JQ('<div>', {id: "MB_window" + ( lastIndex > -1 ? (lastIndex + 1) : "" ), 'class': "MB_window", style: "display: none; z-index:" + zIndexWindow }).html(
        this.MBframe = $JQ('<div>', {id: "MB_frame" + ( lastIndex > -1 ? (lastIndex + 1) : "" ), 'class': "MB_frame"}).html(
        this.MBheader = $JQ('<div>', {id: "MB_header" + ( lastIndex > -1 ? (lastIndex + 1) : "" ), 'class': "MB_header"}).html(
        this.MBcaption = $JQ('<div>', {id: "MB_caption" + ( lastIndex > -1 ? (lastIndex + 1) : "" ), 'class': "MB_caption"})
        )
    )
);
    
    

       this.MBclose = $JQ('<a>', {id: "MB_close" + ( lastIndex > -1 ? (lastIndex + 1) : "" ), 'class': "MB_close", title: this._options.closeString, href:"javascript:void(0);"}).html("<span>" + this._options.closeValue + "</span>");
	
     
    if(this._options[ "onPrint" ]) {
      	this.MBprint = $JQ('<a>', {id: "MB_print" + ( lastIndex > -1 ? (lastIndex + 1) : "" ), 'class': "MB_print", title: this._options.printString, href:"javascript:void(0);"}).html("<span>" + this._options.printValue + "</span>");
      	$JQ(this.MBheader).append(this.MBprint);
    	
    }
   
    $JQ(this.MBheader).append(this.MBclose);
    
       this.MBcontent = $JQ('<div>', {id: "MB_content", 'class': "MB_content"}).html(
       this.MBloading = $JQ('<div>', {id: "MB_loading" + ( lastIndex > -1 ? (lastIndex + 1) : "" ), 'class': "MB_loading"}).html(this._options.loadingString)
      );
       $JQ(this.MBcontent).scroll(function(){
           $JQ(".datepicker").hide();
       });
       
      $JQ(this.MBframe).append(this.MBcontent);
    
    

    // Inserting into DOM. If parameter set and form element have been found will inject into it. Otherwise will inject into body as topmost element.
    // Be sure to set padding and marging to null via CSS for both body and (in case of asp.net) form elements.
    var injectToEl = this._options.aspnet ? $JQ(document.body).down('form') : $JQ(document.body);
       $JQ(injectToEl).prepend(this.MBwindow);
    $JQ(injectToEl).prepend(this.MBoverlay);
    

    // Initial scrolling position of the window. To be used for remove scrolling effect during ModalBox appearing
    this.initScrollX = window.pageXOffset || document.body.scrollLeft || document.documentElement.scrollLeft;
    this.initScrollY = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;

    //Adding event observers   function(event){ event.data.addResult(event) };
    this.closeObserver = this.checkConfirmationBeforeClose.bindAsEventListener(this); // MFGChange: add this listener
    this.printObserver = this._print.bindAsEventListener(this); // MFGChange: add this listener
    this.hideObserver = this._hide.bindAsEventListener(this);
    this.kbdObserver = this._kbdHandler.bindAsEventListener(this);
    this._initObservers();

    this.initialized = true; // Mark as initialized
},

show : function(content, options) {
    if(!this.initialized) this._init(options); // Check for is already initialized

    this.content = content;
    this._options.setOptions(options);

    if(this._options.title) // Updating title of the MB
      
    	this.MBcaption.html(this._options.title);
    else { // If title isn't given, the header will not displayed
        $JQ(this.MBheader).hide();
        $JQ(this.MBcaption).hide();
    }
    if (options.lastModalbox != undefined) {
        this.lastModal = options.lastModalbox;
    }
    if(this.MBwindow.css('display') == "none") { // First modal box appearing
        this._appear();
        this.event("onShow"); // Passing onShow callback
    }
    else { // If MB already on the screen, update it
        this._update();
        this.event("onUpdate"); // Passing onUpdate callback
    }
},

hide : function(options) { // External hide method to use from external HTML and JS
    if(this.initialized) {
        // Reading for options/callbacks except if event given as a pararmeter
        //if(options && typeof options.element != 'function') Object.extend(this._options, options);
    	if(options && typeof options.element != 'function') $JQ.extend(this._options, options);
		  this.event( "beforeHide" );
        if(this._options.transitions)
        {   $JQ(this.MBwindow).slideUp({ duration: this._options.slideUpDuration, transition: Transitions.sinoidal, complete: this._deinit.bind(this) } );
            $JQ(".datepicker").hide(); }
        else {
            $JQ(this.MBwindow).hide();
            this._deinit();
        }
        return true;
    } else throw("Modalbox is not initialized.");
},
_hide : function(event) { // Internal hide method to use with overlay and close link
	event.stopPropagation() // Stop event propaganation for link elements
    /* Then clicked on overlay we'll check the option and in case of overlayClose == false we'll break hiding execution [Fix for #139] */
    if(event.target.id == 'MB_overlay' && !this._options.overlayClose) return false;
    mfgHideCurrentModalBox();
},

_print : function(event) { // Add this function to call a specific callback when user click on print
	event.stopPropagation() // Stop event propaganation for link elements
    this.event( "onPrint", true ); // Passing onPrint callback
},

updateTitle : function( title ) { // Add this function to update the title
	
		if ( title.trim().length == 0  ) return;
	this.MBcaption.html( title );
	
},

checkConfirmationBeforeClose : function(event) { //Add this function to call a specific callback when user click on close
    if ( this.event( "onCloseConfirm", true ) )
	 {
	    this.hide( event );
	    return true;
	 }
	 return false;
},

alert : function(message){
    var html = '<div class="MB_alert"><p>' + message + '</p><input type="button" onclick="mfgHideCurrentModalBox()" value="OK" /></div>';
    this.show(html, {title: 'Alert: ' + document.title, width: 300});
},

_appear : function() { // First appearing of MB
	  if(navigator.userAgent.indexOf("MSIE6") != -1){
        window.scrollTo(0,0);
        this._prepareIE("100%", "hidden");
    }
    this._setWidth();
    this._setPosition();
    if(this._options.transitions) {
      $JQ(this.MBoverlay).css({opacity: 0});
      $JQ(this.MBoverlay).fadeTo(this._options.overlayDuration,this._options.overlayOpacity);
      $JQ(this.MBoverlay).fadeTo({
                complete : function() {
                    $JQ(this.MBwindow).slideDown({
                        duration: this._options.slideDownDuration,
                        transition: Transitions.sinoidal,
                        complete: function(){
                            this._setPosition();
                            this.loadContent();
                        }.bind(this)
                    });
                }.bind(this)
        });
    } else {
   
    	 $JQ(this.MBoverlay).css({opacity: this._options.overlayOpacity});
         $JQ(this.MBwindow).show();
        this._setPosition();
        this.loadContent();
    }
    this._setWidthAndPosition = this._setWidthAndPosition.bindAsEventListener(this);
    $JQ(window).bind( "resize",this._setWidthAndPosition);
    
},

resizeTo : function(newWidth, newHeight, options) { // Change size of MB without content reloading
		var o = this.MBoverlay.getDimensions();
		var newStyle = {width: newWidth + "px", height: newHeight + "px", left: (o.width - newWidth)/2 + "px"};
		this._options.width = newWidth;
		if (options) this.setOptions(options); // Passing callbacks
		if (this._options.transitions) {
			$JQ(this.MBwindow).css({
			style: newStyle,
			duration: this._options.resizeDuration,
			start: function(fx){
				$JQ(fx.element).css({overflow: "hidden"}); // Fix for MSIE 6 to resize correctly
			},
			complete: (function(fx) {
				$JQ(fx.element).css({overflow: "visible"});
				this.event("_afterResize"); // Passing internal callback
				this.event("afterResize"); // Passing callback
			}).bind(this)
		});
		} else {
			this.MBwindow.css(newStyle);
			(function() {
				this.event("_afterResize"); // Passing internal callback
				this.event("afterResize"); // Passing callback
			}).bind(this).defer();
		}
},






resize : function(byWidth, byHeight, options) { // Change size of MB without loading content
 	var w = this.MBwindow.getDimensions(), hHeight = this.MBheader.outerHeight(), cHeight = this.MBcontent.outerHeight();
	this.resizeTo((w.width + byWidth), Math.max(hHeight + cHeight, w.height + byHeight), options);
},

resizeToContent : function(options){
 	// Resizes the modalbox window to the actual content height.
	// This might be useful to resize modalbox after some content modifications which were changed content height.

	var byHeight = this._options.height - this.MBwindow.outerHeight();
	if (byHeight != 0) {
		this.resize(0, byHeight, options);
	}
},

resizeToInclude : function(element, options){
 // Resizes the modalbox window to the cumulative height of element. Calculations are using CSS properties for margins and border.
// This method might be useful to resize modalbox before including or updating content.

var element = $JQ(element);
var styles = ['margin-top','margin-bottom','border-top-width','border-bottom-width'];
var elHeight = $JQ(styles).each(element.getHeight(), function(acc, n) {
var x = parseInt($JQ(element).css(n), 10);
acc += (isNaN(x) ? 0 : x);
return acc;
});
if (elHeight > 0) {
Modalbox.resize(0, elHeight, options);
}
},

_update : function() { // Updating MB in case of wizards
	$JQ(this.MBcontent).html($JQ(this.MBloading).html(this._options.loadingString));
	this.loadContent();
},

loadContent : function () {
    if(this.event("beforeLoad") != false) { // If callback passed false, skip loading of the content
        if(typeof this.content == 'string') {
            var htmlRegExp = new RegExp(/<\/?[^>]+>/gi);
            if(htmlRegExp.test(this.content)) { // Plain HTML given as a parameter
                this._insertContent(this.content.stripScripts());
            	//this._insertContent($JQ(this.content).html());
                this._putContent(function(){
                    this.content.extractScripts().map(function(script) {
                        return eval(script.replace("<!--", "").replace("// -->", ""));
                    }.bind(window));
                }.bind(this));
            } else // URL given as a parameter. We'll request it via Ajax
            
            	AjaxRequestHandler.mfgRequest( this.content, { type: this._options.method.toLowerCase(), data: this._options.params,
                    success: function(transport) {                   
                     var response = new String(transport.responseText);
								this._insertContent(transport.responseText.stripScripts(), function(){
									response.extractScripts().map(function(script) {
                                return eval(script.replace("<!--", "").replace("// -->", ""));
                            }.bind(window));
                            $JQ("#MB_content").trigger("ModalBox:ContentLoaded");                            
                        });
                    }.bind(this),
                    error : function(instance, exception){
                        mfgHideCurrentModalBox();
                        throw('Modalbox Loading Error: ' + exception);
                    }
                   });
        } else if (typeof this.content == 'object') {// HTML Object is given
            this._insertContent(this.content);
        } else {
            mfgHideCurrentModalBox();
            throw('Modalbox Parameters Error: Please specify correct URL or HTML element (plain HTML or object)');
        }
    }
},

_insertContent : function(content, callback){
	$JQ(this.MBcontent).hide().html("");
	if(typeof content == 'string') { // Plain HTML is given	  
		this.MBcontent.html($JQ('<div>', { id: this._options.contentWrapper}).css('display','none').html(content)).children().first().show();

	} else if (typeof content == 'object') { // HTML Object is given
		var _htmlObj = content.cloneNode(true); // If node already a part of DOM we'll clone it
		// If clonable element has ID attribute defined, modifying it to prevent duplicates
		if(content.id) content.id = "MB_" + content.id;
		/* Add prefix for IDs on all elements inside the DOM node */
		
		$JQ(content).find('*[id]').each(function(el){ el.id = "MB_" + el.id; });
		this.MBcontent.html(_htmlObj).children('div').first().show();
		if(navigator.userAgent.indexOf("MSIE") != -1) // Toggling back visibility for hidden selects in IE
			
			$JQ("#MB_content select").each(function(){
				$JQ(this).css({'visibility': ''});
							});
}
	// Prepare and resize modal box for content
    var defaultOpt =  new options();                                             //$JQ.extend(defaultOpt,options);  
    if( defaultOpt.height == this._options.height) {
		this.resize((this._options.width - $JQ(this.MBwindow).outerWidth()), $JQ(this.MBcontent).outerHeight() - $JQ(this.MBwindow).outerHeight() + $JQ(this.MBheader).outerHeight(), {
			afterResize: function(){
				setTimeout(function(){ // MSIE fix
					this._putContent(callback);
				}.bind(this),1);
			}.bind(this)
		});
	} else { // Height is defined. Creating a scrollable window
		this._setWidth();
		$JQ(this.MBcontent).css({overflow: 'auto', height: $JQ(this.MBwindow).outerHeight() - $JQ(this.MBheader).outerHeight() - 30 + 'px'});
		setTimeout(function(){ // MSIE fix
			this._putContent(callback);
		}.bind(this),1);
	}
},

_putContent : function(callback){
	$JQ(this.MBcontent).show();
	this.focusableElements = this._findFocusableElements();
	this._setFocus(); // Setting focus on first 'focusable' element in content (input, select, textarea, link or button)
	if(callback != undefined)
		callback(); // Executing internal JS from loaded content
	this.event("afterLoad"); // Passing callback
},

activate  : function(options){
    this._options.setOptions(options);
    this.active = true;
    $JQ(this.MBclose).bind("click", this.closeObserver); //need to comment this line
    if( this.MBprint ) $JQ(this.MBprint).bind("click", this.printObserver); // need to comment this line
    if(this._options.overlayClose)
        $JQ(this.MBoverlay).bind("click", this.hideObserver);
    $JQ(this.MBclose).show();
    if( this.MBprint ) $JQ(this.MBprint).show();
    if(this._options.transitions && this._options.inactiveFade)
       
    	$JQ(this.MBwindow).show({duration: this._options.slideUpDuration});
},

deactivate : function(options) {
    this._options.setOptions(options);
    this.active = false;
    $JQ(this.MBclose).unbind("click", this.closeObserver); // need to comment this line
    if( this.MBprint ) $JQ(this.MBprint).unbind("click", this.printObserver); // need to comment this line
    if(this._options.overlayClose)
        $(this.MBoverlay).unbind("click", this.hideObserver);
    $JQ(this.MBclose).hide();
    if( this.MBprint ) $JQ(this.MBprint).hide();
    if(this._options.transitions && this._options.inactiveFade)
        $JQ(this.MBwindow).fadeOut({duration: this._options.slideUpDuration, start: .75});
},

_initObservers : function(){
    $JQ(this.MBclose).bind("click", this.closeObserver); // need to comment this line
    if( this.MBprint ) $JQ(this.MBprint).bind("click", this.printObserver); // need to comment this line
    if(this._options.overlayClose)
        $JQ(this.MBoverlay).bind("click", this.hideObserver);
	 if(navigator.appCodeName == "Gecko" )
		 $JQ(document).bind("keypress", this.kbdObserver); // Gecko is moving focus a way too fast
	 else
		 $JQ(document).bind("keydown", this.kbdObserver); // All other browsers are okay with keydown
},

_removeObservers : function(){
    $JQ(this.MBclose).unbind("click", this.closeObserver); //  need to comment this line
    if( this.MBprint ) $JQ(this.MBprint).unbind("click", this.printObserver); // need to comment this line
    if(this._options.overlayClose)
        $JQ(this.MBoverlay).unbind("click", this.hideObserver);
		if(navigator.userAgent.indexOf("Gecko") != -1)
			$JQ(document).unbind("keypress", this.kbdObserver);
		else
			$JQ(document).unbind("keydown", this.kbdObserver);
},

_loadAfterResize : function() {
    this._setWidth();
    this._setPosition();
    this.loadContent();
},



_setFocus  : function() { // MFG change fba, for tab on element in modal
    /* Setting focus to the first 'focusable' element which is one with tabindex = 1 or the first in the form loaded. */
    if(this.focusableElements.length > 0 && this._options.autoFocusing == true) {
       
        var firstEl = this._findFirstFocusableAndVisibleElement();
        if( firstEl != null )
        {
        		this.currFocused = this.focusableElements.toArray().indexOf(firstEl);
        		if( typeof firstEl.id != 'undefined' && firstEl.id != '' )
        			window.setTimeout( "$JQ('#'+ '" + firstEl.id + "').focus()", 100 ); // Focus on first focusable element except close button, under Ie issue with datepicker Input
        }
    } else if($JQ(this.MBclose).is(":visible"))
        $JQ(this.MBclose).focus(); // If no focusable elements exist focus on close button
},

_findFirstFocusableAndVisibleElement : function(){ 
	if( this.focusableElements.length > 0 )
	{
		var el = null;
		for( var i = 0; i < this.focusableElements.length; i++ )
		{
			var item = this.focusableElements[ i ];
			if( el == null && this._isFocusable( item ) )
			{
				el = item;
				break;
			}
		}
		return el;
	}
	return null;
},

_isFocusable : function( element ) { 
	if( element == null || typeof element == 'undefined' )
		return false;
	var myElement = element;
	if( element.id != null && element.id.length > 0 )
		myElement = $JQ( element.id );
	if( !myElement || typeof myElement == 'undefined' )
		return false;
	if( myElement.type == 'button' || myElement.type == 'radio' || myElement.type == 'select' || myElement.type == 'select-one' )
		return !myElement.disabled && !this._isUnderHiddenDiv( myElement );
	else if( myElement.type == 'text' || myElement.type == 'textarea' )
		return myElement.visible() && !this._isUnderHiddenDiv( myElement );
	return !this._isUnderHiddenDiv( myElement );
},

_isUnderHiddenDiv : function( element ) { 
	if( element == null || typeof element == 'undefined' )
		return false;
	var underHidden = false;
	$JQ( element ).parents().each( function( elm ) {
		if(elm == this.MBcontent) return false;
		if( !$JQ(elm).is(':visible') ) {
			underHidden = true;
			return false;
		}
	});
	return underHidden;
},

_findFocusableElements : function(){ // Collect form elements or links from MB content
	$JQ(this.MBcontent).find('input:not([type~=hidden]), select, textarea, button, a[href]').each(function(){$JQ(this).addClass('MB_focusable');});
    return $JQ(this.MBcontent).find('.MB_focusable');
},


_kbdHandler: function(event, useNode ) { 
    var node = event.target;
    var ind = 0;
    switch(event.keyCode) {
        case Event.KEY_TAB:
        	event.stopPropagation()

            /* Switching currFocused to the element which was focused by mouse instead of TAB-key. Fix for #134 */
            if( ( typeof useNode == 'undefined' || useNode ) && node != this.focusableElements[this.currFocused] && node != null )
                this.currFocused = this.focusableElements.toArray().indexOf(node);

            if(!event.shiftKey) { //Focusing in direct order
                if(this.currFocused >= this.focusableElements.length - 1) {
                	  this.currFocused = 0;
                    if ( this._isFocusable( this.focusableElements.first() ) ) 
                    {
                    		this.focusableElements.first().focus();
                    }
                    else{
                    		this._kbdHandler( event, false );
                    }
                } else {
                    this.currFocused++;
                    if ( typeof window.tinyMCE != 'undefined' && tinyMCE.get( this.focusableElements[this.currFocused].id ) != null ) 
                    		tinyMCE.execCommand( 'mceFocus', true, this.focusableElements[this.currFocused].id );
                    else if( this._isFocusable( this.focusableElements[this.currFocused] ) && typeof this.focusableElements[this.currFocused].id != 'undefined' && this.focusableElements[this.currFocused].id != '' )
                    		window.setTimeout( "$JQ('#'+'" + this.focusableElements[this.currFocused].id + "' ).focus()", 100 );
                    	else
                    	{
                    		this._kbdHandler( event, false );
                    	}
                }
            } else { // Shift key is pressed. Focusing in reverse order
                if(this.currFocused <= 0) {
                	  this.currFocused = this.focusableElements.length - 1;
                    if ( this._isFocusable( this.focusableElements.last() ) ) 
                    {
	                    this.focusableElements.last().focus();
                    }
                    else{
                    		this._kbdHandler( event, false );
                    }
                } else {
                    this.currFocused--;
                    if ( typeof window.tinyMCE != 'undefined' && tinyMCE.get( this.focusableElements[this.currFocused].id ) != null ) //MFGChange: fix for tinyMce focus
                    		tinyMCE.execCommand( 'mceFocus', true, this.focusableElements[this.currFocused].id );
                    else if( this._isFocusable( this.focusableElements[this.currFocused] ) )
                    		this.focusableElements[this.currFocused].focus();
                    	else
                    	{
                    		this._kbdHandler( event, false );
                    	}
                }
            }
            break;
        case Event.KEY_ESC:
            if(this.active) this._hide(event);
            break;
        case 32:
            this._preventScroll(event);
            break;
        case 0: // For Gecko browsers compatibility
            if(event.which == 32) this._preventScroll(event);
            break;
        case Event.KEY_UP:
        case Event.KEY_DOWN:
        case Event.KEY_PAGEDOWN:
        case Event.KEY_PAGEUP:
        case Event.KEY_HOME:
        case Event.KEY_END:
            // Safari operates in slightly different way. This realization is still buggy in Safari.
            if(navigator.userAgent.indexOf("WebKit") != -1  && !["textarea", "select"].indexOf($JQ(node).prop('tagName').toLowerCase()))
            	event.stopPropagation();
            else if( ($JQ(node).prop('tagName').toLowerCase() == "input" && ["submit", "button"].indexOf(node.type)) || ($JQ(node).prop('tagName').toLowerCase() == "a") )
            	event.stopPropagation();
            break;
    }
},


_preventScroll : function(event) { // Disabling scrolling by "space" key
    if(!["input", "textarea", "select", "button"].indexOf($JQ(event.target).prop('tagName').toLowerCase()))
        event.stopPropagation();
},

_deinit : function()
{
    this._removeObservers();
    $JQ(window).unbind("resize", this._setWidthAndPosition );
    if(this._options.transitions) {
       
         $JQ(this.MBoverlay).toggle({duration: this._options.overlayDuration, complete: this._removeElements.bind(this) });

    } else {
        $JQ(this.MBoverlay).hide();
        this._removeElements();
    }
    $JQ(this.MBcontent).css({overflow: '', height: ''});
},

_removeElements : function () {
    if (this.lastModal) {
        $JQ(this.MBoverlay).remove();
        if(navigator.userAgent.indexOf("MSIE") != -1 && !navigator.appVersion.match(/\b7.0\b/)) {
            this._prepareIE("", ""); // If set to auto MSIE will show horizontal scrolling
            window.scrollTo(this.initScrollX, this.initScrollY);
        }
    }

    $JQ(this.MBwindow).remove();

    /* Replacing prefixes 'MB_' in IDs for the original content */
    if(typeof this.content == 'object') {
        if(this.content.id && this.content.id.match(/MB_/)) {
            this.content.id = this.content.id.replace(/MB_/, "");
        }
        $JQ(this.content).find('*[id]').each(function(el){ el.id = el.id.replace(/MB_/, ""); });
    }
    // Initialized will be set to false
    this.initialized = false;
    this.event("afterHide"); // Passing afterHide callback
    this._options.setOptions(this._options); //Settings options object into initial state
},

_setWidth : function () { //Set size
    $JQ(this.MBwindow).css({width: this._options.width + "px", height: this._options.height + "px"});
},

_setPosition : function () { //MFGChange: Rewritten to centralize the popup in height
    var paddingLeft = Math.round(($JQ(document.body).outerWidth() - $JQ(this.MBwindow).outerWidth()) / 2 );
    var defaultOpt = new options();
    var paddingTop;
    if( this._options.height == defaultOpt.height )
        paddingTop = parseInt( 100, 10 );
    else
    {
    	//make pop win show in center/middle of page.
     	var dOffests = $JQ(window).scrollTop();
	     if(MfgWindow.getClientHeight() - $JQ(this.MBwindow).outerHeight() > 0 ){
	    	if( $JQ('body').outerHeight() > MfgWindow.getClientHeight() ){
		     	paddingTop = Math.round(dOffests + (MfgWindow.getClientHeight() - $JQ(this.MBwindow).outerHeight()) / 2);
	    	} else {
	    		paddingTop = Math.round((MfgWindow.getClientHeight() - $JQ(this.MBwindow).outerHeight())/ 2);
	    	}
	     }
	     else {
	    	 paddingTop = 0;	    	 
	     }
    }
    if( this._options.centerBox == true )
        $JQ(this.MBwindow).css({left: paddingLeft + "px", top: paddingTop + "px"});
    else
        $JQ(this.MBwindow).css({left: paddingLeft + "px"});
},


_setWidthAndPosition  : function () {
    $JQ(this.MBwindow).css({width: this._options.width + "px"});
    this._setPosition();
},

_getScrollTop : function () { 
    var theTop;
    if (document.documentElement && document.documentElement.scrollTop)
        theTop = document.documentElement.scrollTop;
    else if (document.body)
        theTop = document.body.scrollTop;
    return theTop;
},

_prepareI : function(height, overflow){
    $JQ('html, body').each(function(){
    $JQ(this).css({width: height, height: height, overflow: overflow}); // IE requires width and height set to 100% and overflow hidden
    });
    $JQ("select").each(function(){
    	$JQ.css({'visibility': overflow}); // Toggle visibility for all selects in the common document
    });
},

event : function(eventName, keepCallBack) {
	
    if(this._options[eventName]) {
        var returnValue = this._options[eventName](); // Executing callback
        if ( ! keepCallBack )
        	  this._options[eventName] = null; // Removing callback after execution
        if(returnValue != undefined)
            return returnValue;
        return true;
    }
    return true;
},

rePosition : function()
{
    this._setPosition();
}

});




options = function() {
    this.title= "ModalBox Window"; // Title of the ModalBox window
    this.overlayClose= true; // Close modal box by clicking on overlay
    this.width= 500; // Default width in px
    this.height= 90; // Default height in px
    this.overlayOpacity= .8; // Default overlay opacity
    this.overlayDuration= .25; // Default overlay fade in/out duration in seconds
    this.slideDownDuration= 0.0; // Default Modalbox appear slide down effect in seconds
    this.slideUpDuration= 0.0; // Default Modalbox hiding slide up effect in seconds
    this.resizeDuration= .25; // Default resize duration seconds
    this.inactiveFade= true; // Fades MB window on inactive state
    this.transitions= true; // Toggles transition effects. Transitions are enabled by default
    this.loadingString= "Please wait. Loading..."; // Default loading string message
    this.closeString= "Close window"; // Default title attribute for close window link
    this.printString= "Print window"; // MFGChange: added attribute. Default title attribute for print window link
    this.closeValue= "&nbsp;"; // Default string for close link in the header
    this.printValue= "&nbsp;"; // MFGChange: added attribute. Default string for print link in the header
    this.params= {};
    this.method= 'get'; // Default Ajax request method
    this.autoFocusing= true; // Toggles auto-focusing for form elements. Disable for long text pages.
    this.aspnet= false; // Should be use then using with ASP.NET costrols. Then true Modalbox window will be injected into the first form element.
    this.centerBox = true; // Set it to false if you want modal box not be displayed in the window center
    this.modalname='';// window name
    this.contentWrapper=''; //id of innermost content div, useful when doing ajax update for the modalbox. 
    return this;
};


var Event = {
	    KEY_BACKSPACE: 8,
	    KEY_TAB:       9,
	    KEY_RETURN:   13,
	    KEY_ESC:      27,
	    KEY_LEFT:     37,
	    KEY_UP:       38,
	    KEY_RIGHT:    39,
	    KEY_DOWN:     40,
	    KEY_DELETE:   46,
	    KEY_HOME:     36,
	    KEY_END:      35,
	    KEY_PAGEUP:   33,
	    KEY_PAGEDOWN: 34,
	    KEY_INSERT:   45,

	    cache: {}
	  };
$JQ.extend(options.prototype,{setOptions :function(myoptions) {
    $JQ.extend(this, myoptions || {}); }
});
$JQ.extend($JQ.fn,{down : function() {
    var el = this[0] && this[0].firstChild;
    while (el && el.nodeType != 1)
      el = el.nextSibling;
    return $JQ(el);
},
getHeight : function(element) {
    return ModalBox.getDimensions(element).height;
  },

  getWidth : function(element) {
    return this.getDimensions(element).width;
  },
  
  getDimensions :function(){
		var element = $JQ(this)[0];
	    var display = $JQ(this).css('display');
	    if (display != 'none' && display != null) // Safari bug
	      return {width: element.offsetWidth, height: element.offsetHeight};

	    var els = element.style;
	    var originalVisibility = els.visibility;
	    var originalPosition = els.position;
	    var originalDisplay = els.display;
	    els.visibility = 'hidden';
	    if (originalPosition != 'fixed') // Switching fixed to absolute causes issues in Safari
	      els.position = 'absolute';
	    els.display = 'block';
	    var originalWidth = element.clientWidth;
	    var originalHeight = element.clientHeight;
	    els.display = originalDisplay;
	    els.position = originalPosition;
	    els.visibility = originalVisibility;
	    return {width: originalWidth, height: originalHeight};
	},
 });
Transitions =  {
	   
    sinoidal : function(pos) {
      return (-Math.cos(pos*Math.PI)/2) + .5;
    },
    reverse: function(pos) {
        return 1-pos;
      },
      flicker: function(pos) {
        var pos = ((-Math.cos(pos*Math.PI)/4) + .75) + Math.random()/4;
        return pos > 1 ? 1 : pos;
      },
      wobble: function(pos) {
        return (-Math.cos(pos*Math.PI*(9*pos))/2) + .5;
      },
      pulse: function(pos, pulses) {
        return (-Math.cos((pos*((pulses||5)-.5)*2)*Math.PI)/2) + .5;
      },
      spring: function(pos) {
        return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
      },
      none: function(pos) {
        return 0;
      },
      full: function(pos) {
        return 1;
      }
};
/** section: Language
 * class Function
 *
 *  Extensions to the built-in `Function` object.
**/
var ScriptFragment= '<script[^>]*>([\\S\\s]*?)<\/script>';
$JQ.extend(String.prototype,{
  stripScripts : function() {
		    return this.replace(new RegExp(ScriptFragment, 'img'), '');
		 },
  extractScripts : function() {
      var matchAll = new RegExp(ScriptFragment, 'img'),
        matchOne = new RegExp(ScriptFragment, 'im');
      return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1]; 
         })
	       },
  stripTags : function() {
		    return this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
		  }

});
$JQ.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
        }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

 
  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

 
    function bind(context) {
	    if (arguments.length < 2 && Object.isUndefined(arguments[0]))
	      return this;

	    if (!Object.isFunction(this))
	      throw new TypeError("The object is not callable.");
	      
	    var nop = function() {};
	    var __method = this, args = slice.call(arguments, 1);
	    
	    var bound = function() {
	      var a = merge(args, arguments);
	      // Ignore the supplied context when the bound function is called with
	      // the "new" keyword.
	      var c = this instanceof bound ? this : context;
	      return __method.apply(c, a);
	    };
	        
	    nop.prototype   = this.prototype;
	    bound.prototype = new nop();

	    return bound;
	  }


  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    return function(event) {
      var a = update([event || window.event], args);
      return __method.apply(context, a);
    }
  }  
  function delay(timeout) {
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  }
 
  function wrap(wrapper) {
    var __method = this;
    return function() {
      var a = update([__method.bind(this)], arguments);
      return wrapper.apply(this, a);
    }
  }

 
  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      var a = update([this], arguments);
      return __method.apply(null, a);
    };
  }
  
function isUndefined(object) {
    return typeof object === "undefined";
  }

  var extensions = {
    argumentNames:       argumentNames,
    bindAsEventListener: bindAsEventListener,
    wrap:                wrap,
    methodize:           methodize
  };
  
 
  if (!Function.prototype.bind)
    extensions.bind = bind;

  return extensions; 
})() );
