let utils = require('scripts/utils')
let ui = require('scripts/ui')
let user = require('scripts/user')
let logUpView = require('scripts/login-view')
let api = require('scripts/api')

let objectId = ""

$app.listen({
  refreshAll: function (object) {
    if (object.appItem) {
      refreshAppItemView()
    }
  },
  refreshItemView: function (object) {
    if (object.onStore) {
      refreshAppItemView()
    } else {
      genNotOnStoreView()
    }
  },
});

function show(id) {
  objectId = id
  $ui.push({
    props: {
      id: "appItemViewParent",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [genAppItemShowView()]
  });
  resizeItemScroll()
  $("appPreviewPhotosScroll").resize()
  $("appPreviewPhotosScroll").contentSize = $size($("appPreviewPhotosScroll").contentSize.width + 20, 0)
}

function preview(id) {
  objectId = id
  $ui.push({
    props: {
      id: "appItemViewParent",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [{
      type: "view",
      props: {
        id: "appItemView",
      },
      layout: $layout.fill,
      views: [ui.genPageHeader("主页", ""), {
        type: "view",
        layout: function (make, view) {
          make.center.equalTo(view.super)
          make.size.equalTo($size(40, 40))
        },
        views: [{
          type: "spinner",
          props: {
            loading: true,
            style: utils.themeColor.spinnerStyle,
          },
          layout: function (make, view) {
            make.top.inset(0)
            make.centerX.equalTo(view.super)
          }
        }, {
          type: "label",
          props: {
            text: "正在载入...",
            align: $align.center,
            font: $font(12),
            textColor: utils.themeColor.appObviousColor,
          },
          layout: function (make, view) {
            make.centerX.equalTo(view.super).offset(4)
            make.bottom.inset(0)
          }
        }],
      }]
    }]
  });
}

function genNotOnStoreView() {
  if ($("appItemView")) {
    $("appItemView").remove()
    $("appItemViewParent").add({
      type: "view",
      props: {
        id: "appItemView",
      },
      layout: $layout.fill,
      views: [ui.genPageHeader("主页", ""), {
        type: "label",
        props: {
          text: "此应用已下架",
          align: $align.center,
          font: $font(15),
          textColor: utils.themeColor.appObviousColor,
        },
        layout: function (make, view) {
          make.center.equalTo(view.super)
        }
      }]
    })
  }
}

function resizeItemScroll() {
  $("appItemShowScroll").resize()
  $("appItemShowScroll").contentSize = $size(0, $("appItemShowScroll").contentSize.height + 50)
}

function refreshAppItemView() {
  if ($("appItemView")) {
    $("appItemView").remove()
    $("appItemViewParent").add(genAppItemShowView())
    $("appItemShowScroll").resize()
    $("appItemShowScroll").contentSize = $size(0, $("appItemShowScroll").contentSize.height + 50)
    $("appPreviewPhotosScroll").resize()
    $("appPreviewPhotosScroll").contentSize = $size($("appPreviewPhotosScroll").contentSize.width + 20, 0)
  }
}

function genAppItemShowView() {
  let app = {}
  let cloudApps = utils.getCache("cloudApps", [])
  for (let i = 0; i < cloudApps.length; i++) {
    if (cloudApps[i].objectId == objectId) {
      app = cloudApps[i];
      break;
    }
  }
  let buttonText = ""
  if (app.haveInstalled) {
    if (app.needUpdate) {
      buttonText = "更新"
    } else {
      buttonText = "打开"
    }
  } else {
    buttonText = "获取"
  }
  let comments = app.comment
  let commentView = {}
  let commentSubviews = []
  if (comments && comments.length > 0) {
    for (let i = 0; i < comments.length; i++) {
      let cardSubViews = []
      let commentSize = $text.sizeThatFits({
        text: comments[comments.length - i - 1].comment,
        width: $device.info.screen.width - 70,
        font: $font("PingFangSC-Regular", 15),
      })
      let haveReply = comments[comments.length - i - 1].reply
      let showCommentMore = false
      let commentHeight = undefined
      if (!haveReply && commentSize.height > 153) {
        commentHeight = 153
        showCommentMore = true
      } else if (haveReply && commentSize.height > 66) {
        commentHeight = 66
        showCommentMore = true
      }
      cardSubViews = [{
        type: "label",
        props: {
          text: comments[comments.length - i - 1].name,
          textColor: utils.themeColor.appHintColor,
          font: $font("PingFangSC-Regular", 15),
        },
        layout: function (make, view) {
          make.top.inset(10)
          make.height.equalTo(20)
          make.left.inset(15)
        },
      }, {
        type: "label",
        props: {
          text: utils.getUpdateDateString(comments[comments.length - i - 1].time),
          textColor: utils.themeColor.appHintColor,
          font: $font("PingFangSC-Regular", 14),
        },
        layout: function (make, view) {
          make.top.inset(10)
          make.height.equalTo(20)
          make.right.inset(15)
        },
      }, {
        type: "label",
        props: {
          text: comments[comments.length - i - 1].comment,
          textColor: utils.themeColor.listHeaderTextColor,
          font: $font("PingFangSC-Regular", 15),
          align: $align.justified,
          bgcolor: $color("clear"),
          lines: 0,
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(7)
          make.left.right.inset(15)
          if (commentHeight) {
            make.height.equalTo(commentHeight)
          }
        },
      }, {
        type: "gradient",
        props: {
          colors: [utils.getThemeMode() == "dark" ? $rgba(0, 0, 0, 0.0) : $rgba(255, 255, 255, 0.0), utils.themeColor.commentBgColor],
          locations: [0.0, 0.3],
          startPoint: $point(0, 0.5),
          endPoint: $point(1, 0.5),
          hidden: !showCommentMore,
          bgcolor: $color("clear"),
        },
        layout: function (make, view) {
          make.right.bottom.equalTo(view.prev)
          make.width.equalTo(50)
        },
        views: [{
          type: "button",
          props: {
            title: "更多",
            font: $font("PingFangSC-Regular", 15),
            titleColor: utils.getCache("themeColor"),
            bgcolor: $color("clear"),
            radius: 0,
            contentEdgeInsets: $insets(2, 5, 2, 0),
          },
          layout: function (make, view) {
            make.right.equalTo(view.super)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
          events: {
            tapped: function (sender) {
              genCommentDetailView(comments[comments.length - i - 1])
            }
          }
        }],
      }]
      if (haveReply) {
        let replySize = $text.sizeThatFits({
          text: comments[comments.length - i - 1].reply,
          width: $device.info.screen.width - 70,
          font: $font("PingFangSC-Regular", 15),
        })
        let showReplyMore = false
        let replyHeight = undefined
        if (commentSize.height > 66 && replySize.height > 46) {
          replyHeight = 46
          showReplyMore = true
        } else if (commentSize.height <= 66 && replySize.height > 108 - commentSize.height) {
          replyHeight = 108 - commentSize.height
          showReplyMore = true
        }
        cardSubViews.push({
          type: "label",
          props: {
            text: "开发者回复",
            textColor: utils.themeColor.appHintColor,
            font: $font("PingFangSC-Regular", 15),
          },
          layout: function (make, view) {
            make.top.equalTo(view.prev.bottom).inset(10)
            make.height.equalTo(20)
            make.left.inset(15)
          },
        }, {
            type: "label",
            props: {
              text: utils.getUpdateDateString(comments[comments.length - i - 1].replyTime),
              textColor: utils.themeColor.appHintColor,
              font: $font("PingFangSC-Regular", 14),
            },
            layout: function (make, view) {
              make.centerY.equalTo(view.prev)
              make.height.equalTo(20)
              make.right.inset(15)
            },
          }, {
            type: "label",
            props: {
              text: comments[comments.length - i - 1].reply,
              textColor: utils.themeColor.listHeaderTextColor,
              font: $font("PingFangSC-Regular", 15),
              align: $align.justified,
              bgcolor: $color("clear"),
              lines: 0,
            },
            layout: function (make, view) {
              make.top.equalTo(view.prev.bottom).inset(7)
              make.left.right.inset(15)
              if (replyHeight) {
                make.height.equalTo(replyHeight)
              }
            },
          }, {
            type: "gradient",
            props: {
              colors: [utils.getThemeMode() == "dark" ? $rgba(0, 0, 0, 0.0) : $rgba(255, 255, 255, 0.0), utils.themeColor.commentBgColor],
              locations: [0.0, 0.3],
              startPoint: $point(0, 0.5),
              endPoint: $point(1, 0.5),
              hidden: !showReplyMore,
              bgcolor: $color("clear"),
            },
            layout: function (make, view) {
              make.right.bottom.equalTo(view.prev)
              make.width.equalTo(50)
            },
            views: [{
              type: "button",
              props: {
                title: "更多",
                font: $font("PingFangSC-Regular", 15),
                titleColor: utils.getCache("themeColor"),
                bgcolor: $color("clear"),
                radius: 0,
                contentEdgeInsets: $insets(2, 5, 2, 0),
              },
              layout: function (make, view) {
                make.right.equalTo(view.super)
                make.centerY.equalTo(view.super)
                make.height.equalTo(view.super)
              },
              events: {
                tapped: function (sender) {
                  genCommentDetailView(comments[comments.length - i - 1])
                }
              }
            }],
          })
      }
      commentSubviews.push({
        type: "view",
        props: {
          bgcolor: utils.themeColor.commentBgColor,
          radius: 8,
        },
        layout: function (make, view) {
          make.top.inset(0)
          make.height.equalTo(view.super)
          make.width.equalTo($device.info.screen.width - 40)
          if (i == 0) {
            make.left.inset(20)
          } else {
            make.left.equalTo(view.prev.right).inset(10)
          }
        },
        events: {
          longPressed: function (sender) {
            let userInfo = user.getLoginUser()
            if (user.haveLogined() && comments[comments.length - i - 1].time && userInfo.objectId == app.authorId) {
              $device.taptic(0);
              $ui.menu({
                items: ["回复评论"],
                handler: function (title, idx) {
                  switch (idx) {
                    case 0: {
                      genCommentReplyView(app, comments.length - i - 1);
                      break;
                    }
                  }
                }
              });
            }
          }
        },
        views: cardSubViews,
      })
    }
    let commentMoveXOffsetOld, commentMoveXOffsetNew = 0;
    commentSubviews.push({
      type: "view",
      layout: function (make, view) {
        make.top.inset(0)
        make.height.equalTo(view.super)
        make.width.equalTo(30)
        make.left.equalTo(view.prev.right).inset(0)
      },
    })
    commentView = {
      type: "view",
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom).inset(10)
        make.height.equalTo(200)
        make.left.right.inset(0)
      },
      views: [{
        type: "scroll",
        props: {
          alwaysBounceHorizontal: true,
          alwaysBounceVertical: false,
          userInteractionEnabled: true,
          showsHorizontalIndicator: false,
          showsVerticalIndicator: false,
        },
        layout: $layout.fill,
        views: commentSubviews,
        events: {
          willBeginDragging: function (sender) {
            commentMoveXOffsetOld = sender.contentOffset.x;
          },
          willEndDragging: function (sender, decelerate) {
            commentMoveXOffsetNew = sender.contentOffset.x;
          },
          willBeginDecelerating: function (sender) {
            let offsetChange = commentMoveXOffsetNew - commentMoveXOffsetOld
            let unit = (sender.contentSize.width - 40) / comments.length
            let x = Math.round(commentMoveXOffsetOld / unit) * unit
            if (Math.abs(offsetChange) > 40) {
              x = (offsetChange > 0) ? x + unit : x - unit
            }
            if (x < 0 || x > sender.contentSize.width - unit) {
              x = Math.round(commentMoveXOffsetOld / unit) * unit
            }
            sender.scrollToOffset($point(x, 0))
          },
          didEndDragging: function (sender, decelerate) {
            let offsetChange = commentMoveXOffsetNew - commentMoveXOffsetOld
            let unit = (sender.contentSize.width - 40) / comments.length
            let x = Math.round(commentMoveXOffsetOld / unit) * unit
            if (Math.abs(offsetChange) > 40) {
              x = (offsetChange > 0) ? x + unit : x - unit
            }
            if (x < 0 || x > sender.contentSize.width - unit) {
              x = Math.round(commentMoveXOffsetOld / unit) * unit
            }
            sender.scrollToOffset($point(x, 0))
          }
        }
      }]
    }
  } else {
    commentView = {
      type: "label",
      props: {
        text: "此应用尚未收到评论。",
        font: $font(15),
        align: $align.center,
        textColor: $color("gray"),
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom).inset(0)
        make.height.equalTo(30)
        make.left.inset(20)
      },
    }
  }
  let appInstSize = $text.sizeThatFits({
    text: app.instruction,
    width: $device.info.screen.width - 40,
    font: $font("PingFangSC-Regular", 15),
    lineSpacing: 5, // Optional
  })
  let appVerInstSize = $text.sizeThatFits({
    text: app.versionInst,
    width: $device.info.screen.width - 40,
    font: $font("PingFangSC-Regular", 15),
    lineSpacing: 5, // Optional
  })
  const appInstFoldHeight = 125;
  const appVerInstFoldHeight = 125;
  return {
    type: "view",
    props: {
      id: "appItemView",
    },
    layout: $layout.fill,
    views: [ui.genPageHeader("主页", ""), {
      type: "scroll",
      props: {
        id: "appItemShowScroll",
      },
      layout: function (make, view) {
        make.left.right.bottom.inset(0)
        make.top.equalTo(view.prev.bottom)
        make.centerX.equalTo(view.super)
      },
      views: [{
        type: "view",
        layout: function (make, view) {
          make.left.right.inset(20)
          make.top.inset(10)
          make.height.equalTo(120)
          make.centerX.equalTo(view.super)
        },
        views: [{
          type: "view",
          props: {
            borderColor: utils.themeColor.iconBorderColor,
            borderWidth: 1.2,
            smoothRadius: 17,
          },
          layout: function (make, view) {
            make.left.inset(0)
            make.size.equalTo($size(90, 90))
            make.centerY.equalTo(view.super)
          },
          views: [ui.genIconView(app.appIcon)]
        }, {
          type: "view",
          layout: function (make, view) {
            make.left.equalTo(view.prev.right).inset(15)
            make.bottom.equalTo(view.prev.bottom)
            make.right.inset(0)
            make.height.equalTo(30)
          },
          views: [{
            type: "view",
            layout: function (make, view) {
              make.left.inset(0)
              make.centerY.equalTo(view.super)
              make.size.equalTo($size(75, 30))
            },
            views: [{
              type: "button",
              props: {
                title: buttonText,
                bgcolor: utils.themeColor.appButtonBgColor,
                titleColor: utils.getCache("themeColor"),
                font: $font("bold", 15),
                radius: 15,
                align: $align.center,
              },
              layout: function (make, view) {
                make.center.equalTo(view.super)
                make.size.equalTo($size(75, 30))
              },
              events: {
                tapped: function (sender) {
                  if (!app.needUpdate && app.haveInstalled) {
                    $addin.run(app.appName)
                  } else {
                    sender.userInteractionEnabled = false
                    sender.title = ""
                    sender.updateLayout(function (make, view) {
                      make.size.equalTo($size(30, 30))
                    })
                    $ui.animate({
                      duration: 0.2,
                      animation: function () {
                        sender.relayout()
                      },
                      completion: function () {
                        $ui.animate({
                          duration: 0.1,
                          animation: function () {
                            sender.bgcolor = $color("clear")
                          },
                        })
                        sender.add({
                          type: "canvas",
                          layout: (make, view) => {
                            make.center.equalTo(view.super)
                            make.size.equalTo($size(30, 30))
                          },
                          events: {
                            draw: (view, ctx) => {
                              ctx.strokeColor = utils.themeColor.appButtonBgColor,
                                ctx.setLineWidth(2.5)
                              ctx.addArc(15, 15, 14, 0, 3 / 2 * 3.14)
                              ctx.strokePath()
                            }
                          },
                        })
                        let radius = 0;
                        let timer = $timer.schedule({
                          interval: 0.01,
                          handler: function () {
                            if (sender.get("canvas")) {
                              sender.get("canvas").rotate(radius)
                              radius = radius + Math.PI / 180 * 6
                            } else {
                              timer.invalidate()
                            }
                          }
                        });
                        $http.download({
                          url: app.file,
                          showsProgress: false,
                          handler: function (resp) {
                            let json = utils.getSearchJson(app.appIcon)
                            let icon_code = (json.code) ? json.code : "124";
                            utils.saveAddin(app.appName, "icon_" + icon_code + ".png", resp.data);
                            if (app.needUpdate && app.haveInstalled) {
                              utils.addUpdateApps(app.objectId);
                            }
                            let cloudApps = utils.getCache("cloudApps", [])
                            for (let j = 0; j < cloudApps.length; j++) {
                              if (cloudApps[j].objectId == app.objectId) {
                                cloudApps[j].haveInstalled = true
                                cloudApps[j].needUpdate = false
                              }
                            }
                            $cache.set("cloudApps", cloudApps);
                            $ui.animate({
                              duration: 0.1,
                              animation: function () {
                                sender.bgcolor = utils.themeColor.appButtonBgColor
                              },
                              completion: function () {
                                sender.get("canvas").remove()
                                sender.updateLayout(function (make, view) {
                                  make.size.equalTo($size(75, 30))
                                })
                                $ui.animate({
                                  duration: 0.2,
                                  animation: function () {
                                    sender.relayout()
                                  },
                                  completion: function () {
                                    sender.title = "打开"
                                    api.uploadDownloadTimes(app.objectId)
                                    $app.notify({
                                      name: "refreshAll",
                                      object: { appItem: false }
                                    });
                                    app.needUpdate = false
                                    app.haveInstalled = true
                                    sender.userInteractionEnabled = true
                                    $device.taptic(2);
                                    $delay(0.2, () => { $device.taptic(2); })
                                  }
                                })
                              }
                            })
                          }
                        })
                      }
                    })
                  }
                }
              },
            }]
          }, {
            type: "button",
            props: {
              title: "",//"⋯",
              bgcolor: utils.themeColor.appButtonBgColor,
              titleColor: utils.getCache("themeColor"),
              font: $font("bold", 20),
              circular: true,
              align: $align.center,
            },
            layout: function (make, view) {
              make.centerY.equalTo(view.super)
              make.right.inset(0)
              make.size.equalTo($size(30, 30))
            },
            events: {
              tapped: function (sender) {
                $ui.menu({
                  items: ["分享链接"],
                  handler: function (title, idx) {
                    switch (idx) {
                      case 0: $share.sheet([app.appName, "https://liuguogy.github.io/JSBox-addins/?q=show&objectId=" + app.objectId]); break;
                      case 1: genAppShareView(app); break;
                    }
                  }
                });
              }
            },
            views: [{
              type: "canvas",
              props: {
                userInteractionEnabled: false,
              },
              layout: $layout.fill,
              events: {
                draw: function (view, ctx) {
                  ctx.fillColor = utils.getCache("themeColor")
                  ctx.strokeColor = utils.getCache("themeColor")
                  ctx.setLineWidth(2)
                  ctx.addArc(view.frame.width / 2, view.frame.height / 2, 1, 0, 2 * Math.PI, true)
                  ctx.strokePath()
                  ctx.addArc(view.frame.width / 2 - 6, view.frame.height / 2, 1, 0, 2 * Math.PI, true)
                  ctx.strokePath()
                  ctx.addArc(view.frame.width / 2 + 6, view.frame.height / 2, 1, 0, 2 * Math.PI, true)
                  ctx.strokePath()
                }
              }
            }]
          }]
        }, {
          type: "label",
          props: {
            text: app.appName,
            font: $font("PingFangSC-Medium", 20),
            textColor: utils.themeColor.listHeaderTextColor,
            align: $align.left,
          },
          layout: function (make, view) {
            make.left.equalTo(view.prev.left).inset(0)
            make.right.inset(0)
            make.top.equalTo(view.prev.prev.top)
          }
        }, {
          type: "label",
          props: {
            text: (app.subtitle != "") ? app.subtitle : app.appCate,
            font: $font(13),
            textColor: utils.themeColor.appCateTextColor,
            align: $align.left,
          },
          layout: function (make, view) {
            make.left.equalTo(view.prev.left)
            make.right.equalTo(view.prev)
            make.top.equalTo(view.prev.bottom).inset(3)
          }
        },]
      }, {
        type: "view",
        layout: function (make, view) {
          make.left.right.inset(0)
          make.top.equalTo(view.prev.bottom)
          make.centerX.equalTo(view.super)
          make.height.equalTo(60)
        },
        views: [{
          type: "view",
          layout: function (make, view) {
            make.width.equalTo(view.super).multipliedBy(0.3)
            make.center.equalTo(view.super)
            make.height.equalTo(view.super)
          },
          views: [{
            type: "label",
            props: {
              text: "" + app.downloadTimes,
              font: $font("PingFangSC-Medium", 20),
              align: $align.center,
              textColor: $color("gray"),
            },
            layout: function (make, view) {
              make.top.inset(15)
              make.height.equalTo(18)
              make.centerX.equalTo(view.super)
            },
          }, {
            type: "label",
            props: {
              text: "下载量",
              font: $font(11),
              align: $align.center,
              textColor: utils.themeColor.appHintColor,
            },
            layout: function (make, view) {
              make.top.equalTo(view.prev.bottom).inset(5)
              make.height.equalTo(15)
              make.centerX.equalTo(view.super)
            },
          }]
        }, {
          type: "view",
          layout: function (make, view) {
            make.left.inset(20)
            make.right.equalTo(view.prev.left)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
          views: [{
            type: "label",
            props: {
              text: "" + app.comment.length,
              font: $font("PingFangSC-Medium", 20),
              align: $align.center,
              textColor: $color("gray"),
            },
            layout: function (make, view) {
              make.top.inset(15)
              make.height.equalTo(18)
              make.centerX.equalTo(view.super)
            },
          }, {
            type: "label",
            props: {
              text: "评论",
              font: $font(11),
              align: $align.center,
              textColor: utils.themeColor.appHintColor,
            },
            layout: function (make, view) {
              make.top.equalTo(view.prev.bottom).inset(5)
              make.height.equalTo(15)
              make.centerX.equalTo(view.super)
            },
          }]
        }, {
          type: "view",
          layout: function (make, view) {
            make.right.inset(20)
            make.left.equalTo(view.prev.prev.right)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
          views: [{
            type: "label",
            props: {
              text: "0",
              font: $font("PingFangSC-Medium", 20),
              align: $align.center,
              textColor: $color("gray"),
            },
            layout: function (make, view) {
              make.top.inset(15)
              make.height.equalTo(18)
              make.centerX.equalTo(view.super)
            },
          }, {
            type: "label",
            props: {
              text: "点赞",
              font: $font(11),
              align: $align.center,
              textColor: utils.themeColor.appHintColor,
            },
            layout: function (make, view) {
              make.top.equalTo(view.prev.bottom).inset(5)
              make.height.equalTo(15)
              make.centerX.equalTo(view.super)
            },
          }]
        }]
      }, {
        type: "canvas",
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
        },
        events: {
          draw: function (view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("lightGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      }, {
        type: "view",
        layout: function (make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom)
          make.height.equalTo(90)
          make.left.right.inset(0)
        },
        views: [{
          type: "view",
          layout: function (make, view) {
            make.top.inset(10)
            make.height.equalTo(50)
            make.left.right.inset(0)
          },
          views: [{
            type: "label",
            props: {
              text: "新功能",
              font: $font("bold", 22),
              align: $align.center,
              textColor: utils.themeColor.listHeaderTextColor,
            },
            layout: function (make, view) {
              make.top.inset(0)
              make.height.equalTo(50)
              make.left.inset(20)
            },
          }, {
            type: "button",
            props: {
              title: "版本历史记录",
              bgcolor: $color("clear"),
              titleColor: utils.getCache("themeColor"),
              font: $font(17),
            },
            layout: function (make, view) {
              make.top.inset(0)
              make.height.equalTo(50)
              make.right.inset(20)
            },
            events: {
              tapped: function (sender) {
                genUpdateHistoryView(app)
              }
            }
          },]
        }, {
          type: "view",
          layout: function (make, view) {
            make.top.equalTo(view.prev.bottom)
            make.height.equalTo(25)
            make.width.equalTo(view.super)
          },
          views: [{
            type: "label",
            props: {
              text: "版本 " + app.appVersion,
              font: $font(14),
              align: $align.center,
              textColor: utils.themeColor.appCateTextColor,
            },
            layout: function (make, view) {
              make.centerY.equalTo(view.super)
              make.height.equalTo(25)
              make.left.inset(20)
            },
          }, {
            type: "label",
            props: {
              text: utils.getUpdateDateString((app.updateTime) ? app.updateTime : app.updatedAt),
              font: $font(14),
              align: $align.center,
              textColor: utils.themeColor.appCateTextColor,
            },
            layout: function (make, view) {
              make.centerY.equalTo(view.super)
              make.height.equalTo(25)
              make.right.inset(20)
            },
          }]
        },]
      }, {
        type: "label",
        props: {
          id: "appVerInstLabel",
          text: app.versionInst,
          align: $align.left,
          lines: 0,
          font: $font("PingFangSC-Regular", 15),
          attributedText: utils.setLineSpacing(app.versionInst, 5),
          textColor: utils.themeColor.listContentTextColor,
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(5)
          if (appVerInstSize.height > appVerInstFoldHeight) {
            make.height.equalTo(appVerInstFoldHeight)
          } else {
            make.height.equalTo(appVerInstSize.height)
          }
          make.left.right.inset(20)
          make.centerX.equalTo(view.super)
        }
      }, {
        type: "gradient",
        props: {
          colors: [utils.getThemeMode() == "dark" ? $rgba(0, 0, 0, 0.0) : $rgba(255, 255, 255, 0.0), utils.themeColor.mainColor],
          locations: [0.0, 0.3],
          startPoint: $point(0, 0.5),
          endPoint: $point(1, 0.5),
          hidden: (appVerInstSize.height <= appVerInstFoldHeight),
          bgcolor: $color("clear"),
        },
        layout: function (make, view) {
          make.right.bottom.equalTo(view.prev)
          make.width.equalTo(50)
          make.height.equalTo(20)
        },
        views: [{
          type: "button",
          props: {
            title: "更多",
            font: $font("PingFangSC-Regular", 15),
            titleColor: utils.getCache("themeColor"),
            bgcolor: $color("clear"),
            radius: 0,
            contentEdgeInsets: $insets(2, 5, 2, 0),
          },
          layout: function (make, view) {
            make.right.equalTo(view.super)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
          events: {
            tapped: function (sender) {
              sender.super.hidden = true
              $("appVerInstLabel").updateLayout(function (make, view) {
                make.height.equalTo(appVerInstSize.height)
              })
              $("appVerInstLabel").relayout()
              resizeItemScroll()
            }
          }
        }],
      }, {
        type: "canvas",
        layout: function (make, view) {
          if (app.previews.length > 0) {
            make.top.equalTo(view.prev.bottom).inset(20)
            make.height.equalTo(1 / $device.info.screen.scale)
          } else {
            make.top.equalTo(view.prev.bottom).inset(0)
            make.height.equalTo(0)
          }
          make.left.right.inset(20)
        },
        events: {
          draw: function (view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("lightGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      }, {
        type: "label",
        props: {
          text: "预览",
          font: $font("bold", 22),
          align: $align.center,
          textColor: utils.themeColor.listHeaderTextColor,
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          if (app.previews.length > 0) {
            make.height.equalTo(40)
          } else {
            make.height.equalTo(0)
          }
          make.left.inset(20)
        },
      }, {
        type: "view",
        props: {
          id: "appPreviewPhotosScrollParent",
          bgcolor: utils.themeColor.bgcolor,
        },
        layout: function (make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(0)
          if (app.previews.length > 0) {
            make.height.equalTo(260)
          } else {
            make.height.equalTo(0)
          }
          make.left.right.inset(0)
        },
        views: [{
          type: "scroll",
          props: {
            id: "appPreviewPhotosScroll",
            contentSize: $size(app.previews.length * 100, 260),
            alwaysBounceHorizontal: true,
            alwaysBounceVertical: false,
            userInteractionEnabled: true,
            showsHorizontalIndicator: false,
            showsVerticalIndicator: false,
          },
          layout: function (make, view) {
            make.center.equalTo(view.super)
            make.size.equalTo(view.super)
          },
          views: ui.genAppPreviewPhotosView(app.previews, function (sender) {
            genAppPreviewPhotosScrollView(app.previews)
          }),
        },]
      }, {
        type: "canvas",
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
        },
        events: {
          draw: function (view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("lightGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      }, {
        type: "label",
        props: {
          id: "appInstLabel",
          text: app.instruction,
          align: $align.left,
          lines: 0,
          font: $font("PingFangSC-Regular", 15),
          attributedText: utils.setLineSpacing(app.instruction, 5),
          textColor: utils.themeColor.listContentTextColor,
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          if (appInstSize.height > appInstFoldHeight) {
            make.height.equalTo(appInstFoldHeight)
          } else {
            make.height.equalTo(appInstSize.height)
          }
          make.left.right.inset(20)
          make.centerX.equalTo(view.super)
        },
      }, {
        type: "gradient",
        props: {
          colors: [utils.getThemeMode() == "dark" ? $rgba(0, 0, 0, 0.0) : $rgba(255, 255, 255, 0.0), utils.themeColor.mainColor],
          locations: [0.0, 0.3],
          startPoint: $point(0, 0.5),
          endPoint: $point(1, 0.5),
          hidden: (appInstSize.height <= appInstFoldHeight),
          bgcolor: $color("clear"),
        },
        layout: function (make, view) {
          make.right.bottom.equalTo(view.prev)
          make.width.equalTo(50)
          make.height.equalTo(20)
        },
        views: [{
          type: "button",
          props: {
            title: "更多",
            font: $font("PingFangSC-Regular", 15),
            titleColor: utils.getCache("themeColor"),
            bgcolor: $color("clear"),
            radius: 0,
            contentEdgeInsets: $insets(2, 5, 2, 0),
          },
          layout: function (make, view) {
            make.right.equalTo(view.super)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
          events: {
            tapped: function (sender) {
              sender.super.hidden = true
              $("appInstLabel").updateLayout(function (make, view) {
                make.height.equalTo(appInstSize.height)
              })
              $("appInstLabel").relayout()
              resizeItemScroll()
            }
          }
        }],
      }, {
        type: "canvas",
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
        },
        events: {
          draw: function (view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("lightGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      }, {
        type: "view",
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(50)
          make.left.right.inset(20)
        },
        views: [{
          type: "label",
          props: {
            text: "评论",
            font: $font("bold", 22),
            align: $align.center,
            textColor: utils.themeColor.listHeaderTextColor,
          },
          layout: function (make, view) {
            make.top.inset(0)
            make.height.equalTo(50)
            make.left.inset(0)
          },
        }, {
          type: "button",
          props: {
            title: "撰写评论",
            bgcolor: $color("clear"),
            titleColor: utils.getCache("themeColor"),
            font: $font(17),
          },
          layout: function (make, view) {
            make.top.inset(0)
            make.height.equalTo(50)
            make.right.inset(0)
          },
          events: {
            tapped: function (sender) {
              if (!user.haveLogined()) {
                $ui.alert({
                  title: "提示",
                  message: "未登录用户无法发布评论，请先登录",
                  actions: [
                    {
                      title: "我要登录",
                      handler: function () {
                        logUpView.setupLoginView()
                      }
                    },
                    {
                      title: "我要注册",
                      handler: function () {
                        logUpView.setupLogUpView()
                      }
                    },
                    {
                      title: "好的",
                      handler: function () {

                      }
                    },
                  ]
                });
              } else {
                genCommentView(app)
              }
            }
          }
        }]
      }, commentView, {
        type: "view",
        props: {
          clipsToBounds: true,
        },
        layout: function (make, view) {
          if(user.haveLogined() && user.getLoginUser().objectId == app.authorId && app.comment.length > 0) {
            make.top.equalTo(view.prev.bottom).inset(10)
            make.height.equalTo(20)
          } else {
            make.top.equalTo(view.prev.bottom)
            make.height.equalTo(0)
          }
          make.left.right.inset(20)
        },
        views: [{
          type: "image",
          props: {
            icon: $icon("009", utils.themeColor.appHintColor , $size(14, 14)),
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(14, 14))
            make.left.inset(10)
          }
        },{
          type: "label",
          props: {
            text: "长按评论可以回复",
            bgcolor: $color("clear"),
            textColor: utils.themeColor.appHintColor,
            font: $font(13),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.left.equalTo(view.prev.right).inset(5)
            make.right.inset(10)
            make.height.equalTo(view.super)
          },
        }],
      },{
        type: "canvas",
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
        },
        events: {
          draw: function (view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("lightGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      }, {
        type: "label",
        props: {
          text: "信息",
          font: $font("bold", 22),
          align: $align.center,
          textColor: utils.themeColor.listHeaderTextColor,
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(50)
          make.left.inset(20)
        },
      }, {
        type: "view",
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom)
          make.height.equalTo(40)
          make.left.right.inset(20)
        },
        views: [{
          type: "label",
          props: {
            text: "开发者",
            align: $align.left,
            font: $font("PingFangSC-Regular", 14),
            textColor: utils.themeColor.appCateTextColor,
          },
          layout: function (make, view) {
            make.top.inset(0)
            make.height.equalTo(20)
            make.left.inset(0)
            make.centerY.equalTo(view.super)
          }
        }, {
          type: "label",
          props: {
            text: (app.author) ? app.author : "无",
            align: $align.right,
            font: $font("PingFangSC-Regular", 14),
            textColor: utils.themeColor.listHeaderTextColor,
          },
          layout: function (make, view) {
            make.top.inset(0)
            make.height.equalTo(20)
            make.right.inset(0)
            make.width.equalTo(100)
            make.centerY.equalTo(view.super)
          }
        }, {
          type: "canvas",
          layout: function (make, view) {
            make.bottom.inset(0)
            make.height.equalTo(1 / $device.info.screen.scale)
            make.left.right.inset(0)
          },
          events: {
            draw: function (view, ctx) {
              var width = view.frame.width
              var scale = $device.info.screen.scale
              ctx.strokeColor = $color("#D0D0D0")
              ctx.setLineWidth(1 / scale)
              ctx.moveToPoint(0, 0)
              ctx.addLineToPoint(width, 0)
              ctx.strokePath()
            }
          }
        }]
      }, {
        type: "view",
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom)
          make.height.equalTo(40)
          make.left.right.inset(20)
        },
        views: [{
          type: "label",
          props: {
            text: "类别",
            align: $align.left,
            font: $font(14),
            textColor: utils.themeColor.appCateTextColor,
          },
          layout: function (make, view) {
            make.top.inset(0)
            make.height.equalTo(20)
            make.left.inset(0)
            make.centerY.equalTo(view.super)
          }
        }, {
          type: "label",
          props: {
            text: app.appCate,
            align: $align.right,
            font: $font(14),
            textColor: utils.themeColor.listHeaderTextColor,
          },
          layout: function (make, view) {
            make.top.inset(0)
            make.height.equalTo(20)
            make.right.inset(0)
            make.width.equalTo(100)
            make.centerY.equalTo(view.super)
          }
        }, {
          type: "canvas",
          layout: function (make, view) {
            make.bottom.inset(0)
            make.height.equalTo(1 / $device.info.screen.scale)
            make.left.right.inset(0)
          },
          events: {
            draw: function (view, ctx) {
              var width = view.frame.width
              var scale = $device.info.screen.scale
              ctx.strokeColor = $color("#D0D0D0")
              ctx.setLineWidth(1 / scale)
              ctx.moveToPoint(0, 0)
              ctx.addLineToPoint(width, 0)
              ctx.strokePath()
            }
          }
        }]
      }, {
        type: "view",
        props: {
          hidden: !app.praise,
          clipsToBounds: true,
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(10)
          if (app.praise) {
            make.height.equalTo(110)
          } else {
            make.height.equalTo(0)
          }
          make.left.right.inset(0)
        },
        views: [{
          type: "button",
          props: {
            title: " 赞赏作者",
            icon: $icon("103", utils.getCache("themeColor"), $size(20, 20)),
            bgcolor: utils.themeColor.appButtonBgColor,
            titleColor: utils.getCache("themeColor"),
            font: $font("bold", 16.5),
            radius: 7,
            align: $align.center,
          },
          layout: function (make, view) {
            make.center.equalTo(view.super)
            make.size.equalTo($size(150, 50))
          },
          events: {
            tapped: function (sender) {
              $ui.alert({
                title: "提示",
                message: "开发者 " + app.author + " 为了给你更好的体验，为该应用更新了 " + (app.buildVersion) + " 个版本，你的赞赏会给开发者更多的动力。\n\n即将跳转赞赏开发者，确定跳转？",
                actions: [{
                  title: "确定",
                  handler: function () {
                    if (app.praise) {
                      $app.openURL(app.praise);
                    }
                  }
                }, {
                  title: "取消",
                  handler: function () {
                  }
                }]
              });
            }
          },
        }]
      },]
    },]
  }
}

function genAppPreviewPhotosScrollView(photos) {
  let moveXOffsetOld, moveXOffsetNew;
  let items = []
  for (let i = 0; i < photos.length; i++) {
    items.push({
      type: "image",
      props: {
        src: photos[i],
        radius: 5,
        contentMode: $contentMode.scaleToFill,
        borderWidth: 1 / $device.info.screen.scale,
        borderColor: $color("#E0E0E0"),
      },
      layout: function (make, view) {
        make.centerY.equalTo(view.super)
        if (i == 0) {
          make.left.inset(25)
        } else {
          make.left.equalTo(view.prev.right).inset(13)
        }
        make.width.equalTo($device.info.screen.width - 50)
        make.height.equalTo(view.super).multipliedBy(0.9)
      },
      views: [{
        type: "blur",
        props: {
          style: utils.themeColor.blurType, // 0 ~ 5
          alpha: (utils.getThemeMode() == "dark")?0.8:1,
        },
        layout: $layout.fill
      }, {
        type: "image",
        props: {
          src: photos[i],
          radius: 5,
          contentMode: $contentMode.scaleAspectFit,
          borderWidth: 1 / $device.info.screen.scale,
          borderColor: utils.themeColor.separatorColor,
          bgcolor: $color("clear"),
        },
        layout: $layout.fill,
      }]
    })
  }
  items.push({
    type: "view",
    layout: function (make, view) {
      make.centerY.equalTo(view.super)
      make.left.equalTo(view.prev.right)
      make.width.equalTo(25)
      make.height.equalTo(view.super).multipliedBy(0.9)
    }
  })
  $ui.push({
    props: {
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("应用", "预览"), {
      type: "view",
      props: {
        bgcolor: utils.themeColor.bgcolor,
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom).inset(0)
        make.left.right.inset(0)
        make.bottom.inset(0)
      },
      views: [{
        type: "scroll",
        props: {
          alwaysBounceHorizontal: true,
          alwaysBounceVertical: false,
          userInteractionEnabled: true,
          showsHorizontalIndicator: false,
          showsVerticalIndicator: false,
        },
        layout: function (make, view) {
          make.center.equalTo(view.super)
          make.size.equalTo(view.super)
        },
        views: items,
        events: {
          willBeginDragging: function (sender) {
            moveXOffsetOld = sender.contentOffset.x;
          },
          willEndDragging: function (sender, decelerate) {
            moveXOffsetNew = sender.contentOffset.x;
          },
          willBeginDecelerating: function (sender) {
            let offsetChange = moveXOffsetNew - moveXOffsetOld
            let unit = (sender.contentSize.width - 40) / photos.length
            let x = Math.round(moveXOffsetOld / unit) * unit
            if (Math.abs(offsetChange) > 40) {
              x = (offsetChange > 0) ? x + unit : x - unit
            }
            if (x < 0 || x > sender.contentSize.width - unit) {
              x = Math.round(moveXOffsetOld / unit) * unit
            }
            sender.scrollToOffset($point(x, 0))
          },
          didEndDragging: function (sender, decelerate) {
            let offsetChange = moveXOffsetNew - moveXOffsetOld
            let unit = (sender.contentSize.width - 40) / photos.length
            let x = Math.round(moveXOffsetOld / unit) * unit
            if (Math.abs(offsetChange) > 40) {
              x = (offsetChange > 0) ? x + unit : x - unit
            }
            if (x < 0 || x > sender.contentSize.width - unit) {
              x = Math.round(moveXOffsetOld / unit) * unit
            }
            sender.scrollToOffset($point(x, 0))
          }
        }
      },]
    },]
  });
}

function genCommentView(app) {
  $ui.push({
    props: {
      id: "addCommentView",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("应用", "撰写评论", {
      type: "button",
      props: {
        title: "发送",
        titleColor: utils.getCache("themeColor"),
        font: $font("bold", 17),
        bgcolor: $color("clear"),
        borderColor: $color("clear"),
      },
      layout: function (make, view) {
        make.right.inset(0)
        make.height.equalTo(view.super)
      },
      events: {
        tapped: async function (sender) {
          if ($("commentText").text.length >= 5) {
            sender.userInteractionEnabled = false
            sender.titleColor = utils.themeColor.appCateTextColor
            let userInfo = user.getLoginUser()
            let json = {
              userId: userInfo.objectId,
              name: userInfo.nickname,
              comment: $("commentText").text.trim(),
              time: new Date().getTime(),
            }
            await api.uploadComment(app.objectId, json)
            let cloudApps = utils.getCache("cloudApps", [])
            for (let i = 0; i < cloudApps.length; i++) {
              if (cloudApps[i].objectId === app.objectId) {
                cloudApps[i].comment.push(json)
              }
            }
            $cache.set("cloudApps", cloudApps);
            $app.notify({
              name: "refreshAll",
              object: { appItem: true }
            });
            ui.showToastView($("addCommentView"), utils.mColor.green, "发送成功")
            $delay(1, () => {
              $ui.pop();
            })
          } else {
            ui.showToastView($("addCommentView"), utils.mColor.red, "字数不得少于 5 个")
          }
        },
      },
    }), {
      type: "text",
      props: {
        id: "commentText",
        text: "",
        align: $align.left,
        radius: 0,
        textColor: utils.themeColor.listContentTextColor,
        font: $font(17),
        borderColor: $color("clear"),
        insets: $insets(12, 20, 12, 20),
        alwaysBounceVertical: true,
        bgcolor: utils.themeColor.bgcolor,
        tintColor: utils.getCache("themeColor"),
        darkKeyboard: utils.themeColor.darkKeyboard,
      },
      layout: function (make, view) {
        make.height.equalTo(view.super)
        make.top.equalTo(view.prev.bottom)
        make.centerX.equalTo(view.center)
        make.left.right.inset(0)
      },
      events: {
        changed: function (sender) {
          if (sender.text.length > 0) {
            $("commentTextHint").hidden = true
          } else {
            $("commentTextHint").hidden = false
          }
        },
      },
      views: [{
        type: "label",
        props: {
          id: "commentTextHint",
          text: "评论（必填）",
          align: $align.left,
          textColor: utils.themeColor.appHintColor,
          font: $font(17)
        },
        layout: function (make, view) {
          make.left.inset(24)
          make.top.inset(12)
        }
      }]
    }]
  })
}

function genCommentReplyView(app, position) {
  $ui.push({
    props: {
      id: "addCommentReplyView",
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("应用", "回复评论", {
      type: "button",
      props: {
        title: "发送",
        titleColor: utils.getCache("themeColor"),
        font: $font("bold", 17),
        bgcolor: $color("clear"),
        borderColor: $color("clear"),
      },
      layout: function (make, view) {
        make.right.inset(0)
        make.height.equalTo(view.super)
      },
      events: {
        tapped: async function (sender) {
          if ($("commentText").text.length >= 5) {
            sender.userInteractionEnabled = false
            sender.titleColor = utils.themeColor.appCateTextColor
            let comment = app.comment[position]
            comment.reply = $("commentText").text
            comment.replyTime = new Date().getTime()
            await api.uploadReply(app.objectId, comment)
            let cloudApps = utils.getCache("cloudApps", [])
            for (let i = 0; i < cloudApps.length; i++) {
              if (cloudApps[i].objectId === app.objectId) {
                cloudApps[i].comment[position].reply = comment.reply
                cloudApps[i].comment[position].replyTime = comment.replyTime
              }
            }
            $cache.set("cloudApps", cloudApps);
            $app.notify({
              name: "refreshAll",
              object: { appItem: true }
            });
            ui.showToastView($("addCommentReplyView"), utils.mColor.green, "发送成功")
            $delay(1, () => {
              $ui.pop();
            })
          } else {
            ui.showToastView($("addCommentReplyView"), utils.mColor.red, "字数不得少于 5 个")
          }
        },
      },
    }), {
      type: "text",
      props: {
        id: "commentText",
        text: "",
        align: $align.left,
        radius: 0,
        textColor: utils.themeColor.listContentTextColor,
        font: $font(17),
        borderColor: $color("clear"),
        insets: $insets(12, 20, 12, 20),
        alwaysBounceVertical: true,
        bgcolor: utils.themeColor.bgcolor,
        tintColor: utils.getCache("themeColor"),
        darkKeyboard: utils.themeColor.darkKeyboard,
      },
      layout: function (make, view) {
        make.height.equalTo(view.super)
        make.top.equalTo(view.prev.bottom)
        make.centerX.equalTo(view.center)
        make.left.right.inset(0)
      },
      events: {
        changed: function (sender) {
          if (sender.text.length > 0) {
            $("commentTextHint").hidden = true
          } else {
            $("commentTextHint").hidden = false
          }
        },
      },
      views: [{
        type: "label",
        props: {
          id: "commentTextHint",
          text: "评论（必填）",
          align: $align.left,
          textColor: utils.themeColor.appHintColor,
          font: $font(17)
        },
        layout: function (make, view) {
          make.left.inset(24)
          make.top.inset(12)
        }
      }]
    }]
  })
}

function genUpdateHistoryView(app) {
  let history = app.versionHistory
  let historyViews = []
  for (let i = history.length - 1; i >= 0; i--) {
    historyViews.push({
      type: "view",
      layout: function (make, view) {
        make.centerX.equalTo(view.super)
        if (i == history.length - 1) {
          make.top.inset(0)
        } else {
          make.top.equalTo(view.prev.bottom)
        }
        let size = $text.sizeThatFits({
          text: history[i].versionInst,
          width: $device.info.screen.width - 40,
          font: $font("PingFangSC-Regular", 15),
          lineSpacing: 5,
        })
        make.height.equalTo(size.height + 60)
        make.left.right.inset(0)
      },
      views: [{
        type: "view",
        layout: function (make, view) {
          make.top.inset(10)
          make.width.equalTo(view.super)
          make.centerX.equalTo(view.super)
          make.height.equalTo(30)
        },
        views: [{
          type: "label",
          props: {
            text: history[i].version,
            font: $font("PingFangSC-Medium", 15),
            align: $align.center,
            textColor: utils.themeColor.listHeaderTextColor,
          },
          layout: function (make, view) {
            make.left.inset(20)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
        }, {
          type: "label",
          props: {
            text: utils.getUpdateDateString(history[i].time),
            font: $font(15),
            align: $align.center,
            textColor: utils.themeColor.appCateTextColor,
          },
          layout: function (make, view) {
            make.right.inset(20)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
        }]
      }, {
        type: "label",
        props: {
          text: history[i].versionInst,
          font: $font("PingFangSC-Regular", 15),
          align: $align.left,
          textColor: utils.themeColor.listHeaderTextColor,
          lines: 0,
          attributedText: utils.setLineSpacing(history[i].versionInst, 5),
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(5)
          make.centerX.equalTo(view.super)
          let size = $text.sizeThatFits({
            text: history[i].versionInst,
            width: $device.info.screen.width - 40,
            font: $font("PingFangSC-Regular", 15),
            lineSpacing: 5,
          })
          make.height.equalTo(size.height)
          make.left.right.inset(20)
        },
      }, {
        type: "canvas",
        layout: function (make, view) {
          make.bottom.inset(0)
          make.height.equalTo(1 / $device.info.screen.scale)
          make.left.right.inset(20)
        },
        events: {
          draw: function (view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("lightGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      }]
    })
  }
  $ui.push({
    props: {
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("应用", "版本历史记录"), {
      type: "scroll",
      props: {
        alwaysBounceHorizontal: false,
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
      },
      views: historyViews,
      events: {
        ready: function (sender) {
          sender.resize()
          sender.alwaysBounceHorizontal = false
          sender.contentSize = $size(0, sender.contentSize.height)
        }
      }
    }]
  })
}

function genCommentDetailView(comment) {
  let commentSize = $text.sizeThatFits({
    text: comment.comment,
    width: $device.info.screen.width - 70,
    font: $font("PingFangSC-Regular", 15),
  })
  let replySize = $text.sizeThatFits({
    text: comment.reply,
    width: $device.info.screen.width - 70,
    font: $font("PingFangSC-Regular", 15),
  })
  let subViews = [{
    type: "label",
    props: {
      text: comment.name,
      textColor: utils.themeColor.appHintColor,
      font: $font("PingFangSC-Regular", 15),
    },
    layout: function (make, view) {
      make.top.inset(10)
      make.height.equalTo(20)
      make.left.inset(15)
    },
  }, {
    type: "label",
    props: {
      text: utils.getUpdateDateString(comment.time),
      textColor: utils.themeColor.appHintColor,
      font: $font("PingFangSC-Regular", 14),
    },
    layout: function (make, view) {
      make.top.inset(10)
      make.height.equalTo(20)
      make.right.inset(15)
    },
  }, {
    type: "label",
    props: {
      text: comment.comment,
      textColor: utils.themeColor.listHeaderTextColor,
      font: $font("PingFangSC-Regular", 15),
      align: $align.justified,
      bgcolor: $color("clear"),
      lines: 0,
    },
    layout: function (make, view) {
      make.top.equalTo(view.prev.bottom).inset(7)
      make.left.right.inset(15)
    },
  }]
  if (comment.reply) {
    subViews.push({
      type: "label",
      props: {
        text: "开发者回复",
        textColor: utils.themeColor.appHintColor,
        font: $font("PingFangSC-Regular", 15),
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom).inset(10)
        make.height.equalTo(20)
        make.left.inset(15)
      },
    }, {
        type: "label",
        props: {
          text: utils.getUpdateDateString(comment.replyTime),
          textColor: utils.themeColor.appHintColor,
          font: $font("PingFangSC-Regular", 14),
        },
        layout: function (make, view) {
          make.centerY.equalTo(view.prev)
          make.height.equalTo(20)
          make.right.inset(15)
        },
      }, {
        type: "label",
        props: {
          text: comment.reply,
          textColor: utils.themeColor.listHeaderTextColor,
          font: $font("PingFangSC-Regular", 15),
          align: $align.justified,
          bgcolor: $color("clear"),
          lines: 0,
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev.bottom).inset(7)
          make.left.right.inset(15)
        },
      })
  }
  $ui.push({
    props: {
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("应用", "评论详情"), {
      type: "scroll",
      props: {
        alwaysBounceHorizontal: false,
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
      },
      views: [{
        type: "view",
        props: {
          bgcolor: utils.themeColor.commentBgColor,
          radius: 8,
        },
        layout: function (make, view) {
          make.top.inset(20)
          make.height.equalTo(commentSize.height + replySize.height + 87)
          make.left.inset(20)
          make.width.equalTo($device.info.screen.width - 40)
        },
        views: subViews
      }],
      events: {
        ready: function (sender) {
          sender.resize()
          sender.alwaysBounceHorizontal = false
          sender.contentSize = $size(0, sender.contentSize.height + 20)
        }
      }
    }]
  })
}

function genAppShareView(app) {
  $ui.push({
    props: {
      navBarHidden: true,
      statusBarStyle: utils.themeColor.statusBarStyle,
      bgcolor: utils.themeColor.mainColor,
    },
    views: [ui.genPageHeader("应用", "分享"), {
      type: "scroll",
      props: {
        alwaysBounceHorizontal: false,
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev.bottom)
        make.left.right.bottom.inset(0)
      },
      views: [{
        type: "view",
        props: {
          bgcolor: $color("white"),
          radius: 0,
        },
        layout: function (make, view) {
          make.top.inset(20)
          make.height.equalTo(200)
          make.left.inset(0)
          make.width.equalTo($device.info.screen.width)
        },
        views: [{
          type: "view",
          props: {
            bgcolor: $color("clear"),
            radius: 15,
          },
          layout: function (make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(180)
            make.left.right.inset(20)
          },
          views: []
        }]
      }],
      events: {
        ready: function (sender) {
          sender.resize()
          sender.alwaysBounceHorizontal = false
          sender.contentSize = $size(0, sender.contentSize.height)
        }
      }
    }]
  })
}

module.exports = {
  show: show,
  preview: preview,
}