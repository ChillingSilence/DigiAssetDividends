
// Flag to prevent quick multi-click glitches
var animating_flag = false
// Last current fieldset
var last_current_fs
// Fieldset objects to track after click
var current_fs, next_fs, previous_fs 
// Current asset holders
var holders


// At the start..
jQuery(document).ready(function(){

	// Init check fields
	$("fieldset input").change();
	// Current fieldset is first
	last_current_fs = $("fieldset:first");
	on_select_step(last_current_fs);

	// Dialog - on "next" click
	$(".next").click(function(){
		// Go to the next step
		go_next_fs(this, before = function() {
			on_select_step(last_current_fs);
		})
	});
	// On "previous" click
	$(".previous").click(function(){
		// Go to the prev step
		go_prev_fs(this, before = function() {
			on_select_step(last_current_fs);
		})
	});

	// After click submit - no submit form (manual process instead)
	$(".submit").click(function(){
		return false;
	})
})


function disable_btn(name) {
	name.attr('disabled', 'disabled').addClass('disabled-button')
}
function enable_btn(name) {
	name.removeAttr('disabled').removeClass('disabled-button')
}


// Check input field value
function check_field(t) {
	var val = t.value;
	var field = t.name;
	var next_btn = $(t).parent('fieldset').find('input[type=button]');

	// Enable or disable next button
	if (check_input_correct(field, val))
		enable_btn(next_btn);
	else
		disable_btn(next_btn);
}


function check_input_correct(field, val) {
	// Asset-ID might have 38 chars length
	if (field == 'asset-id')
		return val.length == 38;

	// Else correct
	return true;
}


// Go to step ahead or backward
async function go_next_fs(t, before_func = false, dir = 1) {
	// Fieldset properties which we will animate
	let left, opacity, scale;

	// Disable button till animation complete
	if (animating_flag) return false;
	animating_flag = true;

	// Disable x-scroll for a time till animation complete (else bug)
	$("html").css('overflow-x', 'hidden');

	// We have current and next fieldsets
	current_fs = $(t).parent();
	previous_fs = current_fs.prev();
	next_fs = current_fs.next();

	// Go step ahead in a progress bar
	if (dir == 1) {
		// Show the next fieldset
		$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
		next_fs.show(); 
		last_current_fs = next_fs;
	}
	else {
		//show the previous fieldset
		$("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
		previous_fs.show(); 
		last_current_fs = previous_fs;
	}

	// Execute after function
	if (before_func) await before_func();

	// Hide the current fieldset with style
	current_fs.animate({ opacity: 0 }, {
		step: function(now, mx) {
			// 1. Increase opacity of next fieldset to 1 as it moves in
			opacity = 1 - now;

			if (dir == 1) {
				// 2. Scale current fieldset opacity down to 80%
				scale = 1 - (1 - now) * 0.8;

				// 3. Bring next_fs from the right(50%)
				left = (now * 50)+"%";

				current_fs.css({
					'transform'	: 'scale('+scale+')',
					'position'	: 'absolute'
				});
				next_fs.css({
					'left'		: left, 
					'opacity'	: opacity
				});
			}
			else {
				// 2. Scale previous_fs from 80% to 100%
				scale = 0.8 + (1 - now) * 0.2;

				// 3. Take current_fs to the right(50%) - from 0%
				left = ((1-now) * 50)+"%";

				current_fs.css({
					'left'		: left
				});
				previous_fs.css({
					'transform'	: 'scale('+scale+')', 
					'opacity'	: opacity
				});
			}
		}, 
		// Animation duration in ms
		duration: 500, 
		// When complete
		complete: function(){
			// Hide old current fieldset
			current_fs.hide();

			// Animation complete
			animating_flag = false;

			// Return overflow back
			$("html").css('overflow-x', 'auto');

			// Enable again
			/*for (var el in objects)
				$("input[type=button]", objects[el]).removeAttr('disabled');*/
			last_current_fs.focus();
		}, 
		// This comes from the custom easing plugin
		easing: 'easeInOutBack'
	});
}


function go_prev_fs(t, before_func = false) {
	return go_next_fs(t, before_func, -1);
}


// Get fieldset by index
function get_fs(index) {
	// Round to int
	index = Math.floor(index) | 1;
	// Decrement - because started from 0
	return $("fieldset:nth(" + (index-1) + ")")
}


// After select of some stage
function on_select_step(fs) {
	var index = fs.index()
	var prev_fs = get_fs(index - 1)

	// Will find asset info
	if (index == 2) {
		// Get asset_id from step 1
		let asset_id = $("input[name='asset-id']", prev_fs).val();
		let asset_id_short = asset_id.substr(0, 5)
			+ '<span style="color:#AAA;">*****</span>'
			+ asset_id.substr(-5);

		// Show asset id
		$("[name=asset-id-short]", last_current_fs).html( asset_id_short )

		// Hide before request
		$("[name=details]", last_current_fs).hide()

		disable_btn($("input[type=button]", last_current_fs))

		// Do request
		$.ajax({
			url: "https://createdigiassets.com/api/asset-info",
			crossDomain: true,
			data: { id: asset_id },
			success: function(data) {
				let next_btn = $("input[name=next]", last_current_fs)
				let details_label = $("[name=details]")
				let holders_count = 0

				// Get holders info
				holders = []
				if (data.result && data.result.holders) {
					holders = data.result.holders
					holders_count = holders.length
				}

				// Show buttons
				// $("input[type=button]", last_current_fs).show()
				enable_btn($("input[type=button]", last_current_fs))

				// Get holders count of asset, if status = ok
				if (data.status != 'ok' || holders_count == 0) {
					next_btn.hide()
					details_label.html(
						'<span class="error-info">'
						+ 'Failed. Check address'
						+ '</span>'
						).show()
					return
				}

				// All right
				next_btn.show()
				details_label.html(
					'<span class="success-info">'
					+ 'Holders: ' + holders_count
					+ '</span>'
					).show()

				holders = data.result.holders
			},
			dataType: 'json'
		});

		return;
	}
	if (index == 3) {

		// Wait for confirmation to finish
		disable_btn($("input[type=button]", last_current_fs))


	}
}


// Step 3
function amount_changed(t) {
	// Will base on input
	let overall_amount = parseInt( t.value );

	// Set empty, or add fee
	if (overall_amount < 1) overall_amount = '';
	else overall_amount += 50

	// Show it
	$("#amount").html(overall_amount)
}

