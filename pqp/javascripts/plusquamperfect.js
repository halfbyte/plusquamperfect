    var months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
    var dates = []
    var playing =false;
    var elementsVisible;
    var currentLastItem;
    var currentPosition = 0;
    var firstDate;
    var dayWidth = 40;
    var daysHidden = true;
    var currentSlideGroup = null;
    var currentGroupSlide = 0;
    var presenterWindow = null;


    $(document).ready(function(event) {
      $("body").prepend('<div id="day-list-wrapper"><ul id="day-list"></ul></div>');
      $(".date").each( function(i) {
        var date = dateFromId(this.id);
        $(this).hide();
        dates[dates.length] = {date: date, id: this.id};
      });

      
      elementsVisible = $('#day-list-wrapper').width() / dayWidth;
      
      dates = dates.sort(function(a,b) { return a.date - b.date });
      firstDate = new Date(dates[0].date.getFullYear(), dates[0].date.getMonth(), dates[0].date.getDate() - (elementsVisible / 2) - 2); // Time()  - (3600000 * 24 * Math.floor((elementsVisible / 2) + 2)));
      console.log(firstDate)
      var lastDate = dates[dates.length-1].date;
      var fullTimeInDays = Math.floor((lastDate - firstDate) / 3600000 / 24);
      
      currentLastItem = Math.min(fullTimeInDays, (elementsVisible * 2))
      rebuildTimeline(dates[0].date);

      prepareSlideGroups();
      
      createToolbar();

      
      $("#day-list").hide();
      
      function playPause() {
        playing = !playing;
        if (playing) {
          if (daysHidden) {
            daysHidden = false;
            $("#day-list").fadeIn("slow");
          }
          $(".date").fadeOut("slow");
          $(".title").fadeOut("slow");
        }        
      }
      
      function dateFromId(dateString) {
        var dateMatch = dateString.match(/date-(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) return new Date(dateMatch[1],dateMatch[2]-1,dateMatch[3]);
        return null;
      }
      
      function gotoDateString(dateString) {
        var newCurrentDate = dateFromId(dateString);
        currentPosition = Math.floor((newCurrentDate - firstDate) / 86400000) - Math.floor(elementsVisible / 2);
        $('#day-list').css('margin-left', "0")
        rebuildTimeline(newCurrentDate);
        checkForSlides();
      }
            
      function rebuildTimeline(date) {
        $("#day-list").empty();
        var thisFirstDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (elementsVisible / 2) - 1);
        currentLastItem = Math.min(fullTimeInDays, (elementsVisible * 2))
        for( i=0 ; i<Math.min(fullTimeInDays, (elementsVisible * 2)) ; i++ ) {
          var thisDay = new Date(thisFirstDate.getFullYear(), thisFirstDate.getMonth(), thisFirstDate.getDate() + i);
          $("#day-list").append("<li>" + thisDay.getDate() + (thisDay.getDate() == 1 ? "<span class='month'>" + months[thisDay.getMonth()] + " " + thisDay.getFullYear() + "</span>" : "")+ "</li>");
        }
        
      }
      
      function prepareSlideGroups() {
        $(".date.slidegroup").children(".slide").hide();
        $(".date.slidegroup").children(".slide:first").show();
      }
      
      function optimizeList() {
        var num = parseInt($('#day-list').css('margin-left')) / dayWidth;
        if ((-num) > 10) {
          var toRemove = (-num) - 10;
          jQuery.each($('#day-list').children().slice(0,toRemove), function(i,v) {$(v).remove()});
          $('#day-list').css('margin-left', (dayWidth * -10) + "px");
        }
        
        if( $('#day-list li').length < (elementsVisible * 2)) {
          var toAdd = Math.min(currentLastItem + 10, fullTimeInDays) - currentLastItem;
          for(i=0;i<toAdd;i++) {
            var thisDay = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + (i + currentLastItem));
            $("#day-list").append("<li>" + thisDay.getDate() + (thisDay.getDate() == 1 ? "<span class='month'>" + months[thisDay.getMonth()] + " " + thisDay.getFullYear() + "</span>" : "")+ "</li>");
            
          }
          currentLastItem = currentLastItem + toAdd;
        }
        
      }
      
      function isoDateFormat(date) {
        return "" + date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
      }
      
      function toggleToolbar() {
        $('#toolbar').toggle();
      }
      
      function createToolbar() {
        $("body").append('<div id="toolbar"><select id="date-selector"></select> <a href="#" id="click-play">pp</a> <a href="#" id="click-presenter">open presenter display</a> <span id="debug-output"></span></div>');
        var sel = $('#date-selector')[0]
        jQuery.each(dates, function(i,v) {
          sel.options[sel.options.length] = new Option(isoDateFormat(v.date), v.id);
        })
        
        $("#date-selector").change(function(event) {
          gotoDateString(event.target.options[event.target.options.selectedIndex].value);
          return false;
        })
        
        $("#click-play").click(function(event) {
          playPause();
          return false;
        });

        $("#click-presenter").click(function(event) {
          openPresenterWindow();
          return false;
        });

        $(document).keypress(function(e) {
          if (e.which == 32) {
            playPause();
            return false;
          } else if(e.which == 104) {
            toggleToolbar(); 
          } else if(e.which == 106) {
            prevGroupSlide(); 
          } else if(e.which == 107) {
            nextGroupSlide(); 
          } else {
            console.log(e.which)
          }
        });
        
      }
      
      
      function nextGroupSlide() {
        if(currentSlideGroup) {
          if (currentSlideGroup.children(":eq(" + (currentGroupSlide + 1) +")").size() == 0) {
            currentSlideGroup.fadeOut('slow');
            currentSlideGroup = null;
            currentGroupSlide = 0;
          } else {
            currentSlideGroup.children(":eq(" + (currentGroupSlide + 1) +")").show();
            currentSlideGroup.children(":eq(" + (currentGroupSlide) +")").hide();            
            currentGroupSlide++;
          }
          updatePresenterPreviewGroupSlide();
        }
      }

      function prevGroupSlide() {
        if(currentSlideGroup) {
          if (currentSlideGroup.children(":eq(" + (currentGroupSlide - 1) +")").size() == 0) {
            currentGroupSlide = 0;
          } else {
            currentSlideGroup.children(":eq(" + (currentGroupSlide - 1) +")").show();
            currentSlideGroup.children(":eq(" + (currentGroupSlide) +")").hide();            
            currentGroupSlide--;
          }
          updatePresenterPreviewGroupSlide();
        }
        
      }
      
      function openPresenterWindow() {
        presenterWindow = window.open("presenter.html", "Presenter Display", "width=800,height=600,toolbar=no,menubar=no,location=no");
      }

      function updatePresenterWindow() {
        if (!presenterWindow) return;
        var root = $(presenterWindow.document);
        var thisDay = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + Math.floor(currentPosition + Math.floor(elementsVisible/2)));
        console.log($("#date-display", root));
        $("#date-display", root).html("" + isoDateFormat(thisDay));
      }
      
      function updatePresenterPreview(content) {
        if (!presenterWindow) return;
        var root = $(presenterWindow.document);
        $('#preview', root).html(content);
        $('#preview div', root).show();
      }
      
      function updatePresenterPreviewGroupSlide() {
        if (!presenterWindow) return;
        var root = $(presenterWindow.document);
        $('#preview .slide', root).removeClass("current");
        $('#preview .slide:eq(' + currentGroupSlide + ')' , root).addClass("current");
        
      }


      function checkForSlides() {
        var thisDay = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + Math.floor(currentPosition + Math.floor(elementsVisible/2)));
        // $('#debug-output').html("" + thisDay)
        var dateArray = jQuery.map(dates, function(e,i) { return(e.date.getTime()) });
        var posInArray = dateArray.indexOf(thisDay.getTime());
        
        
        if (posInArray != -1) {
          if (!$("#" + dates[posInArray].id).hasClass("version")) $(".date").fadeOut("fast");

          $("#" + dates[posInArray].id).fadeIn("slow");
          console.log($("#" + dates[posInArray].id).html());
          updatePresenterPreview($("#" + dates[posInArray].id).html());
          if ($("#" + dates[posInArray].id).hasClass("hold")) {
            playing = false;
          } if ($("#" + dates[posInArray].id).hasClass("slidegroup")) {
            // do nothing for now.
            currentSlideGroup = $("#" + dates[posInArray].id);
            updatePresenterPreviewGroupSlide();
          } else {
            window.setTimeout(function() {
              $("#" + dates[posInArray].id).fadeOut("slow");  
            }, 3000);
          }
        }
      }
      
      function move(dir) {
        currentPosition += (dir / Math.abs(dir));
        var newMargin = (parseInt($("#day-list").css("margin-left")) - (dayWidth * dir)) + "px";
        $("#day-list").animate({ marginLeft: newMargin}, 600, "swing", function(e) {
          optimizeList();
           window.setTimeout(updateAnim, 400);
        } );
        checkForSlides();
        
      }


      function updateAnim() {
        if(playing) {
          move(1);
        } else window.setTimeout(updateAnim, 1000);
        updatePresenterWindow();
      }     
      window.setTimeout(updateAnim, 1000);
    });

