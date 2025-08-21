# 电子元器件管理系统

一个基于Web的电子元器件管理工具，支持多端同步编辑，数据存储在GitHub仓库中。

## 功能特性

- ✅ 添加、编辑、删除元器件
- ✅ 实时搜索功能
- ✅ 库存统计
- ✅ 响应式设计，支持移动端
- ✅ 数据云端同步（基于GitHub API）
- ✅ 本地数据备份

## 快速部署

### 1. 创建GitHub仓库

1. 在GitHub上创建一个新的公开仓库
2. 将以下文件上传到仓库：
   - `index.html`
   - `style.css`
   - `script.js`
   - `data.json`

### 2. 启用GitHub Pages

1. 进入仓库的 Settings → Pages
2. Source 选择 "Deploy from a branch"
3. Branch 选择 "main" (或 "master")
4. 点击 Save

几分钟后，你的网站就会在 `https://yourusername.github.io/repository-name` 可以访问了。

### 3. 配置GitHub API（可选，用于多端同步）

为了实现多端数据同步，需要配置GitHub Personal Access Token：

1. 进入 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并复制token

5. 在网页的浏览器控制台中运行：
```javascript
setGitHubConfig('your_github_token', 'username/repository-name')
```

## 使用说明

### 基本操作

1. **添加元器件**：点击"添加元器件"按钮
2. **编辑元器件**：点击表格中的"编辑"按钮
3. **删除元器件**：点击表格中的"删除"按钮
4. **搜索元器件**：在搜索框中输入关键词
5. **同步数据**：点击"同步数据"按钮将数据保存到GitHub

### 数据字段说明

- **器件名称**：元器件的名称或型号
- **类别**：元器件类型（如电阻、电容、IC等）
- **器件编号**：厂商编号或内部编号
- **存放位置**：物理存储位置
- **封装类型**：器件的封装规格
- **参数值**：主要电气参数
- **库存数量**：当前库存数量（少于5个会高亮显示）
- **数据手册**：规格书链接

### 库存预警

当元器件库存少于5个时，表格行会以红色背景显示，帮助及时补充库存。

## 技术特性

- **纯前端**：无需服务器，完全基于静态文件
- **离线支持**：数据本地缓存，离线也能使用
- **云端同步**：通过GitHub API实现多设备数据同步
- **响应式**：适配桌面和移动设备

## 数据存储

1. **本地存储**：数据自动保存在浏览器的localStorage中
2. **云端同步**：配置GitHub token后，数据会同步到GitHub仓库的data.json文件
3. **备份策略**：本地和云端双重备份，确保数据安全

## 注意事项

1. GitHub token具有访问仓库的权限，请妥善保管
2. 首次使用时会有示例数据，可以直接编辑或删除
3. 如果GitHub同步失败，数据仍会保存在本地
4. 建议定期点击"同步数据"确保数据同步

## 扩展计划

- [ ] 批量导入/导出功能
- [ ] 图片上传支持
- [ ] 条码扫描功能
- [ ] 使用历史记录
- [ ] 多用户权限管理
- [ ] 采购提醒功能

## 支持

如有问题或建议，请在GitHub仓库中提交Issue。