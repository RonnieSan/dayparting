// --------------------------------------------------
// CUSTOM SCHEDULING PLUGIN
// --------------------------------------------------

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(elt /*, from*/)
	{
		var len = this.length >>> 0;

		var from = Number(arguments[1]) || 0;
		from = (from < 0)
		? Math.ceil(from)
		: Math.floor(from);
		if (from < 0)
			from += len;

		for (; from < len; from++)
		{
			if (from in this &&
				this[from] === elt)
				return from;
		}
		return -1;
	};
}

// Modify select fields
;(function($){

	var methods = {
		
		init : function(options) {

			// Set default options and merge with custom ones
			var settings = $.extend({

				'days'           : [1, 2, 3, 4, 5, 6, 0],
				'dayStart'       : 0,
				'dayEnd'         : 23,
				'selectedValues' : false,
				'timeIncrement'  : 1,
				'useGMT'         : false,

				'onSelected' : function() {}

			}, options);

			var weekday = new Array(7);
			weekday[0] = "Sunday";
			weekday[1] = "Monday";
			weekday[2] = "Tuesday";
			weekday[3] = "Wednesday";
			weekday[4] = "Thursday";
			weekday[5] = "Friday";
			weekday[6] = "Saturday";

			return this.each(function() {

				var $this = $(this);

				if (!$this.data('scheduler')) {

					// Create the data object
					if ($this.data('scheduler') === undefined) {
						$this.data('scheduler', {
							target   : $this,
							settings : settings
						});
					}

					var data = $this.data('scheduler');

					if (data.settings.selectedValues === false) {
						if ($this.val().length > 0) {
							data.settings.selectedValues = $this.val().split(',');
						} else {
							data.settings.selectedValues = [];
						}
					}

					var getSelectedValues = function(event, ui) {
						data.settings.selectedValues = [];
						$template.find('.ui-selected').each(function() {
							data.settings.selectedValues.push($(this).data('value'));
						});
						data.settings.onSelected(data.settings.selectedValues);
					}

					// Build the template wrapper
					var $template = data.template = $('<div class="schedule"></div>');

					// Build the increment elements
					var $increment = $('<div class="increment"></div>');

					// Add each day column
					// data.settings.days.forEach(function(day) {
					for (n = 0; n < data.settings.days.length; n++) {
						var day = data.settings.days[n];
						// Create the day wrapper
						var $day = $('<div class="day ' + weekday[day].toLowerCase() + '"></div>');

						if (day === 0 || day === 6) {
							$day.addClass('weekend');
						}

						// Add a header to the day wrapper
						$day.append('<header>' + weekday[day] + '</header>');

						// Create a container for the increments
						var $container = $('<div class="container"></div>');
						$day.append($container);

						// Create each increment for the day
						for (i = data.settings.dayStart; i <= data.settings.dayEnd; i = i + data.settings.timeIncrement) {

							currentDayValue  = day;
							currentHourValue = i;

							// Get the GMT day value
							if (data.settings.useGMT) {
								var timezoneOffset = new Date().getTimezoneOffset() / 60;
								
								gmtHour = i + timezoneOffset;

								if (gmtHour >= 24) {
									currentDayValue = currentDayValue + 1;
									if (currentDayValue > 6) {
										currentDayValue = 0;
									}
									currentHourValue = gmtHour % 24;
								} else if (gmtHour < 0) {
									currentDayValue = n - 1;
									if (currentDayValue < 0) {
										currentDayValue = 6;
									}
									currentHourValue = 24 - gmtHour;
								} else {
									currentHourValue = gmtHour;
								}

								// console.log(currentDayValue + ":" + gmtHour + ":" +currentHourValue);

							}
							
							// Create a clone of the increment master
							var $incrementClone = $increment.clone(),
								incrementValue  = currentDayValue + '-' + currentHourValue;

							if ($.inArray(incrementValue, data.settings.selectedValues) > -1) {
								$incrementClone.addClass('ui-selected');
							}

							// Format the time being displayed
							var h = i,
								a = 'AM';

							if (h >= 12) {
								h -= 12;
								a = 'PM';
							}
							if (h === 0) h = 12;

							// Append the increment to the day
							$container.append($incrementClone.attr('data-value', incrementValue).html(h + ':00 ' + a));
						}

						// Append the day column to the calendar
						$template.append($day);

					}
					// });

					$this.after($template);

					// Make it selectable
					$template.bind('mousedown', function(event) {
						event.metaKey = true;
					}).selectable({
						'filter' : '.increment',
						'stop'   : getSelectedValues,
						'selecting' : function(event, ui) {
							var $el = $(ui.selecting);
							if (data.settings.selectedValues.indexOf($el.data('value')) > -1) {
								$el.addClass('ui-unselecting').removeClass('ui-selecting ui-selected');
							}
						},
						'unselecting' : function(event, ui) {
							var $el = $(ui.unselecting);
							if (data.settings.selectedValues.indexOf($el.data('value')) > -1) {
								$el.addClass('ui-selected').removeClass('ui-unselecting');
							}
						},
						'create' : function() {
							$template.find('.ui-selectee').on('mouseup', function(event) {
								if ($('.ui-unselecting').size() == 0) {
									if ($(event.target).hasClass('ui-selected')) {
										$(event.target).removeClass('ui-selected');
									}
								}
							});
						}
					});
				}

			});

		},

		// Deselect all selected times
		deselectAll : function() {

			return this.each(function() {

				var $this = $(this).siblings('.schedule');
				var data = $this.data('scheduler');

				$this.find('.ui-selectee').removeClass('ui-selected');
				if( data && data.settings ) data.settings.selectedValues = [];

			});

		},

		destroy : function(options) {
			
			return this.each(function() {

				var $this = $(this);
				var data = $this.data('scheduler');

				data.template.remove();

			});
		}

	};

	// Decide which function to call
	$.fn.scheduler = function(method) {
		
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call( arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist for scheduler plugin.');
		}
	
	};

})(jQuery);