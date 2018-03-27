/**
 * Created by medNaceur on 28/09/2017.
 */
$(document).ready(function () {
    $(document).on('click', '.btn-delete-client', function () {
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
                    data:{fullDelete:$('#full-delete').val()},
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
        $(".dialog .msg").after($('#full-delete-block').clone());
    });
    $(document).on('click','.btn-disable-client',function () {
        var btn = $(this);
        var url = btn.data('url');
        var affBtn=btn.parent().find('.assign-user-md');
        $.ajax({
            url:url,
            method:'POST',
            beforeSend:function () {
                $(btn).mouseleave(function () {
                    $(this).tooltip('hide');
                });
                btn.find('i').addClass('spin');
            },
            success:function (data) {
                if(data.status===1){
                    btn.closest('tr').find('.user-status').html('<i class="icon fa-check-circle"></i>');
                    btn.tooltip().attr('data-original-title',data.action).tooltip('show');
                    affBtn.attr('href','#assignUserModal');
                    affBtn.removeClass('not-active');
                    btn.closest('tr').removeClass('disabled-client')
                }else{
                    btn.closest('tr').find('.user-status').html('<i class="icon fa-times"></i>');
                    btn.removeClass('gray');
                    affBtn.removeAttr('href');
                    affBtn.addClass('no-active');
                    btn.tooltip().attr('data-original-title',data.action).tooltip('show');
                    btn.closest('tr').addClass('disabled-client')
                }
                btn.find('i').removeClass('spin');
                toastr.success(data.msg);
            }
        });
    })
    $(document).on('click','#searchClient',function () {
        var clientName=$('#clientName').val();
        if(clientName.length>0)
            window.location=$(this).data('url')+'?search='+clientName;
        else
            window.location=$(this).data('url');
    });
    $(document).on('keypress','#clientName',function (e) {
        if(e.which == 13){
            $("#searchClient").click();
        }
    });
    $(document).on('click','.assign-user-md:not(.not-active)',function () {
        var elem=$(this);
        $('.assign-user-md.opened').removeClass('opened');
        elem.addClass('opened');
        var url=elem.data('url');
        $('.assign-user:checked').click();
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
                    $('#user-'+obj.token).click();
                })
            }

        })
    });
    $('#saveAssignedUser:not(.loading)').click(function () {
        var btn=$(this);
        var assignedUsers=[];
        var url=$('.assign-user-md.opened').data('url');
        $.each($('.assign-user:checked'),function (i,elem) {
            assignedUsers.push($(elem).val());
        });
        $.ajax({
            url:url,
            method:'POST',
            data:{assignedUsers:assignedUsers},
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
    $('#filter-users').on('change keyup',function () {
        var search=$(this).val();
        $('.user-block').each(function () {
            var txt=$(this).find('label.user-name').text();
            if(!txt.toUpperCase().includes(search.toUpperCase()))
                $(this).addClass('hidden');
            else
                $(this).removeClass('hidden');
        });
        $('#allUsers').prop('checked',$('.user-block:not(.hidden) .assign-user:checked').length===$('.user-block:not(.hidden) .assign-user').length);
    });
    $('.assign-user').on('change',function () {
        $('#allUsers').prop('checked',$('.user-block:not(.hidden) .assign-user:checked').length===$('.user-block:not(.hidden) .assign-user').length);
    });
    $(document).on('change','#allUsers',function () {
        var checked=$(this).prop('checked');
        $('.user-block:not(.hidden) .assign-user').prop('checked',checked);
    })
});