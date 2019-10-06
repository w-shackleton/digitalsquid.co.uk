// JS for layout editor

(function($) {

constants = {
	width: 720,
	height: 405,
	slideshowButtons: [
		"Next",
		"Previous",
		"Start slideshow",
		"End slideshow",
		"White",
		"Black",
		"Beginning",
		"End"
	]
};

function loadItemSettings(item) {
	$("#edit").data("state").currentSelected = item;
	$("#edit .item").removeClass("selected");
	$(item).addClass("selected");
	$("#item-order").spinner("value", $(item).data("order") || 1);

	$("#item-snap").prop("checked", $(item).hasClass("grid")).button("refresh");
	$("#item-text").prop("value", $(item).data("text") || "");
	$("#item-text-size").spinner("value", $(item).data("text-size"));
	switch($(item).data("type")) {
		default:
			$(item).data("type", "both");
		case 'x':
		case 'y':
		case 'both':
			$("#slider-direction").val($(item).data("type"));
	}

	if($(item).hasClass("slider") || $(item).hasClass("panel"))
		$(".slider-prop").show();
	else
		$(".slider-prop").hide();
}

function setBackground(file) {
	var reader = new FileReader();
	reader.onload = function(e) {
		$("#edit img.bg").prop("src", e.target.result);
		$("#edit").data("state").background = e.target.result;
	};
	reader.onerror = function(e) {
		$("#background-error-dialog").dialog("open");
	}
	reader.readAsDataURL(file);
}

function reconfigureGrid() {
	var settings = $("#edit").data("settings");
	var width = settings.width;
	var height = settings.height;
	$("#edit").css("width", width).css("height", height);
	$("#edit-container").css("width", width).css("height", height);
	var partWidth = width / settings.gridX;
	var partHeight = height / settings.gridY;
	$(".item.grid").draggable({
		containment: "#edit",
		scroll: false,
		grid: [ partWidth, partHeight] })
		.resizable({ grid: [partWidth, partHeight] })
		.each(function() {
		var x = parseInt($(this).css("left"), 10);
		var y = parseInt($(this).css("top"), 10);
		x = Math.round(x / partWidth) * partWidth; // Shift to nearest grid position
		y = Math.round(y / partHeight) * partHeight;
		var width = parseInt($(this).css("width"), 10);
		var height = parseInt($(this).css("height"), 10);
		width = Math.round(width / partWidth) * partWidth;
		height = Math.round(height / partHeight) * partHeight;
		$(this) .css("left", x)
			.css("top", y)
			.css("width", width)
			.css("height", height);
	});
	$(".item:not(.grid)").draggable({
		containment: "#edit",
		scroll: false,
		grid: 0
	}).resizable({ grid: 0 });
}
function createItem(type) {
	var item = $("<div class=\"item ui-widget-content\"></div>");
	var icons = $("<div class=\"icons\"></div>");
	icons.append($("<img src=\""+dpeditPaths.img+"grid.png\" class=\"icon grid-icon\" />"));
	icons.append($("<img src=\""+dpeditPaths.img+"toggle.png\" class=\"icon toggle-icon\" />"));
	icons.append($("<img src=\""+dpeditPaths.img+"slider.png\" class=\"icon slider-icon\" />"));
	icons.append($("<img src=\""+dpeditPaths.img+"panel.png\" class=\"icon panel-icon\" />"));
	item.append(icons);
	item.append($("<p class=\"type\">#</p>"));
	item.append($("<p class=\"order\">#</p>"));
	item.append($("<p class=\"text\"></p>"));
	item.data("order", $(".item").length + 1);
	item.data("text", "");
	item.data("text-size", 30);
	switch(type) {
		case "button":
			item.addClass("button");
			break;
		case "toggle":
			item.addClass("toggle");
			break;
		case "slider":
			item.addClass("slider");
			break;
		case "panel":
			item.addClass("panel");
			break;
	}
	$("#edit").append(item);
	item.updateItem();
	reconfigureGrid();
	return item;
}

// Extracts information from the DOM about the current items and saves that information to an array.
function domToItems() {
	var settings = $("#edit").data("settings");
	var partWidth = settings.width / settings.gridX;
	var partHeight = settings.height / settings.gridY;
	return $("#edit .item").map(function() {
		var gridSnap = $(this).hasClass("grid");
		var xpos = parseInt($(this).css("left"), 10);
		var ypos = parseInt($(this).css("top"), 10);
		var rawWidth = parseInt($(this).css("width"), 10);
		var rawHeight = parseInt($(this).css("height"), 10);
		var x = gridSnap ? Math.round(xpos / partWidth) : xpos / settings.width;
		var y = gridSnap ? Math.round(ypos / partHeight) : ypos / settings.height;
		var width = gridSnap ? Math.round(rawWidth / partWidth) : rawWidth / settings.width;
		var height = gridSnap ? Math.round(rawHeight / partHeight) : rawHeight / settings.height;
		var type;
		if($(this).hasClass("button")) type = "button";
		if($(this).hasClass("toggle")) type = "toggle";
		if($(this).hasClass("slider")) type = "slider";
		if($(this).hasClass("panel")) type = "panel";
		return {
			type : type,
			gridSnap : gridSnap,
	       		// If we are grid aligned, use integer positions,
			// otherwise use a float between 0 and 1
			// The same goes for width and height
			x : x, y : y,
	       		width: width, height: height,

			text : $(this).data("text"),
			textSize : parseInt($(this).data("text-size")) || 20,
			orientation : $(this).data("type") || null,
			order: $(this).data("order")
		};
	}).get().sort(function(l, r) {
		return (l.order || 1) - (r.order || 1);
	});
}
function itemsToDom(items) {
	$("#edit .item").remove();
	var settings = $("#edit").data("settings");
	
	// Normalise some settings to what they should be.
	settings.width = constants.width; settings.height = constants.height;

	var partWidth = settings.width / settings.gridX;
	var partHeight = settings.height / settings.gridY;
	$(items).map(function() {
		var domItem = createItem(this.type);
		if(this.gridSnap) domItem.addClass("grid");
		var xpos, ypos, rawWidth, rawHeight;
		if(this.gridSnap) {
			xpos = this.x * partWidth;
			ypos = this.y * partHeight;
			rawWidth = this.width * partWidth;
			rawHeight = this.height * partHeight;
		} else {
			xpos = this.x * settings.width;
			ypos = this.y * settings.height;
			rawWidth = this.width * settings.width;
			rawHeight = this.height * settings.height;
		}
		domItem.css("left", xpos).css("top", ypos);
		domItem.css("width", rawWidth).css("height", rawHeight);
		domItem.data("text", this.text).data("text-size", this.textSize);
		domItem.data("type", this.orientation);
		domItem.updateItem();
	});
}

function getSlideshowButton(pos) {
	if($("#edit").data("settings").mode != "slide") return "";
	return constants.slideshowButtons[pos];
}

$(function() {
	// Initialise data storage
	$("#edit").data("state", {
		currentSelected : null,
		background : null
	});
	$("#edit").data("settings", {
		gridX : 5,
		gridY : 4,
		mode : "joystick",
		name : "New layout",
		description : "A new joystick layout",
		width : constants.width,
		height : constants.height,
		items : []
	});

	// Setup global settings window
	$("#add-item").button({
		icons: {
			primary: "ui-icon-triangle-1-s"
		}
	}).click(function() {
		var menu = $(this).next().show().position({
			my: "left top",
		    at: "left bottom",
		    of: this
		});
		$(document).one("click", function() {
			menu.hide();
		});
		return false;
	}).next().hide().menu();
	$("#select-background").button().click(function() {
		$("#select-background-dialog").dialog("open");
	});
	$(".spinner").spinner({
		spin: function(e, ui) {
			if(this.id == "grid-x") {
				$("#edit").data("settings").gridX = Math.max(ui.value, 1);
				reconfigureGrid();
			}
			if(this.id == "grid-y") {
				$("#edit").data("settings").gridY = Math.max(ui.value, 1);
				reconfigureGrid();
			}
			if(ui.value < 1) {
				$(this).spinner("value", 1);
				return false;
			}
		}
	});

	$("#change-details").button().click(function() {
		var settings = $("#edit").data("settings");
		$("#layout-mode").val(settings.mode);
		$("#layout-name").val(settings.name);
		$("#layout-description").val(settings.description);
		$("#change-details-dialog").dialog("open");
	});

	$("#vertical").button().click(function() {
		if(this.checked) {
			$("#edit").data("settings").width = constants.height;
			$("#edit").data("settings").height = constants.width;
		} else {
			$("#edit").data("settings").width = constants.width;
			$("#edit").data("settings").height = constants.height;
		}
		reconfigureGrid();
	});

	$("#create-button").click(function() { createItem("button"); });
	$("#create-toggle").click(function() { createItem("toggle"); });
	$("#create-slider").click(function() { createItem("slider"); });
	$("#create-panel"). click(function() { createItem("panel"); });

	// Setup background drag-and-drop
	$("#edit").bind("dragover", function() { $(this).addClass("img-drag"); return false; })
		.bind("dragend", function() { $(this).removeClass("img-drag"); return false; })
		.bind("drop", function(e) {
			$(this).removeClass("img-drag");
			e = e || window.event;
			e.preventDefault();
			e = e.originalEvent || e;
			var files = (e.files || e.dataTransfer.files);
			if(files.length < 1) {
				alert("Please drag an image to set as the background");
				return false;
			}
			setBackground(files[0]);
		});

	// Setup item settings window
	$(document).on("mousedown", ".item", function() { loadItemSettings(this)});

	// Method to reconfigure the view of an item
	$.fn.updateItem = function() {
		// TODO: Display type for sliders and panels
		if(this.hasClass("toggle")) $("p.type", this).text("Toggle");
		else if(this.hasClass("button")) $("p.type", this).text("Button");
		else if(this.hasClass("slider")) $("p.type", this).text("Slider");
		else if(this.hasClass("panel")) $("p.type", this).text("Panel");
		$("p.order", this).text("#" + this.data("order"));
		var pos = parseInt(this.data("order")) - 1;
		$("p.text", this).text(
				this.data("text") ||
				getSlideshowButton(pos) ||
				this.data("order"));
		$("p.text", this).css("font-size", this.data("text-size"));
	};

	// Item settings init
	$("#item-snap").button().click(function() {
		if(this.checked)
			$(".item.selected").addClass("grid");
		else
			$(".item.selected").removeClass("grid");
		reconfigureGrid();
	});
	$("#item-order").spinner({
		spin: function(e, ui) {
			if(ui.value < 1) {
				$(this).spinner("value", 1);
				return false;
			}
			if(ui.value > $(".item").length) {
				$(this).spinner("value", $(".item").length);
				return false;
			}
			var oldValue = $(this).spinner("value");
			var currentItem = $("#edit").data("state").currentSelected;
			// Replace old value
			$(".item").filter(function() { return $(this).data("order") == ui.value; })
				.data("order", oldValue).updateItem();
			// Set selected value
			$(currentItem).data("order", ui.value).updateItem();
			return true;
		}
	});
	$("#item-text").keyup(function() {
		var currentItem = $("#edit").data("state").currentSelected;
		$(currentItem).data("text", $(this).prop("value")).updateItem();
	});
	$("#item-text-size").spinner({
		spin: function(e, ui) {
			if(ui.value < 1) {
				$(this).spinner("value", 1);
				return false;
			}
			if(ui.value > 200) {
				$(this).spinner("value", 200);
				return false;
			}
			var currentItem = $("#edit").data("state").currentSelected;
			$(currentItem).data("text-size", ui.value).updateItem();
		}
	});
	$(".slider-prop").hide();
	$("#slider-direction").change(function() {
		var currentItem = $("#edit").data("state").currentSelected;
		$(currentItem).data("type", $(this).val()).updateItem();
	});

	reconfigureGrid();

	// Dialog boxes
	$("#background-error-dialog").dialog({
		autoOpen: false,
		modal: true,
		buttons: {
			Ok: function() {
				$(this).dialog("close");
			}
		}});
	$("#select-background-dialog").dialog({
		autoOpen: false,
		modal: true,
		buttons: {
			Ok: function() {
				var files = $("input[type=file]", this)[0].files;
				if(files === undefined || files.length === 0) $(this).dialog("close");
				setBackground(files[0]);
				$(this).dialog("close");
			}
		}});
	$("#change-details-dialog").dialog({
		autoOpen: false,
		modal: false,
		buttons: {
			Ok: function() {
				$(this).dialog("close");
			}
		}
	});

	// Exporting
	$("#export").button().click(function() {
		// Populate items
		$("#edit").data("settings").items = domToItems();
		$("#export-dialog textarea").val(JSON.stringify(
				$("#edit").data("settings")));
		$("#export-dialog").dialog("open");
	});
	$("#export-dialog").dialog({
		autoOpen: false,
		width: 500,
		modal: true,
		buttons: {
			Close: function() {
				$(this).dialog("close");
			}
		}
	});
	// Set up downloadify
	Downloadify.create("export-dl",{
		filename: function() {
			return $("#edit").data("settings").name.replace(/[^a-zA-Z0-9]+/g, "-") + ".json";
		},
		data: function() {
			$("#edit").data("settings").items = domToItems();
			return JSON.stringify($("#edit").data("settings"))
		},
		onError: function() {
			alert("Something went wrong whilst trying to save the file.");
		},
		swf: dpeditPaths.media+"downloadify.swf",
		downloadImage: dpeditPaths.img+"download.png",
		width: 100,
		height: 30,
		transparent: true,
		append: false
	});

	$("#import").button().click(function() {
		$("#import-dialog").dialog("open");
	});
	$("#import-dialog").dialog({
		autoOpen: false,
		modal: true,
		width: 400,
		buttons: {
			"Import": function() {
				var json = $("#import-dialog textarea").val();
				try {
					var settings = $.parseJSON(json);
					$("#edit").data("settings", settings);
					itemsToDom(settings.items);
					reconfigureGrid();
					$(this).dialog("close");
				} catch(e) {
					alert("The file that was entered contained errors.");
				}
			},
			Close: function() {
				$(this).dialog("close");
			}
		}
	});
	$("#import-dialog input[type=file]").bind("change", function(e) {
			e = e || window.event;
			e.preventDefault();
			e = e.originalEvent.target || e.target;
			var files = (e.files || e.dataTransfer.files);
			if(files.length < 1) {
				alert("Please select a file created by this program.");
				return false;
			}
			var reader = new FileReader();
			reader.onload = function(e) {
				$("#import-dialog textarea").val(e.target.result);
			};
			reader.onerror = function(e) {
				alert("Please drag a file created by this program into the dialog.");
			}
			reader.readAsText(files[0]);
	});
	$("#import-dialog textarea").bind("drop", function(e) {
			e = e || window.event;
			e.preventDefault();
			e = e.originalEvent || e;
			var files = (e.files || e.dataTransfer.files);
			if(files.length < 1) {
				alert("Please drag a file created by this program into the dialog.");
				return false;
			}
			var reader = new FileReader();
			reader.onload = function(e) {
				$("#import-dialog textarea").val(e.target.result);
			};
			reader.onerror = function(e) {
				alert("Please drag a file created by this program into the dialog.");
			}
			reader.readAsText(files[0]);
	});


	$("#layout-mode").       change(function() { $("#edit").data("settings").mode        = this.value; });
	$("#layout-name").       change(function() { $("#edit").data("settings").name        = this.value; });
	$("#layout-description").change(function() { $("#edit").data("settings").description = this.value; });
});

})(jQuery);
