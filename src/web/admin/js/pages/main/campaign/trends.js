/**
 * Created by medNaceur on 10/11/2017.
 */
var monthsNames = moment.months();
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
function initXaxis(mode, chart,activeModeBtn) {
    chart.xAxis[0].update({
        title: {
            text: activeModeBtn.data('chartXaxis')
        }
    });
    if (mode === 'week') {
        chart.xAxis[0].update({
            min: 1,
            max: 52,
            tickInterval: 1
        });
        totalWeeks = 52;
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
    var initData;
    var openSeries;
    var clickSeries;
    var sendChartId = $('#sendChart');
    var performanceChartId = $('#performanceChart');
    var sendChartUrl = sendChartId.data('url');
    var performanceChartUrl = performanceChartId.data('url');
    var translation = $('#translation');
    var title = translation.data('title');
    var xAxis=translation.data('xaxis');
    var noDataMessage = translation.data('no-data-message');
    var chart1Renderer = null,
        chart2Renderer = null;

    // Init Xaxis array
    var loadSendData = function (year, url, token, mode, chart) {
        if (year) {
            var params = {year: year, mode: mode};
            if (token)
                params.token = token;
            $.ajax({
                url: url,
                data: params,
                dataType: 'JSON',
                beforeSend: function () {
                    chart.series[0].update({data: []}, true);
                    sendChartId.addClass('loading-chart');
                    if(chart1Renderer){
                        chart1Renderer.destroy();
                        chart1Renderer=null;
                    }
                },
                success: function (data) {
                    if(data.length>0) {
                        initData = initXaxis(mode, chart,$('.btn-mode.active'));
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
                    sendChartId.removeClass('loading-chart');
                },
                cache: false
            })
        }
    };
    var loadPerformanceData = function (year, url, token, mode, chart) {
        if (year) {
            var params = {year: year, mode: mode};
            if (token)
                params.token = token;
            $.ajax({
                url: url,
                data: params,
                dataType: 'JSON',
                beforeSend: function () {
                    chart.series[0].update({data: []}, true);
                    chart.series[1].update({data: []}, true);
                    performanceChartId.addClass('loading-chart');
                    if(chart2Renderer){
                        chart2Renderer.destroy();
                        chart2Renderer=null;
                    }
                },
                success: function (data) {
                    if(data.length>0){
                        var btnActive=$('.btn-mode2.active');
                        openSeries = initXaxis(mode, chart,btnActive);
                        clickSeries = initXaxis(mode, chart,btnActive);
                        for (var i = 0; i < data.length; i++) {
                            openSeries[parseInt(data[i].mode) - 1].y = parseFloat(data[i].openedPercent);
                            clickSeries[parseInt(data[i].mode) - 1].y = parseFloat(data[i].clickedPercent);
                        }
                        chart.series[0].update({data: openSeries}, true);
                        chart.series[1].update({data: clickSeries}, true);
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
                    performanceChartId.removeClass('loading-chart');
                },
                cache: false
            })
        }
    };
    var columnColors = ["#83B483"];
    var sendChart = new Highcharts.Chart({
        colors: columnColors,
        chart: {
            zoomType: 'xy',
            renderTo: 'sendChart',
            type: 'line',
            events: {
                load: function () {
                    var yearWidget = $('#chosenYear');
                    var year = yearWidget.val();
                    var mode = $('.btn-mode.active').data('mode');
                    loadSendData(year, sendChartUrl, null, mode, this);
                }
            }
        },
        title: {
            text: ''
        },
        yAxis: {
            title: {
                text: sendChartId.data('chartYaxis')
            }
        },
        xAxis: {
            title: {},
            labels: {
                formatter: function () {
                    switch ($('.btn-mode.active').data('mode')) {
                        case 'day':
                            var selectedYear = $('#chosenYear').val();
                            return moment(dateFromDay(selectedYear,this.value +1)).format('ll');
                        case 'month':
                            return monthsNames[this.value - 1];
                        default:
                            return this.value;
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
            formatter: function () {
                var btnMode = $('.btn-mode.active');
                var ch;
                switch (btnMode.data('mode')) {
                    case 'day':
                        var selectedYear = $('#chosenYear').val();
                        ch= moment(dateFromDay(selectedYear,this.point.x+1)).format('dddd D MMMM YYYY');break;
                    case 'month' :
                        ch = monthsNames[this.point.x - 1];
                        break;
                    default:
                        ch = this.point.x;
                        break;
                }
                return '<b> ' + btnMode.data('chart-tooltip') + ' : ' + ch + '</b><br/>' + this.series.name + ' : ' + Highcharts.numberFormat(this.point.y, 0);
            }
        },

        series: [{
            showInLegend: false,
            name: sendChartId.data('series'),
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
    var performanceChart = new Highcharts.Chart({
        colors: columnColors,
        chart: {
            zoomType: 'xy',
            renderTo: 'performanceChart',
            type: 'line',
            events: {
                load: function () {
                    var yearWidget = $('#chosenYear');
                    var year = yearWidget.val();
                    var mode = $('.btn-mode2.active').data('mode');
                    loadPerformanceData(year, performanceChartUrl, null, mode, this);
                }
            }
        },
        title: {
            text: ''
        },
        yAxis: {
            title: {
                text: xAxis
            }
        },
        xAxis: {
            title: {},
            labels: {
                formatter: function () {
                    switch ($('.btn-mode2.active').data('mode')) {
                        case 'day':
                            var selectedYear = $('#chosenYear').val();
                            return moment(dateFromDay(selectedYear,this.value +1)).format('ll');
                        case 'month':
                            return monthsNames[this.value - 1];
                        default:
                            return this.value;
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
            formatter: function () {
                var btnMode = $('.btn-mode2.active');
                var ch;
                switch (btnMode.data('mode')) {
                    case 'day':
                        var selectedYear = $('#chosenYear').val();
                        ch= moment(dateFromDay(selectedYear,this.point.x+1)).format('dddd D MMMM YYYY');break;
                    case 'month' :
                        ch = monthsNames[this.point.x - 1];
                        break;
                    default:
                        ch = this.point.x;
                        break;
                }
                return '<b> ' + btnMode.data('chart-tooltip') + ' : ' + ch + '</b><br/>' + this.series.name + ' : ' + this.point.y + '%';
            }
        },

        series: [
            {
                name: performanceChartId.data('opened'),
                color: '#f7a35c',
                data: []
            },
            {
                name: performanceChartId.data('clicked'),
                color: '#73cbff',
                data: []
            }
        ],
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
    $('#chosenYear').change(function () {
        var year = $(this).val();
        var token = $('#chosenClient').val();
        loadSendData(year, sendChartUrl, token, $('.btn-mode.active').data('mode'), sendChart);
        loadPerformanceData(year, performanceChartUrl, token, $('.btn-mode2.active').data('mode'), performanceChart);
    });
    $('#chosenClient').change(function () {
        var yearWidget = $('#chosenYear');
        var year = yearWidget.val();
        var token = $(this).val();
        loadSendData(year, sendChartUrl, token, $('.btn-mode.active').data('mode'), sendChart);
        loadPerformanceData(year, performanceChartUrl, token, $('.btn-mode2.active').data('mode'), performanceChart);
    });
    $(document).on('click', '.btn-mode:not(.active)', function () {
        var mode = $(this).data('mode');
        var yearWidget = $('#chosenYear');
        $('.btn-mode').removeClass('active');
        $(this).addClass('active');
        var year = yearWidget.val();
        var token = $('#chosenClient').val();
        loadSendData(year, sendChartUrl, token, mode, sendChart);
    });
    $(document).on('click', '.btn-mode2:not(.active)', function () {
        var mode = $(this).data('mode');
        var yearWidget = $('#chosenYear');
        $('.btn-mode2').removeClass('active');
        $(this).addClass('active');
        var year = yearWidget.val();
        var token = $('#chosenClient').val();
        loadPerformanceData(year, performanceChartUrl, token, mode, performanceChart);
    });

});