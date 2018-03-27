/**
 * Created by medNaceur on 23/10/2017.
 */
$(document).on('change', '#chosenYear', function () {
    window.location = $(this).find('option:selected').data('url');
});
$(document).on('click', '#searchClient', function () {
    var clientName = $('#clientName').val();
    if (clientName.length > 0)
        window.location = $(this).data('url') + '?client=' + clientName;
    else
        window.location = $(this).data('url');
});
$(document).on('click', '#searchClient', function () {
    var clientName = $('#clientName').val();
    if (clientName.length > 0)
        window.location = $(this).data('url') + '?client=' + clientName;
    else
        window.location = $(this).data('url');
});
$(document).on('keypress', '#clientName', function (e) {
    if (e.which == 13) {
        $("#searchClient").click();
    }
});