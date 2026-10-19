# 可视化导论 · 课程学习增强版

在原课程网站上增加知识点搜索、学习记录、收藏笔记、章节练习和时序图表联动实验。原站课程正文、页面样式、D3 演示、中英切换及补充案例保留。

原课程及内容来源：https://github.com/cinger007/vis 。原作者信息和课程署名保留；原课程内容的权利归原作者所有。本项目用于课程作业，新增部分位于 `dist/learning/`。

## 本地运行

需要 Python 3。进入本目录运行：

```powershell
python -m http.server 8080 --directory dist
```

浏览器访问 http://localhost:8080/ 。页面使用原站的 D3.js CDN，首次打开演示需要网络。无需安装 Node 依赖、账号或数据库。

## 新功能入口

首页和五章课程页右下角的“学习工具”按钮用于搜索、学习进度、收藏笔记、章节练习，以及进入时序联动实验。实验页面位于 `dist/learning/lab/index.html`。

学习完成状态由用户手动标记。学习记录保存在当前浏览器中，不会上传至服务器；更换浏览器或清除站点数据后，原记录不会自动同步，建议使用导出功能保存笔记与记录。

## 文件结构

- `dist/`：可直接部署的静态网站。
- `dist/learning/`：新增学习功能及实验页面。
- `scripts/prepare.py`：从原课程正文生成 27 个小节的搜索索引，并在六个页面注入新增入口。
- `scripts/verify.py`：检查原站文件是否完整保留、索引锚点和 JavaScript 语法。
- `scripts/upstream-hashes.json`：导入原站时记录的文件摘要，供核对使用。

运行 `python scripts/prepare.py` 可刷新索引；运行 `python scripts/verify.py` 可执行静态核对（语法检查需要 Node.js）。

## 发布

可将 `dist/` 内的完整内容部署到支持静态文件的服务器或 GitHub Pages。请保留章节目录和相对路径。`.openai/hosting.json` 是本次 Sites 发布的站点配置；自行迁移静态文件时不需要它。
