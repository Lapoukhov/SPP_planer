$(function() {

 $.fn.scrollToTop = function() {

  $(this).hide().removeAttr("href");

  if ($(window).scrollTop() >= "250") {
	$(this).fadeIn("slow")
  }

  var scrollDiv = $(this);

  $(window).scroll(function() {
   if ($(window).scrollTop() <= "250") {
	$(scrollDiv).fadeOut("slow")
   } else {
	$(scrollDiv).fadeIn("slow")
   }
  });

  $(this).click(function() {
   $("html, body").animate({scrollTop: 0}, "slow")

  })

 }

});




$(function() {
 $("#top").scrollToTop();

});



$(document).ready(function(){

    $(window).scroll(function(){

        if ($(window).width() <= '995')
        {
            
	    if ($(this).scrollTop() > 100) {
                $('#scroll').fadeIn();

            } else {
                $('#scroll').fadeOut();
            }
        }

    });


    if ($('.owl-nav').hasClass('disabled')) {
        $('#counter').hide();
    }

});

