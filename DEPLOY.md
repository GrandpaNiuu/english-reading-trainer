# 部署成网站

这个项目是静态网站，可以直接用 GitHub Pages 发布。

## 第一步：打开 Pages

进入仓库：

```text
Settings → Pages
```

## 第二步：选择发布来源

选择：

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

然后保存。

## 第三步：等待生成网址

GitHub 通常会生成类似下面的网址：

```text
https://grandpaniuu.github.io/english-reading-trainer/
```

如果打开是 404，通常是 Pages 还没启用，或者刚启用还没生效。

## 手机 App 化使用

网站打开后：

### iPhone Safari

1. 点击底部分享按钮。
2. 选择“添加到主屏幕”。
3. 之后就可以像 App 一样从桌面打开。

### Android Chrome

1. 打开网站。
2. 点击右上角菜单。
3. 选择“安装应用”或“添加到主屏幕”。

## 当前版本的数据保存方式

历史记录和导入题库保存在浏览器中。

也就是说：

- 同一台设备、同一个浏览器可以保留记录。
- 换设备后不会自动同步。
- 清除浏览器数据后记录会消失。

后续如果需要账号同步，需要再加后端数据库，例如 Supabase 或 Firebase。
