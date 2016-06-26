var __n = 1,
	__max = 1,
	__timeout = 1000 * 60 * 10;


var callback = function(data, id, currtPage){
	var _type = typeof data;
	if (_type !== 'string'){
		var _data = {};
		_data.total = data.total;
		_data.maxPage = data.maxPage;
		_data.currentPageNum = data.currentPageNum;
		_data.comments = [];
	}else{
		_data = JSON.parse(data);
		data = _data.data;
		var _time = _data.time;
		var time = new Date();
		time = time.getTime();
		if (time - _time > __timeout){
			localStorage.removeItem(id + '-' + data.currentPageNum);
			getData(_data.id, data.currentPageNum);
			return;
		}
		console.log(_data)
	}
	__max = data.maxPage;
	var _key = id + '-' + data.currentPageNum;

	for (i=0;i<data.comments.length;i++){
		var obj = data.comments[i];
		var content = obj.content;

		if (_type !== 'string'){
			var _obj = {};
			_data.comments.push(_obj);
			var _photos = [];
			_obj.content = content;
			_obj.photos = _photos;
		}

		for (p in obj.photos){
			p = obj.photos[p];
			if (_type !== 'string'){_photos.push({url: p.url});}
			addImg("https:" + p.url, content);
		}
	}

	if (_type !== 'string'){
		var time = new Date();
		time = time.getTime();
		_data = {
			id: id,
			time: time,
			data: _data,
		}
		localStorage.setItem(_key, JSON.stringify(_data));
	}
}

function addImg(src, content){
	content = content || "";
	var html = [];
	html.push('<div class="imgBox">');
	html.push('<a href="' + src.slice(0, -12) + '"class="fancybox" title="' + content + '">');
	html.push('<div class="img"><img src="' + src + '" alt="' + content + '"></div>');
	html.push('</a>');

	html.push('<a href="' + src.slice(0, -12) + '"class="fancybox">');
	html.push('<p>' + content + '</p>');
	html.push('</a>');
	html.push('</div>');
	$('.boxContainer').append(html.join("\n"));
}

 function getUrlParam(name) {
 	var reg = new RegExp("(^|&)" + name + "=(.*?)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null){return unescape(r[2]);}
    return null;
}

var getData = function(id, currtPage){
	currtPage = currtPage || __n;
	var localData = localStorage.getItem(id + "-" + currtPage);
	// var localData = null;
	if (localData){
	    callback(localData, id, currtPage);
		return;
	}

	var commentsAPI = "https://rate.taobao.com/feedRateList.htm";
	var data = {
		"rateType": 3,
		"auctionNumId": id,
		"currentPageNum": currtPage,
		"orderType": "feedbackdate"
	};

	$.ajax({
	    url: commentsAPI,
	    // The name of the callback parameter
	    // jsonpCallback: "callback",
	    // Tell jQuery we're expecting JSONP
	    dataType: "jsonp",
	    data: data,
	    success: function( response ) {
	        console.log( response );
	        callback(response, id, currtPage);
	    },
	    error: function(response){
	        console.log( response );
	    }
	});
}

$(document).ready(function() {
	// 41979357531
	var _id = getUrlParam('id');
	if (_id){getData(_id); }
	else{document.write("获取ID出错")};

	/* This is basic - uses default settings */
	$("a.fancybox").fancybox({
		padding: 0,
		beforeLoad: function(){
			this.title = $(this.element).find('img').attr('alt');
		}
	});

	//当内容滚动到底部时加载新的内容
	setTimeout(function(){
	$(window).scroll(function() {
		// $(document).scrollTop() //获取垂直滚动条到顶部的距离
		// $(document).height()//整个网页的高度
		// $(window).height()//浏览器窗口的高度
		var x = $(document).height() - $(window).height() - $(document).scrollTop();
		if (x <= 20 && __n <= __max){
			__n += 1;
			if (__n <= __max){getData(_id);}
		}
	});
	}, 300);
});