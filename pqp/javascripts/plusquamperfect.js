    var months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
    var dates = []
    var playing =false;
    var elementsVisible;
    var currentLastItem;
    var currentPosition = 0;
    var firstDate;
    var dayWidth = 40;
    var daysHidden = true;
    $(document).ready(function(event) {
      $("body").prepend('<div id="day-list-wrapper"><ul id="day-list"></ul></div>');

      $(".date").each( function(i) {
        var dateMatch = this.id.match(/date-(\d{4})-(\d{2})-(\d{2})/);
        var date = new Date(dateMatch[1],dateMatch[2]-1,dateMatch[3]);
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
      
      
      for(i=0;i<Math.min(fullTimeInDays, (elementsVisible * 2));i++) {
        var thisDay = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + i);
        $("#day-list").append("<li>" + thisDay.getDate() + (thisDay.getDate() == 1 ? "<span class='month'>" + months[thisDay.getMonth()] + " " + thisDay.getFullYear() + "</span>" : "")+ "</li>");
      }
      
      $("#day-list").hide();
      
      $("#click-prev").click(function(event) {
        move(-1);
        return false;
      });
      $("#click-next").click(function(event) {
        move(1);
        return false;
      });
      
      $("#click-play").click(function(event) {
        playing = !playing;
        if (playing) {
          $(".date").fadeOut("slow");
        }
        return false;
      });
      
      $(document).keypress(function(e) {
        if (e.which == 32) {
          playing = !playing;
          if (playing) {
            if (daysHidden) {
              daysHidden = false;
              $("#day-list").fadeIn("slow");
            }
            $(".date").fadeOut("slow");
            $(".title").fadeOut("slow");
          }
          return false;        
        }
      });
      
      
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

      function checkForSlides() {
            var thisDay = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + Math.floor(currentPosition + Math.floor(elementsVisible/2)));
            console.log(thisDay)
            var dateArray = jQuery.map(dates, function(e,i) { return(e.date.getTime()) });
            var posInArray = dateArray.indexOf(thisDay.getTime());
            if (posInArray != -1) {
              $("#" + dates[posInArray].id).fadeIn("slow");
              if ($("#" + dates[posInArray].id).hasClass("hold")) {
                playing = false;
              } else {
                window.setTimeout(function() {
                  $(".date").fadeOut("slow");  
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
      }     
      window.setTimeout(updateAnim, 1000);
    });

