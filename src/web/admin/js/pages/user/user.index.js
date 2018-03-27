/**
 * Created by medNaceur on 28/09/2017.
 */
$(document).ready(function () {
    $(document).on('click', '.btn-modal', function () {
        var btn = $(this);
        var url = btn.data('url');
        var title = btn.data('modal-title');
        var confirmText = btn.data('confirm-text');
        var cancelText = btn.data('cancel-text');
        alertify
            .theme('bootstrap')
            .okBtn(confirmText)
            .cancelBtn(cancelText)
            .confirm(title, function (ev) {
                ev.preventDefault();
                $.ajax({
                    url: url,
                    method: 'post',
                    beforeSend: function () {
                        $('.alertify .ok').html('<span class="ladda-spinner"></span>')
                    },
                    success: function (message) {
                        alertify.success(message);
                        btn.closest('tr').remove();
                    },
                    error: function () {
                        alertify.error("There was an error");
                    }
                })

            });
    });
    $(document).on('click','.assign-client-md:not(.not-active)',function () {
        var elem=$(this);
        $('.assign-client-md.opened').removeClass('opened');
        elem.addClass('opened');
        var url=elem.data('url');
        $('.assign-client:checked').click();
        $.ajax({
            url:url,
            method:'GET',
            dataType:'JSON',
            beforeSend:function () {
                $('.modal-loading').removeClass('hidden');
            },
            success:function (data) {
                $('.modal-loading').addClass('hidden');
                $.each(data,function (i,obj) {
                    $('#client-'+obj.token).click();
                })
            }

        })
    });
    $('#saveAssignedClient:not(.loading)').click(function () {
        var btn=$(this);
        var assignedClients=[];
        var url=$('.assign-client-md.opened').data('url');
        $.each($('.assign-client:checked'),function (i,elem) {
            assignedClients.push($(elem).val());
        });
        $.ajax({
            url:url,
            method:'POST',
            data:{assignedClients:assignedClients},
            beforeSend:function(){
                btn.addClass('loading');
                $('.modal-loading').removeClass('hidden');
            },
            success:function (data) {
                btn.removeClass('loading');
                $('.modal-loading').addClass('hidden');
                if(data.status===200)
                    toastr.success(data.msg);
                $('.modal .close').click();
            }

        })
    });
    $(document).on('click', '.btn-disable-user', function () {
        var btn = $(this);
        var url = btn.data('url');
        var affBtn=btn.parent().find('.assign-client-md');
        $.ajax({
            url: url,
            method: 'POST',
            beforeSend:function () {
                $(btn).mouseleave(function () {
                    $(this).tooltip('hide');
                });
                btn.find('i').addClass('spin');
            },
            success: function (data) {
                if (data.status === 1) {
                    btn.closest('tr').find('.user-status').html('<i class="icon fa-check-circle"></i>');
                    btn.tooltip().attr('data-original-title', data.action).tooltip('show');
                    affBtn.attr('href','#assignedClientModal');
                    affBtn.removeClass('not-active');
                    btn.closest('tr').removeClass('disabled-user')
                } else {
                    btn.closest('tr').find('.user-status').html('<i class="icon fa-times"></i>');
                    btn.removeClass('gray');
                    btn.tooltip().attr('data-original-title', data.action).tooltip('show');
                    affBtn.removeAttr('href');
                    affBtn.addClass('no-active');
                    btn.closest('tr').addClass('disabled-user')
                }
                btn.find('i').removeClass('spin');
                toastr.success(data.msg);
            }
        });
    });
    $('#filter-client').on('keyup',function () {
        var search=$(this).val();
        $('.client-block').each(function () {
            var txt=$(this).find('label.client-name').text();
            if(!txt.toUpperCase().includes(search.toUpperCase()))
                $(this).addClass('hidden');
            else
                $(this).removeClass('hidden');
        });
        $('#allClient').prop('checked',$('.client-block:not(.hidden) .assign-client:checked').length===$('.client-block:not(.hidden) .assign-client').length);
    });
    $(document).on('click','#searchUser',function () {
        var search=$('#search').val();
        if(search.length>0)
            window.location=$(this).data('url')+'?search='+search;
        else
            window.location=$(this).data('url');
    });
    $(document).on('keypress','#search',function (e) {
        if(e.which == 13){
            $("#searchUser").click();
        }
    });
    $('.assign-client').on('change',function () {
        $('#allClient').prop('checked',$('.client-block:not(.hidden) .assign-client:checked').length===$('.client-block:not(.hidden) .assign-client').length);
    });
    $(document).on('change','#allClient',function () {
        var checked=$(this).prop('checked');
        $('.client-block:not(.hidden) .assign-client').prop('checked',checked);
    });
});