var loadCredentialList = function () {
  $('#tokenlist').empty().hide();
  chrome.runtime.getBackgroundPage(function(backgroundpage) {
    chrome.storage.local.get('tokens', function(data) {
      var arr_tokens = data['tokens'];
      if (arr_tokens.length > 0) {
        for (i = 0; i < arr_tokens.length; i++) {
          var api_credential = backgroundpage.b(arr_tokens[i]);
          if (!api_credential) { api_credential = {desc: "Failed to load", tokentype: "Please delete and register again", uniqid: i}; }
          var list_html = '<li class="collection-item avatar disabled">';
          list_html += '<i class="material-icons key-img circle teal lighten-2 z-depth-1" style="display: none;">lock_open</i>';
          list_html += '<span class="center" style="font-size: 15px; font-weight: bold">' + api_credential.desc + '</span>';
          list_html += '<p>' + api_credential.tokentype + '</p>';
          list_html += '<p class="blue-grey-text">Click on Activate to enable this credential for your requests</p>';
          list_html += '<div class="secondary-content">';
          list_html += '<div><a href="#!" tokenid="' + api_credential.uniqid + '" action="activate">Activate</a></div>';
          list_html += '<div><a href="#!" tokenid="' + api_credential.uniqid + '" action="edit">Edit</a></div>';
          list_html += '<div><a href="#!" tokenid="' + api_credential.uniqid + '" action="download">Download</a></div>';
          list_html += '<div><a href="#!" tokenid="' + api_credential.uniqid + '" action="delete">Delete</a></div>';
          list_html += '</div></li>';
          $('#tokenlist').append(list_html);
        }
        // if (arr_tokens.length == 1) {$('[action=activate]').trigger('click')};
        $("#apitab-nocredential").hide();
        $('#tokenlist').show();
        markActiveToken();
      } else {
        $("#apitab-nocredential").show();
        return false;
      }
    });
  });
}

// Mark current active_token
var markActiveToken = function() {
  chrome.runtime.getBackgroundPage(function(backgroundpage) {
    $("a[tokenid='" + backgroundpage.activatedTokenCache.uniqid + "'][action='activate']").trigger('click');
  });
}

$('#deletealltoken').click(function() {
  chrome.runtime.sendMessage({type: "gaq", target: "Delete_all_tokens", behavior: "clicked"});
  chrome.runtime.sendMessage({type: "cmanager", action: "deleteall",});
  $("#tokenlist").hide();
  $("#apitab-nocredential").show();
});

$('#addnewtoken, #addnewtokenlink').click(function() {
  chrome.runtime.sendMessage({type: "gaq", target: "Add_new_credential", behavior: "clicked"});
 // chrome.tabs.create({
  //  url: 'cmanager/credential.html'
 // });
$('.addingapitoken').empty();
$('.addingapitoken').append(' <div class="container" style="width: auto;"> <div class="row"> <div class="col s8"> <div class="card"> <div class="card-content" style="font-size: 13px;"> <span class="card-title">Adding an API Credential</span> <div class="row"> <div class="input-field col s12"> <input placeholder="" id="credential_desc" type="text"> <label for="credential_desc">Credential Description</label> </div> </div> <div class="row"> <div class="input-field col s12"> <input placeholder="" id="baseurl" type="text"> <label for="baseurl">Base URL (ensure you start the BaseURL with https://)</label> </div> </div> <div class="row"> <div class="input-field col s12"> <input placeholder="" id="accesstoken" type="text"> <label for="accesstoken">Access Token</label> </div> </div> <div class="row"> <div class="input-field col s12"> <input placeholder="" id="clienttoken" type="text"> <label for="clienttoken">Client Token</label> </div> </div> <div class="row"> <div class="input-field col s12"> <input placeholder="" id="secret" type="text"> <label for="secret">Secret</label> </div> </div> <div class="row"> <div class="input-field col s12"> <select id="tokentype"> <option value="" disabled selected>Choose Credential Type</option> <option value="General OPEN APIs">General OPEN APIs</option> <option value="Fast Purge APIs">Fast Purge APIs</option> </select> <label>Credential Type</label> </div> </div> </div> <div class="card-action"> <div class="row right-align"> <div class="col s12"> <a id="closed_api_Button" class="blue-grey waves-effect waves-light btn">Close</a> <a id="submitButton-add" class="light-blue waves-effect waves-light btn">Save &amp; Add Another</a> <a id="submitButton" class="light-blue waves-effect waves-light btn">Save &amp; Close</a> <a id="clearButton" class="blue-grey waves-effect waves-light btn">Reset</a> </div> </div> </div> </div> </div> <div class="col s4"> <div class="card"> <div class="card-content"> <span class="card-title">Upload a credential file</span> <form action="#"> <div class="file-field input-field"> <div class="light-blue waves-effect waves-light btn"> <span>File</span> <input type="file"> </div> <div class="file-path-wrapper"> <input class="file-path validate" type="text"> </div> </div> </form> </div> </div> </div> </div> <!-- main row --> </div>');
loadcredentialaddition();

});

$(document).on('click', '#tokenlist li a', function(event) {
  var button_type = $(this).attr('action');
  var token_id = $(this).attr('tokenid');
  switch (button_type) {
    case "edit":
      chrome.tabs.create({url: 'cmanager/credential.html?id=' + token_id});
      chrome.runtime.sendMessage({type: "gaq", target: "Editing_an_api_token", behavior: "clicked"});
      break;
    case "delete":
      $(this).closest("li.avatar").fadeOut("normal", function() {
        if ($(this).parent("ul").children().length === 1) {
          $("#tokenlist").hide();
          $("#apitab-nocredential").show();
        }
        $(this).remove();
      });
      chrome.runtime.sendMessage({type: "cmanager", action: "delete", token_id: token_id});
      chrome.runtime.sendMessage({type: "gaq", target: "Deleting_an_api_token", behavior: "clicked"});
      break;
    case "activate":
      $(".key-img").hide();
      $(this).closest("li.avatar").find(".key-img").fadeToggle();
      $('.collection-item.avatar').addClass("disabled");
      $(this).closest("li.avatar").removeClass("disabled");
      chrome.runtime.sendMessage({type: "cmanager", action: "activate", token_id: token_id});
      chrome.runtime.sendMessage({type: "gaq", target: "Activating_an_api_token", behavior: "clicked"});
      break;
    case "download":
      chrome.runtime.sendMessage({type: "cmanager", action: "download", token_id: token_id});
      chrome.runtime.sendMessage({type: "gaq", target: "Downloading_an_api_token", behavior: "clicked"});
      break;
    default:
      break;
  }
});
