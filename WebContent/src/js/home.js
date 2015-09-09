/**
 * 
 */
var monthsAbbr = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
		'Sep', 'Oct', 'Nov', 'Dec' ];
var token = "12e7eaf1625004b7341b6d681fa3a7c1c551b5300cf7f7f3a02010e99c84695d";

$(document).ready(init);

function init() {
	loadAssignments();
	initDialog();
}

function initListeners() {
	$(".assignmentsList").unbind("hover");
	$(".assignmentsList").unbind("click");

	$(".assignmentsList").hover(function() {
		$(this).addClass("myHover");
	}, function() {
		$(this).removeClass("myHover");
	});

	$(".assignmentsList").click(
			function() {
				$(".assignmentsList").removeClass("assignmentSelected");
				$(this).addClass("assignmentSelected");

				$("#tabs").removeClass("inactive");
				$("#details").addClass("inactive");

				renderTab($(this).data("title"), $(this).data("dueDate"), $(
						this).data("desc"), $(this).data("creatorID"), $(this)
						.data("assigmentID"));
			});

	initTabs();
}

function renderTab(title, dueDate, desc, creatorID, assignmentID) {
	$("#tabs-1 div div.assignDetailName span").html(title);
	$("#tabs-1 div div.assignDetailDue span").html("Due " + dueDate);
	$("#tabs-1 div.assignDetailContent p").html(desc);

	if (assignmentID == undefined) {
		$("#tabs-2 .assignDetailBox").empty();
		return;
	}

	var url = "https://api.edmodo.com/assignment_submissions?assignment_id="
			+ assignmentID + "&assignment_creator_id=" + creatorID
			+ "&access_token=" + token;
	$.ajax({
		url : url,
		method : "GET",
		dataType : "json",
		success : function(data) {
			renderSubmissions(data);
		}
	});
}

function renderSubmissions(data) {
	console.log(data);
	var submissionBox = $("#tabs-2 .assignDetailBox");
	submissionBox.empty();

	for (var i = 0; i < data.length; i++) {
		var submissionList = $("<div class='submissionList'></div>");
		submissionList.append("<div class='imageStudent'><img src="
				+ data[i].creator.avatars.large + "></div>");

		var receiptInfo = $("<div class='receiptInfo'></div>");
		receiptInfo.append("<div><span class='rInfoName'>"
				+ data[i].creator.first_name + " " + data[i].creator.last_name
				+ "</span></div>");
		receiptInfo.append("<div><span>turned in "
				+ getFormattedDate(data[i].submitted_at) + "</span></div>");

		submissionList.append(receiptInfo);
		submissionList
				.append("<div class='arrowDown'><img src='images/arrowDownIcon.fw.png'></div>");
		var submissionContent = $("<div class='submissionContent'>"
				+ data[i].content + "</div>");

		submissionBox.append(submissionList);
		submissionBox.append(submissionContent);
	}
	initSubmissionContent();
}

function initTabs() {
	$("#tabs").tabs();
}

function initSubmissionContent() {
	$(".submissionList").click(
			function() {
				$(this).next().slideToggle(500);
				var imgSrc = $(this).find(".arrowDown img").attr("src");
				if (imgSrc == "images/arrowDownIcon.fw.png") {
					$(this).find(".arrowDown img").attr("src",
							"images/arrowUpIcon.fw.png");
				} else {
					$(this).find(".arrowDown img").attr("src",
							"images/arrowDownIcon.fw.png");
				}

			});
}

function loadAssignments() {
	var url = "https://api.edmodo.com/assignments" + "?access_token=" + token;
	$.ajax({
		url : url,
		method : "GET",
		dataType : "json",
		crossDomain : true,
		success : renderAssignments
	});
}

function getFormattedDate(stringDate) {
	var date = new Date(stringDate);
	var day = date.getUTCDate();
	if (day < 10) {
		day = "0" + day;
	}
	var formattedDate = monthsAbbr[date.getUTCMonth()] + " " + day + " "
			+ date.getFullYear();
	return formattedDate;
}

function renderAssignments(data) {
	console.log(data);
	var leftBar = $("#mainSidebar");
	leftBar.empty();
	for (var i = 0; i < data.length; i++) {
		var assignmentBox = renderAssignmentBox(data[i].title, data[i].due_at,
				data[i].description);

		assignmentBox.data("creatorID", data[i].creator.id);
		assignmentBox.data("assigmentID", data[i].id);
		leftBar.append(assignmentBox);
	}

	initListeners();
}

function renderAssignmentBox(title, due_at, desc) {
	var oddClass = "";
	if ($("#mainSidebar .assignmentsList").length >= 1) {
		oddClass = "odd";
	}

	var assignmentBox = $("<div class='assignmentsList " + oddClass
			+ "'></div>");
	assignmentBox
			.append("<div class='marginNameDue'><span class='assignmentName'>"
					+ title + "</span></div>");
	var dueDate = getFormattedDate(due_at);

	assignmentBox.append("<div><span class='assignmentDue'>Due " + dueDate
			+ "</span></div>");

	assignmentBox.data("title", title);
	assignmentBox.data("desc", desc);
	assignmentBox.data("dueDate", dueDate);

	return assignmentBox;
}

function createAssignment() {
	var leftBar = $("#mainSidebar");
	var assignmentBox = renderAssignmentBox($("#newAssignmentTitle").val(), $(
			"#newAssignmentDueDate").val(), $("#newAssignmentDesc").val());

	leftBar.append(assignmentBox);
	initListeners();
}

function initDialog() {
	var dialog = $("#createAssignment").dialog(
			{
				autoOpen : false,
				height : 300,
				width : 550,
				modal : true,
				buttons : {
					"Create Assignment" : function() {
						if ($("#newAssignmentTitle").val().length == 0
								|| $("#newAssignmentDueDate").val().length == 0
								|| $("#newAssignmentDesc").val().length == 0) {
							errorDialog.dialog("open");
							return;
						}
						createAssignment();
						$(this).dialog("close");
					},
					Cancel : function() {
						$(this).dialog("close");
					}
				},
				close : function() {
					$("#newAssignmentTitle").val("");
					$("#newAssignmentDueDate").val("");
					$("#newAssignmentDesc").val("");
				}
			});

	var errorDialog = $("#validationDialog").dialog({
		autoOpen : false,
		height : 200,
		width : 550,
		modal : true,
		buttons : {
			"Close" : function() {
				$(this).dialog("close");
			}
		}
	});

	$("#createAssignmentButton").click(function() {
		dialog.dialog("open");
	});
}