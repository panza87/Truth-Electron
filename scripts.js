var client = new Faye.Client('https://glacial-depths-39385.herokuapp.com/faye');

truthApp.unread = {};
truthApp.totalUnread = 0;

client.subscribe('/messages/new', function(message) {
  console.log(message)
  if (truthApp.blurred) {
    new Notification('New Message', {
      body: message.data.content
    });
  }
  if (parseInt(message.data.user_id) != parseInt(sessionStorage.getItem("user_id"))) {

    if (message.data.group_id === truthApp.group_id) {
      $newLi = $("<li class='others'>")
      $newLi.append('<img class="thumb" src="' + message.data.image + '"/>');
      $newLi.append('<div class="content">' + message.data.name + '<div id="messageContent" class="round lighten-3">' + message.data.content + '</div></div>')
      $("#messageList").append($newLi)
      var newHeight = $('#main')[0].scrollHeight;
      console.log(newHeight);
      $('#main').animate({scrollTop: newHeight}, 'slow');
    } else {
      truthApp.unread[message.data.group_id] += 1;
      truthApp.totalUnread = 0
      _.each(truthApp.unread, function(num) {
        truthApp.totalUnread += num
      })
      app.setBadgeCount(truthApp.totalUnread)
      if (document.getElementById(message.data.group_id)) {
        $("#" + message.data.group_id).text(truthApp.unread[message.data.group_id])
      } else {
        $("a[data-id='" + message.data.group_id + "'] li").append("<span id='" + message.data.group_id + "' class='badge'>" + truthApp.unread[message.data.group_id] + "</span>")
      }
    }
  }
});

window.client.subscribe('/groups/new', function(data) {
  console.log(data);
  truthApp.unread[data.data.id] = 0;
  $newLink = $("<a href='#' id='group' data-id='" + data.data.id + "'></a>")
  $newLink.append("<li># " + data.data.title + "</li>")
  $("#nav").append($newLink)
  $("a[data-id='" + data.data.id + "']").on("click", function(e) {
    groupId = $(this).attr("data-id");
    e.preventDefault();
    showContent(this.id, groupId)
  });
});

// var displayMessages = function(data) {
//
// }

var displayGroups = function(data) {
  for (var i = 0; i < data.length; i++) {
    truthApp.unread[data[i].id] = 0;
    $newLink = $("<a href='#' id='group' data-id='" + data[i].id + "'></a>")
    $newLink.append("<li># " + data[i].title + "</li>")
    $("#nav").append($newLink)
    $("a[data-id='" + data[i].id + "']").on("click", function(e) {
      groupId = $(this).attr("data-id");
      e.preventDefault();
      showContent(this.id, groupId)
    });
  }
}

var tokenz = function(data) {
  console.log(data);
  sessionStorage.setItem("jwt", data.auth_token);
  sessionStorage.setItem("user_id", parseInt(data.user.id));
  truthApp.user_id = sessionStorage.getItem("user_id");
  truthApp.user_name = sessionStorage.setItem("user_name", data.user.name);
  truthApp.jwt = truthApp.jwt || "Bearer " + sessionStorage.getItem("jwt");
  $("#yourName").append(sessionStorage.getItem("user_name"));
  $("#create_group").css({
    display: "block"
  })

  $.ajax({
    url: "https://glacial-depths-39385.herokuapp.com/groups.json",
    dataType: "JSON",
    type: "GET",
    data: {
      appType: "electron"
    },
    headers: {
        'Authorization': truthApp.jwt
    },
  }).fail(function( xhr, status, errorThrown ) {
    console.log( "Sorry, there was a problem!" );
    console.log( "Error: " + errorThrown );
    console.log( "Status: " + status );
    console.dir( xhr );
  }).done(displayGroups);

  $("#main").html("<h1>Welcome to The Truth</h1><p>Choose a group to get started!</p>")
}

// Making a GET request to a URL that looks something like :http://omdbapi.com?t=jaws"
// $.ajax({
//   url: "http://localhost:3000/messages.json",
//   dataType: "JSON",
//   type: "GET",
//   headers: {
//       'Authorization':'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxfQ.6aC6HlofVMAMKqk15Jra5_bhiHb-jBS6XyjAEAIINpk'
//   },
// }).fail(function( xhr, status, errorThrown ) {
//   console.log( "Sorry, there was a problem!" );
//   console.log( "Error: " + errorThrown );
//   console.log( "Status: " + status );
//   console.dir( xhr );
// }).done(displayMessages);

$(document).ready(function() {
  $("#submit").on("click", function(e) {
    e.preventDefault();
    email = $("#email").val();
    password = $("#password").val();
    appType = $("#appType").val();
    $.ajax({
      url: "https://glacial-depths-39385.herokuapp.com/login?email=" + email + "&password=" + password + "&appType=" + appType,
      dataType: "JSON",
      type: "POST"
    }).fail(function( xhr, status, errorThrown ) {
      console.log( "Sorry, there was a problem!" );
      console.log( "Error: " + errorThrown );
      console.log( "Status: " + status );

      console.dir( xhr );
    }).done(tokenz);
    // showContent("search")
  });
})
