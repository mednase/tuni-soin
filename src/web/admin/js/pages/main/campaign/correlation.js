/**
 * Created by medNaceur on 23/10/2017.
 */
$(document).ready(function () {
    var usedHourClicked=[];
    var usedHourOpened=[];
    var usedDayClicked=[];
    var usedDayOpened=[];

    var chartDay = $("#chartDay");
    var chartHour = $("#chartHour");
    var url = chartDay.data('url');
    var translation=$('#translation');
    var delivered = translation.data('delivered');
    var tooltipTime= translation.data('tooltip-time');
    var tooltipSubject= translation.data('tooltip-subject');
    var openedSeries=translation.data('series-opened');
    var chartDayXaxis=translation.data('day-xaxis');
    var chartHourXaxis=translation.data('hour-xaxis');
    var clickedSeries=translation.data('series-clicked');
    var yAxis=translation.data('yaxis');
    var dayNames = moment.weekdays();
    var noDataMessage = translation.data('no-data-message');
    var chartRenderer = [];

    var loadData=function(type,chart){
        var year = $('#chosenYear').val();
        var params={type: type,year:year};
        var client=$('#chosenClient').val();
        if(client)
            params.token=client;
        $.ajax({
            url: url,
            data: params,
            dataType: 'JSON',
            beforeSend:function () {
                chart.series[0].update({data: []}, false);
                chart.series[1].update({data: []}, false);
                $('.responsive-chart').addClass('loading-chart');
                if(chartRenderer[type]){
                    chartRenderer[type].destroy();
                    chartRenderer[type]=null;
                }
            },
            success: function (result) {
                if(result.length>0) {
                    if (type === "Day") {
                        usedDayClicked = [];
                        usedDayOpened = [];
                    } else {
                        usedHourClicked = [];
                        usedHourOpened = [];
                    }
                    for (var i = 0; i < result.length; i++) {
                        var time;
                        if (type === "Day") {
                            time = parseFloat(result[i].day);
                            var hour = parseFloat(((time - Math.floor(time)) * 100 / 24).toFixed(2));
                            time = Math.floor(time) + hour - 0.5;
                            if (usedDayClicked[time] === undefined)
                                usedDayClicked[time] = [];
                            if (usedDayClicked[time][parseFloat(result[i].clickedPercent)] === undefined)
                                usedDayClicked[time][parseFloat(result[i].clickedPercent)] = [];
                            if (usedDayOpened[time] === undefined)
                                usedDayOpened[time] = [];
                            if (usedDayOpened[time][parseFloat(result[i].openedPercent)] === undefined)
                                usedDayOpened[time][parseFloat(result[i].openedPercent)] = [];

                            usedDayClicked[time][parseFloat(result[i].clickedPercent)].push(result[i]);
                            usedDayOpened[time][parseFloat(result[i].openedPercent)].push(result[i]);
                        } else {
                            time = parseFloat(result[i].time);
                            var minutes = parseFloat(((time - Math.floor(time)) * 100 / 60).toFixed(2));
                            time = parseFloat(Math.floor(time) + minutes - 0.50);

                            if (usedHourClicked[time] === undefined)
                                usedHourClicked[time] = [];
                            if (usedHourClicked[time][parseFloat(result[i].clickedPercent)] === undefined)
                                usedHourClicked[time][parseFloat(result[i].clickedPercent)] = [];

                            if (usedHourOpened[time] === undefined)
                                usedHourOpened[time] = [];
                            if (usedHourOpened[time][parseFloat(result[i].openedPercent)] === undefined)
                                usedHourOpened[time][parseFloat(result[i].openedPercent)] = [];

                            usedHourClicked[time][parseFloat(result[i].clickedPercent)].push(result[i]);
                            usedHourOpened[time][parseFloat(result[i].openedPercent)].push(result[i]);
                        }
                        chart.series[0].addPoint({x: time, y: parseFloat(result[i].openedPercent)}, false, false);
                        chart.series[1].addPoint({x: time, y: parseFloat(result[i].clickedPercent)}, false, false);
                    }
                }else {
                    //Set No data text
                    var textX = chart.plotLeft + (chart.plotWidth * 0.5);
                    var textY = chart.plotTop + (chart.plotHeight * 0.5);
                    var textWidth = 400;
                    textX = textX - (textWidth / 2);
                    chartRenderer[type]=chart.renderer.label('<div style="width: ' + textWidth + 'px; text-align: center;font-weight: 600"><span>'+noDataMessage+'</span></div>', textX, textY, null, null, null, true)
                        .css({
                            color: '#4572A7',
                            fontSize: '16px'
                        })
                        .add();
                }
                $('.responsive-chart').removeClass('loading-chart');
                chart.redraw();
            },
            cache: false
        })
    };
    var dayChart=Highcharts.chart('chartDay', {
        chart: {
            type: 'scatter',
            zoomType: 'xy',
            spacingBottom: 30,
            events: {
                load: function () {
                    loadData('Day',this);
                }
            }
        },
        title: {
            text: ''
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            floating: true,
            borderWidth: 1,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        xAxis: {
            title: {
                enabled: true,
                text: chartDayXaxis
            },
            labels: {
                formatter: function () {
                    return dayNames[Math.floor(this.value+0.5)-1];
                }
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            categories: [],
            min: 1,
            max: 7
        },
        yAxis: {
            min: 0,
            max: 100,
            tickInterval: 20,
            title: {
                text: yAxis+ ' %'

            }

        },
        tooltip: {
            formatter: function () {
                var realX=this.x+0.5;
                var day = dayNames[Math.floor(realX)-1];
                var msg="";
                var subject;
                if(this.series.name===openedSeries){
                    for(var i=0;i<usedDayOpened[this.x][this.y].length;i++){
                        subject = usedDayOpened[this.x][this.y][i].subject.slice(0, 30) + (usedDayOpened[this.x][this.y][i].subject.length > 30 ? "..." : "");
                        if(usedDayOpened[this.x][this.y].length>1 && i>0)
                            msg+='<strong>———————————————————</strong><br>';
                        msg+='<b>Client : </b>'+usedDayOpened[this.x][this.y][i].client+'<br>'+
                            '<b>'+tooltipSubject+' : </b> '+subject+'<br>'+
                            '<b>'+tooltipTime+' : </b>'+day + ' at '+usedDayOpened[this.x][this.y][i].time+'<br> ' +
                            '<b>'+yAxis+'</b> : ' + this.y.toFixed(1) + '% <br>' +
                            '<b>'+this.series.name+' : </b> '+Highcharts.numberFormat(parseInt(usedDayOpened[this.x][this.y][i].opened), 0)+'<br>'+
                            '<b>'+delivered+' : </b>'+Highcharts.numberFormat(parseInt(usedDayOpened[this.x][this.y][i].delivered), 0)+'<br>';

                    }
                }else{
                    for(var j=0;j<usedDayClicked[this.x][this.y].length;j++){
                        subject = usedDayClicked[this.x][this.y][j].subject.slice(0, 30) + (usedDayClicked[this.x][this.y][j].subject.length > 30 ? "..." : "");
                        if(usedDayClicked[this.x][this.y].length>1 && j>0)
                            msg+='<strong>———————————————————</strong><br>';
                        msg+='<b>Client : </b>'+usedDayClicked[this.x][this.y][j].client+'<br>'+
                            '<b>'+tooltipSubject+' : </b> '+subject+'<br>'+
                            '<b>'+tooltipTime+' : </b>'+day + ' at '+usedDayClicked[this.x][this.y][j].time+' <br> ' +
                            '<b>'+yAxis+'</b> : ' + this.y.toFixed(1) + '% <br>' +
                            '<b>'+this.series.name+' : </b> '+Highcharts.numberFormat(parseInt(usedDayClicked[this.x][this.y][j].clicked), 0)+'<br>'+
                            '<b>'+delivered+' : </b>'+Highcharts.numberFormat(parseInt(usedDayClicked[this.x][this.y][j].delivered), 0)+'<br>';

                    }
                }

                return msg;
            }
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                }
            }
        },
        series: [{
            name: openedSeries,
            color: '#62a8ea',
            data: []
        }, {
            name: clickedSeries,
            color: '#42d38d',
            data: []
        }]
    });
    var hourChart =Highcharts.chart('chartHour', {
        chart: {
            type: 'scatter',
            zoomType: 'xy',
            events: {
                load: function () {
                    loadData('Hour',this)
                }
            }
        },
        title: {
            text: ''
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            borderWidth: 1
        },
        xAxis: {
            title: {
                enabled: true,
                text: chartHourXaxis
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            categories: [],
            min: 0,
            max: 23
        },
        yAxis: {
            min: 0,
            max: 100,
            tickInterval: 20,
            title: {
                text: yAxis + ' %'
            }

        }
        ,
        tooltip: {
            formatter: function () {
                var realX=this.x+0.5;
                var hour =Math.floor(realX)>=10?Math.floor(realX).toString():"0"+Math.floor(realX);
                var minutes=Math.round((realX-Math.floor(realX))*60);
                minutes=minutes>=10?minutes:'0'+minutes;
                var time=hour+":"+minutes;
                var msg="";
                var subject;
                if(this.series.name===openedSeries){
                    for(var i=0;i<usedHourOpened[this.x][this.y].length;i++){
                        subject = usedHourOpened[this.x][this.y][i].subject.slice(0, 30) + (usedHourOpened[this.x][this.y][i].subject.length > 30 ? "..." : "");
                        if(usedHourOpened[this.x][this.y].length>1 && i>0)
                            msg+='<strong>———————————————————</strong><br>';
                        msg+='<b>Client : </b>'+usedHourOpened[this.x][this.y][i].client+'<br>'+
                            '<b>'+tooltipSubject+' : </b> '+subject+'<br>'+
                            '<b>'+tooltipTime+' : </b>'+time+'<br> ' +
                            '<b>'+yAxis+'</b> : ' + this.y.toFixed(1) + '% <br>' +
                            '<b>'+this.series.name+' : </b> '+Highcharts.numberFormat(parseInt(usedHourOpened[this.x][this.y][i].opened), 0)+'<br>'+
                            '<b>'+delivered+' : </b>'+Highcharts.numberFormat(parseInt(usedHourOpened[this.x][this.y][i].delivered), 0)+'<br>';
                    }
                }else{
                    for(var j=0;j<usedHourClicked[this.x][this.y].length;j++){
                        subject = usedHourClicked[this.x][this.y][j].subject.slice(0, 30) + (usedHourClicked[this.x][this.y][j].subject.length > 30 ? "..." : "");
                        if(usedHourClicked[this.x][this.y].length>1 && j>0)
                            msg+='<strong>———————————————————</strong><br>';
                        msg+='<b>Client : </b>'+usedHourClicked[this.x][this.y][j].client+'<br>'+
                            '<b>'+tooltipSubject+' : </b> '+subject+'<br>'+
                            '<b>'+tooltipTime+' : </b>'+time+'<br> ' +
                            '<b>'+yAxis+'</b> : ' + this.y.toFixed(1) + '% <br>' +
                            '<b>'+this.series.name+' : </b> '+Highcharts.numberFormat(parseInt(usedHourClicked[this.x][this.y][j].clicked), 0)+'<br>'+
                            '<b>'+delivered+' : </b>'+Highcharts.numberFormat(parseInt(usedHourClicked[this.x][this.y][j].delivered), 0)+'<br>';


                    }
                }
                return  msg;
            }
        },
        plotLines: [{
            value: 0,
            width: 10,
            color: '#808080'
        }],
        plotOptions: {
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x} cm, {point.y} kg'
                }
            }
        }
        ,
        credits: {
            enabled: false
        }
        ,
        series: [{
            name: openedSeries,
            color: '#62a8ea',
            data: []
        }, {
            name: clickedSeries,
            color: '#42d38d',
            data: []
        }]
    });
    $('#chosenYear').change(function () {
        loadData('Day',dayChart);
        loadData('Hour',hourChart);
    });
    $('#chosenClient').change(function () {
        loadData('Day',dayChart);
        loadData('Hour',hourChart);
    });
});