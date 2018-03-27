$(document).ready(function () {
    $(document).on('click','#searchSubmit',function () {
        var clientName=$('#search').val();
        if(clientName.length>0)
            window.location=$(this).data('url')+'?search='+clientName;
        else
            window.location=$(this).data('url');
    });
    $(document).on('keypress','#search',function (e) {
        if(e.which == 13){
            $("#searchSubmit").click();
        }
    });
});