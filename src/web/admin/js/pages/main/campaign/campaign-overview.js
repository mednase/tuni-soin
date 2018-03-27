/**
 * Created by medNaceur on 10/11/2017.
 */
$(document).ready(function () {
    $(".values").show();
    $(".stats").hide();
    $(document).on('click', '#searchClient', function () {
        var clientName = $('#clientName').val();
        if (clientName.length > 0)
            window.location = $(this).data('url') + '?client=' + clientName;
        else
            window.location = $(this).data('url');
    });
    $(document).on('change', '#chosenYear', function () {
        var year = $(this).val();
        var url = $(this).data('url');
        var search = $(this).data('search').length > 0 ? "?client=" + $(this).data('search') : "";
        window.location = url.replace('_year_', year) + search;
    });
    $('#clientName').keypress(function (e) {
        if (e.which == 13) {//Enter key pressed
            $('#searchClient').click();//Trigger search button click event
        }
    });
    if (sessionStorage.getItem('compare') === "on") {
        setTimeout(function () {
            $('#inputUnchecked').click();
        }, 100)
    }
    $(document).on('change', "#inputUnchecked", function () {
        setTimeout(function(){
            $(window).scroll();
        },10);
        if (this.checked) {
            $("#exportBtn").attr("href", $('#exportPreview').val());
            sessionStorage.setItem('compare', "on");
            $(".stats").show();
            $(".netChange").show();
            $(".values").hide();
        } else {
            $("#exportBtn").attr("href", $('#exportCurrent').val());
            sessionStorage.setItem('compare', "off");
            $(".values").show();
            $(".stats").hide();
        }
    });
});