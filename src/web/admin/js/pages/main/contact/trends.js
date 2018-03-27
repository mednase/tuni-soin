/**
 * Created by medNaceur on 23/10/2017.
 */
function initializeMonthStat() {
    var result=[];
    for(var i=0;i<12;i++){
        result[i]=0;
    }
    return result;
}
Array.prototype.max = function() {
    return Math.max.apply(null, this);
};

Array.prototype.min = function() {
    return Math.min.apply(null, this);
};
$(document).ready(function () {
    var translation = $('#translation');
    var netChange=$("#netChangeChart");
    var netChangeUrl=netChange.data('url');
    var subUrl=$('#subChart').data('url');
    var unSubUrl=$('#unsubChart').data('url');
    var months=moment.months();
    var subTitle=netChange.data('subtitle');
    var yAxis=netChange.data('yaxis');
    var yAxisNetChange=netChange.data('yaxis-percent');
    var noDataMessage = translation.data('no-data-message');
    var chartRenderer = [];
    var loadData = function (token, url, year,chart,noTotal) {
        if (year) {
            $.ajax({
                url: url,
                data: {token: token, year: year},
                dataType: 'JSON',
                beforeSend:function(){
                    $('.responsive-chart').addClass('loading-chart');
                    if(chartRenderer[$(chart.renderTo).attr('id')]){
                        chartRenderer[$(chart.renderTo).attr('id')].destroy();
                        chartRenderer[$(chart.renderTo).attr('id')]=null;
                    }
                },
                success: function (result) {
                    while(chart.series.length > 0)
                        chart.series[0].remove();
                    if (result.length !==0) {
                        var totalMonthStat=initializeMonthStat();
                        $.each(result,function (i,obj) {
                            if(token){
                                var monthStat=initializeMonthStat();
                                for(var j=0;j<obj.length;j++){
                                    monthStat[(obj[j].monthNumber)-1]=parseFloat(obj[j].data);
                                }
                                totalMonthStat = totalMonthStat.map(function (num, idx) {
                                    return num + monthStat[idx];
                                });
                                chart.addSeries({name: obj[0].mjName, data: monthStat}, false);
                            }else{
                                totalMonthStat[obj.monthNumber-1]=parseFloat(obj.data);
                            }
                        });
                        if(!noTotal || !token){
                            if(result.length>0)
                                chart.addSeries({name: 'Total', data: totalMonthStat}, false);
                            chart.yAxis[0].update({
                                max:totalMonthStat.max()<1?10:totalMonthStat.max()
                            })
                        }
                    }else{
                        //Set No data text
                        var textX = chart.plotLeft + (chart.plotWidth * 0.5);
                        var textY = chart.plotTop + (chart.plotHeight * 0.5);
                        var textWidth = 400;
                        textX = textX - (textWidth / 2);
                        chartRenderer[$(chart.renderTo).attr('id')]=chart.renderer.label('<div style="width: ' + textWidth + 'px; text-align: center;font-weight: 600"><span>'+noDataMessage+'</span></div>', textX, textY, null, null, null, true)
                            .css({
                                color: '#4572A7',
                                fontSize: '16px'
                            })
                            .add();
                    }
                    chart.xAxis[0].setCategories(months, true, true);
                    chart.redraw();
                    $('.responsive-chart').removeClass('loading-chart');
                },
                cache: false
            })
        }else{
            //Set No data text
            var textX = chart.plotLeft + (chart.plotWidth * 0.5);
            var textY = chart.plotTop + (chart.plotHeight * 0.5);
            var textWidth = 400;
            textX = textX - (textWidth / 2);
            chartRenderer[$(chart.renderTo).attr('id')]=chart.renderer.label('<div style="width: ' + textWidth + 'px; text-align: center;font-weight: 600"><span>'+noDataMessage+'</span></div>', textX, textY, null, null, null, true)
                .css({
                    color: '#4572A7',
                    fontSize: '16px'
                })
                .add();
        }
    };
    var netChangeChart =Highcharts.chart('netChangeChart', {
        chart: {
            type: 'area',
            zoomType: 'xy',
            spacingBottom: 30,
            events: {
                load: function () {
                    var token=$('#chosenClient').val();
                    var year = $('#chosenYear').val();
                    loadData(token, netChangeUrl, year,this,true);
                }
            }
        },
        title: {
            text: ''
        },
        subtitle: {
            text: subTitle,
            floating: true,
            align: 'center',
            verticalAlign: 'bottom',
            y: 15
        },
        yAxis: {
            min:0,
            title: {
                text: yAxisNetChange
            },
            labels: {
                formatter: function () {
                    return this.value;
                }
            },
            max:100
        },
        tooltip: {
            formatter: function () {
                return '<b>' + this.series.name + '</b><br/>' +
                    this.x + ': ' + this.y +' %';
            }
        },
        plotOptions: {
            area: {
                fillOpacity: 0.5
            }
        },
        credits: {
            enabled: false
        },
        series: []
    });
    var subChart =Highcharts.chart('subChart', {
        chart: {
            type: 'area',
            spacingBottom: 30,
            events: {
                load: function () {
                    var token=$('#chosenClient').val();
                    var year = $('#chosenYear').val();
                    loadData(token, subUrl, year,this);
                }
            }
        },
        title: {
            text: ''
        },
        subtitle: {
            text: subTitle,
            floating: true,
            align: 'center',
            verticalAlign: 'bottom',
            y: 15
        },
        yAxis: {
            min:0,
            minTickInterval:1,
            title: {
                text: yAxis
            },
            labels: {
                formatter: function () {
                    return this.value;
                }
            }

        },
        tooltip: {
            formatter: function () {
                return '<b>' + this.series.name + '</b><br/>' +
                    this.x + ': ' + Highcharts.numberFormat(this.y,0);
            }
        },
        plotOptions: {
            area: {
                fillOpacity: 0.5
            }
        },
        credits: {
            enabled: false
        },
        series: []
    });
    var unsubChart =Highcharts.chart('unsubChart', {
        chart: {
            type: 'area',
            spacingBottom: 30,
            events: {
                load: function () {
                    var token=$('#chosenClient').val();
                    var year = $('#chosenYear').val();
                    loadData(token, unSubUrl, year,this);
                }
            }
        },
        title: {
            text: ''
        },
        subtitle: {
            text: subTitle,
            floating: true,
            align: 'center',
            verticalAlign: 'bottom',
            y: 15
        },
        yAxis: {
            title: {
                text: yAxis
            },
            min:0,
            minTickInterval:1,
            labels: {
                formatter: function () {
                    return this.value;
                }
            }
        },
        tooltip: {
            formatter: function () {
                return '<b>' + this.series.name + '</b><br/>' +
                    this.x + ': ' + Highcharts.numberFormat(this.y,0);
            }
        },
        plotOptions: {
            area: {
                fillOpacity: 0.5
            }
        },
        credits: {
            enabled: false
        },
        series: []
    });
    $(document).on('change','#chosenClient',function () {
        var clientName=$('#chosenClient').find('option:selected').text();
        netChangeChart.setTitle({text: clientName});
        subChart.setTitle({text: clientName});
        unsubChart.setTitle({text: clientName});
        var token = $(this).val();
        var year = $('#chosenYear').val();
        loadData(token, netChangeUrl, year,netChangeChart,true);
        loadData(token, subUrl, year,subChart);
        loadData(token, unSubUrl, year,unsubChart);
    });
    $(document).on('change','#chosenYear',function () {
        var year = $(this).val();
        var token = $('#chosenClient').val();
        loadData(token, netChangeUrl, year,netChangeChart,true);
        loadData(token, subUrl, year,subChart);
        loadData(token, unSubUrl, year,unsubChart);
    });
});