//====================
//     依赖声明区
//====================
console.log('初始化中：载入依赖');
var http = require("http"),
    url = require("url"),
    superagent = require("superagent"),
    cheerio = require("cheerio"),
    eventproxy = require("eventproxy"),
    async = require("async"),
    mysql= require('mysql');  

//站点抓取数据声明
var Site = "", //当前抓取的站点
    SiteAdded=[], //已经添加过的站点
    URLs=[], //待抓取URL队列
    URLsScanned=[], //爬完的URL扔这里
    ReqLimit=5, //并发限制
    Depth=4,//抓取层深
    concurrencyCount=0; //并发统计，不要改

//====================
//   依赖声明区结束
//====================



//====================
//     数据库连接
//====================
console.log('初始化中：连接数据库');
var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database:'dalaospider'
});
connection.connect();
//====================
//   数据库连接结束
//====================

//====================
//     主程序区
//====================

//--------------------
//      流程控制
//--------------------
//说明：一个单站点流程.
function StartScan(){
    console.log('程序开始运行，载入流程控制');
    async.waterfall([
        ImportSite,//载入站点
        SeriesTimes,//管理抓取层深
    ], function (err, result) {
        FinishSite() //数据临时汇总输出
    });  
}
//====================
//     通用函数区
//====================
function ImportSite(callback){
    //本函数用于导入站点信息和初始化变量。
    console.log('正在载入站点');
    //重新初始化变量
    URLs=[],
    URLsScanned=[], 
    concurrencyCount=0;

    connection.query("select * from Sites where Scan=0 order by 1", function(err, rows, fields) {
        if(rows!=""){
            Site=rows[0].Domain; //当前站点
            URLs.push("http://" + Site); //把首页添加到队列中
            console.log("往队列添加首页：http://" + Site);
        }else{
            console.log("全部扫描完成");
            process.exit(0);
        };
        callback(err);
    });
}

function SeriesTimes(_callback){
    //本函数负责处理Async.timeSeries控制的轮回次数（抓取层深）
    async.timesSeries(Depth, function(n, callback){
        console.log("开始" + (n+1) + '/' + Depth + '次轮回，已抓取' 
        + URLsScanned.length + "条，队列中剩余" + URLs.length + '条');
        FetchURLMgr(callback);
    }, function(err, data) {
        _callback();
    });
}

function FetchURLMgr(_callback){
    //本函数负责处理每次轮回中Async.mapLimit的并发限制
    var URLsCache=URLs.slice(0);
    //URLsCache负责保存本次轮回所需要抓取的链接，
    //以保证不受URLs队列变化影响
    async.mapLimit(URLsCache,ReqLimit, function(URL, callback) {
        //延迟一下,不然抓太快会爆炸
        setTimeout(function() {
            FetchURL(URL,callback);
        }, 10);
    }, function(err, results) {
        //报告上级异步抓取完毕
        _callback();
    });
}

function FetchURL(URL,callback){
    //本函数由FetchURLMgr管理，负责实际的抓取
    
    //检查爬过没
    if(URLsScanned.indexOf(URL) == -1){
        URLsScanned.push(URLs.shift());
        concurrencyCount++;
        console.log('现在的并发数是' + concurrencyCount + '，开始抓取 ' + URL);
        superagent.get(URL).timeout(5000).end(function(err,sres){
            try{
            var $=cheerio.load(sres.text);
            //获取所有<a>
            $('a').each(function(){
                var ThisURL=$(this).attr('href');
                if(typeof ThisURL == "string"){
                    ThisURL=url.parse(ThisURL); //处理URL 转化为URL对象
                    if(Site==ThisURL.host){
                        //站内链接，直接添加队列
                        URLs.push(ThisURL.href);
                    }else if(ThisURL.host==null){
                        //站内相对链接，需要加Site
                        URLs.push('http://' + Site + ThisURL.href);
                    }else{
                        //站外链接，存数据库，先检查是否添加过
                        if(SiteAdded.indexOf(ThisURL.host) == -1){
                            var sql = "insert into sites values('',?,?,'','',0)";
                            var inserts = [$(this).text() , ThisURL.host];
                            sql = mysql.format(sql, inserts);
                            connection.query(sql);
                            SiteAdded.push(ThisURL.host);
                        }
                    }
                }
            });
            }catch(err){
                console.log(err.message);
            }
            concurrencyCount--;
            callback();
        });
    }else{
        callback();
    }

}

function FinishSite(){
    //本函数用于临时输出统计汇总
    console.log(Site + '抓取完毕');
    connection.query("update sites set scan=1 where domain='" + Site + "'")
    StartScan();
}

StartScan();