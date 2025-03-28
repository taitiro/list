document.addEventListener('DOMContentLoaded', function() {
    // チェックボックスの要素を取得
    const checkboxes = document.querySelectorAll('.checkbox');
    const resetButton = document.getElementById('reset');
    
    // ページ読み込み時にローカルストレージからチェック状態を復元
    loadCheckboxStates();
    
    // チェックボックスの状態が変更されたときのイベントリスナーを追加
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // チェックボックスの状態をローカルストレージに保存
            saveCheckboxState(this.id, this.checked);
            
            // ラベルのスタイルを更新
            updateLabelStyle(this);
        });
    });
    
    // リセットボタンのイベントリスナー
    resetButton.addEventListener('click', function() {
        // すべてのチェックボックスをリセット
        resetAllCheckboxes();
    });
    
    // ローカルストレージからチェックボックスの状態を読み込む関数
    function loadCheckboxStates() {
        checkboxes.forEach(checkbox => {
            // ローカルストレージから状態を取得
            const isChecked = localStorage.getItem(checkbox.id) === 'true';
            
            // チェックボックスの状態を設定
            checkbox.checked = isChecked;
            
            // ラベルのスタイルを更新
            updateLabelStyle(checkbox);
        });
    }
    
    // チェックボックスの状態をローカルストレージに保存する関数
    function saveCheckboxState(id, isChecked) {
        localStorage.setItem(id, isChecked);
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
        checkboxes.forEach(checkbox => {
            // チェックボックスをオフに設定
            checkbox.checked = false;
            
            // ローカルストレージから状態を削除
            localStorage.removeItem(checkbox.id);
            
            // ラベルのスタイルを更新
            updateLabelStyle(checkbox);
        });
    }
});
