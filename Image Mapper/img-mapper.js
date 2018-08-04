const defaultImgURL = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';

/* Area tag */
var area_tag;
function Area_Tag() {
	this.x1 = 0;
	this.y1 = 0;
	this.x2 = 0;
	this.y2 = 0;
	this.isRightClick = false;
	this.link = "";
};
/* Contains all area tags on the image */
var all_area_tags = [];

/* Load Event Listeners */
jQuery(document).ready(function() {
	
	jQuery('#url-input').change(updateImgSrc);
	
	/* Mouse Events */
	jQuery('*').contextmenu(function() { return false; }); // Prevent right click menu
	jQuery('#unmapped-img').mousedown(capturePosition);
	jQuery('#unmapped-img').mouseup(capturePosition);
	
	/* Button Events */
	jQuery('#gen-html-btn').click(generateHTML);
	jQuery('#reset-btn').click(resetPage);
	jQuery('#update-demo-btn').click(updateDemo);
	
});

/* Change the image source when the URL input box text changes */
function updateImgSrc(event) {
	var srcURL = (jQuery(this).val() == "") ? defaultImgURL : jQuery(this).val();
	jQuery('#unmapped-img').attr('src', srcURL);
}

/* Capture the position of the mouse inside of the image container */
function capturePosition(event) {
	if (event.type == 'mousedown') {
		area_tag = new Area_Tag();
		area_tag.x1 = event.offsetX;
		area_tag.y1 = event.offsetY;
	}
	else if (event.type == 'mouseup') {
		area_tag.x2 = event.offsetX;
		area_tag.y2 = event.offsetY;
		all_area_tags.push(area_tag);
		drawDiv(all_area_tags.length-1);
	}
	area_tag.isRightClick = ((event.which == 3) ? true : false);
	return false;
}

/* Draw div where the link will go */
function drawDiv(index) {
	var divIndex = 'div-' + index;
	var divX = area_tag.x1;
	var divY = area_tag.y1;
	var divWidth = area_tag.x2 - area_tag.x1;
	var divHeight = area_tag.y2 - area_tag.y1;
	var link_div = jQuery('<div></div>');
	link_div.attr('id', divIndex);
	link_div.addClass('link-box');
	link_div.css({
		'top': divY,
		'left': divX,
		'width': divWidth,
		'height': divHeight,
		'border-color': ((area_tag.isRightClick) ? 'blue' : 'red')
	});
	link_div.click(createLink);
	jQuery('#unmapped-img-container').append(link_div);
}

function createLink(event) {
	var new_link = prompt('Please enter the URL you want this area to link to:');
	var link_index = jQuery(this)[0].id.substring(4, jQuery(this)[0].id.length);
	all_area_tags[link_index].link = new_link;
}

/* Create the HTML for an image mapper */
function generateHTML(event) {
	var html_elements = "";
	html_elements += '<!-- Image Element -->';
	html_elements += '\n<img usemap="#img-map" src="'+jQuery('#unmapped-img')[0].src+'">';
	html_elements += '\n\n<!-- Image Map -->';
	html_elements += '\n<map name="img-map">';
	jQuery.each(all_area_tags, function(index, value) {
		html_elements += '\n\t<area shape="rect"'+
			'coords="' + value.x1 + ',' + value.y1 + ',' + value.x2 + ',' + value.y2 + '"'+
			'href="' + value.link + '"'+
			'target="' + ((value.isRightClick) ? "_blank" : "_self") + '">';
	});
	html_elements += '\n</map>';
	
	jQuery('#html-output').val(html_elements);
}

/* Reset all elements and global variables */
function resetPage(event) {
	/* Reset all_area_tags array */
	all_area_tags = [];
	
	/* Reset URL input box */
	jQuery('#url-input').val('');
	
	/* Reset default image */
	jQuery('#unmapped-img').attr('src', defaultImgURL);
	
	/* Remove link-box div elements */
	jQuery('.link-box').each(function(i, v) { jQuery(v).remove(); });
	
	/* Clear html output text area */
	jQuery('#html-output').val('');
	
	/* Clear demo container */
	jQuery('#html-demo').empty();
}

/* Load demo container with generated HTML */
function updateDemo(event) {
	var html_output = jQuery('#html-output').val();
	var demo_html = jQuery(html_output);
	jQuery('#html-demo').empty();
	jQuery('#html-demo').append(demo_html);
}
