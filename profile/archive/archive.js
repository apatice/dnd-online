document.addEventListener('DOMContentLoaded', function() {
    const backBtn = document.querySelector('.back-btn');
    
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = '../profile.html';
        });
    }
    
    const archiveItems = document.querySelectorAll('.archive-item');
    
    archiveItems.forEach(function(item) {
        const archiveName = item.querySelector('.archive-name');
        const editBtn = item.querySelector('.edit-btn');
        const deleteBtn = item.querySelector('.delete-btn');
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'archive-name-input';
        nameInput.maxLength = 25;
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-btn';
        
        item.appendChild(nameInput);
        item.appendChild(saveBtn);
        item.appendChild(cancelBtn);
        
        let originalName = archiveName.textContent;
        let isEditing = false;
        
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (isEditing) return;
            isEditing = true;
            
            archiveName.style.display = 'none';
            nameInput.style.display = 'block';
            editBtn.style.opacity = '0.5';
            deleteBtn.style.opacity = '0.5';
            saveBtn.style.display = 'block';
            cancelBtn.style.display = 'block';
            
            nameInput.value = originalName;
            nameInput.focus();
            nameInput.select();
        });
        
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (isEditing) return;
            
            const archiveNameText = archiveName.textContent;
            
            if (confirm(`Delete "${archiveNameText}"?`)) {
                item.style.opacity = '0.5';
                item.style.pointerEvents = 'none';
                
                setTimeout(() => {
                    item.remove();
                }, 300);
            }
        });
        
        saveBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const newName = nameInput.value.trim();
            
            if (newName === '') {
                alert('Name cannot be empty');
                return;
            }
            
            if (newName.length > 25) {
                alert('Maximum 25 characters');
                return;
            }
            
            archiveName.textContent = newName;
            originalName = newName;
            
            archiveName.style.display = 'block';
            nameInput.style.display = 'none';
            editBtn.style.opacity = '1';
            deleteBtn.style.opacity = '1';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            
            isEditing = false;
        });
        
        cancelBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            archiveName.style.display = 'block';
            nameInput.style.display = 'none';
            editBtn.style.opacity = '1';
            deleteBtn.style.opacity = '1';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            
            isEditing = false;
        });
        
        nameInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                saveBtn.click();
            } else if (e.key === 'Escape') {
                cancelBtn.click();
            }
            
            if (this.value.length >= 25 && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab' && e.key !== 'Enter' && e.key !== 'Escape') {
                e.preventDefault();
                alert('Maximum 25 characters');
            }
        });
        
        nameInput.addEventListener('input', function(e) {
            if (this.value.length > 25) {
                this.value = this.value.substring(0, 25);
                alert('Maximum 25 characters');
            }
        });
    });
});