document.addEventListener('DOMContentLoaded', function() {
    // チェックボックスの要素を取得
    const checkboxes = document.querySelectorAll('.checkbox');
    const resetButton = document.getElementById('reset');
    const dateSelector = document.getElementById('dateSelector');
    const historyList = document.getElementById('historyList');
    
    // 日付選択器の初期値を今日の日付に設定
    const today = new Date().toISOString().split('T')[0];
    dateSelector.value = today;
    
    // チェックリストの内容を読み込む
    loadChecklistContent();
    
    // ページ読み込み時にローカルストレージからチェック状態を復元
    loadCheckboxStates();
    
    // 日付が変更されたときのイベントリスナー
    dateSelector.addEventListener('change', function() {
        loadCheckboxStates();
        updateHistory();
    });
    
    // チェックボックスの状態が変更されたときのイベントリスナーを追加
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('checkbox')) {
            // チェックボックスの状態をローカルストレージに保存
            saveCheckboxState(e.target.id, e.target.checked);
            
            // ラベルのスタイルを更新
            updateLabelStyle(e.target);
            
            // 履歴を更新
            updateHistory();
        }
    });
    
    // リセットボタンのイベントリスナー
    resetButton.addEventListener('click', function() {
        // すべてのチェックボックスをリセット
        resetAllCheckboxes();
        // 履歴を更新
        updateHistory();
    });
    
    // チェックリストの内容を読み込む関数
    async function loadChecklistContent() {
        try {
            const response = await fetch('list.md');
            const text = await response.text();
            const lines = text.split('\n');
            
            let currentCategory = '';
            let currentList = null;
            const categories = {
                '良好サイン': { element: document.getElementById('good-signs'), class: 'good' },
                '注意サイン': { element: document.getElementById('warning-signs'), class: 'warning' },
                '悪化サイン': { element: document.getElementById('danger-signs'), class: 'danger' }
            };
            
            // 各カテゴリーのリストをクリア
            Object.values(categories).forEach(cat => {
                cat.element.innerHTML = '';
            });
            
            // 行を処理
            lines.forEach(line => {
                line = line.trim();
                if (!line) return;
                
                if (line.startsWith('# ')) {
                    // カテゴリーの開始
                    currentCategory = line.substring(2);
                    currentList = categories[currentCategory]?.element;
                } else if (line.startsWith('- ') && currentList) {
                    // チェックリスト項目
                    const itemText = line.substring(2);
                    const itemId = `${currentCategory.toLowerCase().replace('サイン', '')}-${currentList.children.length + 1}`;
                    
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <input type="checkbox" id="${itemId}" class="checkbox">
                        <label for="${itemId}">${itemText}</label>
                    `;
                    currentList.appendChild(li);
                }
            });
            
            // チェックボックスの状態を再読み込み
            loadCheckboxStates();
        } catch (error) {
            console.error('チェックリストの読み込みに失敗しました:', error);
        }
    }
    
    // ローカルストレージからチェックボックスの状態を読み込む関数
    function loadCheckboxStates() {
        const selectedDate = dateSelector.value;
        document.querySelectorAll('.checkbox').forEach(checkbox => {
            // ローカルストレージから状態を取得
            const storageKey = `${checkbox.id}_${selectedDate}`;
            const isChecked = localStorage.getItem(storageKey) === 'true';
            
            // チェックボックスの状態を設定
            checkbox.checked = isChecked;
            
            // ラベルのスタイルを更新
            updateLabelStyle(checkbox);
        });
    }
    
    // チェックボックスの状態をローカルストレージに保存する関数
    function saveCheckboxState(id, isChecked) {
        const selectedDate = dateSelector.value;
        const storageKey = `${id}_${selectedDate}`;
        localStorage.setItem(storageKey, isChecked);
    }
    
    // ラベルのスタイルを更新する関数
    function updateLabelStyle(checkbox) {
        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        
        if (checkbox.checked) {
            label.classList.add('checked');
        } else {
            label.classList.remove('checked');
        }
    }
    
    // すべてのチェックボックスをリセットする関数
    function resetAllCheckboxes() {
        const selectedDate = dateSelector.value;
        document.querySelectorAll('.checkbox').forEach(checkbox => {
            // チェックボックスをオフに設定
            checkbox.checked = false;
            
            // ローカルストレージから状態を削除
            const storageKey = `${checkbox.id}_${selectedDate}`;
            localStorage.removeItem(storageKey);
            
            // ラベルのスタイルを更新
            updateLabelStyle(checkbox);
        });
    }
    
    // 日付を日本語の曜日に変換する関数
    function getJapaneseWeekday(date) {
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        return weekdays[new Date(date).getDay()];
    }
    
    // 週の開始日（月曜日）を取得する関数
    function getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff)).toISOString().split('T')[0];
    }
    
    // 日付を1日進める関数
    function addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    }
    
    // 履歴を更新する関数
    function updateHistory() {
        const selectedDate = dateSelector.value;
        const weekStart = getWeekStart(selectedDate);
        let historyHTML = '';
        
        // 週の各日付について処理
        for (let i = 0; i < 7; i++) {
            const currentDate = addDays(weekStart, i);
            const checkedItems = [];
            
            // その日のチェックされた項目を取得
            document.querySelectorAll('.checkbox').forEach(checkbox => {
                const storageKey = `${checkbox.id}_${currentDate}`;
                if (localStorage.getItem(storageKey) === 'true') {
                    const label = document.querySelector(`label[for="${checkbox.id}"]`);
                    checkedItems.push(label.textContent);
                }
            });
            
            // 日付と曜日を表示
            const weekday = getJapaneseWeekday(currentDate);
            const dateDisplay = `${currentDate} (${weekday})`;
            
            // チェックされた項目がある場合は表示
            if (checkedItems.length > 0) {
                historyHTML += `
                    <div class="history-item">
                        <div class="history-date">${dateDisplay}</div>
                        <div class="history-content">${checkedItems.join(', ')}</div>
                    </div>
                `;
            } else {
                historyHTML += `
                    <div class="history-item">
                        <div class="history-date">${dateDisplay}</div>
                        <div class="history-content">記録なし</div>
                    </div>
                `;
            }
        }
        
        // 履歴を表示
        historyList.innerHTML = historyHTML;
    }
    
    // 初期表示時に履歴を更新
    updateHistory();
});
