/**
 * Created by Chayma on 01/11/2017.
 */

var monthsNames = moment.months();
var urlOverAllCount = $('#container2').data('url');
var urlByAccount = $('#container3').data('url');
var othersValues = function (array) {
    var rest = {processed: 0, delivered: 0};
    for (var i = 0; i < array.length; i++) {
        rest.processed += parseInt(array[i].mjProcessedCount);
        rest.delivered += parseInt(array[i].mjDeliveredCount);
    }
    return rest;
};
function dateFromDay(year, day){
    var date = new Date(year, 0); // initialize a date in `year-01-01`
    date = date.setDate(day); // add the number of days
    return date;
}
function daysInYear(year) {
    if(year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
        // Leap year
        return 366;
    } else {
        // Not a leap year
        return 365;
    }
}
var initXaxis = function (mode, chart) {
    var activeModeBtn = $('.btn-mode.active');
    chart.xAxis[0].update({
        title: {
            text: activeModeBtn.data('chartXaxis')
        }
    });
    if (mode === 'week') {
        chart.xAxis[0].update({
            min: 1,
            max: 52,
            tickInterval: 1,
        });
        var totalWeeks = 52;
        weeks = [];
        do {
            weeks[totalWeeks - 1] = {x: totalWeeks, y: 0};
            totalWeeks--;
        } while (totalWeeks > 0);
        return weeks
    } else {
        if (mode === 'day') {
            var selectedYear = $('#chosenYear').val();
            var limitDay=daysInYear(selectedYear);
            if( selectedYear === moment().format('YYYY'))
                limitDay = moment().format('DDDD');
            limitDay--;
            chart.xAxis[0].update({
                max: limitDay,
                tickInterval: 10,
                startOnTick: true,
                showLastLabel:true
            });
            days = [];
            do {
                days[limitDay] = {x: limitDay, y: 0};
                limitDay--;
            } while (limitDay > -1);
            return days
        } else {
            chart.xAxis[0].update({
                min: 1,
                max: 12,
                tickInterval: 1
            });
            var totalMonths = 12;
            months = [];
            do {
                months[totalMonths - 1] = {x: totalMonths, y: 0};
                totalMonths--;
            } while (totalMonths > 0);
            return months
        }
    }
}
$(document).ready(function () {
    var translation = $('#translation');
    var translationOverAllChart = $('#translationOverAllChart');
    var otherTrans = translation.data('others');
    var title = translation.data('title');
    var deliveredSeries = translation.data('series-delivered');
    var xaxisChartByAccount = translation.data('xaxis');
    var processedSeries = translation.data('series-processed');
    var yaxisChartByAccount = translation.data('yaxis');
    var xaxisOverAllChart = translationOverAllChart.data('xaxis');
    var yaxisOverAllChart = translationOverAllChart.data('yaxis');
    var noDataMessage = translation.data('no-data-message');
    var chart1Renderer = null,
        chart2Renderer = null;
    var initData;
    var seriesName = $('#container2').data('series');
    var loadData = function (year, url, mode, chart) {
        if (year) {
            var params = {year: year, mode: mode};
            $.ajax({
                url: url,
                data: params,
                dataType: 'JSON',
                beforeSend: function () {
                    $('#container2').addClass('loading-chart');
                    if(chart1Renderer){
                        chart1Renderer.destroy();
                        chart1Renderer=null;
                    }
                },
                success: function (data) {
                    if(data.length>0){
                        initData = initXaxis(mode, chart);
                        for (var i = 0; i < data.length; i++)
                            initData[parseInt(data[i].mode) - 1].y += parseInt(data[i].deliveredCount);
                        chart.series[0].update({data: initData}, true);
                    }else {
                        //Set No data text
                        var textX = chart.plotLeft + (chart.plotWidth * 0.5);
                        var textY = chart.plotTop + (chart.plotHeight * 0.5);
                        var textWidth = 400;
                        textX = textX - (textWidth / 2);
                        chart1Renderer=chart.renderer.label('<div style="width: ' + textWidth + 'px; text-align: center;font-weight: 600"><span>'+noDataMessage+'</span></div>', textX, textY, null, null, null, true)
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
        }
    };
    var drawByAccountData = function (url, year, chart) {
        if (year) {
            $.ajax({
                url: url,
                data: {year: year},
                dataType: 'JSON',
                beforeSend: function () {
                    $('#container3').addClass('loading-chart');
                    if(chart2Renderer){
                        chart2Renderer.destroy();
                        chart2Renderer=null;
                    }
                },
                success: function (result) {
                    if (result[0]) {
                        var names = [];
                        var maxShow = 10;
                        // reset all series
                        chart.series[1].update({name: deliveredSeries, data: []}, false);
                        chart.series[0].update({name: processedSeries, data: []}, false);
                        var dataDelivered = [];
                        var dataProcessed = [];
                        for (var i = 0; i < result.length; i++) {
                            if (i < maxShow) {
                                dataDelivered.push({y: parseInt(result[i].mjDeliveredCount)});
                                dataProcessed.push({y: parseInt(result[i].mjProcessedCount)});
                                names.push(result[i].mjName);
                            } else {
                                var others = othersValues(result.slice(i));
                                if ((dataDelivered[0].y > others.delivered)) {
                                    dataDelivered.push({y: others.delivered, color: '#bbffbb'});
                                    dataProcessed.push({y: others.processed, color: '#ffe276'});
                                    names.push(otherTrans);
                                    break;
                                } else {
                                    dataDelivered.push({y: parseInt(result[i].mjDeliveredCount)});
                                    dataProcessed.push({y: parseInt(result[i].mjProcessedCount)});
                                    names.push(result[i].mjName);
                                }
                            }
                        }
                        chart.series[1].update({data: dataDelivered});
                        chart.series[0].update({data: dataProcessed});
                        chart.xAxis[0].setCategories(names, true, true);
                    } else {
                        //Set No data text
                        var textX = chart.plotLeft + (chart.plotWidth * 0.5);
                        var textY = chart.plotTop + (chart.plotHeight * 0.5);
                        var textWidth = 400;
                        textX = textX - (textWidth / 2);
                        chart2Renderer =chart.renderer.label('<div style="width: ' + textWidth + 'px; text-align: center;font-weight: 600"><span>'+noDataMessage+'</span></div>', textX, textY, null, null, null, true)
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
        }
    };
    var columnColors = ["#f2a654","#83B483"];
    var columnChartOverAll = ["#83B483"];
    var chartOverAllCount = new Highcharts.Chart({
        colors: columnChartOverAll,
        chart: {
            zoomType: 'xy',
            renderTo: 'container2',
            type: 'line',
            events: {
                load: function () {
                    var yearWidget = $('#chosenYear');
                    var year = yearWidget.val();
                    var url = urlOverAllCount;
                    //var url = yearWidget.data('url');
                    var mode = $('.btn-mode.active').data('mode');
                    loadData(year, url, mode, this);
                }
            }
        },
        title: {
            text: ''
        },
        yAxis: {
            title: {
                text: yaxisOverAllChart
            }
        },
        xAxis: {
            title: {
                text: xaxisOverAllChart
            },
            labels: {
                formatter: function () {
                    switch ($('.btn-mode.active').data('mode')) {
                        case 'day':
                            var selectedYear = $('#chosenYear').val();
                            return moment(dateFromDay(selectedYear,this.value +1)).format('ll');
                        case 'month':
                            return monthsNames[this.value - 1];
                            break;
                        default:
                            return this.value;
                            break;
                    }

                }
            },
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },

        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false
                }
            }
        },
        tooltip: {
            formatter: function() {
                var btnMode=$('.btn-mode.active');
                var ch;
                switch(btnMode.data('mode')){
                    case 'day':
                        var selectedYear = $('#chosenYear').val();
                        ch= moment(dateFromDay(selectedYear,this.point.x+1)).format('dddd D MMMM YYYY');break;
                    case 'month' : ch=monthsNames[this.point.x-1];break;
                    default: ch=this.point.x;break;
                }

                return '<b> '+btnMode.data('chart-tooltip')+' : '+ch+'</b><br/><span style="color:'+this.series.color+'">'+this.series.name+'</span> : '+Highcharts.numberFormat(this.point.y, 0) ;
            }
        },
        series: [{
            showInLegend: false,
            name: seriesName,
            data: []
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }
    });
    var chartByAccount = new Highcharts.Chart({
        colors: columnColors,
        chart: {
            zoomType: 'xy',
            renderTo: 'container3',
            type: 'column',
            events: {
                load: function () {
                    var yearWidget = $('#chosenYear');
                    var year = yearWidget.val();
                    drawByAccountData(urlByAccount, year, this);
                }
            }

        },
        title: {
            text: ''
        },
        xAxis: {
            categories: [],
            title: {
                text: xaxisChartByAccount
            },
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: yaxisChartByAccount
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:15px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y} </b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true,
            borderRadius: 10,
            borderWidth: 2
        },
        plotOptions: {
            series: {
                groupPadding: 0.2
            },
            column: {
                pointPadding: 0,
                borderWidth: 0
            }
        },
        series: [
            {
                name: deliveredSeries,
                data: []
            },
            {
                name: processedSeries,
                data: []

            }

        ]
    });

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
        var search = $(this).data('search').length > 0 ? "&client=" + $(this).data('search') : "";
        var mode = $('.btn-mode.active').data('mode');
        window.location = url.replace('_year_', year) + search;
        loadData(year, urlOverAllCount, mode, chartOverAllCount);
        drawByAccountData(urlByAccount, year, chartByAccount)

    });
    $('#clientName').keypress(function (e) {
        if (e.which == 13) {//Enter key pressed
            $('#searchClient').click();//Trigger search button click event
        }
    });
    $(document).on('click', '.btn-mode:not(.active)', function () {
        var mode = $(this).data('mode');
        var yearWidget = $('#chosenYear');
        $('.btn-mode').removeClass('active');
        $(this).addClass('active');
        var year = yearWidget.val();
        loadData(year, urlOverAllCount, mode, chartOverAllCount)
    })

});
