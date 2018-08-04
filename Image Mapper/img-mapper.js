/* ==========================
		Global Variables
   ========================== */
const defaultImgURL = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';

/* Contains all area tags on the image */
var all_area_tags = [];
/* Area Tag Class*/
function Area_Tag() {
	this.url = ""; // URL to website or file
	this.newWindow = false; // Link target type; _blank or _self
	this.div = null; // jQuery object
	this.left = 0; // X position
	this.top = 0; // Y position
	this.width = 0; // Div width
	this.height = 0; // Div height
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
	$update_demo_btn = jQuery('#update_demo_btn');
	$html_demo = jQuery('#html_demo');
	
	/* Text changed event */
	$url_input.change(updateImgSrc);

	/* Mouse Events */
	$unmapped_img_container.contextmenu(function() { return false; }); // Prevent right click menu
	$unmapped_img.mousedown(mouseDownEvent);
	$unmapped_img.mouseup(mouseUpEvent);
	
	/* Button Events */
	$html_gen_btn.click(generateHTML);
	$reset_btn.click(resetPage);
	$update_demo_btn.click(updateDemo);
	
	/* Keydown Events */
	jQuery(document).keydown(keyEvents);
});

/* Draw div where the link will go */
function drawDiv(area_tag) {
	area_tag.div = jQuery('<div></div>'); // Create new div element
	var div_class = (area_tag.newWindow) ? 'link_box_blue' : 'link_box_red';
	area_tag.div.addClass('link_box ' + div_class);
	area_tag.div.css({
		'top': area_tag.top,
		'left': area_tag.left,
		'width': area_tag.width,
		'height': area_tag.height
	});
	$unmapped_img_container.append(area_tag.div);
	
	// Set .link-box Event Listeners
	area_tag.div.dblclick(assignLink);
	area_tag.div.mousedown(function(event) {
		if (event.which == 1) {
			jQuery('.link_box').each(function(i, v) {
				if (v == event.currentTarget) {
					area_tag.div.removeClass('link_box_red');
					area_tag.div.removeClass('link_box_blue');
					area_tag.div.addClass('link_box_selected');
				} else {
					var not_selected = jQuery(v);
					var not_selected_class = (all_area_tags[i].newWindow) ? 'link_box_blue' : 'link_box_red';
					not_selected.removeClass('link_box_selected');
					not_selected.addClass(not_selected_class);
				}
			});
			updateDivPosition(area_tag);
		}
	});
	area_tag.div.mouseup(function(event) {
		updateDivPosition(area_tag);
	});
	area_tag.div.draggable({
		containment: 'parent'
	});
	area_tag.div.resizable();
}

/* Update the div's position whenver a change is detected and before generating html */
function updateDivPosition(area_tag) {
	area_tag.top = area_tag.div.position().top;
	area_tag.left = area_tag.div.position().left;
	area_tag.width = area_tag.div.width();
	area_tag.height = area_tag.div.height();
}

/* ======================
       EVENT HANDLERS
   ====================== */
/* Change the image source when the URL input box text changes */
function updateImgSrc(event) {
	var src_url = ($url_input.val() == "") ? defaultImgURL : $url_input.val();
	$unmapped_img.attr('src', src_url);
}

/* Mouse Down Event Handler */
function mouseDownEvent(event) {
	var area_tag = new Area_Tag();
	area_tag.left = event.offsetX;
	area_tag.top = event.offsetY;
	all_area_tags.push(area_tag);
	
	return false;
}

/* Mouse Up Event Handler */
function mouseUpEvent(event) {
	var area_tag = all_area_tags[all_area_tags.length-1]; // Get the most recently created area tag
	area_tag.width = event.offsetX - area_tag.left;
	area_tag.height = event.offsetY - area_tag.top;
	area_tag.newWindow = ((event.which == 3) ? true : false);
	drawDiv(area_tag);
	return false;
}

/* Assign a link to the area tag */
function assignLink(event) {
	var link_index = null;
	for (var i = 0; i < all_area_tags.length; i++) {
		if (all_area_tags[i].div[0] == event.currentTarget) {
			link_index = i;
		}
	}
	var new_link = prompt('Please enter the URL you want this area to link to:');
	all_area_tags[link_index].url = new_link;
}

/* Execute function when a key is pressed */
function keyEvents(event) {
	var link_index = null;
	for (var i = 0; i < all_area_tags.length; i++) {
		if (all_area_tags[i].div.hasClass('link_box_selected')) {
			link_index = i;
		}
	}
	switch(event.key.toLowerCase()) {
		case "delete":
			if (link_index != null) {
				all_area_tags[link_index].div.remove();
				all_area_tags.splice(link_index, 1);
			}
			break;
		case "arrowup":
			var current_pos = all_area_tags[link_index].div.position().top;
			all_area_tags[link_index].div.css('top', current_pos-1);
			break;
		case "arrowdown":
			var current_pos = all_area_tags[link_index].div.position().top;
			all_area_tags[link_index].div.css('top', current_pos+1);
			break;
		case "arrowleft":
			var current_pos = all_area_tags[link_index].div.position().left;
			all_area_tags[link_index].div.css('left', current_pos-1);
			break;
		case "arrowright":
			var current_pos = all_area_tags[link_index].div.position().left;
			all_area_tags[link_index].div.css('left', current_pos+1);
			break;
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
		updateDivPosition(value);
		var x1 = value.left;
		var y1 = value.top;
		var x2 = value.left + value.width;; // Add the width of the div to the starting X position 
		var y2 = value.top + value.height; // Add the height of the div to the starting Y position
		html_elements += '\n\t<area shape="rect"'+
			'coords="' + x1 + ',' + y1 + ',' + x2 + ',' + y2 + '"'+
			'href="' + value.url + '"'+
			'target="' + ((value.newWindow) ? "_blank" : "_self") + '">';
	});
	html_elements += '\n</map>';
	
	$html_output.val(html_elements);
}

/* Reset all elements and global variables */
function resetPage(event) {
	/* Reset all_area_tags array */
	all_area_tags = [];
	
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
