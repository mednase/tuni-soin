/**
 * Created by medNaceur on 25/09/2017.
 */
$(document).ready(function () {
    if ($("#menuSelected").length) {
        $("." + $("#menuSelected").data('menu')).addClass('active').closest('.has-sub').addClass('open');
    }
    $(document).on('change', '#saveTablePageLength', function () {
        var pageLen = $(this).val();
        var url=$(this).data('url');
        var reload=$(this).data('reload');
        $.ajax({
            url: url,
            method: 'post',
            data: {tablePageLength: pageLen},
            success: function () {
                window.location=reload;
            }
        })
    });
    $('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover'
    });
});