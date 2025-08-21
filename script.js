// 电子元器件管理系统
class ComponentManager {
    constructor() {
        this.components = [];
        this.editingIndex = -1;
        this.init();
    }

    // 初始化
    async init() {
        this.setupEventListeners();
        await this.loadData();
        this.renderTable();
        this.updateStats();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 按钮事件
        document.getElementById('addBtn').addEventListener('click', () => this.openModal());
        document.getElementById('syncBtn').addEventListener('click', () => this.syncData());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        
        // 表单提交
        document.getElementById('componentForm').addEventListener('submit', (e) => this.handleSubmit(e));
        
        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // 模态框关闭
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal')) {
                this.closeModal();
            }
        });
    }

    // 加载数据
    async loadData() {
        try {
            // 优先从GitHub加载数据
            const githubData = await this.loadFromGitHub();
            if (githubData) {
                this.components = githubData;
                this.saveToLocal(); // 备份到本地
                return;
            }
        } catch (error) {
            console.log('从GitHub加载失败，尝试从本地加载:', error);
        }

        // 从本地存储加载
        const localData = localStorage.getItem('components');
        if (localData) {
            this.components = JSON.parse(localData);
        } else {
            // 如果没有数据，使用示例数据
            this.components = this.getDefaultData();
            this.saveToLocal();
        }
    }

    // 从GitHub加载数据
    async loadFromGitHub() {
        const config = this.getGitHubConfig();
        if (!config.token || !config.repo) {
            console.log('GitHub配置不完整，使用本地存储');
            return null;
        }

        try {
            const response = await fetch(`https://api.github.com/repos/${config.repo}/contents/data.json`, {
                headers: {
                    'Authorization': `token ${config.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const content = atob(data.content);
                return JSON.parse(content);
            }
        } catch (error) {
            console.error('GitHub API错误:', error);
        }
        return null;
    }

    // 保存到GitHub
    async saveToGitHub() {
        const config = this.getGitHubConfig();
        if (!config.token || !config.repo) {
            console.log('GitHub配置不完整，只保存到本地');
            return false;
        }

        try {
            // 先获取当前文件的SHA
            const getResponse = await fetch(`https://api.github.com/repos/${config.repo}/contents/data.json`, {
                headers: {
                    'Authorization': `token ${config.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            let sha = null;
            if (getResponse.ok) {
                const fileData = await getResponse.json();
                sha = fileData.sha;
            }

            // 上传数据
            const content = btoa(JSON.stringify(this.components, null, 2));
            const uploadData = {
                message: `更新元器件数据 - ${new Date().toLocaleString()}`,
                content: content
            };

            if (sha) {
                uploadData.sha = sha;
            }

            const response = await fetch(`https://api.github.com/repos/${config.repo}/contents/data.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${config.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(uploadData)
            });

            return response.ok;
        } catch (error) {
            console.error('保存到GitHub失败:', error);
            return false;
        }
    }

    // 获取GitHub配置
    getGitHubConfig() {
        return {
            token: localStorage.getItem('github_token') || '',
            repo: localStorage.getItem('github_repo') || ''
        };
    }

    // 保存到本地
    saveToLocal() {
        localStorage.setItem('components', JSON.stringify(this.components));
    }

    // 获取默认数据
    getDefaultData() {
        return [
            {
                name: 'AMS1117-3.3',
                category: '线性稳压器(LDO)',
                partNumber: 'C347223',
                location: '1',
                package: 'SOT-223',
                parameters: '输出电压5V，输出电流1A，耐压12V',
                stock: 10,
                datasheet: ''
            },
            {
                name: 'APH25201DT2K2M',
                category: '功率电感',
                partNumber: 'C5349606',
                location: '2',
                package: '1008',
                parameters: '电感值2.2uH，额定电流2.1A，饱和电流3A，精度±20%',
                stock: 5,
                datasheet: ''
            }
        ];
    }

    // 同步数据
    async syncData() {
        const syncBtn = document.getElementById('syncBtn');
        const originalText = syncBtn.textContent;
        syncBtn.textContent = '同步中...';
        syncBtn.disabled = true;

        try {
            const success = await this.saveToGitHub();
            if (success) {
                alert('数据同步成功！');
            } else {
                alert('GitHub同步失败，数据已保存到本地');
            }
        } catch (error) {
            alert('同步失败: ' + error.message);
        } finally {
            syncBtn.textContent = originalText;
            syncBtn.disabled = false;
        }
    }

    // 渲染表格
    renderTable(filteredComponents = null) {
        const tbody = document.getElementById('tableBody');
        const components = filteredComponents || this.components;
        
        tbody.innerHTML = '';
        
        components.forEach((component, index) => {
            const row = document.createElement('tr');
            if (component.stock < 5) {
                row.classList.add('low-stock');
            }
            
            row.innerHTML = `
                <td>${component.name}</td>
                <td>${component.category}</td>
                <td>${component.partNumber}</td>
                <td>${component.location}</td>
                <td>${component.package}</td>
                <td>${component.parameters}</td>
                <td>${component.stock}</td>
                <td>${component.datasheet ? `<a href="${component.datasheet}" target="_blank">查看</a>` : ''}</td>
                <td class="action-buttons">
                    <button class="btn btn-edit" onclick="manager.editComponent(${this.getOriginalIndex(component, filteredComponents)})">编辑</button>
                    <button class="btn btn-danger" onclick="manager.deleteComponent(${this.getOriginalIndex(component, filteredComponents)})">删除</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    // 获取原始索引
    getOriginalIndex(component, filteredComponents) {
        if (!filteredComponents) return this.components.indexOf(component);
        return this.components.findIndex(c => 
            c.name === component.name && 
            c.partNumber === component.partNumber
        );
    }

    // 更新统计信息
    updateStats() {
        const totalCount = this.components.length;
        const lowStockCount = this.components.filter(c => c.stock < 5).length;
        
        document.getElementById('totalCount').textContent = totalCount;
        document.getElementById('lowStockCount').textContent = lowStockCount;
    }

    // 搜索处理
    handleSearch(query) {
        if (!query.trim()) {
            this.renderTable();
            return;
        }
        
        const filtered = this.components.filter(component =>
            component.name.toLowerCase().includes(query.toLowerCase()) ||
            component.category.toLowerCase().includes(query.toLowerCase()) ||
            component.partNumber.toLowerCase().includes(query.toLowerCase()) ||
            component.parameters.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderTable(filtered);
    }

    // 打开模态框
    openModal(component = null, index = -1) {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('componentForm');
        
        this.editingIndex = index;
        
        if (component) {
            title.textContent = '编辑元器件';
            this.fillForm(component);
        } else {
            title.textContent = '添加元器件';
            form.reset();
        }
        
        modal.style.display = 'block';
    }

    // 关闭模态框
    closeModal() {
        document.getElementById('modal').style.display = 'none';
        this.editingIndex = -1;
    }

    // 填充表单
    fillForm(component) {
        document.getElementById('name').value = component.name;
        document.getElementById('category').value = component.category;
        document.getElementById('partNumber').value = component.partNumber;
        document.getElementById('location').value = component.location;
        document.getElementById('package').value = component.package;
        document.getElementById('parameters').value = component.parameters;
        document.getElementById('stock').value = component.stock;
        document.getElementById('datasheet').value = component.datasheet || '';
    }

    // 表单提交处理
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const component = {
            name: document.getElementById('name').value,
            category: document.getElementById('category').value,
            partNumber: document.getElementById('partNumber').value,
            location: document.getElementById('location').value,
            package: document.getElementById('package').value,
            parameters: document.getElementById('parameters').value,
            stock: parseInt(document.getElementById('stock').value) || 0,
            datasheet: document.getElementById('datasheet').value
        };
        
        if (this.editingIndex >= 0) {
            this.components[this.editingIndex] = component;
        } else {
            this.components.push(component);
        }
        
        this.saveToLocal();
        this.renderTable();
        this.updateStats();
        this.closeModal();
    }

    // 编辑元器件
    editComponent(index) {
        if (index >= 0 && index < this.components.length) {
            this.openModal(this.components[index], index);
        }
    }

    // 删除元器件
    deleteComponent(index) {
        if (index >= 0 && index < this.components.length) {
            if (confirm('确定要删除这个元器件吗？')) {
                this.components.splice(index, 1);
                this.saveToLocal();
                this.renderTable();
                this.updateStats();
            }
        }
    }
}

// 初始化应用
let manager;
document.addEventListener('DOMContentLoaded', () => {
    manager = new ComponentManager();
});

// GitHub配置函数（在控制台中使用）
function setGitHubConfig(token, repo) {
    localStorage.setItem('github_token', token);
    localStorage.setItem('github_repo', repo);
    console.log('GitHub配置已保存');
}