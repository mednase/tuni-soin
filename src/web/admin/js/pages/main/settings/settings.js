/**
 * Created by medNaceur on 21/11/2017.
 */
$(document).ready(function () {
    $('#addNewsletter').click(function () {
        var container= $('#newsletter_container');
        var prototype=$(this).data('prototype');
        prototype=prototype.replace(/__name__/g,container.children().length);
        container.append(prototype);
        container.children().last().find('input').addClass('form-control');
    });
    $(document).on('click','.btn-delete-newsletter',function (e) {
        e.preventDefault();
        $(this).closest('.newsletter-block').remove();
    })
})