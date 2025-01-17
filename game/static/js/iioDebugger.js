/*
 iio Debugger :: iio Engine Extension
 Version 1.3
 Last Update 6/4/2013

 The iio Engine is licensed under the BSD 2-clause Open Source license

 Copyright (c) 2013, Sebastian Bierman-Lytle
 All rights reserved.

 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 Redistributions of source code must retain the above copyright notice, this list
 of conditions and the following disclaimer.

 Redistributions in binary form must reproduce the above copyright notice, this
 list of conditions and the following disclaimer in the documentation and/or other
 materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 POSSIBILITY OF SUCH DAMAGE.
 */
(function () {
	var OUTLINE_COLOR = 'white';

	//Definition
	function AppDebugger() {
		this.AppDebugger.apply(this, arguments);
	};
	iio.AppDebugger = AppDebugger;

	//Constructor
	AppDebugger.prototype.AppDebugger = function (io) {
		this.io = io;
		//create the debugger section element
		this.section = document.createElement('section');
		this.section.setAttribute("class", "AppDebugger");
		this.section.style.position = 'absolute';
		this.section.style.left = io.canvas.pos.x + 'px';
		this.section.style.top = io.canvas.pos.y + 'px';
		this.section.style.zIndex = 100;
		this.section.style.backgroundColor = 'rgba(0,0,0,0.2)';
		this.section.style.padding = 5 + 'px';
		this.section.style.fontFamily = "Calibri";
		this.section.style.color = "#f8f8f8";
		this.section.style.maxWidth = 202 + 'px';
		this.section.style.maxHeight = io.canvas.height - 20 + 'px';
		this.section.style.overflowY = 'auto';
		this.section.style.overflowX = 'hidden';
		document.body.appendChild(this.section);

		this.drawOutlineToggle = document.createElement('div');
		this.drawOutlineToggle.setAttribute('id', 'ioDBOpts');
		this.drawOutlineToggle.innerHTML =
			'<input id="ioDBshowOutline" type="checkbox"><label for="ioDBshowOutline">Outline Objects</label>';
		this.section.appendChild(this.drawOutlineToggle);
		this.drawOutline = false;
		var self = this;
		document.getElementById('ioDBshowOutline').addEventListener('change', function () {
			self.drawOutline = !self.drawOutline;
			self.toggleOutlines();
		});

		this.table = document.createElement('table');
		this.table.setAttribute("class", "ioDBTable");

		//Objects
		tr = document.createElement('tr');
		var td = document.createElement('td');
		td.innerHTML = "Total Objects:"
		td.setAttribute("class", "ioDBtdLeft");
		td.style.textAlign = 'right';
		this.totalObjs = document.createElement('td');
		this.totalObjs.setAttribute("class", "ioDBtdRight");
		this.totalObjs.style.paddingLeft = 5 + 'px';
		this.totalObjs.style.textAlign = 'left';
		tr.appendChild(td);
		tr.appendChild(this.totalObjs);
		this.table.appendChild(tr);
		this.section.appendChild(this.table);
		this.cnvs = [];
		this.lastTime = 0;
		this.update(0, this);

		iio.addEvent(window, 'resize', function (event) {
			if (this[0].io.fullScreen) {
				io.canvas.width = window.innerWidth;
				io.canvas.height = window.innerHeight;
			}
			for (var c = 0; c < this[0].io.cnvs.length; c++) {
				if (c > 0) {
					this[0].io.cnvs[c].style.left = this[0].io.cnvs[0].offsetLeft + "px";
					this[0].io.cnvs[c].style.top = this[0].io.cnvs[0].offsetTop + "px";
				}
				this[0].io.setCanvasProperties(c);
			}
			this[0].section.style.left = io.canvas.pos.x + 'px';
			var ScrollTop = document.body.scrollTop;
			if (ScrollTop == 0) {
				if (window.pageYOffset)
					ScrollTop = window.pageYOffset;
				else
					ScrollTop = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
			}
			this[0].section.style.top = io.canvas.pos.y + ScrollTop + 'px';
			if (typeof this[0].io.app.onResize != 'undefined')
				this[0].io.app.onResize(event);
		}.bind([this]), false);
	}
	AppDebugger.prototype.toggleOutlines = function () {
		for (var i = 0; i < this.io.cnvs.length; i++)
			for (var j = 0; j < this.io.cnvs[i].groups.length; j++)
				for (var k = 0; k < this.io.cnvs[i].groups[j].objs.length; k++)
					if (this.drawOutline) {
						if (typeof this.io.cnvs[i].groups[j].objs[k].styles != 'undefined'
							&& typeof this.io.cnvs[i].groups[j].objs[k].styles.strokeStyle != 'undefined')
							this.io.cnvs[i].groups[j].objs[k].alreadyStroked = true;
						else {
							this.io.cnvs[i].groups[j].objs[k].setStrokeStyle(OUTLINE_COLOR);
							this.io.cnvs[i].groups[j].objs[k].clearSelf(this.io.ctxs[i]);
							this.io.cnvs[i].groups[j].objs[k].draw(this.io.ctxs[i]);
						}
					} else if (this.io.cnvs[i].groups[j].objs[k].alreadyStroked) break;
					else {
						this.io.cnvs[i].groups[j].objs[k].clearSelf(this.io.ctxs[i]);
						this.io.cnvs[i].groups[j].objs[k].styles.strokeStyle = undefined;
						this.io.cnvs[i].groups[j].objs[k].draw(this.io.ctxs[i]);
					}
	}
	AppDebugger.prototype.addOutlines = function () {
		for (var i = 0; i < this.io.cnvs.length; i++)
			for (var j = 0; j < this.io.cnvs[i].groups.length; j++)
				for (var k = 0; k < this.io.cnvs[i].groups[j].objs.length; k++)
					this.io.cnvs[i].groups[j].objs[k].setStrokeStyle(OUTLINE_COLOR);
	}
	AppDebugger.prototype.update = function (dt, db) {
		iio.requestTimeout(5, db.lastTime, function (dt, args) {
			args[0].lastTime = dt;
			args[0].update(5, args[0]);
			args[0].totalObjs.innerHTML = args[0].updateData();
			args[0].updateMsgs();
			if (args[0].drawOutline) args[0].addOutlines();
		}, [this]);
	}
	AppDebugger.prototype.updateMsgs = function () {
		if (typeof this.msgs != 'undefined') {
			if (typeof this.msgBox == 'undefined') {
				this.msgBox = document.createElement('div');
				this.msgBox.setAttribute('class', 'ioDBMsgBox');
				this.msgBox.style.marginTop = '5px';
				this.msgBox.style.maxHeight = '200px';
				this.msgBox.style.overflowY = 'scroll';
				this.msgBox.style.textAlign = 'left';
				this.msgBox.style.borderTop = '1px solid white';
				this.section.appendChild(this.msgBox);
			}
			for (var i = 0; i < this.msgs.length; i++) {
				var p = document.createElement('p');
				p.innerHTML = this.msgs[i];
				p.style.margin = 0;
				this.msgBox.appendChild(p);
				this.msgBox.scrollTop = this.msgBox.scrollHeight;
			}
			this.msgs = undefined;
		}
	}
	AppDebugger.prototype.updateCanvasData = function (c) {
		if (typeof this.io.cnvs[c].groups == 'undefined') return 0;
		var totalCanvasObjects = 0;
		for (var g = 0; g < this.io.cnvs[c].groups.length; g++) {
			if (this.cnvs[c].groups.length <= g) {
				tr = document.createElement('tr');
				this.cnvs[c].tags[g] = document.createElement('td');
				this.cnvs[c].tags[g].setAttribute("class", "ioDBtdLeft");
				this.cnvs[c].tags[g].style.textAlign = 'right';
				tr.appendChild(this.cnvs[c].tags[g]);
				this.cnvs[c].groups[g] = document.createElement('td');
				this.cnvs[c].groups[g].setAttribute("class", "ioDBtdRight");
				this.cnvs[c].groups[g].style.paddingLeft = 5 + 'px';
				this.cnvs[c].groups[g].style.textAlign = 'left';
				tr.appendChild(this.cnvs[c].groups[g]);
				this.cnvs[c].appendChild(tr);
			}
			var numObjsInGroup = this.io.cnvs[c].groups[g].objs.length;
			this.cnvs[c].groups[g].innerHTML = numObjsInGroup;
			this.cnvs[c].tags[g].innerHTML = this.io.cnvs[c].groups[g].tag + ':';
			totalCanvasObjects += numObjsInGroup
		}
		return totalCanvasObjects;
	}
	AppDebugger.prototype.updateData = function () {
		if (typeof this.io.cnvs == 'undefined') return 'no canvas elements';
		var totalObjs = 0;
		for (var c = 0; c < this.io.cnvs.length; c++) {
			if (this.cnvs.length <= c) {
				this.cnvs[c] = document.createElement('this.table');
				this.cnvs[c].setAttribute("class", "ioDBtable");
				this.cnvs[c].style.width = 100 + '%';
				this.section.appendChild(this.cnvs[c]);

				tr = document.createElement('tr');
				var td = document.createElement('td');
				if (c == 0) td.innerHTML = "Base Canvas";
				else td.innerHTML = "Canvas " + c;
				td.setAttribute("class", "ioDBtdLeft");
				td.style.textAlign = 'right';
				td.style.color = '#00baff';
				tr.appendChild(td);
				this.cnvs[c].appendChild(tr);
				this.cnvs[c].groups = [];
				this.cnvs[c].tags = [];
			}
			totalObjs += this.updateCanvasData(c);
		}
		return totalObjs;
	}
	iio.AppManager.prototype.debugMsg = function (msg) {
		if (typeof this.debugger != 'undefined') {
			if (typeof this.debugger.msgs == 'undefined') this.debugger.msgs = [];
			this.debugger.msgs[this.debugger.msgs.length] = msg;
		}
	}
	iio.AppManager.prototype._setFramerate = iio.AppManager.prototype.setFramerate;
	iio.AppManager.prototype.setFramerate = function (fps, callback, obj, ctx) {
		if (typeof this.debugger != 'undefined'
			&& document.getElementById("ioDBOpts") != null
			&& this.debugger.section != null) {
			if (typeof this.debugger.stats == 'undefined') {
				this.debugger.stats = new Stats();
				this.debugger.stats.setMode(0);
				this.debugger.section.insertBefore(this.debugger.stats.domElement, document.getElementById("ioDBOpts"));
			}
			this.debugger.stats.begin();
			this._setFramerate(fps, callback, obj, ctx);
			this.debugger.stats.end();
		} else this._setFramerate(fps, callback, obj, ctx);
	}
	iio.AppManager.prototype._AppManager = iio.AppManager.prototype.AppManager;
	//automatically attach iioDebugger
	iio.AppManager.prototype.activateDebugger = function (a, b, c, d) {
		this.debugger = new iio.AppDebugger(this);
	}
})();


/** STATS
 * @author mrdoob / http://mrdoob.com/
 */
var Stats = function () {

	var startTime = Date.now(), prevTime = startTime;
	var ms = 0, msMin = Infinity, msMax = 0;
	var fps = 0, fpsMin = Infinity, fpsMax = 0;
	var frames = 0, mode = 0;

	var container = document.createElement('div');
	container.id = 'stats';
	container.addEventListener('mousedown', function (event) {
		event.preventDefault();
		setMode(++mode % 2)
	}, false);
	container.style.cssText = 'width:100%;opacity:0.9;cursor:pointer';

	var fpsDiv = document.createElement('div');
	fpsDiv.id = 'fps';
	fpsDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;';
	container.appendChild(fpsDiv);

	var fpsText = document.createElement('div');
	fpsText.id = 'fpsText';
	fpsText.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	fpsText.innerHTML = 'FPS';
	fpsDiv.appendChild(fpsText);

	var fpsGraph = document.createElement('div');
	fpsGraph.id = 'fpsGraph';
	fpsGraph.style.cssText = 'position:relative;width:100%;height:30px;background-color:#0ff';
	fpsDiv.appendChild(fpsGraph);

	while (fpsGraph.children.length < 199) {

		var bar = document.createElement('span');
		bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#113';
		fpsGraph.appendChild(bar);

	}

	var msDiv = document.createElement('div');
	msDiv.id = 'ms';
	msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;display:none';
	container.appendChild(msDiv);

	var msText = document.createElement('div');
	msText.id = 'msText';
	msText.style.cssText = 'color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	msText.innerHTML = 'MS';
	msDiv.appendChild(msText);

	var msGraph = document.createElement('div');
	msGraph.id = 'msGraph';
	msGraph.style.cssText = 'position:relative;width:100%;height:30px;background-color:#0f0';
	msDiv.appendChild(msGraph);

	while (msGraph.children.length < 199) {

		var bar = document.createElement('span');
		bar.style.cssText = 'width:1px;height:30px;float:left;background-color:#131';
		msGraph.appendChild(bar);

	}

	var setMode = function (value) {
		mode = value;
		switch (mode) {
			case 0:
				fpsDiv.style.display = 'block';
				msDiv.style.display = 'none';
				break;
			case 1:
				fpsDiv.style.display = 'none';
				msDiv.style.display = 'block';
				break;
		}
	}

	var updateGraph = function (dom, value) {

		var child = dom.appendChild(dom.firstChild);
		child.style.height = value + 'px';
	}

	return {

		REVISION: 11,
		domElement: container,
		setMode: setMode,
		begin: function () {
			startTime = Date.now();
		},
		end: function () {
			var time = Date.now();
			ms = time - startTime;
			msMin = Math.min(msMin, ms);
			msMax = Math.max(msMax, ms);

			msText.textContent = ms + ' MS (' + msMin + '-' + msMax + ')';
			updateGraph(msGraph, Math.min(30, 30 - ( ms / 200 ) * 30));

			frames++;

			if (time > prevTime + 1000) {

				fps = Math.round(( frames * 1000 ) / ( time - prevTime ));
				fpsMin = Math.min(fpsMin, fps);
				fpsMax = Math.max(fpsMax, fps);

				fpsText.textContent = fps + ' FPS (' + fpsMin + '-' + fpsMax + ')';
				updateGraph(fpsGraph, Math.min(30, 30 - ( fps / 100 ) * 30));

				prevTime = time;
				frames = 0;
			}
			return time;
		},
		update: function () {
			startTime = this.end();
		}
	}
};