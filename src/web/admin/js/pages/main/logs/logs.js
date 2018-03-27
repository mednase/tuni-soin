/**
 * Created by medNaceur on 15/12/2017.
 */
$(document).ready(function () {
    $(".input-daterange").datepicker({  format: "yyyy-mm-dd" });
    $('#filterApply').click(function () {
        var url= $(this).data('url')+"?";
        var client = $('#selectedClient').val();
        if(client)
            url+="client="+client+"&";
        var fails =$('#fails').prop('checked');
        if(fails)
            url+="fail=1&";
        var timeFrom = $('#dateFrom').val();
        var timeTo = $('#dateTo').val();
        if(timeFrom)
            url+="from="+timeFrom+"&to="+timeTo;
        if(url.slice(-1)==="&" || url.slice(-1)==="?")
            url=url.substring(0, url.length - 1);
        window.location=url;
    })
})