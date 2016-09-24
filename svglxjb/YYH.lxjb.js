/**
 * Created by yehai on 2016/9/24.
 */
(function( global, factory ) {
    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = global.document ?
            factory( global, true ) :
            function( w ) {
                if ( !w.document ) {
                    throw new Error( "this lib requires a window with a document" );
                }
                return factory( w );
            };
    } else {
        factory( global );
    }
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

    var document = window.document;

    //创建svg元素
    var createSvgTag = function(tagName,attr,innerHTML)
    {
        var ele = document.createElementNS('http://www.w3.org/2000/svg',tagName);
        if(attr){
            for(var i in attr)
            {
                ele.setAttribute(i,attr[i]);
            }
        }
        if(innerHTML){
            var text = document.createTextNode(innerHTML);
            ele.appendChild(text);
        }
        return ele;
    }

    //随机颜色
    function SuiJiSe(){
        var r = Math.round(Math.random()*255);
        var g = Math.round(Math.random()*255);
        var b = Math.round(Math.random()*255);
        return 'rgb('+r+','+g+','+b+')';
    }

    //解析颜色
    var parseColor = function(str){
        var color = {
            r:0,
            g:0,
            b:0,
            a:1
        };
        var colorZhi = 0;
        if(/^#[a-fA-F0-9]{3}$/.test(str)){
            str = str.slice(1).replace(/[a-fA-F0-9]/g,function(a){
                return a+a;
            });
            colorZhi = parseInt(str,16);
        }else if(/^#[a-fA-F0-9]{6}$/.test(str)){
            str = str.slice(1);
            colorZhi = parseInt(str,16);
        }else if(/^rgb\s*\([\d\s]+,[\d\s]+,[\d\s]+\)\s*$/.test(str)){
            str.replace(/([\d\s]+),([\d\s]+),([\d\s]+)/,function(quan,a,b,c){
                colorZhi += parseInt(a.replace(/\s/,''))<<16;
                colorZhi += parseInt(b.replace(/\s/,''))<<8;
                colorZhi += parseInt(c.replace(/\s/,''));
            });
        }else if(/^rgba\s*\([\d\s]+,[\d\s]+,[\d\s]+,[\.\d\s]+\)\s*$/.test(str)){
            str.replace(/([\d\s]+),([\d\s]+),([\d\s]+),([\.\d\s]+)/,function(quan,a,b,c,d){
                colorZhi += parseInt(a.replace(/\s/,''))<<16;
                colorZhi += parseInt(b.replace(/\s/,''))<<8;
                colorZhi += parseInt(c.replace(/\s/,''));
                color.a = parseFloat(d);
                color.a = color.a>1?1:color.a;
            });
        }else{
            return color;
        }
        color.r = colorZhi>>16&0xff;
        color.g = colorZhi>>8&0xff;
        color.b = colorZhi>>0&0xff;
        return color;
    };

    //菱形渐变
    var LXJB = function(opts){

        var opts = opts || {};

        //提取参数
        var color1 = opts.color1 || LXJB.opts.color1;
        var color2 = opts.color2 || LXJB.opts.color2;
        var shuzhi = opts.shuzhi || LXJB.opts.shuzhi;
            shuzhi = shuzhi>100?100:shuzhi;
        var banjing = opts.banjing || LXJB.opts.banjing;
        var border = opts.border || LXJB.opts.border;
        var bgColor = opts.bgColor || LXJB.opts.bgColor;
        var speed = opts.speed || LXJB.opts.speed;
        var wrap = opts.wrap || LXJB.opts.wrap;
        var fontSize = opts.fontSize || LXJB.opts.fontSize;
        var fontColor = opts.fontColor || LXJB.opts.fontColor;
        var fontFamily = opts.fontFamily || LXJB.opts.fontFamily;
        var startColor = parseColor(color1);
        var stopColor = parseColor(color2);


        var zhouchang = 2 * Math.PI * banjing;
        var geshu = Math.round(60/35*banjing);
            geshu = geshu>180?180:geshu;
        var sWidth = zhouchang / geshu;
        var dushu = 360 / geshu;
        var shiji = Math.round(geshu * shuzhi / 100);

        //svg
        var svg = createSvgTag('svg',{width:banjing*2,height:banjing*2,version:'1.1',xmlns:'http://www.w3.org/2000/svg'});

        //背景
        var circle = createSvgTag('circle',{cx:banjing,cy:banjing,r:banjing-border/2,fill:'none',stroke:bgColor,'stroke-width':border});
        svg.appendChild(circle);

        //前景组
        var jianbianG = createSvgTag('g');
        var firstPath = null;
        var animateQuee = [];
        for(var i=0;i<shiji;i++){
            var r = Math.round(startColor.r + (stopColor.r-startColor.r) * i/shiji);
            var g = Math.round(startColor.g + (stopColor.g-startColor.g) * i/shiji);
            var b = Math.round(startColor.b + (stopColor.b-startColor.b) * i/shiji);
            var a = Math.round(startColor.a*100 + (stopColor.a*100-startColor.a*100) * i/shiji)/100;
            var path = createSvgTag('rect',{fill:'rgba('+r+','+g+','+b+','+a+')',x:banjing,y:0,width:sWidth,height:border,transform:'rotate('+i*dushu+' '+banjing+' '+banjing+')',opacity:0});
            if(i==0){
                firstPath = path;
            }else{
                jianbianG.appendChild(path);
            }
            animateQuee.push(path);
        }
        jianbianG.appendChild(firstPath);
        svg.appendChild(jianbianG);

        //数字
        var shuzi = createSvgTag('text',{'x':banjing,'y':banjing+border/2,'fill':fontColor,'font-size':fontSize,'font-family':fontFamily,'text-anchor':'middle'},shuzhi);
        svg.appendChild(shuzi);
        var setShuZhi = function(str){
            shuzi.textContent = str;
        };

        //动画
        var animateGo = function(i){
            while(true){
                if(!(i in animateQuee))break;
                if(animateQuee[i].getAttribute('opacity')==1)break;
                animateQuee[i].setAttribute('opacity',1);
                i--;
            }
        };
        var start = Date.now();
        var animateFn = function(){
            var now = Date.now()-start;
            var suoyin = Math.floor(shiji*now/speed);
            setShuZhi(Math.floor(suoyin/shiji*shuzhi));
            animateGo(suoyin);
            if(now<speed){
                setTimeout(animateFn,10)
            }else{
                animateGo(shiji-1);
                setShuZhi(shuzhi);
            }
        };

        wrap.appendChild(svg);
        animateFn();

    };

    //默认值
    LXJB.opts = {
        //半径
        banjing:35,
        //边框
        border:10,
        //数值
        shuzhi:100,
        //颜色1
        color1:'#f87103',
        //颜色2
        color2:'#fbbc0b',
        //动画时长,
        speed:500,
        //背景色
        bgColor:'#e5e5e5',
        //字体大小
        fontSize:'20',
        //字体颜色
        fontColor:'#fb6402',
        //字体名称
        fontFamily:'Microsoft Yahei',
        //外层元素
        wrap:document.body
    };

    var YYH = YYH || {};
    YYH.lxjb = LXJB;
    window.YYH = YYH;
    return YYH;
}));