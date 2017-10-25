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
CandleData = function( day, open, high, close, low, volume, amount, exchange){
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
            if(size) ctx.lineWidth = size * window.devicePixelRatio;
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
            if(lineSize) ctx.lineWidth = lineSize * window.devicePixelRatio;
            
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
        
        chart.clearCanvas = function(){
            var ctx = chart.getCanvasCtx();
            ctx.clearRect(0, 0, chart.canvas.width, chart.canvas.height);
        }
        
        chart.drawX = function(color, size){
            var p = new Point(chart.offsetX + chart.width, chart.offsetY);
            chart.drawLine(chart.offsetX, chart.offsetY, [p], color, size)
        };
        
        chart.drawY = function(color, size){
            var p = new Point(chart.offsetX, chart.offsetY - chart.height);
            chart.drawLine(chart.offsetX, chart.offsetY, [p], color, size)
        };
        
        chart.drawYGrid = function(num, textList, color, size){
            var step = Math.round( chart.height / num );
            var lineDash = [2,2];
            for(var i = 0; i <= num; i++){
                var y = chart.offsetY - step * i;
                var p = new Point(chart.offsetX + chart.width, y);                
                chart.drawLine(chart.offsetX, y, [p], color, size, lineDash); 
                if(textList){
                    var font_size = 10 * window.devicePixelRatio;
                    chart.drawText(textList[i], chart.offsetX, y, "rgb(255,0,0)", font_size+"px serif");
                }
            }
        };
        
        chart.drawXGrid = function(color, size, num, textList){
            var step = Math.round( chart.width / num );
            var lineDash = [2,2];
            for(var i = 0; i <= num; i++){
                var x = chart.offsetX + step * i;
                var p = new Point(x, chart.offsetY - chart.height);
                chart.drawLine(x, chart.offsetY, [p], color, size, lineDash);
            }
        };
        
        
        return chart;
    }
};

 
var CandelChart = {
    newInstance: function(option){
        var cc = Chart.newInstance(option);
        var data = option.candleDataList; //蜡烛图数据，可以多于当前画的个数
        data.sort(function(a,b){
            var t1 = Date.parse(new Date(a.day));
            var t2 = Date.parse(new Date(b.day));
            return t1 - t2;
        });
                
        cc.marginTop = 0.02;/* margin top and margin botton precent*/
        cc.marginBottom = 0.02;
        cc.marginLeft = 0.01;
        cc.marginRight = 0.01;
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
        cc.maxCandleCount = 80;  //最大画的蜡烛图个数
        cc.minCandleCount = 20;  //最小画的蜡烛图个数
        cc.curCandleCount = 50;  //当前画的蜡烛图个数
        cc.candleWidth = cc.dataWidth / cc.curCandleCount;
        cc.drawCandle = function(i, start){
            start = start || 0;
            var margin = 1 * window.devicePixelRatio;//边距
            var x1 = Math.round(cc.offsetX + cc.width * cc.marginLeft + (i - start) * cc.candleWidth + margin);
            var x2 = Math.round(cc.offsetX + cc.width * cc.marginLeft + (i - start + 1) * cc.candleWidth - margin);
            var x = Math.round( (x1 + x2) / 2);
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
                color = "rgb(204,0,0)";
                cc.drawRect(x1, y1, x2 - x1, y2 - y1, color);
            }else{
                y1 = yo;
                y2 = yc;
                color = "rgb(0,102,0)";
                var height = y2 - y1;
                if(height == 0){
                    height = 1 * window.devicePixelRatio;
                }
                var width = x2 - x1;
                if(width == 0 ){
                    width = 1 * window.devicePixelRatio;
                }
                cc.drawFillRect(x1, y1, width, height, color);
            }
            if(yh < y1){
                cc.drawLine(x, yh, [new Point(x, y1)], color);
            }
            if(yl > y2){
                cc.drawLine(x, yl, [new Point(x, y2)], color);
            }
        };
        
        cc.yGridNum = 5;
        cc.getMinMaxPrice = function(start, num){
            if(start != 0 && start + num >= data.length){
                cc.minPrice = 0;
                cc.maxPrice = 1;
                return;
            }
            cc.minPrice = 100000000;
            cc.maxPrice = -1;
            for(var i = start; i < data.length & i < start + num; i++ ){
                if(data[i].high > cc.maxPrice){
                    cc.maxPrice = data[i].high;
                }
                if(data[i].low < cc.minPrice){
                    cc.minPrice = data[i].low;
                }
            }
            if(cc.maxPrice == cc.minPrice){
                cc.maxPrice = cc.maxPrice * ( 1 + 0.1 );
            }
        }
        //num of draw candles from start index in cc.candleDataList
        cc.drawMutilCandles = function(start){
            start = start || 0;
            if(start != 0 && start + cc.curCandleCount >= data.length){
                return;
            }            
            cc.getMinMaxPrice(start, cc.curCandleCount);
            
            cc.clearCanvas();
            //cc.drawX('rgb(0,0,0)', 1);
            //cc.drawY('rgb(0,0,0)', 1);
            for(var i = start; i < data.length && i < start + cc.curCandleCount; i++ ){
                cc.drawCandle(i, start);
            }
            
            var textArr = [];
            var priceLen = cc.maxPrice - cc.minPrice;
            var min = cc.minPrice - priceLen * cc.marginBottom;
            var max = cc.maxPrice + priceLen * cc.marginTop;
            var step = (max - min) / cc.yGridNum ;
            for(var i = 0;i <= cc.yGridNum; i++){
                var n = Math.round((min + step * i)*100) / 100;
                textArr.push( n.toString());
            }
            cc.drawYGrid(cc.yGridNum, textArr, 'rgb(204,204,204)');            
        }
        
        return cc;
    }
};

var s = 0;
function init(){
    //day, open, high, close, low, volume, amount, exchange
    var data = [
    new CandleData("2009/12/31",10.24,10.38,10.3,10.12,53609036,550198080),
    new CandleData("2009/12/30",10.02,10.25,10.24,9.95,84355144,855148672),
    new CandleData("2009/12/29",10.11,10.13,10.02,9.92,52599252,525828064),
    new CandleData("2009/12/28",9.94,10.16,10.11,9.94,43861760,441469440),
    new CandleData("2009/12/25",10.06,10.07,9.92,9.9,36566288,364125600),
    new CandleData("2009/12/24",9.9,10.08,10.06,9.83,37334912,372418144),
    new CandleData("2009/12/23",9.79,9.91,9.87,9.73,36194944,355757344),
    new CandleData("2009/12/22",10.26,10.27,9.79,9.7,52204936,519132512),
    new CandleData("2009/12/21",10.2,10.28,10.24,10.1,24899704,253852288),
    new CandleData("2009/12/18",10.31,10.36,10.2,10.12,43549492,445230656),
    new CandleData("2009/12/17",10.71,10.72,10.33,10.28,52193344,546126272),
    new CandleData("2009/12/16",10.71,10.86,10.69,10.66,39819288,429003520),
    new CandleData("2009/12/15",10.95,11.07,10.79,10.74,68762280,747536960),
    new CandleData("2009/12/14",10.79,10.98,10.93,10.59,105077824,1134069376),
    new CandleData("2009/12/11",10.7,10.75,10.6,10.57,41880012,446246624),
    new CandleData("2009/12/10",10.74,10.76,10.65,10.55,47712504,506793664),
    new CandleData("2009/12/09",10.76,10.9,10.66,10.61,74750272,801047808),
    new CandleData("2009/12/08",11.28,11.31,10.94,10.84,87024768,956285760),
    new CandleData("2009/12/07",11.18,11.37,11.26,11.1,98618784,1109132032),
    new CandleData("2009/12/04",10.9,11.1,11.09,10.66,95186712,1039742144),
    new CandleData("2009/12/03",11,11.03,10.96,10.75,75854656,825616896),
    new CandleData("2009/12/02",10.98,11.29,11.09,10.93,113216728,1260802304),
    new CandleData("2009/12/01",10.8,10.99,10.91,10.7,79944840,869549248),
    new CandleData("2009/11/30",10.49,11,10.9,10.4,93734688,1008985792),
    new CandleData("2009/11/26",10.85,11.09,10.5,10.47,123250992,1334111488),
    new CandleData("2009/11/25",10.45,10.69,10.67,10.4,64131948,676836672),
    new CandleData("2009/11/24",10.9,11.04,10.48,10.44,115716880,1249415936),
    new CandleData("2009/11/23",10.88,10.92,10.87,10.74,76176888,824179264),
    new CandleData("2009/11/20",10.98,10.98,10.88,10.83,86992000,948180096),
    new CandleData("2009/11/19",10.77,11.06,11.06,10.72,109795632,1194779520),
    new CandleData("2009/11/18",10.95,10.95,10.81,10.7,89436760,965905920),
    new CandleData("2009/11/17",11,11.15,10.95,10.89,72545208,796845056),
    new CandleData("2009/11/16",10.94,11.04,10.98,10.88,107397024,1178078976),
    new CandleData("2009/11/13",11.14,11.14,10.84,10.68,119641592,1297519744),
    new CandleData("2009/11/12",11.4,11.8,11.14,10.95,202809280,2290217216),
    new CandleData("2009/11/06",11.25,11.72,11.35,11.2,134578656,1535981184),
    new CandleData("2009/11/05",10.52,11.15,10.86,10.52,135736384,1481654272),
    new CandleData("2009/11/04",10.28,10.63,10.44,10.28,118403416,1237650816),
    new CandleData("2009/11/03",9.95,10.08,10.01,9.88,48002316,479718528),
    new CandleData("2009/11/02",9.65,9.97,9.93,9.55,35578972,347081824),
    new CandleData("2009/10/30",9.89,9.94,9.75,9.71,33499772,329580512),
    new CandleData("2009/10/29",9.74,9.9,9.74,9.67,38686620,377975296),
    new CandleData("2009/10/28",9.93,10,9.81,9.65,40622532,398031104),
    new CandleData("2009/10/27",9.91,10.12,9.98,9.9,71541648,716665344),
    new CandleData("2009/10/26",9.85,10.01,9.91,9.83,45740688,454080640),
    new CandleData("2009/10/23",9.9,10.01,9.88,9.8,64896168,644487744),
    new CandleData("2009/10/22",9.9,9.98,9.87,9.78,35008916,345531328),
    new CandleData("2009/10/21",10.03,10.03,9.9,9.87,41143236,408402816),
    new CandleData("2009/10/20",10.06,10.15,10.04,9.98,59450992,596471360),
    new CandleData("2009/10/19",9.95,10,9.98,9.82,42099040,418823584),
    new CandleData("2009/10/16",9.73,10.04,9.95,9.73,73770440,730984960),
    new CandleData("2009/10/15",9.77,9.85,9.73,9.69,41915880,409114496),
    new CandleData("2009/10/14",9.57,9.82,9.76,9.51,58493528,568125120),
    new CandleData("2009/10/13",9.44,9.55,9.53,9.42,25215508,239339488),
    new CandleData("2009/10/12",9.55,9.65,9.44,9.42,28628932,272612704),
    ];
    
    var canvas = document.querySelector("canvas");
    canvas.width = document.documentElement.clientWidth * window.devicePixelRatio;
    canvas.height = Math.round( document.documentElement.clientHeight * window.devicePixelRatio * 0.5 );
    var marginTop = 0.03; //precent
    var marginBottom = 0.03;
    var marginLeft = 0.02;//precent
    var marginRight = 0.02;
    var height = canvas.height * ( 1 - marginTop - marginBottom);
    var width = canvas.width * (1 - marginLeft - marginRight);
    var offsetX = canvas.width * marginLeft ;
    var offsetY = canvas.height * marginTop + height;
    var option = CandleChartOption.newInstance("canvas",offsetX, offsetY, width, height, data);
    var chart = CandelChart.newInstance(option);
    chart.drawMutilCandles(s);    
    return chart;
}
var c = init();

function next(){
    
    s+=1;
    c.drawMutilCandles(s);
    setTimeout(next,1000);
}




