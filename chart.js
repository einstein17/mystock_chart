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
        
        chart.drawText = function(text, topX, topY, textColor, textFont, textBaseline){
            var ctx = chart.getCanvasCtx();
            ctx.save();
            
            if(textColor){
                ctx.fillStyle = textColor;
            }
            if(textFont){
                ctx.font = textFont;
            }
            //textAlign = "start";
            if(textBaseline) ctx.textBaseline = textBaseline;
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
        
        chart.drawYGrid = function(num, color, size, textList, fontSize){
            var step = Math.round( chart.height / num );
            var lineDash = [1,2];
            fontSize = fontSize || 10 * window.devicePixelRatio;
            for(var i = 0; i <= num; i++){
                var y = chart.offsetY - step * i;
                var p = new Point(chart.offsetX + chart.width, y);                
                chart.drawLine(chart.offsetX, y, [p], color, size, lineDash); 
                if(textList){
                    var textBaseline  = "alphabetic";
                    if(i == 0 ) {
                        textBaseline = "ideographic";
                    }
                    else if(i == num) {
                        textBaseline = "top";
                    }
                    chart.drawText(textList[i], chart.offsetX, y, "rgb(0,0,0)", fontSize + "px sans-serif", textBaseline);
                }
            }
        };
        
        chart.drawXGrid = function(num, color, size, textList){
            var step = Math.round( chart.width / num );
            var lineDash = [1,2];
            for(var i = 0; i <= num; i++){
                var x = chart.offsetX + step * i;
                var p = new Point(x, chart.offsetY - chart.height);
                chart.drawLine(x, chart.offsetY, [p], color, size, lineDash);
                if(textList){
                    //todo: 画x坐文字
                }
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
        
        cc.fontSize = 10 * window.devicePixelRatio; //px, 用于最大小值和坐标
        //margin between chart and max,min price
        cc.marginTop = Math.max(cc.height * 0.04, cc.fontSize);
        cc.marginBottom = Math.max(cc.height * 0.04, cc.fontSize);
        cc.marginLeft = Math.max(cc.height * 0.01, cc.fontSize);
        cc.marginRight = Math.max(cc.height * 0.01, cc.fontSize);
        cc.dataHeight = cc.height - cc.marginTop - cc.marginBottom;  //显示数据图的高度
        cc.dataWidth = cc.width - cc.marginLeft - cc.marginRight;    //显示数据图的宽
        
        cc.calcYFromPrice = function(price){ //根据价格计算Y坐标
            var pLen = cc.maxPrice - cc.minPrice;
            if(pLen == 0){
                pLen = 1;
            }
            
            var ret = Math.round( cc.offsetY - cc.marginBottom - (price - cc.minPrice) * cc.dataHeight / pLen  );
            return ret;
        };
        
        cc.maxCandleCount = 80;  //最大画的蜡烛图个数
        cc.minCandleCount = 20;  //最小画的蜡烛图个数
        cc.curCandleCount = 60;  //当前画的蜡烛图个数
        cc.candleWidth = cc.dataWidth / cc.curCandleCount;
        cc.candleMargin = 1 * window.devicePixelRatio;//边距
        cc.drawCandle = function(i, start){
            start = start || 0;            
            var x1 = Math.round(cc.offsetX + cc.marginLeft + (i - start) * cc.candleWidth + cc.candleMargin);
            var x2 = Math.round(cc.offsetX + cc.marginLeft + (i + 1 - start) * cc.candleWidth - cc.candleMargin);
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
                color = "rgb(255,0,0)";
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
        
        cc.maxIndex = cc.minIndex = -1;
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
                    cc.maxIndex = i;
                }
                if(data[i].low < cc.minPrice){
                    cc.minPrice = data[i].low;
                    cc.minIndex = i;
                }
            }
            if(cc.maxPrice == cc.minPrice){
                cc.maxPrice = cc.maxPrice * ( 1 + 0.1 );
            }
        }
        cc.drawMaxMinPrice = function(start){
            var length = cc.fontSize * 6 / 2;
            var marginToCandle = 4;
            if(cc.maxIndex >= 0){
                var x = Math.round(cc.offsetX + cc.marginLeft + (cc.maxIndex - start) * cc.candleWidth + cc.candleWidth / 2);
                var y = cc.calcYFromPrice(cc.maxPrice);
                var end_x = 0;
                if(x > cc.offsetX + cc.width / 2 ){  //on the right,then draw to left
                    x = x - marginToCandle;
                    end_x = x - length;
                }else{
                    x = x + marginToCandle;
                    end_x = x + length;                    
                }
                cc.drawLine(x, y, [new Point(end_x, y)]);
                cc.drawText(cc.maxPrice.toFixed(2).toString(), end_x, y, 'rgb(0,0,0)', cc.fontSize + "px sans-serif", "bottom");
            }
            if(cc.minIndex >= 0){
                var x = Math.round(cc.offsetX + cc.marginLeft + (cc.minIndex - start) * cc.candleWidth + cc.candleWidth / 2);
                var y = cc.calcYFromPrice(cc.minPrice);
                var end_x = 0;
                if(x > cc.offsetX + cc.width / 2 ){  //on the right,then draw to left
                    x = x - marginToCandle;
                    end_x = x - length;
                }else{
                    x = x + marginToCandle;
                    end_x = x + length;                    
                }
                cc.drawLine(x, y, [new Point(end_x, y)]);
                cc.drawText(cc.minPrice.toFixed(2).toString(), end_x, y, 'rgb(0,0,0)', cc.fontSize + "px sans-serif", "top");
            } 
            
        }
        
        cc.yGridNum = 5;
        cc.xGridNum = 1;
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
            var min = cc.minPrice - priceLen * cc.marginBottom / cc.dataHeight;
            var max = cc.maxPrice + priceLen * cc.marginTop / cc.dataHeight;
            var step = (max - min) / cc.yGridNum;
            for(var i = 0;i <= cc.yGridNum; i++){
                var n = Math.round((min + step * i)*100) / 100;
                textArr.push( n.toFixed(2).toString());
            }
            var gridColor = 'rgb(153,153,153)';
            cc.drawYGrid(cc.yGridNum, gridColor, 1, textArr );
            cc.drawXGrid(cc.xGridNum, gridColor, 1);
            cc.drawMaxMinPrice(start);
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
    new CandleData("2009/09/30",9.37,9.39,9.27,9.2,29413284,272985856),
    new CandleData("2009/09/29",9.04,9.4,9.39,9.03,69586232,643621632),
    new CandleData("2009/09/28",9.4,9.45,9.03,8.99,53225268,489899232),
    new CandleData("2009/09/25",9.57,9.68,9.4,9.38,43247856,409570848),
    new CandleData("2009/09/24",9.6,9.61,9.57,9.43,49189844,467949376),
    new CandleData("2009/09/23",9.55,9.77,9.58,9.51,70093928,675661440),
    new CandleData("2009/09/22",9.72,9.95,9.54,9.53,57122696,555674880),
    new CandleData("2009/09/21",9.71,9.81,9.76,9.53,49564880,478450048),
    new CandleData("2009/09/18",10.18,10.24,9.8,9.7,67409360,676858944),
    new CandleData("2009/09/17",10.04,10.19,10.16,9.98,60782476,614341184),
    new CandleData("2009/09/16",10.22,10.25,10.01,9.9,58594920,587899136),
    new CandleData("2009/09/15",10.31,10.34,10.22,10.16,52065944,532811328),
    new CandleData("2009/09/14",10.13,10.36,10.29,10.12,63250648,646231872),
    new CandleData("2009/09/11",10.02,10.25,10.09,10,49389032,500346912),
    new CandleData("2009/09/10",10,10.25,10.07,9.91,47464224,480448352),
    new CandleData("2009/09/09",10.09,10.13,10,9.85,47876732,477294368),
    new CandleData("2009/09/08",9.85,10.12,10.09,9.81,39810200,397435072),
    new CandleData("2009/09/07",9.96,10.09,9.92,9.86,37782344,377556864),
    new CandleData("2009/09/04",9.98,10.05,9.92,9.76,45724704,452505568),
    new CandleData("2009/09/03",9.57,10,9.98,9.57,70739216,697182912),
    new CandleData("2009/09/02",9.43,9.68,9.59,9.35,29716976,284198528),
    new CandleData("2009/09/01",9.4,9.77,9.47,9.31,38369828,365568512),
    new CandleData("2009/08/31",10.15,10.15,9.44,9.41,55581852,542153984),
    new CandleData("2009/08/28",10.5,10.62,10.3,10.21,44357208,461268224),
    new CandleData("2009/08/27",10.37,10.65,10.55,10.35,42116728,442932160),
    new CandleData("2009/08/26",10.13,10.55,10.44,10.13,37074928,385331712),
    new CandleData("2009/08/25",10.38,10.54,10.22,10,51728008,529638976),
    new CandleData("2009/08/24",10.58,10.59,10.44,10.31,38417272,400983168),
    new CandleData("2009/08/21",10.35,10.55,10.47,10.28,42854928,446974976),
    new CandleData("2009/08/20",10.04,10.44,10.39,10.04,46784432,480201280),
    new CandleData("2009/08/19",10.66,10.67,10.02,9.93,54310920,561811520),
    new CandleData("2009/08/18",10.39,10.77,10.66,10.33,53672612,569924544),
    new CandleData("2009/08/17",10.7,10.93,10.44,10.26,89475600,939773440),
    new CandleData("2009/08/14",11.1,11.12,10.97,10.6,78622672,852711424),
    new CandleData("2009/08/13",11.21,11.31,11.09,10.88,87473440,966890368),
    new CandleData("2009/08/12",11.99,12,11.23,11.13,77745296,897920512),
    new CandleData("2009/08/11",12.35,12.41,12,11.85,57663080,696928768),
    new CandleData("2009/08/10",11.9,12.37,12.34,11.72,96570160,1158177024),
    new CandleData("2009/08/07",12.37,12.54,11.72,11.65,106142560,1276213760),
    new CandleData("2009/08/06",12.58,12.9,12.41,12.19,121844888,1526963968),
    new CandleData("2009/08/05",11.9,13.15,12.74,11.73,258223312,3269657600),
    new CandleData("2009/08/04",11.51,11.98,11.95,11.2,143924640,1662849792),
    new CandleData("2009/08/03",11.28,11.54,11.33,11.22,107518136,1221102720),
    new CandleData("2009/07/31",10.94,11.3,11.28,10.85,109227440,1216086656),
    new CandleData("2009/07/30",10.72,11.1,10.88,10.7,110414880,1203447168),
    new CandleData("2009/07/29",11.25,11.37,10.75,10.25,132373519,1455367742),
    new CandleData("2009/07/28",11.35,11.44,11.27,11.15,121602176,1368536064),
    new CandleData("2009/07/27",11.33,11.45,11.42,11.18,97086112,1098887168),
    new CandleData("2009/07/24",11.67,11.7,11.31,11.01,109669624,1243372672),
    new CandleData("2009/07/23",11.66,11.73,11.58,11.45,74154416,856901824),
    new CandleData("2009/07/22",11.38,11.83,11.65,11.38,117742616,1370093696),
    new CandleData("2009/07/21",11.25,11.65,11.44,11.24,150246144,1724063616),
    new CandleData("2009/07/20",11.2,11.52,11.23,11.18,130034224,1473484928),
    new CandleData("2009/07/17",10.85,11.07,11.05,10.7,99858448,1090235520),
    new CandleData("2009/07/16",10.99,11.1,10.77,10.76,119130232,1304322944),
    new CandleData("2009/07/15",10.62,11.04,10.96,10.6,175533600,1911720192),
    new CandleData("2009/07/14",10.33,10.68,10.64,10.29,148826400,1564979840),
    new CandleData("2009/07/13",10.37,10.52,10.3,10.25,78847312,818686080),
    new CandleData("2009/07/10",10.37,10.58,10.41,10.3,106089936,1106854784),

    ];
    
    var canvas = document.querySelector("canvas");
    canvas.width = document.documentElement.clientWidth * window.devicePixelRatio;
    canvas.height = Math.round( document.documentElement.clientHeight * window.devicePixelRatio * 0.5 );
    //margin between chart and canvas
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




