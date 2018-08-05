/* ==========================
		Global Variables
   ========================== */
const defaultImgURL = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';

/* Contains all area tags on the image */
var all_area_tags = [];
var selected_area_tag;
/* Area Tag Class*/
function Area_Tag() {
	this.url = ""; // URL to website or file
	this.newWindow = false; // Link target type; _blank or _self
	this.div = null; // jQuery object
};

/* jQuery Objects */
var $url_input = null;
var $unmapped_img_container = null;
var $unmapped_img = null;
var $html_gen_btn = null;
var $reset_btn = null;
var $html_output = null;
var $update_demo_btn = null;
var $html_demo = null;

/* Flags */
var is_mouse_down = false;

/* ===================
		Functions
   =================== */
/* Initialize variables and event listeners */
jQuery(document).ready(function() {
	
	/* Set jQuery objects */
	$url_input = jQuery('#url_input');
	$unmapped_img_container = jQuery('#unmapped_img_container');
	$unmapped_img = jQuery('#unmapped_img');
	$html_gen_btn = jQuery('#html_gen_btn');
	$reset_btn = jQuery('#reset_btn');
	$html_output = jQuery('#html_output');
	$html_demo = jQuery('#html_demo');
	
	/* Text changed event */
	$url_input.change(updateImgSrc);
	$html_output.on('input', updateDemo);

	/* Mouse Events */
	$unmapped_img_container.contextmenu(function() { return false; }); // Prevent right click menu
	$unmapped_img.mousedown(mouseDownEvent);
	$unmapped_img.mouseup(mouseUpEvent);
	
	/* Button Events */
	$html_gen_btn.click(generateHTML);
	$reset_btn.click(resetPage);
	
	/* Keydown Events */
	jQuery(document).keydown(keyEvents);
});

/* Create a new div for the area_tag */
function createDiv(area_tag, div_top, div_left) {
	area_tag.div = jQuery('<div class="link_box"></div>'); // Create a new div element
	setDivClass(area_tag);
	area_tag.div.css({ 'top': div_top, 'left': div_left,
					   'width': 5, 'height': 5 });
	$unmapped_img_container.append(area_tag.div);
	
	/* AREA TAG DIV EVENT LISTENERS */
	area_tag.div.dblclick(assignLink);
	area_tag.div.mousedown(function(event) {
		setDivClass(area_tag);
	});
	area_tag.div.draggable({
		containment: 'parent'
	});
	area_tag.div.resizable();
}
/* Set the size of the div then append to the DOM */
function setDivSize(area_tag, div_width, div_height) {
	area_tag.div.css({ 'width': div_width, 'height': div_height });
}

/* Set the class names for the div element */
function setDivClass(area_tag) {
	/* Set the selected area tag div class */
	area_tag.div.removeClass('link_box_red link_box_blue');
	area_tag.div.addClass('link_box_selected');
	selected_area_tag = area_tag;
	
	jQuery.each(all_area_tags, function(index, value) {
		if (value != area_tag) {
			value.div.removeClass('link_box_selected');
			value.div.addClass((value.newWindow) ? 'link_box_blue' : 'link_box_red');
		}
	});
}


/* ======================
       EVENT HANDLERS
   ====================== */
/* Change the image source when the URL input box text changes */
function updateImgSrc(event) {
	var src_url = ($url_input.val() == "") ? defaultImgURL : $url_input.val();
	resetPage(event);
	$unmapped_img.attr('src', src_url);
}

/* Mouse Down Event Handler */
function mouseDownEvent(event) {
	selected_area_tag = new Area_Tag();
	selected_area_tag.newWindow = ((event.which == 3) ? true : false);
	all_area_tags.push(selected_area_tag);
	createDiv(selected_area_tag, event.offsetY, event.offsetX);
	return false;
}

/* Mouse Up Event Handler */
function mouseUpEvent(event) { console.log(event);
	var div_width = event.offsetX - selected_area_tag.div.position().left;
	var div_height = event.offsetY - selected_area_tag.div.position().top;
	setDivSize(selected_area_tag, div_width, div_height);
	return false;
}

/* Assign a link to the area tag */
function assignLink(event) {
	selected_area_tag.url = prompt('Please enter the URL you want this area to link to:', selected_area_tag.url);
}

/* Execute function when a key is pressed */
function keyEvents(event) {
	if (selected_area_tag != null && !$html_output.is(':focus') && !$url_input.is(':focus')) {
		switch(event.keyCode) {
			/* Sizing Shortcut Keys */
			case 187: // Plus
			case 107: // Increases Width
				selected_area_tag.div.width(selected_area_tag.div.width() + 1);
				break;
			case 189: // Minus
			case 109: // Decreases Width
				selected_area_tag.div.width(selected_area_tag.div.width() - 1);
				break;
			
			case 17: // Ctrl, Increases Height
				selected_area_tag.div.height(selected_area_tag.div.height() + 1);
				break;
			case 16: // Shift, Decreases Height
				selected_area_tag.div.height(selected_area_tag.div.height() - 1);
				break;
				
			/* Positioning Shortcut Keys */
			case 38: // Up Arrow Key
				selected_area_tag.div.css('top', selected_area_tag.div.position().top - 1);
				event.preventDefault();
				break;
			case 40: // Down Arrow Key
				selected_area_tag.div.css('top', selected_area_tag.div.position().top + 1);
				event.preventDefault();
				break;
			case 37: // Left Arrow Key
				selected_area_tag.div.css('left', selected_area_tag.div.position().left - 1);
				event.preventDefault();
				break;
			case 39: // Right Arrow Key
				selected_area_tag.div.css('left', selected_area_tag.div.position().left + 1);
				event.preventDefault();
				break;
			case 46: // Delete Key
				selected_area_tag.div.remove(); // Remove div from page
				all_area_tags.splice(all_area_tags.indexOf(selected_area_tag), 1); // Remove element from array
				if (all_area_tags.length > 0) {
					selected_area_tag = all_area_tags[0];
					setDivClass(selected_area_tag);
				}
				else { selected_area_tag = null; }
				break;
		}
	}
}

/* Create the HTML for an image mapper */
function generateHTML(event) {
	// It's easier to write the HTML as a string, load it into the textarea element to be edited and then later convert it to actual HTML
	var html_elements = '<!-- Image Element -->';
	html_elements += '\n<img usemap="#img-map" src="' + $unmapped_img[0].src + '">';
	
	html_elements += '\n\n<!-- Image Map -->';
	html_elements += '\n<map name="img-map">';
	jQuery.each(all_area_tags, function(index, value) {
		var x1 = value.div.position().left;
		var y1 = value.div.position().top;
		var x2 = value.div.position().left + value.div.width(); // Add the width of the div to the starting X position 
		var y2 = value.div.position().top + value.div.height(); // Add the height of the div to the starting Y position
		html_elements += '\n\t<area shape="rect" '+
			'coords="' + x1 + ',' + y1 + ',' + x2 + ',' + y2 + '" '+
			'href="' + value.url + '" '+
			'target="' + ((value.newWindow) ? "_blank" : "_self") + '">';
	});
	html_elements += '\n</map>';
	
	$html_output.val(html_elements);
	updateDemo(event);
}

/* Reset all elements and global variables */
function resetPage(event) {
	/* Reset all_area_tags array */
	all_area_tags = [];
	
	/* Clear selected area tag object */
	selected_area_tag = '';
	
	/* Remove link-box div elements */
	jQuery('.link_box').remove();
	
	/* Reset URL input box */
	$url_input.val('');
	
	/* Reset default image */
	$unmapped_img.attr('src', defaultImgURL);
	
	/* Clear html output text area */
	$html_output.val('');
	
	/* Clear demo container */
	$html_demo.empty();
}

/* Load demo container with generated HTML */
function updateDemo(event) {
	var html_output = $html_output.val(); // Get string representation of HTML
	var demo_html = jQuery(html_output); // Convert string to HTML
	$html_demo.empty(); // Clear demo area
	$html_demo.append(demo_html); // Append new HTML to demo area
}
