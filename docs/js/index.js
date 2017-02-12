
PM25_DATA_URL = 'http://www.kankyo-net.city.nagoya.jp/taiki/Jiho/OyWbJiho01.htm';
//とりあえず
DROPBOX_ACCESS_TOKEN = 'KdninD-qaaoAAAAAAAAAFIcS-bSijM9UR-DqQhGc46Vk-qG8oWc0Z6oL13t5L5G9';
DROPBOX_CACHE_FILE = '/ngo-cache.json';

MAP_CENTER = [35.1723086,136.9082951];
TILE_LAYER = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
TILE_ATTRIBUTION = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';

var PM25_RED = 35;
var PM25_ORANGE = 25;

var KANSOKU = {
   '上下水道北営業所':[35.196984,136.907401]
  ,'愛知工業高校':[35.21112418737606,136.90217971801758]
  ,'名塚中学校':[35.203900836374864,136.88406944274902]
  ,'中村保健所':[35.16972146992249,136.8635129928589]
  ,'テレビ塔':[35.17230866155641,136.90829515457153]
  ,'滝川小学校':[35.1441608563049,136.9605016708374]
  ,'熱田神宮公園':[35.130859846051806,136.90252304077148]
  ,'八幡中学校':[35.137071933966524,136.88024997711182]
  ,'富田支所':[35.14037081620902,136.81271195411682]
  ,'港　陽':[35.102203967566936,136.88733905553818]
  ,'惟信高校':[35.10526947166374,136.84196949005127]
  ,'白水小学校':[35.07619411318051,136.91393852233887]
  ,'千　竈':[35.1090216497418,136.92324578762054]
  ,'元塩公園':[35.083911681657725,136.92460298538208]
  ,'守山保健所':[35.2033573058161,136.97685778141022]
  ,'大高北小学校':[35.06923977438771,136.93745613098145]
  ,'天白保健所':[35.122760607342286,136.97511434555054]
};
//データ項目のラベル
var AREA = "区";
var POINT = "測定局";
var PM25 = "微小粒子状物質(PM2.5)";
var WIND_D = "風向(WD)";
var WIND_V = "風速(WV)";

var ArrowIcon = L.Icon.extend({
    options: {
         iconSize:     [48, 48]
        ,iconAnchor:   [24, 24]
        ,popupAnchor:  [0, -24]
    }
});

//Dropbox用
var dbx = "";
var isExistCacheFile = false;
var cacheUpdateTime = "";
//地図用
var map = "";

function update() {
  //更新処理
  console.log('更新処理');
  initData();
}

//データを取得する
function initData() {
  //Dropboxを初期化する
  dbx = new Dropbox({'accessToken': DROPBOX_ACCESS_TOKEN });//TODO とりあえずaxxess token そのうちOAuthにしたい
  //地図を初期化
  initMap();
  //データをロード
  loadJSON();
}
//データをロードできたときに呼ばれる関数
function callbackData(data) {
  console.log('callbackData');
  var sum = 0;
  var sumcnt = 0;
  //変換したオブジェクトを表示
  for (var i=0;i<data.length;i++) {
    var val = data[i];
    if (i == 0) {
      console.log("日時："+val["updatetime"]);
      continue;
    }
    //マーカーを追加
    addMaker(val);
    if (!isNaN(val[PM25])){
      sum += parseFloat(val[PM25]);
      sumcnt++;
    }
  }
  //平均値を計算
  console.log("合計："+sum+" 件数："+sumcnt+" 平均："+(sum/sumcnt));
  $('#loading').hide();
}

function initMap() {
  if (map != "") return;
  console.log('initMap');
   $('#map').height($(window).height()-48);
   // create a map in the "map_elemnt" div,
   // set the view to a given place and zoom
   map = L.map('map');
   map.setView(MAP_CENTER, 12);//中心の緯度経度
   // add an OpenStreetMap tile layer
   var tileLayer = L.tileLayer(TILE_LAYER, {
       attribution : TILE_ATTRIBUTION
   });
   tileLayer.addTo(map);
   // add control scale
   L.control.scale().addTo(map);
}

function addMaker(val) {
  console.log("測定局:"+val[POINT]+" "+val[PM25]+"μg/m3 "+val[WIND_D]+" "+val[WIND_V]+"m/s");
  var latlon = KANSOKU[val[POINT]];
  //風向きと濃度で画像を変更する
  var pic = toPic(val[PM25],val[WIND_D]);
  var mapMarker = L.marker(latlon,{icon: new ArrowIcon({iconUrl:pic})});
  mapMarker.addTo(map);
  //クリック時のポップアップを表示する
  var content =
     ' <span style="font-size:12pt">'+val[PM25]+'</span>μg/m3'
    +' <span style="font-size:12pt">'+val[WIND_D]+'</span>'
    +' '+val[WIND_V]+'m/s'
    +'<br/>'+val[POINT]+','+val[AREA];
  mapMarker.bindPopup(content);
}
//アイコン画像の変換
function toPic(pm,wd) {
  if (pm == "欠測"  || wd == "欠測") { //測定値がない場合
    return 'images/arrowno.png';
  }
  var sig = 'g';  // g:GREEN　o:ORANGE r:RED
  var no = WIND_DIRECTION[wd];
  //濃度の判断
  if (!isNaN(pm)) {
    var p = parseFloat(pm);
    if (p > PM25_ORANGE) {
      sig = 'o';
    } else if (p > PM25_RED) {
      sig = 'r';
    }
  }
  return 'images/arrow'+sig+no+'.png';
}
var WIND_DIRECTION = {
   '北':'00'
  ,'北北東':'01'
  ,'北東':'02'
  ,'東北東':'03'
  ,'東':'04'
  ,'東南東':'05'
  ,'南東':'06'
  ,'南南東':'07'
  ,'南':'08'
  ,'南南西':'09'
  ,'南西':'10'
  ,'西南西':'11'
  ,'西':'12'
  ,'西北西':'13'
  ,'北西':'14'
  ,'北北西':'15'
  ,'静穏':'99'
};

//Dropboxのキャッシュからデータを読み込む
function loadJSON() {
  isExistCacheFile = false;
  cacheUpdateTime = "";
  //Dropboxにキャッシュが存在するかチェック
  dbx.filesListFolder({path: ''})
  .then(function(response) {
    console.log(response);
    var files = response.entries;
    console.log(files.length);
    for (var i=0;i<files.length;i++) {
      console.log(DROPBOX_CACHE_FILE+"="+files[i].path_lower);
      if (DROPBOX_CACHE_FILE == files[i].path_lower) {
        isExistCacheFile = true;//キャッシュファイルが存在する
        download();
        break;
      }
    }
    //キャッシュが存在しない場合、新しくデータを取得して保存
    if (!isExistCacheFile) {
      console.log('キャッシュが存在しない場合');
      store();
    }
  })
  .catch(function(error) {
    console.log(error);
  });
}

//キャッシュデータをダウンロードする
function download() {
  dbx.filesDownload({'path': DROPBOX_CACHE_FILE})
  .then(function(response) {
    console.log(response);
    //キャッシュが存在する場合、ファイルを読み込む
    var reader = new FileReader();//FileReaderの作成
    reader.readAsText(response.fileBlob);//テキスト形式で読み込むs
    reader.onload = function(ev){
      //読込終了後の処理
      //console.log(reader.result);
      var data = JSON.parse(reader.result);
      //更新日時が古くなければ、読み込んだファイルを返す
      var current = currentNichiji();
      var updateTime = data[0].updatetime;
      console.log(current+"="+updateTime);
      if ( current <= updateTime ) {
        callbackData(data);//コールバック
      } else {
        //更新日時が古ければ、新しくデータを取得して保存
        cacheUpdateTime = updateTime;
        store();
      }
    }
  })
  .catch(function(error) {
    console.log(error);
  });
}

function currentNichiji() {
  var d = new Date();
  var str = d.getFullYear()
    + ((d.getMonth()+1) < 10 ? "0" + (d.getMonth()+1) : (d.getMonth()+1))
    + (d.getDate()  < 10 ? "0" + d.getDate() : d.getDate())
    + (d.getHours() < 10 ? "0" + d.getHours() : d.getHours())
    ;
  return str;
}

//新しくデータを取得して、保存する
function store() {
  console.log('store:新しくデータを取得して、保存する');
  //TODO クロスドメインで時差が影響する（古い日時が取得される）？？？？？？？
  $.ajax({
      url: PM25_DATA_URL,//　http://から始まるURLを指定
      type: 'GET',
      cache: false,
      timeout:10000,
      success : successHandler,
      error :errorHandler
  });
}
//ajax処理成功
function successHandler(res)
{
    console.log("通信成功");
    var content = res.responseText;//responseTextで取得
    //console.log(content);
    //ページの内容を変換する
    var data = scraping(content);
    //キャッシュをアップロードする
    upload(data);
    callbackData(data);//コールバック
}
function errorHandler(XMLHttpRequest, textStatus, errorThrown)
{
    console.log("通信失敗");
    console.log(XMLHttpRequest);
    console.log(textStatus);
    console.log(errorThrown);
}

//データをアップロードする
function upload(data) {
  console.log('upload '+data[0].updatetime+'='+cacheUpdateTime);
  if (isExistCacheFile) {
    //更新日時が古いデータが取得できた場合はキャッシュにアップロードしない
    if (cacheUpdateTime != "" && data[0].updatetime <= cacheUpdateTime) {
      console.log('更新日時が古いデータが取得できた場合はキャッシュにアップロードしない '+data[0].updatetime+'='+cacheUpdateTime);
      return;
    }
    //削除して追加
    dbx.filesDelete({'path': DROPBOX_CACHE_FILE})
    .then(function(response) {
      uploadFiles(data);
    })
    .catch(function(error) {
      console.log(error);
    });
  } else {
    uploadFiles(data);
  }
}
function uploadFiles(data) {
  dbx.filesUpload({'path': DROPBOX_CACHE_FILE
    , 'contents': JSON.stringify(data)
  })
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.log(error);
  });
}
// WebページをスクレイビングしてJSON形式のオブジェクトに変換
function scraping(content){
  var data = [];
  var isData = false;
  var buf = "";
  //改行文字で分割
  var rows = content.split('&#xd;');
  //ページからデータ部分だけを抽出
  for (var i=0;i<rows.length;i++) {
    var line = rows[i];
    if (line.indexOf('selected') >= 0) console.log(i+":"+line);//ページの設定日時を出力
    //データのキーワードが出てくるまで空読みする
    if ( !isData && line.indexOf('id="time_signal"') < 0) {
      continue;
    }
    //console.log(i+":"+rows[i]);
    isData = true;
    buf += line;
    //データの終わりを判断
    if (line.indexOf('</table>') >= 0) { //
      isData = false;
    };
  }
  //tableの中身を分解
  var rows = $(buf).find('tr');
  for (var i=0;i<rows.length;i++) {
    //console.log(i+":"+$(rows[i]).html());
    var row = rows[i];
    switch (i) {
      case 0://１行目　更新日時を取得
        var updatetime = formatTime($.trim($(row).text()));
        data.push({'updatetime':updatetime});
        break;
      case 1://２行目 ヘッダー
        var labels = $(row).find('td');
        break;
      case 2://３行目 何もしない
        break;
      default:
        var obj = {};//key-valueを格納する連想配列
        var cols = $(row).find('td');
        for (var j=0;j<cols.length;j++) {
          var key = $(labels[j]).text();
          var val = $(cols[j]).text();
          obj[key] = $.trim(val);
        }
        data.push(obj);
    }
  }
  return data;
}

function formatTime(str) {
  return str.replace("年","").replace("月","").replace("日","").replace("時","");
}
