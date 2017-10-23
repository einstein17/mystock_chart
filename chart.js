Point = function(x,y){
    this.x = x;
    this.y = y;
};
var ChartOption = {
    newInstance:function(canvasId, offsetX, offsetY, width, height){
        var co = {};
        co.canvasId = canvasId;
        co.offsetX = offsetX;
        co.offsetY = offsetY;
        co.width = width;
        co.height = height;
        
        return co;
    }
};
var CandleChartOption = {
    newInstance:function(canvasId, offsetX, offsetY, width, height, candleDataList){
        var option = ChartOption.newInstance(canvasId, offsetX, offsetY, width, height);
        option.candleDataList = candleDataList;
        
        return option;
    }
}
/*
* high is the highest price of the day
* low is the lowest price of the day
* open is the open price of the day
* close is the close price of the day
* volume is the trading volume of the day
* amount is the trading amount of the day
* 
*/
CandleData = function(high, low, open, close, volume, amount, exchange, day){
    this.high = high;
    this.low = low;
    this.open = open;
    this.close = close;
    this.volume = volume;
    this.amount = amount;
    this.exchange = exchange;
    this.day = day;
};

var Chart = {
    newInstance:function(chartOption){
        var chart = {};
        chart.canvasId = chartOption.canvasId; /*canvas id */
        chart.canvas = document.getElementById(chartOption.canvasId);
        chart.ctx = null;
        chart.getCanvasCtx = function(){
            if(chart.ctx){
                return chart.ctx;
            }
            else{
                if(chart.canvas.getContext){
                    chart.ctx = chart.canvas.getContext('2d');
                }
                else{
                    chart.ctx = null;
                }
                return chart.ctx;
            }
        };
        chart.ctx = chart.getCanvasCtx();
        
        chart.offsetX = chartOption.offsetX || 0;
        chart.offsetY = chartOption.offsetY || chart.canvas.height;
        chart.width = chartOption.width || (chart.canvas.width - chart.offsetX);
        chart.height = chartOption.height || chart.canvas.height;
        
        chart.drawLine = function(startX, startY, pointList, color, size, lineDash){
            var ctx = chart.getCanvasCtx();
            ctx.save();
            
            if(color) ctx.strokeStyle = color;
            if(size) ctx.lineWidth = size;
            if(lineDash) ctx.setLineDash(lineDash);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            pointList.forEach(function(v){
                ctx.lineTo(v.x, v.y);
            });
            ctx.stroke();            
            
            ctx.restore();
        };
        
        
        
        chart.drawRect = function(topX, topY, width, height, lineColor, lineSize){
            var ctx = chart.getCanvasCtx();
            ctx.save();
            
            if(lineColor) ctx.strokeStyle = lineColor;
            if(lineSize) ctx.lineWidth = lineSize;
            
            ctx.strokeRect(topX, topY, width, height);            
            
            ctx.restore();
        };
        
        chart.drawFillRect = function(topX, topY, width, height, fillColor){
            var ctx = chart.getCanvasCtx();
            ctx.save();
            
            if(fillColor) ctx.fillStyle = fillColor;
            ctx.fillRect(topX, topY, width, height);            
            
            ctx.restore();
        };
        
        chart.drawText = function(text, topX, topY, textColor, textFont){
            var ctx = chart.getCanvasCtx();
            ctx.save();
            
            if(textColor){
                ctx.fillStyle = textColor;
            }
            if(textFont){
                ctx.font = textFont;
            }
            textAlign = "right";
            ctx.textBaseline = "alphabetic";
            ctx.fillText(text, topX, topY);            
            
            ctx.restore();
        };
        
        chart.drawX = function(color, size){
            var p = new Point(chart.offsetX + chart.width, chart.offsetY);
            chart.drawLine(chart.offsetX, chart.offsetY, [p], color, size)
        };
        
        chart.drawY = function(color, size){
            var p = new Point(chart.offsetX, chart.offsetY - chart.height);
            chart.drawLine(chart.offsetX, chart.offsetY, [p], color, size)
        };
        
        chart.drawYGrid = function(color, size, num, textList){
            var step = Math.round( chart.height / num );
            var lineDash = [5,10];
            for(var i = 0; i < num; i++){
                var y = chart.offsetY - step * i;
                var p = new Point(chart.offsetX + chart.width, y);                
                chart.drawLine(chart.offsetX, y, [p], color, size, lineDash); 
                if(textList){
                    chart.drawText(textList[i], chart.offsetX, y, "rgb(255,0,0)", "12px serif");
                }
            }
        };
        
        chart.drawXGrid = function(color, size, num, textList){
            var step = Math.round( chart.width / num );
            var lineDash = [5,10];
            for(var i = 1; i <= num; i++){
                var x = chart.offsetX + step * i;
                var p = new Point(x, chart.offsetY - chart.height);
                chart.drawLine(x, chart.offsetY, [p], color, size, lineDash);
            }
        };
        
        chart.drawCandle = function(index, candleData){
            
        }
        
        return chart;
    }
};

 
var CandelChart = {
    newInstance: function(option){
        var cc = Chart.newInstance(option);
        var data = option.candleDataList;
        data.sort(function(a,b){
            var t1 = Date.parse(new Date(a.day));
            var t2 = Date.parse(new Date(b.day));
            return t1 - t2;
        });
        cc.maxPrice = 0;
        cc.minPrice = 10000000;
        data.forEach(function(v,i,arr){
            if(v.high > cc.maxPrice){
                cc.maxPrice = v.high;
            }
            if(v.low < cc.minPrice){
                cc.minPrice = v.low;
            }
        });       
        
        cc.marginTop = 0.05;/* margin top and margin botton precent*/
        cc.marginBottom = 0.05;
        cc.marginLeft = 0.02;
        cc.marginRight = 0.02;
        cc.dataHeight = cc.height * (1 - cc.marginTop - cc.marginBottom);  //显示数据图的高度
        cc.dataWidth = cc.width * (1 - cc.marginLeft - cc.marginRight);    //显示数据图的宽
        
        cc.calcYFromPrice = function(price){ //根据价格计算Y坐标
            var pLen = cc.maxPrice - cc.minPrice;
            if(pLen == 0){
                pLen = 1;
            }
            
            var ret = Math.round( cc.offsetY - cc.height * cc.marginBottom - (price - cc.minPrice) * cc.dataHeight / pLen  );
            return ret;
        };
        cc.candleWidth = cc.dataWidth / (data.length < 20? 20:data.length);
        cc.drawCandle = function(i){
            
            var margin = 2;//边距
            var x1 = cc.offsetX + i * cc.candleWidth + margin;
            var x2 = cc.offsetX + (i + 1) * cc.candleWidth - margin;
            var x = (x1 + x2) /2;
            var candlePrice = data[i];
            var y1 = y2 = 0;
            var color = "";
            var yh = cc.calcYFromPrice(candlePrice.high);
            var yl = cc.calcYFromPrice(candlePrice.low);
            var yo = cc.calcYFromPrice(candlePrice.open);
            var yc = cc.calcYFromPrice(candlePrice.close);
            if(yo > yc){//坐标大的，价格则是低的
                y1 = yc;
                y2 = yo;
                color = "rgb(255,0,0)";
                cc.drawRect(x1, y1, x2 - x1, y2 - y1, color);
            }else{
                y1 = yo;
                y2 = yc;
                color = "rgb(0,0,0)";
                cc.drawFillRect(x1, y1, x2 - x1, y2 - y1, color);
            }
            if(yh < y1){
                cc.drawLine(x, yh, [new Point(x, y1)], color);
            }
            if(yl > y2){
                cc.drawLine(x, yl, [new Point(x, y2)], color);
            }
        };
        
        cc.drawAllCandle = function(){
            for(var i = 0; i < data.length; i++ ){
                cc.drawCandle(i);
            }
        }
        
        return cc;
    }
};
function test(){
    //high, low, open, close, volume, amount, exchange, day
    var data = [
    new CandleData(10,2,3,6,10,10,0.1,"2017-10-10"),
    new CandleData(8,1,6,8,10,10,0.1,"2017-10-11"),
    new CandleData(8,1,6,3,10,10,0.1,"2017-10-09"),
    new CandleData(8,8,8,8,10,10,0.1,"2017-10-12"),
    new CandleData(8,6,6,8,10,10,0.1,"2017-10-12"),
    new CandleData(8,6,6,7,10,10,0.1,"2017-10-12"),
    new CandleData(8,6,8,7,10,10,0.1,"2017-10-12"),
    new CandleData(8,6,8,7,10,10,0.1,"2017-10-12"),
    ];
    var option = CandleChartOption.newInstance("canvas",10,280,350,250, data);
    var chart = CandelChart.newInstance(option);
    var pointList = [new Point(100,200),new Point(100,150)]
    //chart.drawLine(10,200, pointList, 'rgb(255,0,0)', 100);
    //chart.drawRect(100,10,100,50,'rgb(255,0,0)', 4);
    //chart.drawFillRect(210,10,100,50,'rgb(0,255,0)', 10);
    chart.drawX('rgb(0,0,0)', 1);
    chart.drawY('rgb(0,0,0)', 1);
    chart.drawYGrid('rgb(38,56,60)', 1, 5, ["1","2","3","4","5"]);
    chart.drawXGrid('rgb(38,56,60)', 1, 5);
    chart.drawAllCandle();
}



