;(function (d, $) {

    var jQdm_horizontal_scroll;
  
    jQdm_horizontal_scroll = function(){
  
      // 初期設定
      var prop = {
        $window: $(window),
        contentContainer: '#contentContainer',
        columnContainer: '#columnContainer',
        columnContainerItem: '.column',
        columnMainContent: '.column_mainContent',
        vurtualContainer: 'body',
        transitionSpeed: 1000,
        transitionEasingDefault: 'easeOutQuint',
        transitionEasingJump: 'easeInOutQuint',
        mainNavigation: '#mainNavigation',
        dataPossessor: [],
        currentSelector: '.current',
        mode: {
          scroll: 1, 
          wheel: 1 
        },
        fitWindowWidthScale: true, 
        
        ua_query: { 
          mobile: 'iphone|ipad|ipod|android',
          ipod: 'ipod',
          mac: 'mac',
          windows: 'windows'
        }
      };
  
      function init(){
  
        var _$w = prop.$window,
        _$cn = $(prop.columnContainer),
        _$t = $(prop.columnContainerItem);
  
        
        _$w.on('load', function(){
          
          prop.mode.scroll = checkUserAgent('mobile') ? 1 : prop.mode.scroll;
          prop.mode.wheel = prop.mode.wheel == 0 ? 0 : checkUserAgent('mac') ? 2 : checkUserAgent('windows') ? 1 : prop.mode.wheel;
          if(prop.mode.scroll == 1) { 
            $('body').css('overflow','hidden');
          }
  
          if(checkUserAgent('mobile') || checkUserAgent('ipod')){
            $('*').removeClass('noSwipe');
          }
          
          fitWindowScale(_$t); 
          setTargetPosition(_$t); 
        });
        
        _$w.on('resize orientationchange', function(){
          setTimeout( function() {
            setTargetPosition(_$t);
            fitWindowScale(_$t);
            adjustScrollPosition(-10);
          }, 200);
        });
        
        _$w.on('resize scroll', function(e){
          preventDefault(e);
          setTargetPosition(_$t);
          if($('body').is(':animated')) {
            return;
          }
          adjustScrollPosition();
        });
  
        // スワイプイベント
        _$w.on('touchmove',function(e){
            preventDefault(e);
        });
        _$w.swipe({
          swipeLeft:function(ev, dir, dist, dur, fin) {
            adjustScrollPosition(dist, dist);
          },
          swipeRight:function(ev, dir, dist, dur, fin) {
            adjustScrollPosition(-dist, dist);
          }
        });

        // マウスホイールイベント
        _$w.on('mousewheel', function(e) {
          preventDefault(e);
          var _dur = e.deltaY, _spd = 100;
          switch(prop.mode.wheel){
            case 0:
              _dur = 0;
              break;
            case 1:
              _dur *= -150;
              _dur = _dur > 120 ? 120 : _dur < - 120 ? -120 : _dur + (( _dur < 0 ) ? -1 : 1) * 60;
              break;
            case 2:
              _dur = _dur * -2;
              _dur = _dur > 60 ? 60 : _dur < - 60 ? -60 : _dur + (( _dur < 0 ) ? -1 : 1) * 20;
              break;
            default:
          }
          adjustScrollPosition(_dur, _spd || Math.abs(_dur) * 2);
      });

      // ナビゲーションのクリックイベント
      $(prop.mainNavigation).find('a').on('click', function(e){
        preventDefault(e);
        // リンクの飛び先のキャッシュ
        var _href = $(this).attr('href'),
        _diff = 0;
        // リンク先へアニメーション遷移させる
        if(_href && $(_href).length > 0) {
          _diff = getColumnContainerInfo().left + parseInt($(_href).css('left'), 10);
          adjustScrollPosition(_diff, prop.transitionSpeed, prop.transitionEasingJump);
        }
      });

        // ナビゲーションのクリックイベント
        $(prop.mainNavigation).find('a').on('click', function(e){
          preventDefault(e);
          // リンクの飛び先のキャッシュ
          var _href = $(this).attr('href'),
          _diff = 0;
          // リンク先へアニメーション遷移させる
          if(_href && $(_href).length > 0) {
            _diff = getColumnContainerInfo().left + parseInt($(_href).css('left'), 10);
            adjustScrollPosition(_diff, prop.transitionSpeed, prop.transitionEasingJump);
          }
        });
        
        // カラム配置位置情報を間を置いて記憶領域にセットする
        setTimeout( function() {
          setTargetPostion(_$t);
        }, 200)
        
      }
      
      // ウィンドウのスクロール位置やスケールなどの情報を取得する
      function getWindowInfo(){
  
        return {
          obj: prop.$window,
          w: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
          h: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
        };
      }
  
      function getColumnContainerInfo(_val){
        var _$t = $(prop.columnContainer);
        return {
          obj: _$t,
          left: parseInt(_$t.css('left')),
          top: parseInt(_$t.css('top')),
          w: _$t.width(),
          maxpos: _$t.width() - getWindowInfo().w
        }
      }
  
      // 仮想コンテナの情報を取得する
      function getVurtualContainerInfo(_val){
        var _$vc = $(prop.vurtualContainer),
        _win = getWindowInfo(),
        _res = _val ? _$vc.height(_val) : _$vc.height();
        return {
          obj: _$vc,
          h: _res,
          top: _$vc.scrollTop(),
          maxpos: _res - _win.h + _win.w * _$vc.height() / $(prop.columnContainer).width(),
          ratio: _$vc.height() / $(prop.columnContainer).width()
        };
      }
      
      // 要素をウィンドウワイズにあわせる
      function fitWindowScale(_$t){
        var _win = getWindowInfo();
        _$cn = $(prop.columnContainer),
        _pos = { x: 0, y: 0};
  
        _$t.each(function(){
          
          $(this).css({
            left: _pos.x,
            width: prop.fitWindowWidthScale ? _win.w : $(this).width(),
            height: _win.h
          });
  
          _pos.x += $(this).width(); 
          _pos.y += $(this).height(); 
        });
  
        _$cn.width(_pos.x); 
        getVurtualContainerInfo(_pos.y);
  
      }
      
      function adjustScrollPosition(_diff, _dur, _ease){
          var _cn = getColumnContainerInfo(), 
          _win = getWindowInfo(), 
          _vc = getVurtualContainerInfo(), 
          _destX = _cn.left, 
          _destY = 0; 
  
          if(prop.mode.scroll == 0) { 
  
            if(_diff == undefined) {

              _destY = _vc.top;
            } else {
              _diff *= _vc.ratio; 
              
              _destY = _vc.top  + _diff;
            }
  
            _destY = _destY <= 0 ? 0 : _destY >= _vc.maxpos ? _vc.maxpos : _destY;
            _destX = -_destY / _vc.ratio; 
  
          } else {
            _destX -= _diff;
          }
  
          _destX = _destX >= 0 ? 0 : _destX <= -_cn.maxpos ? -_cn.maxpos : _destX;
  
          var _option = {  // アニメーションオプション
            duration: _dur ? _dur : prop.mode.scroll != 0 ? 500 : 0,
            easing: _ease || prop.transitionEasingDefault,
            queue: false,
            complete: function(){
              setTargetPosition($(prop.columnContainerItem));
            }
          };
          _vc.obj.stop(true, true).animate({
            scrollLeft: _destX,
            scrollTop: prop.mode.scroll == 0 ? _destY : 0,
          }, _option);
          _cn.obj.stop(true, true).animate({
            left: _destX,
            top: prop.mode.scroll == 0 ? _destY : 0
          }, _option);
      }
      
      function setTargetPosition(_$t){
        prop.dataPossessor = [];
        _$t.each(function(){
          prop.dataPossessor.push(parseInt($(this).css('left'),10));
        });
        changeCurrent();
      }
      
      function changeCurrent(){
        var _win = getWindowInfo(),
        _cn = getColumnContainerInfo(),
        _pos = -_cn.left - _win.w / 2, // 現在の横スクロール位置から、各カラム領域の半分位をマイナスした地点を基準に、メニューの現在地を判定する
        _dp = prop.dataPossessor,
        _$nav = $(prop.mainNavigation).find('li'),
        _cur = replaceString(prop.currentSelector);
  
        for(var i = 0; i < _dp.length; i++) {
          if( _pos <= _dp[i]){
            var _id = '#' + $(prop.columnContainerItem).eq(i).attr('id'),
            _$cur = $(prop.mainNavigation).find('a[href="'+_id+'"]');
            if(_$cur.length > 0){
              _$nav.removeClass(_cur);
              _$cur.parent('li').addClass(_cur);
            }
            return;
          }
        }
      }
      // デフォルトの挙動をキャンセル
      function preventDefault(e){
        if(typeof e.preventDefault !== undefined){
            e.preventDefault();
        }
      }
  
      // ユーザエージェントをチェックする
      function checkUserAgent(_t){
        var _ua = navigator.userAgent.toLowerCase(),
        _query = prop.ua_query,
        _res;
  
        if(_t){ // キーワードが指定してあるときはそのワードでuaを照合
          _res = _ua.search(new RegExp(_query[_t])) != -1;
        } else {
          for(var _k in _query){ 
            if(_ua.search(new RegExp(_k)) != -1) {
              _res = _k;
              break;
            }
            _res = _ua;
          }
        }
        return _res;
      }
  
      init();
      
  
    };
  
    jQdm_horizontal_scroll();
  
  })(document, jQuery);