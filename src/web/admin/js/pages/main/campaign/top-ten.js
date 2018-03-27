/**
 * Created by medNaceur on 10/11/2017.
 */
function compare(a, b) {
    return b.y - a.y;
}
var colors = ['#f96868', '#62a8ea', '#37F223', '#3aa99e', '#57c7d4', '#526069', '#8D6658', '#926dde', ' #F44C87', '#E98F2E'];
$(document).ready(function () {
    var translation = $('#translation');
    var campaign = $('#campaign').text();
    var tableChosenClient = $('#tableChosenClient');
    var tableChosenYear = $('#tableChosenYear');
    var tableFilterType= $('#tableFilterType');
    var chartContainer = $('#container1');
    var chartUrl = chartContainer.data('url');
    var xAxisTitle = chartContainer.data('xaxis');
    var yAxisTitle = chartContainer.data('yaxis');
    var params = {year: tableChosenYear.val()};
    var noDataMessage = translation.data('no-data-message');
    var chartRenderer = null;
    var setTableData = function (params) {
        var table = $('#campaign_top_opened');
        $.ajax({
            url: table.data('url'),
            data: params,
            beforeSend: function () {
                table.find('tr.data').remove();
                $('#clientTh').hide();
                $('#campaign').show();
                $('#dateTh').show();
                $('#loadingTd').show();
            },
            success: function (data) {
                var pickedColor = [];
                $.each(data, function (i, o) {
                    if (!pickedColor[o.clientName])
                        pickedColor[o.clientName] = colors[i];
                    var tr = "<tr class='data'>" +
                        "<td style='border-left: 10px solid " + pickedColor[o.clientName] + "'><b>" + o.subject + "</b><br>";
                    if(o.contactListName)
                        tr+="<small>"+o.clientName+" — "+ o.contactListName +"</small>";
                    else
                        tr+="<small>"+o.clientName+"</small>";
                    if (i < data.length)
                        tr += "<div class='border-divider'></div>";
                    tr += "</td>" +
                        "<td>" + moment(o.date).fromNow() + "</td>" +
                        "<td class='text-right fw-600'>" + o.openedPercent + " %<br><small class='fw-600'>" + parseInt(o.opened).toLocaleString() + "</small></td>" +
                        "<td class='text-right'>" + o.clickedPercent + " %<br><small>" + parseInt(o.clicked).toLocaleString() + "</small></td>" +
                        "<td class='text-right'>" + o.deliveredPercent + " %<br><small>" + parseInt(o.delivered).toLocaleString() + "</small></td>" +
                        "<td class='text-right'>" + o.blockedPercent + " %<br><small> " + parseInt(o.blocked).toLocaleString() + "</small></td>" +
                        "<td class='text-right'>" + o.bouncedPercent + " %<br><small>" + parseInt(o.bounced).toLocaleString() + "</small></td>" +
                        "<td class='text-right'>" + o.spamPercent + " %<br><small>" + parseInt(o.spam).toLocaleString() + "</small></td>" +
                        "<td class='text-right'>" + o.unsubscribedPercent + " %<br><small>" + parseInt(o.unsubscribed).toLocaleString() + "</small></td></tr>";
                    table.find('tbody').append(tr);
                });
                $("small[data-toggle='tooltip']").tooltip();
                $('#loadingTd').hide();
                if (data.length === 0)
                    table.find('tbody').append('<tr class="data no-data"><td colspan="9" class="text-center">' + translation.data('empty') + '</td></tr>')
            }
        })
    };
    var setAvgTableData = function (params) {
        var table = $('#campaign_top_opened');
        $.ajax({
            url: table.data('url2'),
            data: params,
            beforeSend: function () {
                table.find('tr.data').remove();
                $('#clientTh').show();
                $('#campaign').hide();
                $('#dateTh').hide();
                $('#loadingTd').show();
            },
            success: function (dataAvg) {
                var pickedColor = [];
                $.each(dataAvg, function (i, o) {
                    if (!pickedColor[o.name])
                        pickedColor[o.name] = colors[i];
                    var tr = "<tr class='data'>" +
                        "<td style='border-left: 10px solid " + pickedColor[o.name] + "'><b>" + o.name + "</b><br>";
                    if (i < dataAvg.length)
                        tr += "<div class='border-divider'></div>";
                    tr += "</td>" +
                        "<td class='text-right fw-600'>" + o.openedPercent + " %<br><small class='fw-600'>" + parseInt(o.opened).toLocaleString() + "</small></td>" +
                        "<td class='text-right'>" + o.clickedPercent + " %<br><small>" + parseInt(o.clicked).toLocaleString() + "</small></td>" +
                        "<td class='text-right'>" + o.deliveredPercent + " %<br><small>" + parseInt(o.delivered).toLocaleString() + "</small></td>" +
                        "<td class='text-right'>" + o.blockedPercent + " %<br><small> " + parseInt(o.blocked).toLocaleString() + "</small></td>" +
                        "<td class='text-right'>" + o.bouncedPercent + " %<br><small>" + parseInt(o.bounced).toLocaleString() + "</small></td>" +
                        "<td class='text-right'>" + o.spamPercent + " %<br><small>" + parseInt(o.spam).toLocaleString() + "</small></td>" +
                        "<td class='text-right'>" + o.unsubscribedPercent + " %<br><small>" + parseInt(o.unsubscribed).toLocaleString() + "</small></td></tr>";
                    table.find('tbody').append(tr);
                });
                $("small[data-toggle='tooltip']").tooltip();
                $('#loadingTd').hide();
                if (dataAvg.length === 0)
                    table.find('tbody').append('<tr class="data no-data"><td colspan="9" class="text-center">' + translation.data('empty') + '</td></tr>')
            }
        })
    };
    var loadDataTopFive = function (year, url, chart, filterEvent, filterType) {
        $.ajax({
            url: url,
            data: {year: year, filterEvent: filterEvent, filterType: filterType},
            dataType: 'JSON',
            beforeSend: function () {
                $('.responsive-chart').addClass('loading-chart');
                if(chartRenderer){
                    chartRenderer.destroy();
                    chartRenderer=null;
                }
            },
            success: function (result) {
                var filterName = $('#chartFilterEvent>option:selected').data('series');
                var usedColor = [];
                var categories = [];
                if(result.length>0){
                    chart.series[0].update({name: filterName, data: []}, false);
                    for (var i = 0; i < result.length; i++) {
                        var point = {
                            name: result[i].name,
                            y: parseFloat(result[i].eventPercent),
                            event: parseInt(result[i].event),
                            related: parseInt(result[i].related)
                        };
                        if (filterType === 'campaign') {
                            if (!usedColor[result[i].name])
                                usedColor[result[i].name] = colors[i];
                            point.color = usedColor[result[i].name];
                            point.campaign = result[i].campaign;
                        }
                        categories.push(point.name);
                        chart.series[0].addPoint(point, false, false);
                    }
                    chart.xAxis[0].setCategories(categories, true, true);
                }else{
                    //Set No data text
                    var textX = chart.plotLeft + (chart.plotWidth * 0.5);
                    var textY = chart.plotTop + (chart.plotHeight * 0.5);
                    var textWidth = 400;
                    textX = textX - (textWidth / 2);
                    chartRenderer=chart.renderer.label('<div style="width: ' + textWidth + 'px; text-align: center;font-weight: 600"><span>'+noDataMessage+'</span></div>', textX, textY, null, null, null, true)
                        .css({
                            color: '#4572A7',
                            fontSize: '16px'
                        })
                        .add();
                }
                $('.responsive-chart').removeClass('loading-chart');
            },
            cache: false
        })
    };
    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'container1',
            type: 'column',
            events: {
                load: function () {
                    var filterEvent = $('#chartFilterEvent').val();
                    var filterType = $('#chartFilterType').val();
                    var year = $('#chartChosenYear').val();
                    loadDataTopFive(year, chartUrl, this, filterEvent, filterType)
                }
            }
        },
        colors: [
            '#DEB887'
        ],
        title: {
            text: ''
        },
        xAxis: {
            categories: [],
            title: {
                text: xAxisTitle
            }
        },
        yAxis: {
            min: 0,
            tickInterval: 20,
            max:100,
            title: {
                text: yAxisTitle
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                }
            }
        },
        tooltip: {
            formatter: function () {
                var type = $('#chartFilterType').val();
                var event = $('#chartFilterEvent>option:selected').text();
                var related = $('#delivered').text();

                if ($('#chartFilterEvent').val() === 'clicked')
                    related = $('#opened').text();
                var message = "";
                if (type === 'campaign') {
                    var campName = this.point.campaign.slice(0, 30) + (this.point.campaign.length > 30 ? "..." : "");
                    message += '<b>' + campaign + ' : </b>' + campName + '<br>';
                }
                return message +=
                    '<b>' + related + ' : </b> ' + Highcharts.numberFormat(this.point.related, 0) + '<br>' +
                    '<b>' + event + ' : </b> ' + Highcharts.numberFormat(this.point.event, 0) + '<br>' +
                    '<b>' + yAxisTitle + '</b> : ' + this.y.toFixed(1) + '% <br>';
            }
        },
        plotOptions: {
            column: {colorByPoint: true},
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return this.y.toFixed(1) + ' %'

                    }
                }
            }
        },
        series: [{
            showInLegend: false,
            name: '',
            data: []
        }]


    });
    $('#chartFilterEvent').change(function () {
        var filterEvent = $(this).val();
        var filterType = $('#chartFilterType').val();
        var year = $('#chartChosenYear').val();
        loadDataTopFive(year, chartUrl, chart, filterEvent, filterType)
    });
    $('#chartChosenYear').change(function () {
        var filterEvent = $('#chartFilterEvent').val();
        var filterType = $('#chartFilterType').val();
        var year = $(this).val();
        loadDataTopFive(year, chartUrl, chart, filterEvent, filterType)
    });
    $('#chartFilterType').change(function () {
        var filterEvent = $('#chartFilterEvent').val();
        var filterType = $(this).val();
        var year = $('#chartChosenYear').val();
        loadDataTopFive(year, chartUrl, chart, filterEvent, filterType)
    });
    tableChosenClient.change(function () {
        var client = $(this).val();
        if (client !==null)
            params.token = $(this).val();
        else
            params = {year: params.year};
        setTableData(params);
    });
    tableChosenYear.change(function () {
        var client = tableChosenClient.val();
        var year = $(this).val();
        params = {year: year};
        if (client  && (tableFilterType.val() === "campaign")) {
            params.token = tableChosenClient.val();
            setTableData(params);
        }else if (tableFilterType.val() === "campaign"){
            setTableData(params);
        }else{
            params = {year: year};
            setAvgTableData(params);
        }
    });
    setTableData(params);
    $(document).on('click', '.exportBtn', function () {
        var client = $('#tableChosenClient').val();
        var year = $('#tableChosenYear').val();
        var url = $('#export').val();
        var urlAvg = $('#exportAvg').val();

        if (client !==null && $('#tableFilterType').val() === "campaign") {
            $("#exportBtn").attr("href", url + '?year=' + year + '&' + 'token=' + client);
            window.location = url + '?year=' + year + '&' + 'token=' + client;
        }
        else if ($('#tableFilterType').val() === "moy"){
            $("#exportBtn").attr("href", urlAvg + '?year=' + year);
            window.location = url + '?year=' + year;
        }
        else {
            $("#exportBtn").attr("href", url + '?year=' + year);
            window.location = url + '?year=' + year ;

        }
    });

    tableFilterType.on('change', function () {
        var year = tableChosenYear.val();
        params = {year: year};
        if ($(this).val() === "moy") {
            $('.chosenClient').hide();
            setAvgTableData(params);
        }
        else {
            $('.chosenClient').show();
            var client =tableChosenClient.val();
            if (client !==null)
                params.token = client;
            else
                params = {year: params.year};
            setTableData(params)
        }
    })
});