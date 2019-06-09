let widget = require("scripts/widget");
let app = require("scripts/app");
let ui = require("scripts/ui");
let utils = require("scripts/utils");

function detect() {
  if($app.env == $env.app) {
    let url = "https://wcphv9sr.api.lncld.net/1.1/classes/fansList?where={\"deviceId\":\"" + $objc("FCUUID").invoke("uuidForDevice").rawValue() + "\"}"
    $http.request({
      method: "GET",
      url: encodeURI(url),
      timeout: 5,
      header: {
        "Content-Type": "application/json",
        "X-LC-Id": "Ah185wdqs1gPX3nYHbMnB7g4-gzGzoHsz",
        "X-LC-Key": "HmbtutG47Fibi9vRwezIY2E7",
      },
      handler: function(resp) {
        let data = resp.data.results
        authCheck(data.length > 0)
        $delay(0.1, function() {
          go();
        });
      }
    })
    $ui.render({
      props: {
        navBarHidden: true,
        statusBarStyle: 1,
        bgcolor: (getThemeMode() == "dark")?$color("black"):$color("white"),
      },
      views: [{
        type: "view",
        layout: function(make, view) {
          make.center.equalTo(view.super)
          make.size.equalTo($size(40, 40))
        },
        views:[{
          type: "spinner",
          props: {
            loading: true,
            style: (getThemeMode() == "dark")?1:2,
          },
          layout: function(make, view) {
            make.top.inset(0)
            make.centerX.equalTo(view.super)
          }
        },{
          type: "label",
          props: {
            text: "正在载入...",
            align: $align.center,
            font: $font(12),
            textColor: (getThemeMode() == "dark")?$color("white"):$color("darkGray"),
          },
          layout: function(make, view) {
            make.centerX.equalTo(view.super).offset(4)
            make.bottom.inset(0)
          }
        }],
      },]
    });
  } else {
    go();
  }
}

function getThemeMode() {
  if(utils.getCache("darkMode")) {
    if($device.isDarkMode) {
      return "dark";
    } else {
      if(utils.getCache("darkModeAuto")) {
        return ($system.brightness < 0.15)?"dark":"light";
      } else {
        return "dark";
      }
    }
  } else {
    return "light";
  }
}

function authCheck(pass) {
  if(!pass) {
    $cache.remove("darkMode");
    $cache.set("authPass", false);
  } else {
    $cache.set("authPass", true);
  }
}

function go() {
  if ($app.env != $env.app) {
    if(utils.getCache("haveBanned") === true) {
      ui.showBannedAlert()
    } else {
      // widget.setupView()
    }
  } else {
    app.show()
  }
}

module.exports = {
  start: detect,
};