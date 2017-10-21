Point = function(x,y){
	this.x = x;
	this.y = y;
};
ChartOption = function(canvasId, offsetX, offsetY, width, height){
	this.canvasId = canvasId;
	this.offsetX = offsetX;
	this.offsetY = offsetY;
	this.width = width;
	this.height = height;
};
var Chart = {
	newInstance:function(chartOption){
		var chart = {};
		chart.canvasId = chartOption.canvasId; /*canvas id */
		chart.canvas = document.getElementById('canvas');
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
		chart.offsetY = chartOption.offsetY || 0;
		chart.width = chartOption.width || chart.canvas.width;
		chart.height = chartOption.height || chart.canvas.height;
		
		chart.drawLine = function(startX, startY, pointList, color, size){
			var ctx = chart.getCanvasCtx();
			ctx.save();
			
			if(color) ctx.strokeStyle = color;
			if(size) ctx.lineWidth = size;
			
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
		return chart;
	}
};
function test(){
	var chartOption = new ChartOption("canvas");
	var chart = Chart.newInstance(chartOption);
	var pointList = [new Point(100,200),new Point(100,150)]
	chart.drawLine(10,200, pointList, 'rgb(255,0,0)', 100);
	chart.drawRect(100,10,100,50,'rgb(255,0,0)', 4);
	chart.drawFillRect(210,10,100,50,'rgb(0,255,0)', 10);
}



