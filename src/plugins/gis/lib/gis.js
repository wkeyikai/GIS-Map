
﻿/*
*
*gis dom Structure:
*'relative'                  'absolute'     'absolute'      'absolute'
*div(mapID)--viewport(div)--tileContainer--draggable(div)--mapDiv(div)--map(img)
*                                         --lineDiv(div)--line(canvas)
*                                         --markDiv(div)--ivon(img)
*                                         --winDiv(div)--div(html)
*                         --crossDiv(div)--cross(html)               
*                         --overviewDiv(div)--overview(html)
*/
let GIS 
(function(doc, win) {
    let d ;
/*init*/
    var add = function (obj) {
        var ev = win.addEventListener ?
        { on: 'addEventListener', off: 'removeEventListener', e: ''} :
        { on: 'attachEvent', off: 'detachEvent', e: 'on' };
        obj.css = function (style) {
            for (var k in style)
            { this.style[k] = style[k]; }
            return obj;
        }
        obj.on = function (event, fn, bool) {
            var fun =function (e) {
                e = e || win.event;
                e.preventDefault();
                fn(e);
            }
            this[ev.on](ev.e + event,
            fun, bool);
            return obj;
        }
        obj.off = function (event, fn, bool) {
            var fun = function (e) {
                e = e || win.event;
                e.preventDefault();
                fn(e);
            }
            this[ev.off](ev.e + event,
            fun, bool);
            return obj;
        }
        return obj;
    }
    GIS = {
    /*版本*/
    version: 'v1.0',
    /*動態路徑檔*/
    path: (function () {
        var RELATIVE = /^[\w\.]+[^:]*$/;
        function makePath(href, path) {
            if (RELATIVE.test(href)) href = (path || "") + href;
            return href;
        };
        function getPath(href, path) {
            href = makePath(href, path);
            return href.slice(0, href.lastIndexOf("/") + 1);
        };
        // get the path to this script
        var scripts = doc.getElementsByTagName('script');
        var script = scripts[scripts.length - 1];
        return getPath(script.src);
    })(),
    /*判斷瀏覽器*/
    BrowserType: function () {
        var OS = { 'MSIE 9': false, 'MSIE 6.0': false, 'MSIE': false, 'Firefox': false, 'Safari': false, 'Opera': false, 'Camino': false, 'Gecko/': false };
        for (var i in OS) {
            if (navigator.userAgent.indexOf(i) > 0) return OS[i] = true;
        }
        return OS;
    },
    /*設定*/
    config: function () {
        //var config = { left: 121.260389, top: 25.344827, right: 122.029189, bottom: 24.630623, gisPath: Path };
        var data = { left: -180, top: 85.05112877980659, right: 180, bottom: -85.05112877980659, gisPath: this.path };
        return data;
    },
    /*載入檔案*/
    loader: function () {
        var Loader = function (type, filename, fun) {
            var head = doc.getElementsByTagName('head')[0],
            script = doc.createElement('script');
            script.type = 'text/' + type;
            script.src = filename;
            if (typeof fun === 'function') { script.onload = fun; }
            head.appendChild(script);
        };
        // Loader('javascript', this.path + 'excanvas_r3/excanvas.js', null);
        // Loader('css', this.path + 'gis.css', null);
    },
    /*語系(目前無功能)*/
    langSet: function () {
        var langs = {
            eng: 'http://image.5284.com.tw/TPBusImg/chtmapcache/EngMap/',
            cht: 'http://www.5284.com.tw/TPBusImg/chtmapcache/ChtMap/'
            //'http://220.128.210.244/MapCatcheCht/'
        };
        //var mapUrl = langs.cht;
    },
    add:add,
    /*js 介面,DOM js Module (預計加入mobile Module)*/
    jsInterface: function (win, doc) {
        //console.log('>>' + this.win());
        //var win = window, doc = document; 
        
        //add the actual browser event listener
//        if (element.addEventListener) {
//            element.addEventListener(name, observer, useCapture);
//        } else if (element.attachEvent) {
//            element.attachEvent('on' + name, observer);
//        }
        d = {
            c: function (e) {
                return add(doc.createElement(e));
            },
            g: {
                id: function (e) { return add(doc.getElementById(e)); },
                tag: function (e) { return add(doc.getElementsByTagName(e)); }
            },
            o: function (e) {
                return add(e);
            }
        }
        return d
    }
};

GIS.loader();
//Core Module
GIS.map = function (mapID, draggable_options, tile_options) {
    console.log(GIS.version);
    var self = this;
    var config = GIS.config();
    var gisPath = config.gisPath;
    var l = parseFloat(config.left, 10),
        t = parseFloat(config.top, 10),
        r = parseFloat(config.right, 10),
        b = parseFloat(config.bottom, 10);

    var mapLat = { Top: t, Bottom: b, Range: t - b },
        mapLon = { Left: l, Right: r, Range: r - l },
        mapDistance = Math.sqrt(Math.pow(mapLat.Range, 2) - 0 + Math.pow(mapLon.Range, 2)),
        Public = { Lon: (r + l) / 2, Lat: (t + b) / 2, MapX: 0, MapY: 0 };

    //var win = window, doc = document;
    var d = new GIS.jsInterface(win, doc);

    var scope = function (val, min, max) {
        return Math.max(min, Math.min(val, max));
    }

    //new classs的全域變數
    var levelOfDetail = 1;
    var levelRate = Math.pow(2, levelOfDetail);
    var dragOffset = { PX: 0, PY: 0, status: false };
    //line,mark,canvas
    var lineArray = [], markArray = [], canvasArray = [], canvasCircle = [];
    self.Window = null
    var windowPOI = null;

    //drag Status
    var dragStatus = 'global';
    //overview map
    var overviewMap = null;
    // Use self to reduce confusion about this.
    //
    var draggable = d.c('div').css({ position: 'absolute', Zindex: 0, top: 0, left: '0px', webkitTransform: 'translate(0px,0px) scale(1)' }), //拖曳圖層
        click = d.c('div'), //拖曳圖層
        //mapDiv01 = d.c('div').css({ position: 'absolute', Zindex: 0, top: '0px', left: '0px' }), //地圖圖片圖層
        //mapDiv02 = d.c('div').css({ position: 'absolute', Zindex: 0, top: '0px', left: '0px' }), //地圖圖片圖層
        mapDivA = d.c('div').css({ position: 'absolute', Zindex: 0, top: '0px', left: '0px' }), //地圖圖片圖層
        mapDivB = d.c('div').css({ position: 'absolute', Zindex: 0, top: '0px', left: '0px' }), //地圖圖片圖層
        mapDiv = mapDivA, //地圖圖片圖層
        lineDiv = d.c('div').css({ position: 'absolute', Zindex: 101, top: '0px', left: '0px' }), //線圖層
        markDiv = d.c('div').css({ position: 'absolute', Zindex: 102, top: '0px', left: '0px' }), //圖層
        labelDiv = d.c('div').css({ position: 'absolute', Zindex: 104, top: '0px', left: '0px' }), //圖層
        winDiv = d.c('div').css({ position: 'absolute', Zindex: 103, top: '0px', left: '0px' }), //視窗圖層
        shapefileDiv = d.c('div'), //shapefil圖層(new 8/23)
        crossDiv = d.c('div').css({ position: 'absolute', Zindex: 10000, top: '0px', left: '0px', width: '0px' }), //魚骨圖圖層(工具列)
        overviewDiv = d.c('div'), //鷹眼圖圖層(工具列)
        viewport = d.c('div').css({ position: 'absolute', Zindex: 0, top: '0px', left: '0px', WebkitUserSelect: 'none', border: '0px inset #FFFFFF', backgroundColor: '#EEECBC', width: '100%', height: '100%', overflow: 'hidden' }), //基本圖層(主圖層2)
        //mapBody = d.g.id(mapID.css({ position: 'absolute', Zindex: 0, WebkitUserSelect: 'none', border: '0px inset #FFFFFF', overflow: 'hidden' }); ; //基本圖層(主圖層1)
        mapBody = add(mapID).css({ position: 'absolute', Zindex: 0, WebkitUserSelect: 'none', border: '0px inset #FFFFFF', overflow: 'hidden' }); //基本圖層(主圖層1)
    //draggable.setAttribute('id', 'draggable');
    var fragment = doc.createDocumentFragment();
    mapBody.appendChild(viewport);
    fragment.appendChild(draggable);
    fragment.appendChild(crossDiv);
    fragment.appendChild(overviewDiv);
    viewport.appendChild(fragment);
    //    [mapDiv, mapDiv2, lineDiv, markDiv, labelDiv, winDiv].forEach(function (entry) {
    //        draggable.appendChild(entry);
    //    });
    //mapDiv01.appendChild(mapDivA);
    //mapDiv02.appendChild(mapDivB);

    draggable.appendChild(mapDivA);
    draggable.appendChild(mapDivB);

    draggable.appendChild(lineDiv);
    draggable.appendChild(markDiv);
    draggable.appendChild(labelDiv);
    draggable.appendChild(winDiv);

    // 防止手機滑動
    mapBody.on('touchmove', (ev)=>{
        ev.preventDefault()
        ev.stopPropagation()
    },{ passive: false });

    // Draggable options
    var _do = (draggable_options) ? draggable_options : {};

    // grid options (default)
    var grid = {};
    // Tile options (default)
    var _tile = {
        class_name: "_tile",
        width: 256,
        height: 256,
        start_col: 0,
        start_row: 0,
        range_col: [-1000000, 1000000],
        range_row: [-1000000, 1000000],
        oncreate: function (element, col, row) {     //col:x,row:y
            var mapurl = 'http://mt0.googleapis.com/vt?lyrs=m@253000000&src=apiv3&hl=zh-TW&x=' + col + '&y=' + row + '&z=' + levelOfDetail; // +'&style=47,37%7Csmartmaps';
            element.setAttribute('src', mapurl);
            return element;
        }
    };
    // Setup-----------
    var viewport_width = viewport.clientWidth, //$viewport.width(),
	    viewport_height = viewport.clientHeight, //$viewport.height(),
		viewport_cols = Math.ceil(viewport_width / _tile.width),
		viewport_rows = Math.ceil(viewport_height / _tile.height);

    draggable.style.left = viewport.offsetLeft - (_tile.start_col * _tile.width);
    draggable.style.top = viewport.offsetTop - (_tile.start_row * _tile.height);

    var olevelOfDetail = 0;
    var Rate = 1;
    // Override tile options.
    for (var i in tile_options) {
        if (tile_options[i] !== undefined) {
            _tile[i] = tile_options[i];
        }
    }

    // Override tile options based on draggable options.
    if (_do.axis == "x") {
        _tile.range_row = [_tile.start_row, _tile.start_row];
    } else if (_do.axis == "y") {
        _tile.range_col = [_tile.start_col, _tile.start_col];
    }

    // Creates the tile at (i, j).
    function create_tile(i, j, offset) {
        if (i < _tile.range_col[0] || _tile.range_col[1] < i) {
            return;
        } else if (j < _tile.range_row[0] || _tile.range_row[1] < j) {
            return;
        }

        grid[i][j] = true;

        var x = i * _tile.width;
        var y = j * _tile.height

        //var e = mapDiv.appendChild(d.c('img'));
        //var new_tile = mapDiv.lastChild;
        var new_tile = d.c('img');
        new_tile.className = _tile.class_name; //new_tile.setAttribute('class',_tile.class_name);
        new_tile.setAttribute('col', i);
        new_tile.setAttribute('row', j);
        new_tile.style.position = "absolute";
        new_tile.style.left = x + dragOffset.PX + "px";
        new_tile.style.top = y + dragOffset.PY + "px";
        new_tile.style.width = _tile.width + "px";
        new_tile.style.height = _tile.height + "px";

        _tile.oncreate(new_tile, i, j);
        return new_tile;
    };

    // Updates the containment box wherein the draggable can be dragged.
    var update_containment = function () {
        //Update viewport info.
        viewport_width = viewport.clientWidth, //$viewport.width(),
        			  viewport_height = viewport.clientHeight, //$viewport.height(),
        			  viewport_cols = Math.ceil(viewport_width / _tile.width),
        			  viewport_rows = Math.ceil(viewport_height / _tile.height);

        // Create containment box.
        var half_width = _tile.width / 2,
        				half_height = _tile.height / 2,
        				viewport_offset = { left: viewport.offsetLeft, top: viewport.offsetTop }, //$viewport.offset(),
        				viewport_draggable_width = viewport_width - _tile.width,
        				viewport_draggable_height = viewport_height - _tile.height;

        var containment = [
        				(-_tile.range_col[1] * _tile.width) + viewport_offset.left + viewport_draggable_width,
        				(-_tile.range_row[1] * _tile.height) + viewport_offset.top + viewport_draggable_height,
        				(-_tile.range_col[0] * _tile.width) + viewport_offset.left,
        				(-_tile.range_row[0] * _tile.height) + viewport_offset.top
        			];

        makeDraggable(draggable); //$draggable.draggable("option", "containment", containment);
    };
    update_containment();

    var imgLoadStatus = false;
    var update_tiles = function () {
        imgLoadStatus = false;
        var parent = draggable.parentNode; //tmp

        if (parent == null) return;
        var value = drag.get(draggable);
        var left = dragOffset.PX + parseInt(value.PX);
        var top = dragOffset.PY + parseInt(value.PY);

        var pos = {
            left: left - parent.offsetLeft,
            top: top - parent.offsetTop
        }

        var visible_left_col = Math.ceil(-pos.left / _tile.width) - 1,
			visible_tilep_row = Math.ceil(-pos.top / _tile.height) - 1;
        //grid = {};
        var add_Side_img = 1; //增加旁邊載入的地圖
        var fragment_img = doc.createDocumentFragment();
        //console.log(Public['MapX'], Public['MapY']);

        for (var i = visible_left_col - add_Side_img; i <= visible_left_col + viewport_cols; i++) {
            for (var j = visible_tilep_row - add_Side_img; j <= visible_tilep_row + viewport_rows; j++) {
                if (grid[i] === undefined) {
                    grid[i] = {};
                } else if (grid[i][j] === undefined) {
                    if ((i <= levelRate - 1 && j <= levelRate - 1 && i >= 0 && j >= 0)) {//tile map scpoe 
                        var e = create_tile(i, j);
                        fragment_img.appendChild(e);
                    }
                }
            }
        }
        mapDiv.appendChild(fragment_img);
        imgLoadStatus = true;
    };

    self.mapLevel = function () {
        return levelOfDetail;
    };

    //    self.draggable = function () {//目前無功能 以及尚未測試
    //        return draggable; //$draggable;
    //    };

    self.disabled = function () { //移除地圖拖曳功能
        draggable.style.pointerEvents = 'none';
        /*draggable.onclick = function (e) { e.stopPropagation();return false; }
        draggable.onmousemove = function (e) { e.stopPropagation();return false; }
        draggable.onmousedown = function (e) { e.stopPropagation();return false; }
        draggable.onmouseup = function (e) { e.stopPropagation();return false; }*/
    };

    self.move = function (col, row) {//目前無功能 以及尚未測試
        var offset = draggable; //$draggable.offset();
        var move = {
            left: col * _tile.width,
            top: row * _tile.height
        };

        var new_offset = {
            left: offset.offsetLeft - move.left,
            top: offset.offsetTop - move.top
        };

        if (_do.axis == "x") {
            new_offset.top = offset.offsetTop;
        } else if (_do.axis == "y") {
            new_offset.left = offset.offsetLeft;
        }
        var obj = makeDraggable(draggable);
        var containment = [obj.style.left, obj.style.top, obj.style.left, obj.style.top];

        if (containment[0] <= new_offset.left && new_offset.left <= containment[2]
				&& containment[1] <= new_offset.top && new_offset.top <= containment[3]) {
            draggable.offsetTop = offset.top;
            draggable.offsetLeft = offset.left;

            update_tiles();
        } else {
            // Don't let the tile go beyond the right edge.
            if (new_offset.left < containment[0]) {
                new_offset.left = containment[0];
            }

            // Don't let the tile go beyond the left edge.
            if (new_offset.left > containment[2]) {
                new_offset.left = containment[2];
            }

            draggable.style.top = offset.top;
            draggable.style.left = offset.left;
            update_tiles();
        }
    };

    /*test reset*/
    self.reflash = function () {
        update_containment();
    };
    /*邊界寬/邊界高*/
    self.bounds = { Y: mapBody.clientWidth, X: mapBody.clientHeight };
    self.setTileCenter_T = function (x, y) {
        var x = _tile.width * x,
			y = _tile.height * y,
			half_vw_width = viewport.clientWidth / 2,
			half_vw_height = viewport.clientHeight / 2;

        var new_offset = {
            left: -x - (/*half_width*/-half_vw_width),
            top: -y - (/*half_height*/-half_vw_height)
        };

        return { top: new_offset.top, left: new_offset.left };
    };
    /*(A)設定瓦片地圖中心:*/
    self.setTileCenter = function (x, y) {
        //console.log(x, y);
        //Public['oMapX'] = Public['MapX'];
        //Public['oMapY'] = Public['MapY'];
        mapDiv.innerHTML = '';
        grid = {};
        Public['MapX'] = x;
        Public['MapY'] = y;
        var x = _tile.width * x,
				y = _tile.height * y,
				half_vw_width = viewport.clientWidth / 2,
				half_vw_height = viewport.clientHeight / 2;

        //half_width = _tile.width / 2,
        //half_height = _tile.height / 2,  
        //offset = draggable;

        var new_offset = {
            left: -x - (/*half_width*/-half_vw_width),
            top: -y - (/*half_height*/-half_vw_height)
        };

        var value = drag.get(draggable);
        var left = parseInt(value.PX);
        var top = parseInt(value.PY);
        if (_do.axis == "x") {
            new_offset.top = top; //draggable.top + "px";
        } else if (_do.axis == "y") {
            new_offset.left = left; //draggable.left + "px";
        }

        //draggable.style.top = new_offset.top + "px";
        //.style.left = new_offset.left + "px";
        //var t = 'translate(' +  + 'px,' +  + 'px) scale(1)';
        //drag.set(draggable, new_offset.top, new_offset.left);
        var value = drag.get(draggable);
        var left = value.PX;
        var top = value.PY;
        dragOffset = { oPX: dragOffset.PX, oPY: dragOffset.PY, PX: new_offset.left - left, PY: new_offset.top - top };
        //draggable.style.webkitTransform = t;
        //grid = {};
        //mapDiv.innerHTML = '';
        update_tiles();

    };

    /*(B)取得瓦片地圖中心:from setTileCenter反解 */
    self.getTileCenter = function () {
        var value = drag.get(draggable);
        var left = dragOffset.PX + parseInt(value.PX);
        var top = dragOffset.PY + parseInt(value.PY);
        var offset_top = top; // parseFloat(draggable.style.top, 10);
        var offset_left = left; // parseFloat(draggable.style.left, 10);
        var half_width = _tile.width / 2,
        half_height = _tile.height / 2,
        half_vw_width = viewport.clientWidth / 2,
        half_vw_height = viewport.clientHeight / 2,
        x = (-offset_left - (/*half_width */-half_vw_width)) / _tile.width,
        y = (-offset_top - (/*half_height*/-half_vw_height)) / _tile.height;

        return { X: x, Y: y };
    };

    /*(B1)取得瓦片地圖四週:*/
    self.getTileBound = function () {
        var offset_top = parseFloat(draggable.style.top, 10); //parseInt
        var offset_left = parseFloat(draggable.style.left, 10); //parseInt
        //var half_width = _tile.width / 2,
        //half_height = _tile.height / 2,
        //half_vw_width = viewport.clientWidth / 2,
        //half_vw_height = viewport.clientHeight / 2,
        //x = (-offset_left - (/*half_width */-half_vw_width)) / _tile.width;
        //y = (-offset_top - (/*half_height*/-half_vw_height)) / _tile.height;
        xr = (-offset_left + viewport.clientWidth) / _tile.width;
        xl = (-offset_left) / _tile.width;
        yb = (-offset_top + viewport.clientHeight) / _tile.height;
        yt = (-offset_top) / _tile.height;
        return { Xleft: xl, Xright: xr, Ybottom: yb, Ytop: yt };
    };

    /*(C)lat lon set map center*/
    self.setCenter = function (lon, lat) {//lon:x,lat:y
        Public['Lon'] = lon;
        Public['Lat'] = lat;
        var XY = self.getXY(lon, lat); //(E)  

        self.setTileCenter(XY.X / 256, XY.Y / 256); //(A)
        //overviewMap 同步設定中心點
        //        if (overviewMap != null) {
        //            overviewMap.setCenter(lon, lat);
        //        }
        //update_tiles();
    };

    /*(D)get center lat lon */
    self.getCenter = function () {
        var center = self.getTileCenter(); //(B)
        var LatLon = self.getLatLon(center.X, center.Y); //(F)
        return { Lat: LatLon.Lat, Lon: LatLon.Lon };
    };

    /*(E)lon,lat 轉 col(x),row(y)*/
    self.getXY = function (lon, lat) {
        //new (EPSG:4326)
        lat = scope(lat, -85.05112, 85.05112);
        lon = scope(lon, -180, 180);
        var pa = (function () {
            var originShift = 2 * Math.PI * 6378137 / 2.0;
            return { o: originShift };
        })();
        var LatLonToMeters = function (xy) {
            xy.x = xy.x * pa.o / 180.0;
            xy.y = Math.log(Math.tan((90 + xy.y) * Math.PI / 360.0)) / (Math.PI / 180.0);
            xy.y = xy.y * pa.o / 180.0;
            return xy
        }
        var MetersToPixels = function (xy, rate) {//zoom
            const res = 2 * Math.PI * 6378137 / 256 / (rate);
            xy.x = (xy.x + pa.o) / res;
            xy.y = (xy.y + pa.o) / res;
            xy.y = (rate) * 256 - xy.y; //Y軸方向轉換
            return xy;
        }
        var xy = LatLonToMeters({ y: lat, x: lon });
        xy = MetersToPixels(xy, levelRate);

        return { X: xy.x, Y: xy.y };
        //return { X: x, Y: y };
    };

    /*(F)col(x),row(y) 轉 lat,lon*/
    self.getLatLon = function (x, y) {

        //var lat = (Math.pow(2, levelOfDetail) - y) * mapLat.Range / levelRate + mapLat.Bottom; //地圖與LAT座標相反所以要調整() 
        //var lat = (/*Math.pow(2, levelOfDetail)*/  y) * mapLat.Range / levelRate + mapLat.Top; //地圖與LAT座標相反所以要調整(mapLat.Bottom==>mapLat.Top)            
        //var lon = x * mapLon.Range / levelRate + mapLon.Left;

        var Resolution = function (rate) { return 2 * Math.PI * 6378137 / 256 / rate; }
        var originShift = 2 * Math.PI * 6378137 / 2.0;
        var PixelsToMeters = function (px, py, rate) {
            let res = Resolution(rate);
            let mx = px * res - originShift;
            //my = py * res - originShift;
            let my = ((rate) * 256 - py) * res - originShift; //Y軸方向轉換
            return { mx: mx, my: my };
        }
        var MetersToLatLon = function (mx, my) {
            let lon = (mx / originShift) * 180.0;
            let lat = (my / originShift) * 180.0;
            lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180.0)) - Math.PI / 2.0)
            return { lat: lat, lon: lon }
        }
        var p = PixelsToMeters(x * 256, y * 256, levelRate);
        p = MetersToLatLon(p.mx, p.my);
        //var p = MetersToLatLon(x, y); //console.log(p);

        return { Lat: p.lat, Lon: p.lon };
    };

    /*remap*/
    olevelOfDetail = 1; //tmp
    var action = { cross: function () { }, overview: function () { } };
    self.reMap = function (level, px, py) {
        if(mapDiv.style.display == 'none'){
            return;
        }
        switch (level) {
            case 'sub': level = levelOfDetail - 1; break;
            case 'add': level = levelOfDetail + 1; break;
        }

        //levelOfDetail = scope(levelOfDetail, 1, 16);
        if (level > 19 || level < 1) return;
        if (level == levelOfDetail) return;
        olevelOfDetail = parseInt(levelOfDetail, 10);
        levelOfDetail = parseInt(level, 10);
        Rate = Math.pow(2, levelOfDetail - olevelOfDetail);
        levelRate = Math.pow(2, levelOfDetail); //地圖等級倍率(256<<levelOfDetail)
        var rang = 256 * Rate; //縮放倍率

        //grid = {}; //tmp clear

        var mapTmp = null; //init
        //mapDivB.style.opacity = 0.4;        //mapDivA.filters.alpha.opacity = 0.5;
        //Zooin/out layer change and show and hide 
        if (mapDivA.style.display == 'none') {
            mapDiv = mapDivA;
            mapTmp = mapDivB;
        } else {
            mapDiv = mapDivB;
            mapTmp = mapDivA;
        }
        //init
        mapDiv.style.display = 'none';
        mapTmp.style.display = '';
        //mapDiv.innerHTML = '';
        if (typeof (px) == 'undefined' || typeof (py) == 'undefined') {//tmp
            //var center = self.getCenter();
            var center = self.getTileCenter();
            //py = Public.MapY;
            //px = Public.MapX;
            py = center.Y;
            px = center.X;
        }
        var center = self.getTileCenter();
        var xx = center.X, yy = center.Y;
        self.setTileCenter(px * Rate, py * Rate); //reflash
        var xxx = Public.MapX, yyy = Public.MapY;
        var dxx = (xxx / Rate - xx);
        var dyy = (yyy / Rate - yy);

        var value = drag.get(draggable);
        var img = function (dx) {
            var offset_rate = (dx / rang) * Rate;
            var offset = self.setTileCenter_T((px) * offset_rate, (py) * offset_rate); //tmp
	    var tile_rate = (Rate - offset_rate) * 256;
            var yy = offset.top - parseInt(value.PY) +(Rate >= 1 ?1:-2)* (dyy * tile_rate );
            var xx = offset.left - parseInt(value.PX) +(Rate >= 1 ?1:-2)* (dxx * tile_rate );
            //mapTmp.style.top = yy + "px";
            //mapTmp.style.left = xx + "px";
            var node = mapTmp.firstChild;
            while (node != null) {
                var i = node.getAttribute('col');
                var j = node.getAttribute('row');

                node.style.width = dx + "px";
                node.style.height = dx + "px";
                var x = i * dx;
                var y = j * dx;
                node.style.left = x + xx + "px";
                node.style.top = y + yy + "px";
                node = node.nextSibling;
            }

        }

        var finishZoom = function(){
            if (lineArray != "") {
                self.reLine();
            }
            totalX = 0;
            totalY = 0;
            if (lineArray != "") {
                //self.reLine();
            }
            if (canvasCircle != "") {
                lineDiv.innerHTML = '';
                self.remapCircle(Rate/*canvasCircle*/);
            }
            //if (markArray != "") 
            {
                self.remark(Rate);
            }
            //        if (self.Window != null) {
            //            self.reWindow(Rate);
            //        }
            //使用tool :cross /overview 
            action.overview();
            action.cross();
        }
        var speed = 16; //16
        var zoom_rate = speed * Rate;
        var zoom_val = 256;
        var timer = 30;
        //var start = 256, end = rang;
        var zoomIn = function () {
            if (zoom_val <= rang) {
                img(zoom_val);
                //draggable.style.transformOrigin = 256-tmpXY.x+'px '+256-tmpXY.y+'px';
                //draggable.style.transform = 'matrix('+zoom_val/256 +', 0, 0, '+zoom_val/256  +', -'+(zoom_val-tmpXY.x)+', -'+(zoom_val-tmpXY.y)+')';
                //mapTmp.style.transform = 'matrix(0.1, 0, 0, 0.1, 100, 100)';
                setTimeout(zoom, timer); zoom_val = zoom_val + zoom_rate;
            } else {
                //draggable.style.transform = 'matrix(1, 0, 0, 1, 0, 0)';
                mapDiv.style.display = '';
                mapTmp.style.display = 'none';
                finishZoom();
            }
        }
        var zoomOut = function () {
            if (zoom_val >= rang) {
                img(zoom_val);
                //draggable.style.transformOrigin = tmpXY.x+'px '+tmpXY.y+'px';
                //draggable.style.transform = 'matrix('+zoom_val/256 +', 0, 0, '+zoom_val/256  +', '+(tmpXY.x -zoom_val)+', '+(tmpXY.y -zoom_val)+')';
                setTimeout(zoom, timer); zoom_val = zoom_val - zoom_rate / (Rate);
            } else {
                //draggable.style.transform = 'matrix(1, 0, 0, 1, 0, 0)';
                mapDiv.style.display = '';
                mapTmp.style.display = 'none';
                finishZoom();
            }
        }
        var zoom = Rate > 1 ? zoomIn : zoomOut;
        zoom(); //setTimeout(zoom, 50);
    };
    var imgName = 'new/a'; //'map-ber_';
    /*TOOL:cross,overview*/
    self.tool = function (obj) {
        switch (obj.type) {
            case 'cross':
                obj.set(levelOfDetail); //init
                obj.click(function (level) { self.reMap(level); });
                action.cross = function () { obj.set(levelOfDetail); };
                crossDiv.appendChild(obj.o);
                crossDiv.style.position = 'absolute';
                crossDiv.style.right = '0px';
                break;
            case 'overview':
                //                overview_obj.init(function () {
                //                    var overviewMap = new GIS.map("eyeDiv");
                //                    overviewMap.disabled();
                //                });
                //                overview_obj.action(function () {
                //                    overviewMap.setCenter(Public['Lon'], Public['Lat']);
                //                    var eyeLevel = levelOfDetail < 6 ? 1 : (levelOfDetail - 4);
                //                    overviewMap.reMap(eyeLevel);
                //                    //overviewDiv.appendChild(overview_obj.o);
                //                });
                overviewDiv.appendChild(obj.o);
                overviewMap = new GIS.map(obj.o);
                obj.o.style.border = '5px solid #ffffff';//over ride border style
                overviewMap.disabled();
                action.overview = function () {
                    var center = self.getCenter();
                    overviewMap.setCenter(center.Lon, center.Lat);
                    overviewMap.reMap(levelOfDetail < 6 ? 1 : (levelOfDetail - 4));
                };
                action.overview();
                //var eyeLevel = levelOfDetail < 6 ? 1 : (levelOfDetail - 4);
                //overviewMap.reMap(eyeLevel);
                break;
        }
    }

    /*Overview*/
    self.overview = function () {
        overviewDiv.style.position = 'absolute';
        overviewDiv.style.bottom = 0 + "px";
        overviewDiv.style.right = 0 + "px";
        overviewDiv.style.width = 120 + "px";
        overviewDiv.style.height = 120 + "px";
        overviewDiv.style.Zindex = 10000;
        overviewDiv.style.borderWidth = '1px';
        overviewDiv.style.borderColor = 'black';
        overviewDiv.style.backgroundColor = 'white';
        overviewDiv.style.borderStyle = 'inset';
        overviewDiv.style.borderImage = 'initial';
        overviewDiv.style.overflow = 'hidden';
        // border-color: initial;
        var div = d.c('div');
        //div.id = 'eyeDiv';
        //div.style.position='relative'; //relative
        //div.style.margin=5+'px';
        div.style.top = 5 + "px";
        div.style.left = 5 + "px";
        div.style.width = 111 + "px";
        div.style.height = 111 + "px";
        div.style.backgroundColor = '#4B94BF';
        overviewDiv.appendChild(div);

        var img = d.c('img');
        img.style.position = 'absolute';
        img.src = gisPath + 'img/mapImage/eyeclose.gif';
        img.title = 'close';
        img.style.bottom = 0 + "px";
        img.style.right = 0 + "px";
        img.style.width = 15 + "px";
        img.style.height = 15 + "px";
        img.onclick = function () {
            if (this.title == 'close') {
                for (i = 120; i >= 15; i--) {
                    overviewDiv.style.width = i + "px";
                    overviewDiv.style.height = i + "px";
                }
                this.src = gisPath + 'img/mapImage/eyeopen.gif';
                this.title = 'open';
            }
            else {
                for (i = 0; i <= 120; i++) {
                    overviewDiv.style.width = i + "px";
                    overviewDiv.style.height = i + "px";
                }
                this.src = gisPath + 'img/mapImage/eyeclose.gif';
                this.title = 'close';
            }
        }
        overviewDiv.appendChild(img);
        overviewMap = new GIS.map("eyeDiv");
        overviewMap.disabled();
        overviewMap.setCenter(Public['Lon'], Public['Lat']);
        var eyeLevel = levelOfDetail < 6 ? 1 : (levelOfDetail - 4);
        overviewMap.reMap(eyeLevel);
    };

    /*line note: chrome 第7層 以上線顯示不出來:已修正,且效率效果好*/
    self.line = function (line_options) {
        // line options.
        var _line = {
            path: 0,
            color: '0000FF'
        }
        for (var i in line_options) {
            if (line_options[i] !== undefined) {
                _line[i] = line_options[i];
            }
        }
        lineArray.push(_line);
        self.canvas(_line);
    }

    self.reLine = function () {
        lineDiv.innerHTML = '';
        for (var i = 0; i < lineArray.length; i++) {
            self.canvas(lineArray[i]);
        }
    }

    self.canvas = function (_line) {
        var array = _line.path;
        var color = _line.color.replace('#', '');
        var xArray = [], yArray = [], xyArray = [];
        for (var i = array.length - 1; i > -1; i--) {
            var XY = self.getXY(array[i][0], array[i][1]);
            xyArray.push([XY.X, XY.Y]);
            xArray.push(XY.X);
            yArray.push(XY.Y);
        }
        // console.log('xArray',xArray)
        xArray.sort();
        yArray.sort();
        var Lat_min = yArray[0], //latArray[0],
            Lat_max = yArray[yArray.length - 1],//latArray[latArray.length - 1],
            Lon_min = xArray[0], // lonArray[0],
            Lon_max = xArray[xArray.length - 1]; //lonArray[lonArray.length - 1];

        //var XY = self.getXY(Lon_min, Lat_max);
        //var XY2 = self.getXY(Lon_max, Lat_min);
        //console.log(Lat_max, Lat_min);
        var H = Math.abs(Lat_max - Lat_min),
            W = Math.abs(Lon_max - Lon_min),
            T = Lat_min,
            L = Lon_min;
        var lineWidth = 4;
        
        var c = doc.createElement('canvas');
        c.style.position = "absolute";  //relative
        c.style.Zindex = 1000;
        c.style.top = T+dragOffset.PY + "px";
        c.style.left = L+dragOffset.PX + "px";
        c.setAttribute('width', W > 2010 ? 2500 : W);
        c.setAttribute('height', H > 2010 ? 2500 : H);

        lineDiv.appendChild(c);

        c = c.getContext ? c : win.G_vmlCanvasManager.initElement(c);

        //color
        canvasArray.push(c); //alert(ctx.strokeStyle); fillStyle
        let ctx = c.getContext("2d"); //ctx.beginPath() //clear

        ctx.beginPath();
        ctx.fillStyle = "rgba(" + parseInt((color[0] + color[1]), 16) + "," + parseInt((color[2] + color[3]), 16) + "," + parseInt((color[4] + color[5]), 16) + ",0.2)";
        ctx.strokeStyle = "rgba(" + parseInt((color[0] + color[1]), 16) + "," + parseInt((color[2] + color[3]), 16) + "," + parseInt((color[4] + color[5]), 16) + ",0.5)";
        ctx.lineWidth = lineWidth;

        //ctx.scale(levelOfDetail,levelOfDetail);   //放大/縮小
        //ctx.translate(10,10);  //移動
        //canvas畫布超過2010處理(demo)
        var offset = 500; //向上與向左偏移500px
        //Rate=Math.pow(2, levelOfDetail-olevelOfDetail);
        if (W > 2010 || H > 2010) {
            var bound = self.getTileBound();
            var center = self.getTileCenter();
            c.style.left = bound.Xleft * 256 - offset + "px";
            c.style.top = bound.Ytop * 256 - offset + "px";
            ctx.translate(L - bound.Xleft * 256 + offset, T - bound.Ytop * 256 + offset);
        }
        var i = xyArray.length - 1;
        ctx.moveTo(xyArray[i][0] - L, xyArray[i][1] - T);
        for (i = xyArray.length - 2; i > -1; i--) {
            ctx.lineTo(xyArray[i][0] - L, xyArray[i][1] - T);
        }
        //ctx.scale(2, 2);
        ctx.stroke();
        ctx.closePath();
        //ctx.fill();
        return c;

    };

    self.canvasClick = function () {
        c.onclick = function () {
            var c1 = doc.createElement('canvas');
            c1.style.position = "absolute";  //relative
            c1.style.top = options['top'] - 50 + "px";    //c.setAttribute('top',options['top']);
            c1.style.left = options['left'] + "px";    //c.setAttribute('left',options['left']);
            lineDiv.appendChild(c1);
            var div = doc.createElement('div');
            div.innerHTML = '123';
            c1.appendChild(div);
            if (GIS.BrowserType['MSIE'] == true) {
                c1 = win.G_vmlCanvasManager.initElement(c1);
            }
            ctx1 = c1.getContext("2d");
            ctx1.beginPath();
            ctx1.fillStyle = "rgba(255,255,255,1)";
            ctx1.strokeStyle = "rgba(0,0,0,1)"; //options['Color'];
            ctx1.moveTo(75, 25);
            ctx1.quadraticCurveTo(25, 25, 25, 62.5);
            ctx1.quadraticCurveTo(25, 100, 50, 100);
            ctx1.quadraticCurveTo(50, 120, 30, 125);
            ctx1.quadraticCurveTo(60, 120, 65, 100);
            ctx1.quadraticCurveTo(125, 100, 125, 62.5);
            ctx1.quadraticCurveTo(125, 25, 75, 25);
            ctx1.stroke();
            ctx1.closePath();
            ctx1.fill();
        };
    }

    /*Paste points(貼點)*/
    self.mark = function (lon, lat, imgSrc, type) {//lon:x,lat:y
        //if (!lon || !lat ) return;
        var markSelf = this;
        var XY = self.getXY(lon, lat);
        var img_top = XY.Y;
        var img_left = XY.X;
        var img;
        
        if(imgSrc){
            img = doc.createElement('img'); //var img = new Image();
            img.src = imgSrc;
            img.style.position = 'absolute';
            img.style.border = '0px';
            img.style.padding = '0px';
            img.style.margin = '0px';
            img.setAttribute('type', type);
            img.style.top = img_top - img.height + 'px';
            img.style.left = img_left - img.width / 2 + 'px';
            //使chrome 吃到img width/height
            img.onload = function () {
                img.style.top = img_top - img.height + 'px';
                img.style.left = img_left - img.width / 2 + 'px';
            };
        }else{
            img = doc.createElement('div');
            img.style.width = '25px';
            img.style.height = '25px';
            img.style.backgroundColor = '#0000FF';
            img.style.borderRadius = '25px';
            img.style.position = 'absolute';
            img.style.border = '0px';
            img.style.padding = '0px';
            img.style.margin = '0px';
            img.setAttribute('type', type);
            
            //console.log('>>',img_top+dragOffset.PY,img_left+dragOffset.PX)
            img.style.top = img_top+dragOffset.PY - 30 + 'px';
            img.style.left = img_left+dragOffset.PX - 30 / 2 + 'px';
        }
       
        img.onmouseover = function () { dragStatus = ''; this.style.cursor = "pointer"; } //new
        img.onmousedown = function (e) { dragStatus = ''; }
        img.onmouseout = function () { dragStatus = 'global'; this.style.cursor = "pointer"; } //new
        markDiv.appendChild(img);

        var format = { lat: lat, lon: lon,src:imgSrc, type:type, ImgObj: img };
        markArray.push(format);
        //makeDraggable(img);
        //dragT(img);

        //img
        markSelf.img = function () {
            return img;
        }
        //label
        markSelf.label = function (title) {//new
            var div = doc.createElement('div');
            div.style.position = 'absolute';
            div.style.color = '#000000';
            div.innerHTML = title;
            div.style.top = img_tilep /*- img.height*/ + 'px';
            div.style.left = img_left /*+ img.width */ + 'px';
            labelDiv.appendChild(div);
            var divArray = labelDiv.getElementsByTagName('div');
            var tmp = '150px';
            div.onclick = function () {
                tmp = divArray[0].style.width == '150px' ? '10px' : '150px'
                for (var i = 0; i < divArray.length; i++) {
                    divArray[i].style.width = tmp;
                }
            }

        }
        markSelf.o = img;
        markSelf.labelDiv = function () {
            //alert(labelDiv);
            return labelDiv;
        }
        //number
        markSelf.number = function (title) {//new
            var div1 = doc.createElement('div');
            div1.style.position = 'absolute';
            //div1.innerHTML = '<span>' + title + '</span>';
            div1.innerHTML = title;
            div1.style.color = '#ffffff';
            div1.style.border = '0px';
            div1.style.borderWidth = '5px';
            div1.style.padding = '0px';
            div1.style.width = '30px'; //tmp 
            div1.style.height = '30px'; //tmp 
            div1.setAttribute('align', 'center');
            //div1.style.textAlign = 'center';
            //tmp
            div1.style.lineHeight = '30px'; //tmp 
            div1.style.top = img_tilep - 30/*imgs.height*/ + 'px';
            div1.style.left = img_left - 30/*imgs.width*/ / 2 + 'px';
            markDiv.appendChild(div1);

            div1.onclick = function () {
                img.click();
            }
            /*div1.onmouseover = function() {
            img.click(); 
            }*/
            return div1;
        }

        return markSelf; //return img;
    };

    self.remark = function (rate) {
        markDiv.innerHTML = '';
        for (var i = 0; i < lineArray.length; i++) {
            var poi = markArray[i];
            self.mark(poi.lon,poi.lat,poi.img,poi.type);
        }
        
        /*var marks = markDiv.getElementsByTagName('img'); //.childNodes;
        var marks1 = markDiv.getElementsByTagName('div'); //.childNodes;
        var marks2 = labelDiv.getElementsByTagName('div'); //.childNodes;
        var win = winDiv.getElementsByClassName('win'); //.childNodes;
        for (var i = marks.length - 1; i > -1; i--) {
            marks[i].style.top = (parseFloat(marks[i].style.top, 10) + marks[i].offsetHeight) * rate - marks[i].offsetHeight + 'px';
            marks[i].style.left = (parseFloat(marks[i].style.left, 10) + marks[i].offsetWidth / 2) * rate - marks[i].offsetWidth / 2 + 'px';
        }
        for (var i = marks1.length - 1; i > -1; i--) {
            marks1[i].style.top = marks1[i].style.top;
            marks1[i].style.left = marks1[i].style.left;
        }
        for (var i = marks2.length - 1; i > -1; i--) {
            marks2[i].style.top = parseFloat(marks[i].style.top, 10) - 0 + marks[i].offsetHeight + 'px';
            marks2[i].style.left = parseFloat(marks[i].style.left, 10) - 0 + marks[i].offsetWidth / 2 + 'px';
        }

        for (var i = win.length - 1; i > -1; i--) {
            //console.log(win[i].offsetHeight);
            win[i].style.top = (parseFloat(win[i].style.top, 10) + win[i].offsetHeight) * rate - win[i].offsetHeight + 'px';
            win[i].style.left = (parseFloat(win[i].style.left, 10) + win[i].offsetWidth / 2) * rate - win[i].offsetWidth / 2 + 'px';
        }*/
    }

    self.reWindow = function (rate) {

    }

    /*滾輪功能:放大縮小*/
    self.mousewheel = function () {
        var evnt, fun;
        if (GIS.BrowserType['Firefox']) {
            evnt = 'DOMMouseScroll';
            fun = function (ev) { return -ev.detail / 120; };
        } else {
            evnt = 'mousewheel';
            fun = function (ev) { return ev.wheelDelta / 120; };
        }
        draggable.on(evnt, function (ev) {//viewport
            ev.preventDefault&&ev.preventDefault();
            var delta = fun(ev);
            var status = delta > 0 ? 'add' : 'sub';
            var level = status == 'add' ? levelOfDetail + 1 : levelOfDetail - 1; //tmp
            if (level > 18 || level < 1) return; //tmp (bug)

            var p = zoomCenter(ev, status);
            console.log(p.x, p.y)
            self.reMap(status, p.x, p.y);
            return false; //當設定回傳false,使用地圖滾輪放大不會觸發瀏覽器的滾輪    
        }, false);

    };

    /*map click listen*/
    self.clickListen = function (fun) {
        mapDiv.onmousedown = function (ev) {
            ev = ev || win.event; //if (!ev) e = window.event;right
            if (ev.button == 2) {
                var Pos = mouseCoords(ev);
                var PX = Pos.x - parseInt(draggable.style.left, 10) - mapBody.offsetLeft;
                var PY = Pos.y - parseInt(draggable.style.top, 10) - mapBody.offsetTop;
                var LatLon = self.getLatLon(PX / 256, PY / 256);

                fun(LatLon);

            }
            return false;
        }
        return mapDiv;
    };

    /*clear map*/
    self.remove = function (o) {
        o.parentNode.removeChild(o);
    };
    self.clear = function () {
        lineDiv.innerHTML = ""; //線圖層
        markDiv.innerHTML = ""; //圖層
        labelDiv.innerHTML = ""; //線圖層
        winDiv.innerHTML = ""; //圖層
        lineArray = [], markArray = [], canvasArray = []; lineColor = [];
    };
    self.claerLine = function () {
        lineDiv.innerHTML = ""; //線圖層
        lineArray = [];
    }
    self.clearMark = function (type) {
        var marks = markDiv.getElementsByTagName('img'); //.childNodes;
        for (i = 0; i < marks.length; i++) {
            if (marks[i].getAttribute('type') == type) {
                markDiv.removeChild(marks[i]);
                i--;
            }
        }
        //labelDiv.innerHTML = ""; //label圖層
        winDiv.innerHTML = ""; //圖層
    };
    self.clearWin = function () {
        winDiv.innerHTML = ""; //線圖層
    };

    /*listen*/
    self.listen = function (obj, event, fun) {
        switch (event) {
            case 'click':
                obj.onclick = function () {
                    //var left= obj.style.left;
                    //var top= obj.style.top;
                    fun(obj);
                };
                break;
            case 'rightclick':
                obj.onmousedown = function (ev) {
                    ev = ev || win.event;

                    if (ev.button == 2) {
                        var Pos = mouseCoords(ev);
                        var PX = Pos.x - draggable.style.left.replace('px', '') - mapBody.offsetLeft;
                        var PY = Pos.y - draggable.style.top.replace('px', '') - mapBody.offsetTop;
                        var LatLon = self.getLatLon(PX / 256, PY / 256);
                        fun(ev, LatLon);
                    }
                }
                break;
            case 'mouseover':
                obj.onmouseover = function (ev) {
                    fun(obj);
                }
                break;
            case 'mouseout':
                obj.onmouseout = function (ev) {
                    fun(obj);
                }
                break;
            default:
                break;
        }
    };
    /*infowindow*/
    self.InfoWindow = function (tile_options) {
        var win = this;
        // init options.
        var init = {
            lmkId: '',
            content: ''
        };
        // set new options.
        for (var i in tile_options) {
            if (tile_options[i] !== undefined) {
                init[i] = tile_options[i];
            }
        }
        //var img_tilep = Math.abs(lat - mapLat.Top) / (mapLat.Range) * levelRate;
        //var img_left = Math.abs(lon - mapLon.Left) / (mapLon.Range) * levelRate;
        var div = d.c('div');
        self.Window = div;
        //div.style.pointerEvents = 'none';
        //div.setAttribute('id', 'ttt');
        div.style.position = 'absolute'
        div.style.display = 'none';
        //div.style.width = 150 + 'px';
        //div.style.height = 100 + 'px';
        div.style.borderStyle = 'solid';
        div.style.backgroundColor = '#FFFFFF';
        div.style.borderWidth = '1px';
        div.style.borderColor = '#000000';
        div.style.color = '#000000';
        div.className = 'win'; //div.className('class', 'win');
        div.onmousedown = function (ev) {//winDiv
            ev = ev || win.event; //if (!ev) e = window.event;
            if (ev.stopPropagation)
            { ev.stopPropagation(); }
            else
            { ev.cancelBubble = true; }
            ev.returnValue = false;
        }
        /*div.onmousemove = function(ev) {//winDiv
        ev = ev || window.event; //if (!ev) e = window.event;
        if (ev.stopPropagation)
        { ev.stopPropagation(); }
        else
        { ev.cancelBubble = true; }
        ev.returnValue = false;
        }*/
        //div.oncontextmenu = function() {            return; }
        winDiv.appendChild(div);
        var div1 = doc.createElement('div');
        div1.style.position = 'absolute'
        div1.style.display = 'none';
        div1.getAttribute('class', 'window');
        //div1.className = 'window';
        //div1.style.width = 150 + 'px';
        //div1.style.height = 100 + 'px';
        //winDiv.appendChild(div1);
        return {
            open: function (markPOI) {
                //win.close(markPOI); //tmp
                div.style.display = '';
                if (markPOI == '') {//tmp
                    var poi = self.getTileCenter(); //console.log(poi);
                    //console.log(div);
                    div.style.top = parseInt(poi.Y * 256, 10) - div.clientHeight + 'px';
                    div.style.left = parseInt(poi.X * 256, 10) - div.clientWidth / 2 + 'px';
                } else {
                    div.style.top = parseInt(markPOI.style.top, 10) /*- markPOI.clientHeight*/ - div.clientHeight /*- 37*/ + 'px';
                    div.style.left = parseInt(markPOI.style.left, 10) - div.clientWidth / 2 + markPOI.clientWidth / 2 + 'px';
                    win.POI = markPOI;
                    windowPOI = markPOI;
                }
                //div1.style.display = '';
                //div1.style.top = markPOI.style.top.replace('px', '') - /*markPOI.clientHeight -*/div1.clientHeight + 'px';
                //div1.style.left = markPOI.style.left.replace('px', '') + 'px';

            },
            close: function (markPOI) {
                div.style.display = 'none';
                div1.style.display = 'none';
            },
            setContent: function (html) {
                //clear
                div.innerHTML = '';
                //Content
                var ContentDiv = doc.createElement('div');
                //ContentDiv.style.margin = '5px 15px 5px 5px';
                //ContentDiv.style.width = '110%';
                ContentDiv.innerHTML = '<nobr>' + html + '</nobr>';
                div.appendChild(ContentDiv);
                //close (x)
                var closeDiv = doc.createElement('div');
                closeDiv.style.position = 'absolute';
                closeDiv.style.right = '5px';
                closeDiv.style.top = '5px';
                //closeDiv.innerHTML = 'x';
                closeDiv.getAttribute('class', 'close');
                closeDiv.className = 'close';
                closeDiv.style.cursor = 'pointer';
                closeDiv.onclick = function () {
                    //div.innerHTML = '';
                    div.style.display = 'none';
                    div1.style.display = 'none';
                };
                div.appendChild(closeDiv);
                //div.appendChild(div1);
                //div.style.top = parseInt(win.POI.style.top, 10) /*- win.POI.clientHeight*/ - div.clientHeight /*- 37*/ + 'px';
                //div.style.left = parseInt(win.POI.style.left, 10) - div.clientWidth / 2 + win.POI.clientWidth / 2 + 'px';

                //div1.style.display = '';
                //div1.style.top = win.POI.style.top.replace('px', '') - /*markPOI.clientHeight -*/div1.clientHeight + 'px';
                //div1.style.left = win.POI.style.left.replace('px', '') + 'px';
            }
        };
        //return win;
    }
    /*circle canvas(具有座標轉換)*/
    self.circle = function (ev, radius) {
        //點擊地圖產生的經緯度位置
        var Pos = mouseCoords(ev);
        if (GIS.BrowserType['Firefox']) {
            var PX = Pos.x - parseInt(draggable.style.left, 10) - mapBody.offsetLeft;
            var PY = Pos.y - parseInt(draggable.style.top, 10) - mapBody.offsetTop;
        } else {
            var PX = Pos.x - parseInt(draggable.style.left, 10) - mapBody.offsetLeft + doc.documentElement.scrollLeft;
            var PY = Pos.y - parseInt(draggable.style.top, 10) - mapBody.offsetTop + doc.documentElement.scrollTop;
        }
        var LatLon = self.getLatLon(PX / 256, PY / 256);
        canvasCircle = { Lat: LatLon.Lat, Lon: LatLon.Lon, Radius: radius };
        radius = radius * 0.009 / mapDistance * levelRate * 256 - 0;
        //mapDistance
        //------------
        var cc = doc.createElement('Canvas');
        //var c=document.getElementById("myCanvas");
        cc.style.position = "absolute";  //relative
        cc.style.top = PY - radius + "px";    //c.setAttribute('top',options['top']);
        cc.style.left = PX - radius + "px";    //c.setAttribute('left',options['left']);
        cc.setAttribute('width', radius * 3);
        cc.setAttribute('height', radius * 3);
        lineDiv.appendChild(cc);
        if (GIS.BrowserType['MSIE'] == true) {
            cc = win.G_vmlCanvasManager.initElement(cc);
        }

        var circle = cc.getContext("2d");
        circle.beginPath();
        circle.fillStyle = "rgba(0,0,255,0.2)";
        circle.arc(radius + 2, radius + 2, radius, 0, Math.PI * 2, true); //centerX, centerY, radius, startingAngle, endingAngle, counterclockwise
        circle.lineWidth = 4;
        circle.strokeStyle = "rgba(0,0,255,0.9)"; //options['Color'];
        circle.stroke();
        circle.lineCap = 'square';
        circle.fill();
        circle.closePath();
        return LatLon;
    }
    /*remap circle*/
    self.remapCircle = function (Rate/*dataArray*/) {
        var ctx = canvasArray[0];
        ctx.scale(Rate, Rate);
        ctx.lineWidth = options['lineWidth'] * 1 / Rate;
    }
    //事件
    var tmpXY ={x:256,y:256}
    var zoomCenter = function (ev, s) {//平均滑鼠位置與地圖中心點為新的中心點
        //get left /top
        var aGetElementsPagePosition = function (e) {
            var left = e.offsetLeft;
            var top = e.offsetTop;
            while (e = e.offsetParent) {//e.offsetParent
                left += e.offsetLeft;
                top += e.offsetTop;
            } //top += e.offsetTop;
            return { offsetLeft: left, offsetTop: top };
        }

        var isMap = aGetElementsPagePosition(mapBody);
        var mouse = getMouseOffset(draggable, ev);

        var x = mouse.x - isMap.offsetLeft - dragOffset.PX;
        var y = mouse.y - isMap.offsetTop - dragOffset.PY;
        //console.log('mouse',mouse.x - isMap.offsetLeft,mouse.y - isMap.offsetTop)
       
        var center = self.getTileCenter();
        tmpXY.x = mouse.x - isMap.offsetLeft;
        tmpXY.y = mouse.y - isMap.offsetTop;
        //tmpXY.x =(center.X+mouse.x - isMap.offsetLeft*2)/2;
        //tmpXY.y =(center.Y+mouse.y - isMap.offsetTop*2)/2;
        //console.log('tmpXY',tmpXY)
        //        var oldRes = levelOfDetail
        //        var newRes = s == 'sub' ? levelOfDetail - 1 : levelOfDetail + 1;
        //        return { x: (oldRes * x/256 - newRes * center.X) / (oldRes - newRes),
        //            y: (oldRes * y/256 - newRes * center.Y) / (oldRes - newRes)
        //        };

        return s == 'sub' ? { x: 2 * center.X - x / 256, y: 2 * center.Y - y / 256} : { x: (center.X - 0 + x / 256) / 2, y: (center.Y - 0 + y / 256) / 2 };
        //return { x: (center.X - 0 + x / 256) / 2, y: (center.Y - 0 + y / 256) / 2 };
    }

    //    GIS.event.add(draggable, 'dblclick', function (ev) {
    //        var p = zoomCenter(ev, 'add');
    //        self.reMap('add', p.x, p.y);
    //    });
    draggable.on('dblclick', function (ev) {
        var p = zoomCenter(ev, 'add');
        self.reMap('add', p.x, p.y);

    }, false);
    // Handle resize of window.
    win.onresize = function () {
        //update_containment();
    };
    doc.oncontextmenu = function (ev) {
        ev = ev || win.event;
        if (ev.preventDefault) {
            ev.preventDefault();
        } else {
            ev.returnValue = false;
        }
        return false;
    }
    /*拖曳 div:'draggable'移動功能*****************************************/
    var dragObject = null;
    var mouseOffset = null;
    //滑鼠在地圖的偏移=滑鼠座標-地圖原點偏移
    function getMouseOffset(target, ev) { //(getMouseOffset) =(getPosition)+(mouseCoords)
        ev = ev || win.event;
        var objPos = drag.get(target);
        var mousePos = mouseCoords(ev);
        // console.log('objPos',objPos)
        // console.log('mousePos',mousePos)
        return { x: mousePos.x - objPos.PX, y: mousePos.y - objPos.PY };
    }

    function mouseCoords(ev) { //(mouseCoords)
        if (ev.pageX || ev.pageY) {
            return { x: ev.pageX, y: ev.pageY };
        }
        return {
            x: ev.clientX || ev.touches[0].clientX, //+ document.body.scrollLeft - document.body.clientLeft,
            y: ev.clientY || ev.touches[0].clientY//,+ document.body.scrollTop - document.body.clientTop
        };
    }
    //    var drag = {
    //        set: function (obj, x, y) {
    //            obj.style.top = x + "px";
    //            obj.style.left = y + "px";
    //            obj.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px) scale(1)';
    //        },
    //        get: function (obj) {
    //            var p = obj.style.webkitTransform.split('(')[1].split(')')[0].split(',');
    //            p={PX:p[0],PY:p[1]};
    //            var p = { PX: obj.offsetLeft, PY: obj.offsetTop };
    //            var p = {PX:obj.style.left, PY:obj.style.top};
    //            return p;
    //        }
    //    };
    var drag = {
        set: function (obj, x, y) {
            obj.style.top = x + "px";
            obj.style.left = y + "px";
            //obj.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px) scale(1)';
        },
        get: function (obj) {
            //var p = obj.style.webkitTransform.split('(')[1].split(')')[0].split(',');
            //p={PX:p[0],PY:p[1]};
            var p = { PX: obj.offsetLeft, PY: obj.offsetTop };
            //var p = {PX:obj.style.left, PY:obj.style.top};
            return p;
        }
    };

    var totalX = 0, totalY = 0, tempX = 0, tempY = 0;
    function makeDraggable(obj) { //(makeDraggable)=(getMouseOffset)+(mouseCoords)

        if (!obj) return;
        var mousedown = function (ev) {
            // ev.preventDefault()
            // ev.stopPropagation()

            if (ev.button == 2) { return false }; //防右鍵
            // console.log('ev.touches',ev)
            obj.style.cursor = "move";
            //obj.addEventListener('mousemove', mousemove, true);
            //if (dragStatus != 'global') return;
            if (obj.addEventListener || obj.attachEvent) {
                var ele = d.o(obj.ownerDocument);
                //ele.on('mouseup', mouseup, true);
                //ele.on('mousemove', mousemove, true);
                ele.addEventListener('mouseup', mouseup, true);
                ele.addEventListener('mousemove', mousemove, true);
                // ele.addEventListener('touchstart', mouseup, true);
                // ele.addEventListener('touchmove', mousemove, true);
            }
            else
                obj.setCapture();

            dragObject = obj;
            mouseOffset = getMouseOffset(obj, ev);
            // console.log('mouseOffset',mouseOffset)
            var mousePos = mouseCoords(ev); //canvas tmp
            tempX = mousePos.x + totalX; //canvas tmp
            tempY = mousePos.y + totalY; //canvas tmp
            // console.log('mouseCoords',mousePos)

            return false;
        }
        obj.on('mousedown', mousedown);
        obj.on('touchstart', mousedown,{ passive: false });
        var mousemove = function (ev) {
            //console.log('move');
            //if (dragStatus != 'global') return;
            // ev.preventDefault()
            // ev.stopPropagation()
            var mousePos = mouseCoords(ev);
            if (dragObject) {
                var x = mousePos.x - mouseOffset.x,
                    y = mousePos.y - mouseOffset.y;

                drag.set(dragObject, y, x);
                update_tiles(); //地圖更新
                var eventOffset = 500;
                totalX = tempX - mousePos.x;
                totalY = tempY - mousePos.y;

                if (Math.abs(totalX) > eventOffset || Math.abs(totalY) > eventOffset) {
                    tempX = mousePos.x;
                    tempY = mousePos.y;
                    totalX = 0;
                    totalY = 0;
                    var canvasA = d.g.tag('canvas');
                    for (i = 0; i < canvasA.length; i++) {
                        var canvas = canvasA[i];
                        if (canvas.getAttribute('width') > 2010 || canvas.getAttribute('height') > 2010) {
                            self.reLine(); //tmp: re all line
                        }
                    }

                }
                //overviewMap 同步設定中心點
                action.overview();
                //canvas bound                    
                Rate = 1;
                var eventOffset = 1500;
                //var Pos = mouseCoords(ev);
                return false;
            }
            return;

        }
        obj.on('mousemove', mousemove);
        obj.on('touchmove', mousemove,{ passive: false });

        var mouseup = function (ev) {
            // ev.preventDefault()
            // ev.stopPropagation()
            //if (ev.button == 2) { return false }; //防右鍵
            //if (dragStatus != 'global') return;
            dragObject = null;
            obj.style.cursor = "default";
            //obj.removeEventListener('mousemove', mousemove, true);
            if (obj.addEventListener || obj.attachEvent) {
                var ele = d.o(obj.ownerDocument);
                //ele.off('mouseup', mouseup, true);
                //ele.off('mousemove', mousemove, true);
                ele.removeEventListener('mouseup', mouseup, true);
                ele.removeEventListener('mousemove', mousemove, true);
                // ele.removeEventListener('touchend', mouseup, true);
                // ele.removeEventListener('touchmove', mousemove, true);
            }
            else
                obj.releaseCapture();
            return;
        }
        obj.on('mouseup', mouseup);
        obj.on('touchend', mouseup,{ passive: false });

        var click = function (ev) {
            //螢幕座標轉換
            //ev = ev || window.event; //if (!ev) e = window.event;
        }
        obj.on('click', click);
        var mouseover = function (ev) {
            // ev.preventDefault()
            // ev.stopPropagation()

            if (GIS.BrowserType['Firefox']) {
                ev.preventDefault();
            }
            return;
        }
        obj.on('mouseover', mouseover); //tmp
        return obj;
    }

};
/*事件*/
GIS.event = {
    add: function (obj, instruction, fun) {
        d.o(obj.o || obj).on(instruction, fun);
    },
    remove: function (obj, instruction, fun) {
    }
};
/*地圖工具*/
GIS.tool = {
    cross: function () {
        var imgName = GIS.path + 'img/mapImage/new/a';
        //var table = doc.createElement('table');
        var div = doc.createElement('div');
        var max = 18,min =1; 
        //var ber_img = ['add', 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 'sub'];
        var ber = ['add'];
        var ber_text = ['+'];
        for(var i=max;i>=min;i--){
            ber.push(i);
            ber_text.push(i);
        }
        ber.push('sub');
        ber_text.push('-');
        //var ber_title = ['放大', '第10層', '第9層', '第8層', '第7層', '第6層', '第5層', '第4層', '第3層', '第2層', '第1層', '縮小'];
        //table.setAttribute('cellpadding', '0');
        //table.setAttribute('cellspacing', '0');
        //cross
        var now_ber = null; //目前放大層級 
        var obj_ber = []; //放大層級物件
        var self = this;
        var mouseout_color ={bg:'#ffffff',font:'#303133'};
        var mouseeover_color ={bg:'#303133',font:'#ffffff'};
        for (var i = 0; i < ber.length; i++) {
            var row= doc.createElement('button');
            row.setAttribute('ber', ber[i]);
            row.style.width = '30px';
            row.style.height = '20px';
            row.align = 'center';
            row.innerHTML = ber_text[i];
            row.style.backgroundColor = mouseout_color.bg;
            row.style.color = mouseout_color.font;
            row.onclick = function () {//改變地圖層級
                self.clickFun(this.getAttribute('ber')); //do 1.self.reMap(this.getAttribute('ber')); ===>2.call this.set(level);
            };
            row.onmouseout = function () {
                if (now_ber == this) return;
                this.style.backgroundColor = mouseout_color.bg;
                this.style.color = mouseout_color.font;
            };
            row.onmouseover = function () {
                this.style.backgroundColor = mouseeover_color.bg;
                this.style.color = mouseeover_color.font;
            };
            obj_ber.push(row);
            div.appendChild(row);
        }
        return {
            o: div,
            type: 'cross',
            set: function (level) {
                var index = ber.indexOf(parseInt(level, 10));
                var obj = obj_ber[index];
                now_ber = obj;
                obj_ber.forEach(function(o){
                    o.onmouseout()
                });
                now_ber.onmouseover()
            },
            click: function (fn) { self.clickFun = fn; }
        };
    },
    overview: function () {
        var gisPath = GIS.path;
        //var fragment = document.createDocumentFragment();
        var divf = d.c('div');
        divf.style.position = 'absolute';
        divf.style.bottom = 0 + "px";
        divf.style.right = 0 + "px";
        divf.style.width = 120 + "px";
        divf.style.height = 120 + "px";
        //divf.style.Zindex = 10000;
        divf.style.borderWidth = '1px';
        divf.style.borderColor = 'black';
        divf.style.backgroundColor = 'white';
        divf.style.borderStyle = 'inset';
        divf.style.borderImage = 'initial';
        divf.style.overflow = 'hidden';
        //divf.style.zIndex = '10';
        // border-color: initial;
        var div = d.c('div');
        //div.id = 'eyeDiv';
        //div.style.position='relative'; //relative
        //div.style.margin=5+'px';
        div.style.top = 5 + "px";
        div.style.left = 5 + "px";
        div.style.width = 111 + "px";
        div.style.height = 111 + "px";
        div.style.backgroundColor = '#4B94BF';
        divf.style.zIndex = '1';
        divf.appendChild(div);

        var control = d.c('div');
        control.style.zIndex = '2';
        control.innerHTML = '-';
        control.align = 'center';
        control.style.position = 'absolute';
        //control.src = gisPath + 'img/mapImage/eyeclose.gif';
        control.title = 'close';
        control.style.bottom = 0 + "px";
        control.style.right = 0 + "px";
        control.style.width = 15 + "px";
        control.style.height = 15 + "px";
        control.style.color = '#000000';
        control.style.backgroundColor = '#ffffff';
        control.style.lineHeight='15px';
        control.style.border = '1px solid rgb(0, 0, 0)';
        control.onclick = function () {
            if (this.title == 'close') {
                for (i = 120; i >= 15; i--) {
                    divf.style.width = i + "px";
                    divf.style.height = i + "px";
                }
                //this.src = gisPath + 'img/mapImage/eyeopen.gif';
                this.innerHTML = '+';
                this.title = 'open';
            }
            else {
                for (i = 0; i <= 120; i++) {
                    divf.style.width = i + "px";
                    divf.style.height = i + "px";
                }
                //this.src = gisPath + 'img/mapImage/eyeclose.gif';
                this.innerHTML = '-';
                this.title = 'close';
            }
        }
        divf.appendChild(control);
        return {
            o: divf,
            type: 'overview'
        }
    }

};

})(document, window);

export default GIS
/*new toolDiv*/
//GIS.map.prototype.addTools = function (html) {
//    var div = document.createElement('div');
//    div.innerHTML = html;
//    //div.style.position = 'absolute'; div.style.right = '0px';
//    div.style.width = '100%';
//    div.style.height = '100%';
//    this.display = function () {
//        if (labelDiv.style.display == '') labelDiv.style.display = 'none';
//        else labelDiv.style.display = '';
//    }
//    alert();
//    viewport.appendChild(div);
//    return this;
//};
